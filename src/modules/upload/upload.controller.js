const ApiError = require('../../utils/ApiError');
const { uploadBuffer } = require('./upload.service');

// Upload generique : le front precise le "type" (cv, logo, document) pour organiser les dossiers Cloudinary
async function uploadFile(req, res) {
  if (!req.file) throw new ApiError(400, 'Aucun fichier recu');
  const folder = `carriere-plus/${req.body.type || 'divers'}`;
  const url = await uploadBuffer(req.file.buffer, folder);
  res.status(201).json({ success: true, data: { url } });
}

module.exports = { uploadFile };
