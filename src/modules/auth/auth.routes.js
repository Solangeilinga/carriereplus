const express = require('express');
const controller = require('./auth.controller');
const {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  resendVerificationRules,
} = require('./auth.validators');
const validate = require('../../middlewares/validate.middleware');

const router = express.Router();

router.post('/register', registerRules, validate, controller.register);
router.post('/login', loginRules, validate, controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);

router.get('/verify-email/:token', controller.verifyEmail);
router.post('/resend-verification', resendVerificationRules, validate, controller.resendVerification);

router.post('/forgot-password', forgotPasswordRules, validate, controller.forgotPassword);
router.post('/reset-password', resetPasswordRules, validate, controller.resetPassword);

module.exports = router;
