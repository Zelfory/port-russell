const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('../middlewares/errors');

router.post('/login', asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const password = String(req.body.password || '');
  const user = await User.findOne({ email });
  // Même message dans les deux cas pour ne pas révéler quels e-mails existent
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'E-mail ou mot de passe incorrect' });
  }
  const token = jwt.sign({ id: user._id, email: user.email, username: user.username }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000
  });
  res.json({ message: 'Connecté', token, user });
}));

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  if (req.accepts(['html', 'json']) === 'html') return res.redirect('/');
  res.json({ message: 'Déconnecté' });
});

module.exports = router;
