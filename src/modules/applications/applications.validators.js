const { body } = require('express-validator');

const applyRules = [
  body('coverLetter').optional().isString().isLength({ max: 3000 }).withMessage('Lettre de motivation trop longue'),
];

const updateStatusRules = [
  body('status')
    .isIn(['ENVOYEE', 'VUE', 'PRESELECTIONNEE', 'ENTRETIEN', 'ACCEPTEE', 'REJETEE'])
    .withMessage('Statut invalide'),
];

module.exports = { applyRules, updateStatusRules };
