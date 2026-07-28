const express = require('express');
const controller = require('./tests.controller');
const { getQuestionsRules, submitResultRules, createQuestionRules, updateQuestionRules } = require('./tests.validators');
const validate = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/questions', getQuestionsRules, validate, controller.getQuestions);
router.post('/submit', authenticate, authorize('CANDIDATE'), submitResultRules, validate, controller.submit);
router.get('/me/results', authenticate, authorize('CANDIDATE'), controller.myResults);

// Gestion admin des questions (CRUD complet)
router.get('/admin/questions', authenticate, authorize('ADMIN'), controller.listAllQuestions);
router.post('/admin/questions', authenticate, authorize('ADMIN'), createQuestionRules, validate, controller.createQuestion);
router.patch('/admin/questions/:id', authenticate, authorize('ADMIN'), updateQuestionRules, validate, controller.updateQuestion);
router.delete('/admin/questions/:id', authenticate, authorize('ADMIN'), controller.deleteQuestion);

module.exports = router;
