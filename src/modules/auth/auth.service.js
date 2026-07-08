const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/jwt');

async function register({ email, password, role, ...profileData }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, 'Un compte existe deja avec cet email');

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      ...(role === 'CANDIDATE' && {
        candidateProfile: {
          create: {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
          },
        },
      }),
      ...(role === 'RECRUITER' && {
        recruiterProfile: {
          create: {
            companyName: profileData.companyName,
            organizationType: profileData.organizationType,
          },
        },
      }),
    },
    include: { candidateProfile: true, recruiterProfile: true },
  });

  return buildAuthResponse(user);
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { candidateProfile: true, recruiterProfile: true },
  });
  if (!user || !user.isActive) throw new ApiError(401, 'Identifiants incorrects');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new ApiError(401, 'Identifiants incorrects');

  return buildAuthResponse(user);
}

async function refresh(token) {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, 'Refresh token invalide');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new ApiError(401, 'Refresh token expire ou revoque');
  }

  const accessToken = signAccessToken({ id: payload.id, role: payload.role });
  return { accessToken };
}

async function logout(token) {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

// Genere access + refresh token et persiste le refresh token en base
async function buildAuthResponse(user) {
  const payload = { id: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  });

  const { passwordHash, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

module.exports = { register, login, refresh, logout };
