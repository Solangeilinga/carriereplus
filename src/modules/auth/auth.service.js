const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const { sendEmail } = require('../../services/email.service');

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

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

  // Envoi de l'email de verification en best-effort : ne bloque jamais l'inscription.
  // NOTE : l'email n'est pas obligatoire pour se connecter aujourd'hui (emailVerified
  // reste informatif) ; voir README pour savoir comment rendre la verification bloquante.
  sendVerificationEmail(user).catch((err) => console.error('Echec envoi email de verification:', err.message));

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

// --- Verification d'email ---

async function sendVerificationEmail(user) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  await prisma.authToken.create({
    data: { token, userId: user.id, purpose: 'EMAIL_VERIFICATION', expiresAt },
  });

  const verifyUrl = `${process.env.API_PUBLIC_URL || 'http://localhost:4000'}/api/auth/verify-email/${token}`;

  await sendEmail({
    to: user.email,
    subject: 'Vérifiez votre adresse email — Carrière+',
    html: `
      <p>Bonjour,</p>
      <p>Merci de vous être inscrit sur Carrière+. Cliquez sur le lien ci-dessous pour vérifier votre adresse email :</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>Ce lien expire dans 24 heures.</p>
    `,
  });
}

async function verifyEmail(token) {
  const authToken = await prisma.authToken.findUnique({ where: { token } });
  if (!authToken || authToken.purpose !== 'EMAIL_VERIFICATION' || authToken.usedAt || authToken.expiresAt < new Date()) {
    throw new ApiError(400, 'Lien de vérification invalide ou expiré');
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: authToken.userId }, data: { emailVerified: true } }),
    prisma.authToken.update({ where: { id: authToken.id }, data: { usedAt: new Date() } }),
  ]);
}

async function resendVerification(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Reponse volontairement identique que l'utilisateur existe ou non (evite l'enumeration de comptes)
  if (!user || user.emailVerified) return;
  await sendVerificationEmail(user);
}

// --- Mot de passe oublie ---

async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Reponse volontairement identique que l'utilisateur existe ou non (evite l'enumeration de comptes)
  if (!user) return;

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

  await prisma.authToken.create({
    data: { token, userId: user.id, purpose: 'PASSWORD_RESET', expiresAt },
  });

  await sendEmail({
    to: user.email,
    subject: 'Réinitialisation de votre mot de passe — Carrière+',
    html: `
      <p>Bonjour,</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe sur Carrière+.</p>
      <p>Copiez ce code dans l'application, dans l'écran "Réinitialiser mon mot de passe" :</p>
      <p style="font-size: 20px; font-weight: bold; letter-spacing: 1px;">${token}</p>
      <p>Ce code expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
    `,
  });
}

async function resetPassword(token, newPassword) {
  const authToken = await prisma.authToken.findUnique({ where: { token } });
  if (!authToken || authToken.purpose !== 'PASSWORD_RESET' || authToken.usedAt || authToken.expiresAt < new Date()) {
    throw new ApiError(400, 'Code de réinitialisation invalide ou expiré');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: authToken.userId }, data: { passwordHash } }),
    prisma.authToken.update({ where: { id: authToken.id }, data: { usedAt: new Date() } }),
    // Invalide toutes les sessions existantes par securite (l'utilisateur devra se reconnecter partout)
    prisma.refreshToken.deleteMany({ where: { userId: authToken.userId } }),
  ]);
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

module.exports = {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
};
