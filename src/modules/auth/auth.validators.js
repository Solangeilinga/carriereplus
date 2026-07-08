const { body } = require('express-validator');

const registerRules = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caracteres'),
  body('role').isIn(['CANDIDATE', 'RECRUITER']).withMessage('Role invalide'),
  body('firstName').if(body('role').equals('CANDIDATE')).notEmpty().withMessage('Prenom requis'),
  body('lastName').if(body('role').equals('CANDIDATE')).notEmpty().withMessage('Nom requis'),
  body('companyName').if(body('role').equals('RECRUITER')).notEmpty().withMessage("Nom de l'entreprise requis"),
];

const loginRules = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
];

module.exports = { registerRules, loginRules };
