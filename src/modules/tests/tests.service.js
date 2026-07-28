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

// --- Gestion admin des questions (CRUD complet, avec correctIndex visible) ---

async function listAllQuestions({ category, page = 1, pageSize = 20 }) {
  const where = category ? { category } : {};
  const [items, total] = await Promise.all([
    prisma.testQuestion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.testQuestion.count({ where }),
  ]);
  return { items, total, page: Number(page), pageSize: Number(pageSize) };
}

async function createQuestion(data) {
  return prisma.testQuestion.create({ data });
}

async function updateQuestion(id, data) {
  const question = await prisma.testQuestion.findUnique({ where: { id } });
  if (!question) throw new ApiError(404, 'Question introuvable');
  return prisma.testQuestion.update({ where: { id }, data });
}

async function deleteQuestion(id) {
  const question = await prisma.testQuestion.findUnique({ where: { id } });
  if (!question) throw new ApiError(404, 'Question introuvable');
  await prisma.testQuestion.delete({ where: { id } });
}

module.exports = {
  getQuestions,
  submitResult,
  myResults,
  listAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
