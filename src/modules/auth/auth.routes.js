const express = require('express');
const controller = require('./auth.controller');
const { registerRules, loginRules } = require('./auth.validators');
const validate = require('../../middlewares/validate.middleware');

const router = express.Router();

router.post('/register', registerRules, validate, controller.register);
router.post('/login', loginRules, validate, controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);

module.exports = router;
