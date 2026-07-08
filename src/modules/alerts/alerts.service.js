const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');

async function createAlert(candidateUserId, { keyword, offerType, location }) {
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: candidateUserId } });
  if (!candidate) throw new ApiError(404, 'Profil candidat introuvable');

  return prisma.alert.create({
    data: { candidateId: candidate.id, keyword, offerType, location },
  });
}

async function listAlerts(candidateUserId) {
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: candidateUserId } });
  if (!candidate) throw new ApiError(404, 'Profil candidat introuvable');

  return prisma.alert.findMany({ where: { candidateId: candidate.id }, orderBy: { createdAt: 'desc' } });
}

async function deleteAlert(candidateUserId, alertId) {
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: candidateUserId } });
  if (!candidate) throw new ApiError(404, 'Profil candidat introuvable');

  const alert = await prisma.alert.findUnique({ where: { id: alertId } });
  if (!alert || alert.candidateId !== candidate.id) throw new ApiError(404, 'Alerte introuvable');

  await prisma.alert.delete({ where: { id: alertId } });
}

// Retourne les offres correspondant a une alerte donnee (utilise par le job de notification)
async function matchOffersForAlert(alert) {
  return prisma.offer.findMany({
    where: {
      isPublished: true,
      ...(alert.offerType && { type: alert.offerType }),
      ...(alert.location && { location: { contains: alert.location, mode: 'insensitive' } }),
      ...(alert.keyword && {
        OR: [
          { title: { contains: alert.keyword, mode: 'insensitive' } },
          { description: { contains: alert.keyword, mode: 'insensitive' } },
        ],
      }),
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // offres publiees dans les dernieres 24h
    },
  });
}

// A brancher sur un cron (ex: node-cron) pour l'envoi d'emails/notifications push quotidien
async function runDailyAlertMatching() {
  const alerts = await prisma.alert.findMany({ where: { isActive: true } });
  const results = [];
  for (const alert of alerts) {
    const offers = await matchOffersForAlert(alert);
    if (offers.length > 0) results.push({ alertId: alert.id, candidateId: alert.candidateId, offers });
  }
  return results; // ici : brancher un service d'envoi (email, push notification, etc.)
}

module.exports = { createAlert, listAlerts, deleteAlert, matchOffersForAlert, runDailyAlertMatching };
