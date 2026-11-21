const jwt = require('jsonwebtoken');

function readToken(req) {
  if (req.cookies && req.cookies.token) return req.cookies.token;
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

function decode(req) {
  const token = readToken(req);
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// API : répond 401 en JSON
exports.requireAuth = (req, res, next) => {
  const payload = decode(req);
  if (!payload) return res.status(401).json({ message: 'Authentification requise' });
  req.user = payload;
  next();
};

// Pages : redirige vers l'accueil
exports.requirePage = (req, res, next) => {
  const payload = decode(req);
  if (!payload) return res.redirect('/');
  req.user = payload;
  next();
};

exports.optionalAuth = (req, _res, next) => {
  req.user = decode(req);
  next();
};
