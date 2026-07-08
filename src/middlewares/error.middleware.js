const ApiError = require('../utils/ApiError');

// Middleware d'erreur global : uniformise le format des reponses d'erreur
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
  });
}

module.exports = errorHandler;
