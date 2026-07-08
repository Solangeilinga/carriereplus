const express = require('express');
const controller = require('./tests.controller');
const { getQuestionsRules, submitResultRules } = require('./tests.validators');
const validate = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/questions', getQuestionsRules, validate, controller.getQuestions);
router.post('/submit', authenticate, authorize('CANDIDATE'), submitResultRules, validate, controller.submit);
router.get('/me/results', authenticate, authorize('CANDIDATE'), controller.myResults);

module.exports = router;
