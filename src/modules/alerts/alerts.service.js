const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const { sendAlertMatchEmail } = require('../../services/email.service');
const { notifyUser } = require('../notifications/notifications.service');

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

// Calcule les correspondances quotidiennes et notifie chaque candidat concerne (email + push).
// A brancher sur un scheduler (voir src/cron/dailyAlerts.cron.js).
async function runDailyAlertMatching() {
  const alerts = await prisma.alert.findMany({
    where: { isActive: true },
    include: { candidate: { include: { user: { select: { id: true, email: true } } } } },
  });

  const results = [];
  for (const alert of alerts) {
    const offers = await matchOffersForAlert(alert);
    if (offers.length === 0) continue;

    results.push({ alertId: alert.id, candidateId: alert.candidateId, offers });

    try {
      await sendAlertMatchEmail({
        to: alert.candidate.user.email,
        candidateName: alert.candidate.firstName,
        offers,
      });
    } catch (err) {
      console.error(`Echec envoi email alerte ${alert.id}:`, err.message);
    }

    try {
      await notifyUser(alert.candidate.user.id, {
        title: 'Nouvelles offres pour vous',
        body: `${offers.length} nouvelle(s) offre(s) correspondent à votre alerte.`,
        data: { type: 'alert_match', alertId: alert.id },
      });
    } catch (err) {
      console.error(`Echec notification push alerte ${alert.id}:`, err.message);
    }
  }
  return results;
}

module.exports = { createAlert, listAlerts, deleteAlert, matchOffersForAlert, runDailyAlertMatching };
