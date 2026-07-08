const express = require('express');
const controller = require('./library.controller');
const { createResourceRules } = require('./library.validators');
const validate = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/', controller.list);
router.post('/', authenticate, authorize('ADMIN'), createResourceRules, validate, controller.create);

module.exports = router;
