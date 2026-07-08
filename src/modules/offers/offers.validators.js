const { body } = require('express-validator');

const createOfferRules = [
  body('title').notEmpty().withMessage('Le titre est requis'),
  body('type').isIn(['EMPLOI', 'STAGE', 'CONCOURS']).withMessage('Type invalide'),
  body('contractType').optional().isIn(['CDI', 'CDD', 'STAGE', 'FREELANCE', 'CONCOURS']),
  body('description').notEmpty().withMessage('La description est requise'),
  body('location').optional().isString(),
  body('remote').optional().isBoolean(),
  body('salaryMin').optional().isInt({ min: 0 }),
  body('salaryMax').optional().isInt({ min: 0 }),
  body('deadline').optional().isISO8601().withMessage('Date limite invalide'),
];

const updateOfferRules = [
  body('title').optional().notEmpty(),
  body('type').optional().isIn(['EMPLOI', 'STAGE', 'CONCOURS']),
  body('contractType').optional().isIn(['CDI', 'CDD', 'STAGE', 'FREELANCE', 'CONCOURS']),
  body('description').optional().notEmpty(),
  body('salaryMin').optional().isInt({ min: 0 }),
  body('salaryMax').optional().isInt({ min: 0 }),
  body('deadline').optional().isISO8601(),
  body('isPublished').optional().isBoolean(),
];

module.exports = { createOfferRules, updateOfferRules };
