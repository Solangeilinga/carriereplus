const express = require('express');
const controller = require('./ai.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();
router.use(authenticate, authorize('CANDIDATE'));

router.post('/cv/analyze', controller.analyzeCv);
router.get('/offers/recommended', controller.recommendOffers);

// Simulation d'entretien conversationnelle : une question a la fois
router.post('/interview/start', controller.startInterview);
router.post('/interview/:sessionId/answer', controller.answerInterview);

module.exports = router;
