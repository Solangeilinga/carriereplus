const express = require('express');
const controller = require('./admin.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();
router.use(authenticate, authorize('ADMIN'));

router.get('/stats', controller.stats);
router.get('/users', controller.listUsers);
router.patch('/users/:id/active', controller.setUserActive);

module.exports = router;
