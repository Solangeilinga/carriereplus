const { body } = require('express-validator');

const updateCandidateRules = [
  body('firstName').optional().notEmpty(),
  body('lastName').optional().notEmpty(),
  body('phone').optional().isString(),
  body('city').optional().isString(),
  body('headline').optional().isString(),
  body('bio').optional().isString().isLength({ max: 2000 }),
  body('skills').optional().isArray(),
];

const updateRecruiterRules = [
  body('companyName').optional().notEmpty(),
  body('organizationType').optional().isString(),
  body('description').optional().isString().isLength({ max: 2000 }),
  body('website').optional().isURL(),
  body('city').optional().isString(),
];

module.exports = { updateCandidateRules, updateRecruiterRules };
