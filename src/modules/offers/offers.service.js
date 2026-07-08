const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');

async function createOffer(userId, data) {
  const recruiter = await prisma.recruiterProfile.findUnique({ where: { userId } });
  if (!recruiter) throw new ApiError(404, 'Profil recruteur introuvable');

  return prisma.offer.create({
    data: {
      recruiterId: recruiter.id,
      title: data.title,
      type: data.type,
      contractType: data.contractType,
      description: data.description,
      requirements: data.requirements,
      location: data.location,
      remote: !!data.remote,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      deadline: data.deadline ? new Date(data.deadline) : null,
    },
  });
}

// Recherche d'offres avec filtres (type, mot-cle, localisation)
async function listOffers({ type, q, location, page = 1, pageSize = 20 }) {
  const where = {
    isPublished: true,
    ...(type && { type }),
    ...(location && { location: { contains: location, mode: 'insensitive' } }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.offer.findMany({
      where,
      include: { recruiter: { select: { companyName: true, logoUrl: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.offer.count({ where }),
  ]);

  return { items, total, page: Number(page), pageSize: Number(pageSize) };
}

// Liste les offres publiees ET non publiees d'un recruteur (tableau de bord recruteur)
async function listMyOffers(userId) {
  const recruiter = await prisma.recruiterProfile.findUnique({ where: { userId } });
  if (!recruiter) throw new ApiError(404, 'Profil recruteur introuvable');

  return prisma.offer.findMany({
    where: { recruiterId: recruiter.id },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

async function getOffer(id) {
  const offer = await prisma.offer.findUnique({
    where: { id },
    include: { recruiter: true },
  });
  if (!offer) throw new ApiError(404, 'Offre introuvable');
  return offer;
}

async function updateOffer(userId, offerId, data) {
  const offer = await prisma.offer.findUnique({ where: { id: offerId }, include: { recruiter: true } });
  if (!offer) throw new ApiError(404, 'Offre introuvable');
  if (offer.recruiter.userId !== userId) throw new ApiError(403, 'Non autorise a modifier cette offre');

  return prisma.offer.update({ where: { id: offerId }, data });
}

async function deleteOffer(userId, offerId) {
  const offer = await prisma.offer.findUnique({ where: { id: offerId }, include: { recruiter: true } });
  if (!offer) throw new ApiError(404, 'Offre introuvable');
  if (offer.recruiter.userId !== userId) throw new ApiError(403, 'Non autorise a supprimer cette offre');

  await prisma.offer.delete({ where: { id: offerId } });
}

async function saveOffer(candidateUserId, offerId) {
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: candidateUserId } });
  if (!candidate) throw new ApiError(404, 'Profil candidat introuvable');

  return prisma.savedOffer.upsert({
    where: { candidateId_offerId: { candidateId: candidate.id, offerId } },
    update: {},
    create: { candidateId: candidate.id, offerId },
  });
}

async function unsaveOffer(candidateUserId, offerId) {
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: candidateUserId } });
  if (!candidate) throw new ApiError(404, 'Profil candidat introuvable');

  await prisma.savedOffer.delete({
    where: { candidateId_offerId: { candidateId: candidate.id, offerId } },
  }).catch(() => {}); // idempotent
}

module.exports = { createOffer, listOffers, listMyOffers, getOffer, updateOffer, deleteOffer, saveOffer, unsaveOffer };
