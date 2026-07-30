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

// --- Simulation d'entretien conversationnelle ---
// Au lieu de generer toutes les questions d'un coup, l'entretien se deroule comme une
// vraie conversation : une question a la fois, la question suivante tient compte de la
// reponse precedente, et apres MAX_TURNS echanges l'IA donne un retour complet.
const MAX_INTERVIEW_TURNS = 5;

function buildTranscript(questions, answers) {
  return questions.map((q, i) => `Q${i + 1}: ${q}\nR${i + 1}: ${answers[i] || '(pas de reponse)'}`).join('\n\n');
}

// Demarre une nouvelle session : genere la toute premiere question et cree la session en base.
async function startInterview(candidateUserId, jobTitle) {
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: candidateUserId } });
  if (!candidate) throw new ApiError(404, 'Profil candidat introuvable');

  const prompt = `Tu es un recruteur qui mene un entretien d'embauche oral pour le poste "${jobTitle}",
face a un candidat avec ce profil : ${candidate.headline || ''} ${(candidate.skills || []).join(', ')}.
Pose la toute premiere question pour demarrer la conversation (chaleureuse mais professionnelle, une seule question).
Reponds UNIQUEMENT en JSON: {"question": "..."}`;

  const raw = await callAI(prompt, { maxTokens: 250 });
  const { question } = parseAiJson(raw);

  const session = await prisma.interviewSession.create({
    data: { candidateId: candidate.id, jobTitle, questions: [question], answers: [] },
  });

  return { sessionId: session.id, question, isFinished: false };
}

// Enregistre la reponse du candidat a la question courante, puis genere soit la question
// suivante (adaptee a la conversation), soit le retour final si MAX_INTERVIEW_TURNS est atteint.
async function answerInterview(candidateUserId, sessionId, answerText) {
  const session = await prisma.interviewSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new ApiError(404, 'Session introuvable');

  const questions = [...session.questions];
  const answers = [...(session.answers || []), answerText];

  if (answers.length >= MAX_INTERVIEW_TURNS) {
    const prompt = `Voici la transcription complete d'un entretien d'embauche simule pour le poste "${session.jobTitle}".
Donne un retour complet et bienveillant : un resume global de la performance, les points forts, les points a
ameliorer, et pour CHAQUE question, ce qui aurait pu etre dit de mieux (conseil concret et actionnable).
Reponds UNIQUEMENT en JSON:
{"resume_global": "...", "points_forts": ["..."], "points_a_ameliorer": ["..."],
 "conseils_par_question": [{"question": "...", "conseil": "..."}]}

Transcription:
${buildTranscript(questions, answers)}`;

    const raw = await callAI(prompt, { maxTokens: 1500 });
    const evaluation = parseAiJson(raw);

    await prisma.interviewSession.update({ where: { id: sessionId }, data: { answers, evaluation } });
    return { isFinished: true, evaluation };
  }

  const prompt = `Tu es un recruteur en plein entretien d'embauche oral pour le poste "${session.jobTitle}".
Voici la conversation jusqu'ici :
${buildTranscript(questions, answers)}

Pose la question suivante : rebondis naturellement sur la reponse precedente si pertinent, ou explore un
nouvel aspect du poste sinon. Une seule question, ton naturel de conversation (pas une liste).
Reponds UNIQUEMENT en JSON: {"question": "..."}`;

  const raw = await callAI(prompt, { maxTokens: 250 });
  const { question } = parseAiJson(raw);

  questions.push(question);
  await prisma.interviewSession.update({ where: { id: sessionId }, data: { questions, answers } });

  return { isFinished: false, question };
}

module.exports = { analyzeCv, recommendOffers, startInterview, answerInterview };
