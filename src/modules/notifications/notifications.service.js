const prisma = require('../../config/db');
const { sendPushNotification } = require('./push.service');

// Enregistre (ou met a jour) le token d'appareil d'un utilisateur pour les notifications push.
async function registerDeviceToken(userId, token, platform) {
  return prisma.deviceToken.upsert({
    where: { token },
    update: { userId, platform },
    create: { token, userId, platform },
  });
}

async function unregisterDeviceToken(token) {
  await prisma.deviceToken.deleteMany({ where: { token } });
}

// Envoie une notification push a tous les appareils enregistres d'un utilisateur donne.
async function notifyUser(userId, { title, body, data }) {
  const devices = await prisma.deviceToken.findMany({ where: { userId } });
  if (devices.length === 0) return { skipped: true };
  return sendPushNotification({ tokens: devices.map((d) => d.token), title, body, data });
}

module.exports = { registerDeviceToken, unregisterDeviceToken, notifyUser };
