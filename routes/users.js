const router = require('express').Router();
const User = require('../models/User');
const { asyncHandler } = require('../middlewares/errors');

const findByEmail = (req) => User.findOne({ email: String(req.params.email).toLowerCase().trim() });

router.get('/', asyncHandler(async (_req, res) => {
  res.json(await User.find().sort({ username: 1 }));
}));

router.get('/:email', asyncHandler(async (req, res) => {
  const user = await findByEmail(req);
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
  res.json(user);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const user = await User.create({ username, email, password });
  res.status(201).json(user);
}));

router.put('/:email', asyncHandler(async (req, res) => {
  const user = await findByEmail(req);
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
  const { username, email, password } = req.body;
  if (username !== undefined) user.username = username;
  if (email !== undefined) user.email = email;
  if (password) user.password = password;
  await user.save();
  res.json(user);
}));

router.delete('/:email', asyncHandler(async (req, res) => {
  const user = await findByEmail(req);
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
  if (String(user._id) === String(req.user.id)) {
    return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte' });
  }
  await user.deleteOne();
  res.status(204).end();
}));

module.exports = router;
