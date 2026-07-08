const alertsService = require('./alerts.service');

async function create(req, res) {
  const alert = await alertsService.createAlert(req.user.id, req.body);
  res.status(201).json({ success: true, data: alert });
}

async function list(req, res) {
  const alerts = await alertsService.listAlerts(req.user.id);
  res.json({ success: true, data: alerts });
}

async function remove(req, res) {
  await alertsService.deleteAlert(req.user.id, req.params.id);
  res.json({ success: true, message: 'Alerte supprimee' });
}

module.exports = { create, list, remove };
