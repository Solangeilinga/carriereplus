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

// Ouvert depuis un lien email dans un navigateur : renvoie une page HTML simple.
async function verifyEmail(req, res) {
  try {
    await authService.verifyEmail(req.params.token);
    res.status(200).send('<h2>Email vérifié avec succès ✅</h2><p>Vous pouvez fermer cette page et retourner sur l\'application.</p>');
  } catch (err) {
    res.status(400).send(`<h2>Lien invalide ou expiré</h2><p>${err.message}</p>`);
  }
}

async function resendVerification(req, res) {
  await authService.resendVerification(req.body.email);
  res.status(200).json({ success: true, message: 'Si un compte existe avec cet email, un lien de vérification a été envoyé.' });
}

async function forgotPassword(req, res) {
  await authService.forgotPassword(req.body.email);
  res.status(200).json({ success: true, message: 'Si un compte existe avec cet email, un code de réinitialisation a été envoyé.' });
}

async function resetPassword(req, res) {
  await authService.resetPassword(req.body.token, req.body.newPassword);
  res.status(200).json({ success: true, message: 'Mot de passe réinitialisé avec succès.' });
}

module.exports = { register, login, refresh, logout, verifyEmail, resendVerification, forgotPassword, resetPassword };
