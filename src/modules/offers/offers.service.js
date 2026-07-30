const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');

// Recupere le profil "recruteur" lie a un utilisateur. Si l'utilisateur est un ADMIN
// et n'a pas encore de profil recruteur, on lui en cree un automatiquement (transparent
// pour l'admin : il n'a jamais a remplir de formulaire d'entreprise pour publier une offre).
async function ensureRecruiterProfile(userId, role) {
  let recruiter = await prisma.recruiterProfile.findUnique({ where: { userId } });
  if (!recruiter && role === 'ADMIN') {
    recruiter = await prisma.recruiterProfile.create({
      data: {
        userId,
        companyName: 'Carrière+ (Administration)',
        organizationType: 'Plateforme Carrière+',
      },
    });
  }
  if (!recruiter) throw new ApiError(404, 'Profil recruteur introuvable');
  return recruiter;
}

async function createOffer(userId, role, data) {
  const recruiter = await ensureRecruiterProfile(userId, role);

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
  // req.query renvoie toujours des chaines de caracteres (ex: "10"), meme pour des nombres.
  // Prisma exige des Int stricts pour skip/take : sans cette conversion, la requete
  // echoue des qu'un parametre de pagination est explicitement fourni dans l'URL.
  const pageNum = Number(page) || 1;
  const pageSizeNum = Number(pageSize) || 20;

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
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
    }),
    prisma.offer.count({ where }),
  ]);

  return { items, total, page: pageNum, pageSize: pageSizeNum };
}

// Liste les offres publiees ET non publiees d'un recruteur ou d'un admin (tableau de bord)
async function listMyOffers(userId, role) {
  const recruiter = await ensureRecruiterProfile(userId, role);

  return prisma.offer.findMany({
    where: { recruiterId: recruiter.id },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

async function getOffer(id) {
  const offer = await prisma.offer.findUnique({
    where: { id },
    include: { recruiter: { include: { user: { select: { email: true } } } } },
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

// Liste des offres sauvegardees (favoris) par un candidat
async function listSavedOffers(candidateUserId) {
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: candidateUserId } });
  if (!candidate) throw new ApiError(404, 'Profil candidat introuvable');

  const saved = await prisma.savedOffer.findMany({
    where: { candidateId: candidate.id },
    include: { offer: { include: { recruiter: { select: { companyName: true } } } } },
    orderBy: { createdAt: 'desc' },
  });

  return saved.map((s) => s.offer);
}

// Indique si une offre donnee est deja dans les favoris du candidat (pour l'icone du detail d'offre)
async function isOfferSaved(candidateUserId, offerId) {
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: candidateUserId } });
  if (!candidate) return false;

  const saved = await prisma.savedOffer.findUnique({
    where: { candidateId_offerId: { candidateId: candidate.id, offerId } },
  });
  return !!saved;
}

module.exports = {
  createOffer,
  listOffers,
  listMyOffers,
  getOffer,
  updateOffer,
  deleteOffer,
  saveOffer,
  unsaveOffer,
  listSavedOffers,
  isOfferSaved,
};
