const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');

// Recupere un lot de questions aleatoires pour une categorie donnee
async function getQuestions(category, count = 10) {
  const questions = await prisma.testQuestion.findMany({ where: { category } });
  const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, count);
  // Ne jamais renvoyer correctIndex au client avant soumission
  return shuffled.map(({ correctIndex, ...q }) => q);
}

async function submitResult(candidateUserId, { category, answers, durationSec }) {
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: candidateUserId } });
  if (!candidate) throw new ApiError(404, 'Profil candidat introuvable');

  const questionIds = answers.map((a) => a.questionId);
  const questions = await prisma.testQuestion.findMany({ where: { id: { in: questionIds } } });

  let score = 0;
  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (question && question.correctIndex === answer.choiceIndex) score += 1;
  }

  return prisma.testResult.create({
    data: {
      candidateId: candidate.id,
      category,
      score,
      totalQuestions: answers.length,
      durationSec,
    },
  });
}

async function myResults(candidateUserId) {
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: candidateUserId } });
  if (!candidate) throw new ApiError(404, 'Profil candidat introuvable');

  return prisma.testResult.findMany({
    where: { candidateId: candidate.id },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = { getQuestions, submitResult, myResults };
