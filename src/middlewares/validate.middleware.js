const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// A placer apres les regles express-validator sur une route
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(422, 'Donnees invalides', errors.array());
  }
  next();
}

module.exports = validate;
