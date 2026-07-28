const notificationsService = require('./notifications.service');

async function registerDevice(req, res) {
  await notificationsService.registerDeviceToken(req.user.id, req.body.token, req.body.platform);
  res.status(201).json({ success: true, message: 'Appareil enregistre pour les notifications' });
}

async function unregisterDevice(req, res) {
  await notificationsService.unregisterDeviceToken(req.body.token);
  res.json({ success: true, message: 'Appareil desinscrit' });
}

module.exports = { registerDevice, unregisterDevice };
