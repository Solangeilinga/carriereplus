const express = require('express');
const controller = require('./library.controller');
const { createResourceRules, updateResourceRules } = require('./library.validators');
const validate = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/', controller.list);
router.post('/', authenticate, authorize('ADMIN'), createResourceRules, validate, controller.create);
router.patch('/:id', authenticate, authorize('ADMIN'), updateResourceRules, validate, controller.update);
router.delete('/:id', authenticate, authorize('ADMIN'), controller.remove);

module.exports = router;
