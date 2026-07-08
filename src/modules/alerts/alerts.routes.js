const express = require('express');
const controller = require('./alerts.controller');
const { createAlertRules } = require('./alerts.validators');
const validate = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();
router.use(authenticate, authorize('CANDIDATE'));

router.post('/', createAlertRules, validate, controller.create);
router.get('/', controller.list);
router.delete('/:id', controller.remove);

module.exports = router;
