const adminService = require('./admin.service');

async function stats(req, res) {
  const data = await adminService.getStats();
  res.json({ success: true, data });
}

async function listUsers(req, res) {
  const data = await adminService.listUsers(req.query);
  res.json({ success: true, data });
}

async function setUserActive(req, res) {
  const user = await adminService.setUserActive(req.params.id, req.body.isActive);
  res.json({ success: true, data: user });
}

module.exports = { stats, listUsers, setUserActive };
