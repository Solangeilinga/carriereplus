const express = require('express');
const controller = require('./upload.controller');
const upload = require('./upload.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/', authenticate, upload.single('file'), controller.uploadFile);

module.exports = router;
