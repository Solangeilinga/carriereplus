const prisma = require('../../config/db');
const bcrypt = require('bcryptjs');

// Statistiques globales pour le tableau de bord admin
async function getStats() {
  const [candidates, recruiters, offers, applications] = await Promise.all([
    prisma.candidateProfile.count(),
    prisma.recruiterProfile.count(),
    prisma.offer.count(),
    prisma.application.count(),
  ]);
  return { candidates, recruiters, offers, applications };
}

async function listUsers({ role, page = 1, pageSize = 20 }) {
  // req.query renvoie des chaines de caracteres : conversion obligatoire pour Prisma (skip/take = Int strict)
  const pageNum = Number(page) || 1;
  const pageSizeNum = Number(pageSize) || 20;
  const where = role ? { role } : {};
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, email: true, role: true, isActive: true, createdAt: true },
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);
  return { items, total, page: pageNum, pageSize: pageSizeNum };
}

async function setUserActive(userId, isActive) {
  return prisma.user.update({ where: { id: userId }, data: { isActive } });
}

// Cree un compte admin (a utiliser uniquement via un script/seed protege, jamais via une route publique)
async function createAdmin({ email, password }) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.create({ data: { email, passwordHash, role: 'ADMIN' } });
}

module.exports = { getStats, listUsers, setUserActive, createAdmin };
