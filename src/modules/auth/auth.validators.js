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

const forgotPasswordRules = [
  body('email').isEmail().withMessage('Email invalide'),
];

const resetPasswordRules = [
  body('token').notEmpty().withMessage('Code de réinitialisation requis'),
  body('newPassword').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caracteres'),
];

const resendVerificationRules = [
  body('email').isEmail().withMessage('Email invalide'),
];

module.exports = { registerRules, loginRules, forgotPasswordRules, resetPasswordRules, resendVerificationRules };
