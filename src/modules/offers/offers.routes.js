const express = require('express');
const controller = require('./offers.controller');
const { createOfferRules, updateOfferRules } = require('./offers.validators');
const validate = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Routes publiques (recherche/consultation d'offres, pas d'auth requise)
router.get('/', controller.list);

// Route recruteur/admin : ses propres offres (publiees et non publiees) - doit precer /:id
router.get('/mine', authenticate, authorize('RECRUITER', 'ADMIN'), controller.listMine);

// Route candidat : offres sauvegardees (favoris) - doit precer /:id
router.get('/saved/mine', authenticate, authorize('CANDIDATE'), controller.listSaved);

router.get('/:id', controller.getOne);

// Routes recruteur/admin (creation/gestion des offres)
router.post('/', authenticate, authorize('RECRUITER', 'ADMIN'), createOfferRules, validate, controller.create);
router.patch('/:id', authenticate, authorize('RECRUITER', 'ADMIN'), updateOfferRules, validate, controller.update);
router.delete('/:id', authenticate, authorize('RECRUITER', 'ADMIN'), controller.remove);

// Routes candidat (offres sauvegardees)
router.post('/:id/save', authenticate, authorize('CANDIDATE'), controller.save);
router.delete('/:id/save', authenticate, authorize('CANDIDATE'), controller.unsave);
router.get('/:id/save', authenticate, authorize('CANDIDATE'), controller.isSaved);

module.exports = router;
