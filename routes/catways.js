const router = require('express').Router();
const Catway = require('../models/Catway');
const Reservation = require('../models/Reservation');
const { asyncHandler } = require('../middlewares/errors');

router.get('/', asyncHandler(async (_req, res) => {
  res.json(await Catway.find().sort({ catwayNumber: 1 }));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const catway = await Catway.findOne({ catwayNumber: Number(req.params.id) });
  if (!catway) return res.status(404).json({ message: 'Catway introuvable' });
  res.json(catway);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { catwayNumber, catwayType, catwayState } = req.body;
  const catway = await Catway.create({ catwayNumber, catwayType, catwayState });
  res.status(201).json(catway);
}));

// Seul l'état peut être modifié : le numéro et le type sont figés.
router.put('/:id', asyncHandler(async (req, res) => {
  const { catwayNumber, catwayType, catwayState } = req.body;
  if (catwayNumber !== undefined || catwayType !== undefined) {
    return res.status(400).json({ message: "Le numéro et le type d'un catway ne sont pas modifiables" });
  }
  const catway = await Catway.findOne({ catwayNumber: Number(req.params.id) });
  if (!catway) return res.status(404).json({ message: 'Catway introuvable' });
  catway.catwayState = catwayState;
  await catway.save();
  res.json(catway);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const number = Number(req.params.id);
  const catway = await Catway.findOne({ catwayNumber: number });
  if (!catway) return res.status(404).json({ message: 'Catway introuvable' });
  if (await Reservation.exists({ catwayNumber: number })) {
    return res.status(409).json({ message: 'Ce catway a des réservations : supprimez-les d\'abord' });
  }
  await catway.deleteOne();
  res.status(204).end();
}));

router.use('/:id/reservations', require('./reservations'));

module.exports = router;
