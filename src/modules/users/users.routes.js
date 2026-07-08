const express = require('express');
const controller = require('./users.controller');
const { updateCandidateRules, updateRecruiterRules } = require('./users.validators');
const validate = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// Choisit dynamiquement les regles de validation selon le role connecte
function updateRulesForRole(req, res, next) {
  const rules = req.user.role === 'CANDIDATE' ? updateCandidateRules : updateRecruiterRules;
  return Promise.all(rules.map((rule) => rule.run(req))).then(() => next());
}

const router = express.Router();

router.use(authenticate);
router.get('/me', controller.getMe);
router.patch('/me', updateRulesForRole, validate, controller.updateMe);
router.post('/me/cv', authorize('CANDIDATE'), controller.uploadCv);

module.exports = router;
