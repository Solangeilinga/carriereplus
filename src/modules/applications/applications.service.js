const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');

async function apply(candidateUserId, offerId, { coverLetter }) {
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: candidateUserId } });
  if (!candidate) throw new ApiError(404, 'Profil candidat introuvable');

  const offer = await prisma.offer.findUnique({ where: { id: offerId } });
  if (!offer || !offer.isPublished) throw new ApiError(404, 'Offre introuvable');

  const existing = await prisma.application.findUnique({
    where: { candidateId_offerId: { candidateId: candidate.id, offerId } },
  });
  if (existing) throw new ApiError(409, 'Vous avez deja postule a cette offre');

  return prisma.application.create({
    data: {
      candidateId: candidate.id,
      offerId,
      coverLetter,
      cvUrlSnapshot: candidate.cvUrl,
    },
  });
}

// Historique des candidatures d'un candidat
async function listMyApplications(candidateUserId) {
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: candidateUserId } });
  if (!candidate) throw new ApiError(404, 'Profil candidat introuvable');

  return prisma.application.findMany({
    where: { candidateId: candidate.id },
    include: { offer: { include: { recruiter: { select: { companyName: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
}

// Candidatures recues pour une offre donnee (cote recruteur)
async function listOfferApplications(recruiterUserId, offerId) {
  const offer = await prisma.offer.findUnique({ where: { id: offerId }, include: { recruiter: true } });
  if (!offer) throw new ApiError(404, 'Offre introuvable');
  if (offer.recruiter.userId !== recruiterUserId) throw new ApiError(403, 'Non autorise');

  return prisma.application.findMany({
    where: { offerId },
    include: { candidate: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function updateStatus(recruiterUserId, applicationId, status) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { offer: { include: { recruiter: true } } },
  });
  if (!application) throw new ApiError(404, 'Candidature introuvable');
  if (application.offer.recruiter.userId !== recruiterUserId) throw new ApiError(403, 'Non autorise');

  return prisma.application.update({ where: { id: applicationId }, data: { status } });
}

module.exports = { apply, listMyApplications, listOfferApplications, updateStatus };
