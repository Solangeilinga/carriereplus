const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const { callAI, parseAiJson } = require('./ai.client');
const { extractTextFromPdfUrl } = require('../../utils/pdfText');

// Analyse le CV d'un candidat. Si aucun texte n'est fourni explicitement, le texte est
// extrait automatiquement depuis le CV PDF deja importe par le candidat (cvUrl).
async function analyzeCv(candidateUserId, providedCvText) {
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: candidateUserId } });
  if (!candidate) throw new ApiError(404, 'Profil candidat introuvable');

  let cvText = providedCvText?.trim();

  if (!cvText) {
    if (!candidate.cvUrl) {
      throw new ApiError(400, "Aucun CV importe. Importe d'abord ton CV dans ton profil, ou colle le texte manuellement.");
    }
    try {
      cvText = await extractTextFromPdfUrl(candidate.cvUrl);
    } catch (err) {
      throw new ApiError(422, "Impossible d'extraire le texte du CV importé (le fichier est peut-être une image scannée sans texte). Essaie de coller le texte manuellement.");
    }
    if (!cvText || cvText.trim().length < 30) {
      throw new ApiError(422, 'Le CV importé ne contient pas assez de texte lisible (probablement une image scannée). Colle le texte manuellement.');
    }
  }

  const prompt = `Tu es un expert en recrutement. Analyse ce CV et reponds UNIQUEMENT en JSON avec le format:
{"points_forts": [...], "points_a_ameliorer": [...], "competences_detectees": [...], "score_global": 0-100}

CV:
${cvText}`;

  const raw = await callAI(prompt, { maxTokens: 1200 });
  const analysis = parseAiJson(raw);

  await prisma.candidateProfile.update({
    where: { userId: candidateUserId },
    data: { cvParsedData: analysis },
  });

  return analysis;
}

// Recommande des offres adaptees au profil du candidat (matching simple base sur les competences)
async function recommendOffers(candidateUserId) {
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: candidateUserId } });
  if (!candidate) throw new ApiError(404, 'Profil candidat introuvable');

  const offers = await prisma.offer.findMany({ where: { isPublished: true }, take: 50 });

  if (!candidate.skills?.length) return offers.slice(0, 10);

  const scored = offers.map((offer) => {
    const matchCount = candidate.skills.filter((skill) =>
      offer.description.toLowerCase().includes(skill.toLowerCase())
    ).length;
    return { offer, matchCount };
  });

  return scored
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 10)
    .map((s) => s.offer);
}

// Genere une session d'entretien simule (questions personnalisees selon le poste vise)
async function generateInterview(candidateUserId, jobTitle) {
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: candidateUserId } });
  if (!candidate) throw new ApiError(404, 'Profil candidat introuvable');

  const prompt = `Genere 6 questions d'entretien d'embauche pertinentes pour le poste "${jobTitle}",
adaptees a un candidat avec ce profil : ${candidate.headline || ''} ${(candidate.skills || []).join(', ')}.
Reponds UNIQUEMENT en JSON: {"questions": ["...", "..."]}`;

  const raw = await callAI(prompt, { maxTokens: 800 });
  const { questions } = parseAiJson(raw);

  const session = await prisma.interviewSession.create({
    data: { candidateId: candidate.id, jobTitle, questions },
  });

  return session;
}

// Evalue les reponses du candidat a une session d'entretien
async function evaluateInterview(candidateUserId, sessionId, answers) {
  const session = await prisma.interviewSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new ApiError(404, 'Session introuvable');

  const prompt = `Voici des questions d'entretien et les reponses d'un candidat.
Evalue chaque reponse (clarte, pertinence, structure) et donne un conseil d'amelioration.
Reponds UNIQUEMENT en JSON: {"evaluations": [{"question": "...", "note": 0-10, "conseil": "..."}]}

Questions et reponses:
${session.questions.map((q, i) => `Q: ${q}\nR: ${answers[i] || ''}`).join('\n\n')}`;

  const raw = await callAI(prompt, { maxTokens: 1200 });
  const evaluation = parseAiJson(raw);

  return prisma.interviewSession.update({
    where: { id: sessionId },
    data: { answers, evaluation },
  });
}

module.exports = { analyzeCv, recommendOffers, generateInterview, evaluateInterview };
