exports.asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

exports.notFound = (req, res) => {
  res.status(404).json({ message: `Route introuvable : ${req.method} ${req.originalUrl}` });
};

exports.errorHandler = (err, _req, res, _next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: errors.join(' ; '), errors });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Valeur invalide pour "${err.path}"` });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'valeur';
    return res.status(409).json({ message: `Cette valeur existe déjà (${field})` });
  }
  console.error(err);
  res.status(500).json({ message: 'Erreur interne du serveur' });
};
