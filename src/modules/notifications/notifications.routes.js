const express = require('express');
const controller = require('./notifications.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = express.Router();
router.use(authenticate);

router.post('/device-token', controller.registerDevice);
router.delete('/device-token', controller.unregisterDevice);

module.exports = router;
