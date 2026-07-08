const express = require('express');
const controller = require('./offers.controller');
const { createOfferRules, updateOfferRules } = require('./offers.validators');
const validate = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Routes publiques (recherche/consultation d'offres, pas d'auth requise)
router.get('/', controller.list);

// Route recruteur : ses propres offres (publiees et non publiees) - doit precer /:id
router.get('/mine', authenticate, authorize('RECRUITER'), controller.listMine);

router.get('/:id', controller.getOne);

// Routes recruteur (creation/gestion des offres)
router.post('/', authenticate, authorize('RECRUITER'), createOfferRules, validate, controller.create);
router.patch('/:id', authenticate, authorize('RECRUITER'), updateOfferRules, validate, controller.update);
router.delete('/:id', authenticate, authorize('RECRUITER'), controller.remove);

// Routes candidat (offres sauvegardees)
router.post('/:id/save', authenticate, authorize('CANDIDATE'), controller.save);
router.delete('/:id/save', authenticate, authorize('CANDIDATE'), controller.unsave);

module.exports = router;
