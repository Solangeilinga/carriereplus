const express = require('express');
const controller = require('./applications.controller');
const { applyRules, updateStatusRules } = require('./applications.validators');
const validate = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();
router.use(authenticate);

// Candidat
router.post('/offers/:offerId/apply', authorize('CANDIDATE'), applyRules, validate, controller.apply);
router.get('/me', authorize('CANDIDATE'), controller.listMine);

// Recruteur
router.get('/offers/:offerId', authorize('RECRUITER'), controller.listForOffer);
router.patch('/:id/status', authorize('RECRUITER'), updateStatusRules, validate, controller.updateStatus);

module.exports = router;
