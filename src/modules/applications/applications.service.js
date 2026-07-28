const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const { sendEmail } = require('../../services/email.service');
const { notifyUser } = require('../notifications/notifications.service');

async function apply(candidateUserId, offerId, { coverLetter }) {
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: candidateUserId } });
  if (!candidate) throw new ApiError(404, 'Profil candidat introuvable');

  const offer = await prisma.offer.findUnique({ where: { id: offerId }, include: { recruiter: { include: { user: true } } } });
  if (!offer || !offer.isPublished) throw new ApiError(404, 'Offre introuvable');

  const existing = await prisma.application.findUnique({
    where: { candidateId_offerId: { candidateId: candidate.id, offerId } },
  });
  if (existing) throw new ApiError(409, 'Vous avez deja postule a cette offre');

  const application = await prisma.application.create({
    data: {
      candidateId: candidate.id,
      offerId,
      coverLetter,
      cvUrlSnapshot: candidate.cvUrl,
    },
  });

  // Notifie le recruteur par email (best-effort : n'empeche pas la candidature si l'envoi echoue)
  // Inclut un lien direct vers le CV quand il existe, pour eviter toute limitation de piece jointe.
  try {
    await sendEmail({
      to: offer.recruiter.user.email,
      subject: `Nouvelle candidature reçue pour "${offer.title}"`,
      html: `
        <p>Bonjour,</p>
        <p><strong>${candidate.firstName} ${candidate.lastName}</strong> vient de postuler à votre offre
        <strong>${offer.title}</strong>.</p>
        ${candidate.headline ? `<p>Titre : ${candidate.headline}</p>` : ''}
        ${candidate.cvUrl ? `<p><a href="${candidate.cvUrl}">Consulter le CV du candidat</a></p>` : ''}
        <p>Connectez-vous à Carrière+ pour consulter le profil complet.</p>
        <p>— L'équipe Carrière+</p>
      `,
    });
  } catch (err) {
    console.error('Echec envoi email de notification recruteur:', err.message);
  }

  // Notification push au recruteur (best-effort, ignoree silencieusement si non configuree)
  notifyUser(offer.recruiter.userId, {
    title: 'Nouvelle candidature',
    body: `${candidate.firstName} ${candidate.lastName} a postulé à "${offer.title}"`,
    data: { type: 'new_application', offerId: offer.id },
  }).catch((err) => console.error('Echec notification push recruteur:', err.message));

  return application;
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
    include: { candidate: { include: { user: { select: { email: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
}

async function updateStatus(recruiterUserId, applicationId, status) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { offer: { include: { recruiter: true } }, candidate: { include: { user: true } } },
  });
  if (!application) throw new ApiError(404, 'Candidature introuvable');
  if (application.offer.recruiter.userId !== recruiterUserId) throw new ApiError(403, 'Non autorise');

  const updated = await prisma.application.update({ where: { id: applicationId }, data: { status } });

  const statusLabels = {
    VUE: 'a été vue',
    PRESELECTIONNEE: 'a été présélectionnée',
    ENTRETIEN: 'est passée en entretien',
    ACCEPTEE: 'a été acceptée 🎉',
    REJETEE: "n'a malheureusement pas été retenue",
  };
  if (statusLabels[status]) {
    notifyUser(application.candidate.userId, {
      title: 'Mise à jour de votre candidature',
      body: `Votre candidature pour "${application.offer.title}" ${statusLabels[status]}.`,
      data: { type: 'application_status', applicationId: application.id },
    }).catch((err) => console.error('Echec notification push candidat:', err.message));
  }

  return updated;
}

module.exports = { apply, listMyApplications, listOfferApplications, updateStatus };
