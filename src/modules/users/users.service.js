const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');

async function getMe(userId, role) {
  if (role === 'CANDIDATE') {
    const profile = await prisma.candidateProfile.findUnique({ where: { userId } });
    if (!profile) throw new ApiError(404, 'Profil candidat introuvable');
    return profile;
  }
  if (role === 'RECRUITER') {
    const profile = await prisma.recruiterProfile.findUnique({ where: { userId } });
    if (!profile) throw new ApiError(404, 'Profil recruteur introuvable');
    return profile;
  }
  throw new ApiError(400, 'Role non gere');
}

async function updateCandidateProfile(userId, data) {
  const allowed = ['firstName', 'lastName', 'phone', 'city', 'headline', 'bio', 'skills'];
  const payload = Object.fromEntries(Object.entries(data).filter(([k]) => allowed.includes(k)));
  return prisma.candidateProfile.update({ where: { userId }, data: payload });
}

async function updateRecruiterProfile(userId, data) {
  const allowed = ['companyName', 'organizationType', 'description', 'website', 'city'];
  const payload = Object.fromEntries(Object.entries(data).filter(([k]) => allowed.includes(k)));
  return prisma.recruiterProfile.update({ where: { userId }, data: payload });
}

async function setCvUrl(userId, cvUrl) {
  return prisma.candidateProfile.update({ where: { userId }, data: { cvUrl } });
}

module.exports = { getMe, updateCandidateProfile, updateRecruiterProfile, setCvUrl };
