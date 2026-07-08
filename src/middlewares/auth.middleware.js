const { verifyAccessToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

// Verifie le token JWT et attache l'utilisateur (id + role) a req.user
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentification requise');
  }
  const token = header.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = payload; // { id, role }
    next();
  } catch (err) {
    throw new ApiError(401, 'Token invalide ou expire');
  }
}

// Restreint l'acces a certains roles (ex: authorize('RECRUITER'))
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, 'Acces non autorise pour ce role');
    }
    next();
  };
}

module.exports = { authenticate, authorize };
