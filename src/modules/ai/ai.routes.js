const express = require('express');
const controller = require('./ai.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();
router.use(authenticate, authorize('CANDIDATE'));

router.post('/cv/analyze', controller.analyzeCv);
router.get('/offers/recommended', controller.recommendOffers);
router.post('/interview/generate', controller.generateInterview);
router.post('/interview/:sessionId/evaluate', controller.evaluateInterview);

module.exports = router;
