const { body } = require('express-validator');

const createResourceRules = [
  body('title').notEmpty().withMessage('Le titre est requis'),
  body('category')
    .isIn(['ANCIEN_SUJET_CONCOURS', 'ANCIEN_SUJET_RECRUTEMENT', 'DOCUMENT_PREPARATION', 'CONSEIL_ENTRETIEN', 'CONSEIL_CV'])
    .withMessage('Categorie invalide'),
  body('fileUrl').isURL().withMessage('URL de fichier invalide'),
  body('correctionUrl').optional().isURL(),
];

module.exports = { createResourceRules };
