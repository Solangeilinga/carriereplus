const { body, query } = require('express-validator');

const getQuestionsRules = [
  query('category')
    .isIn(['CULTURE_GENERALE', 'LOGIQUE', 'INFORMATIQUE', 'FRANCAIS', 'ANGLAIS'])
    .withMessage('Categorie invalide'),
];

const submitResultRules = [
  body('category')
    .isIn(['CULTURE_GENERALE', 'LOGIQUE', 'INFORMATIQUE', 'FRANCAIS', 'ANGLAIS'])
    .withMessage('Categorie invalide'),
  body('answers').isArray({ min: 1 }).withMessage('Reponses requises'),
  body('answers.*.questionId').isString().notEmpty(),
  body('answers.*.choiceIndex').isInt({ min: 0 }),
  body('durationSec').isInt({ min: 0 }).withMessage('Duree invalide'),
];

module.exports = { getQuestionsRules, submitResultRules };
