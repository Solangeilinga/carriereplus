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

const createQuestionRules = [
  body('category')
    .isIn(['CULTURE_GENERALE', 'LOGIQUE', 'INFORMATIQUE', 'FRANCAIS', 'ANGLAIS'])
    .withMessage('Categorie invalide'),
  body('question').notEmpty().withMessage('La question est requise'),
  body('choices').isArray({ min: 2 }).withMessage('Au moins 2 choix requis'),
  body('choices.*').isString().notEmpty(),
  body('correctIndex').isInt({ min: 0 }).withMessage('Index de la bonne reponse invalide'),
];

const updateQuestionRules = [
  body('category')
    .optional()
    .isIn(['CULTURE_GENERALE', 'LOGIQUE', 'INFORMATIQUE', 'FRANCAIS', 'ANGLAIS']),
  body('question').optional().notEmpty(),
  body('choices').optional().isArray({ min: 2 }),
  body('choices.*').optional().isString().notEmpty(),
  body('correctIndex').optional().isInt({ min: 0 }),
];

module.exports = { getQuestionsRules, submitResultRules, createQuestionRules, updateQuestionRules };
