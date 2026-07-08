const usersService = require('./users.service');

async function getMe(req, res) {
  const profile = await usersService.getMe(req.user.id, req.user.role);
  res.json({ success: true, data: profile });
}

async function updateMe(req, res) {
  const profile = req.user.role === 'CANDIDATE'
    ? await usersService.updateCandidateProfile(req.user.id, req.body)
    : await usersService.updateRecruiterProfile(req.user.id, req.body);
  res.json({ success: true, data: profile });
}

// Upload de CV : le fichier est deja uploade sur le stockage cloud (voir middlewares/upload)
// et l'URL resultante est enregistree ici.
async function uploadCv(req, res) {
  const profile = await usersService.setCvUrl(req.user.id, req.body.cvUrl);
  res.json({ success: true, data: profile });
}

module.exports = { getMe, updateMe, uploadCv };
