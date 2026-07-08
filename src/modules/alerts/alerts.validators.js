const { body } = require('express-validator');

const createAlertRules = [
  body('keyword').optional().isString(),
  body('offerType').optional().isIn(['EMPLOI', 'STAGE', 'CONCOURS']),
  body('location').optional().isString(),
];

module.exports = { createAlertRules };
