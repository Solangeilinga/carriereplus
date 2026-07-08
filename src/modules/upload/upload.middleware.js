const multer = require('multer');

// Fichiers geres en memoire puis envoyes directement vers Cloudinary (pas de stockage disque local)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo max (CV, logos, documents)
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Type de fichier non autorise (PDF, PNG ou JPG uniquement)'));
    }
    cb(null, true);
  },
});

module.exports = upload;
