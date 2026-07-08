const authService = require('./auth.service');

async function register(req, res) {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
}

async function login(req, res) {
  const result = await authService.login(req.body);
  res.status(200).json({ success: true, data: result });
}

async function refresh(req, res) {
  const result = await authService.refresh(req.body.refreshToken);
  res.status(200).json({ success: true, data: result });
}

async function logout(req, res) {
  await authService.logout(req.body.refreshToken);
  res.status(200).json({ success: true, message: 'Deconnecte' });
}

module.exports = { register, login, refresh, logout };
