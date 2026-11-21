const router = require('express').Router({ mergeParams: true });
const Catway = require('../models/Catway');
const Reservation = require('../models/Reservation');
const { asyncHandler } = require('../middlewares/errors');

// Vérifie que le catway de l'URL existe
router.use(asyncHandler(async (req, res, next) => {
  const number = Number(req.params.id);
  if (!Number.isInteger(number)) return res.status(400).json({ message: 'Numéro de catway invalide' });
  if (!(await Catway.exists({ catwayNumber: number }))) {
    return res.status(404).json({ message: 'Catway introuvable' });
  }
  req.catwayNumber = number;
  next();
}));

// Refuse deux réservations qui se chevauchent sur le même catway
async function hasOverlap(catwayNumber, start, end, ignoreId) {
  if (!(start instanceof Date) || isNaN(start) || !(end instanceof Date) || isNaN(end)) return false;
  const query = { catwayNumber, startDate: { $lt: end }, endDate: { $gt: start } };
  if (ignoreId) query._id = { $ne: ignoreId };
  return !!(await Reservation.exists(query));
}

router.get('/', asyncHandler(async (req, res) => {
  res.json(await Reservation.find({ catwayNumber: req.catwayNumber }).sort({ startDate: 1 }));
}));

router.get('/:idReservation', asyncHandler(async (req, res) => {
  const reservation = await Reservation.findOne({ _id: req.params.idReservation, catwayNumber: req.catwayNumber });
  if (!reservation) return res.status(404).json({ message: 'Réservation introuvable' });
  res.json(reservation);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { clientName, boatName, startDate, endDate } = req.body;
  const reservation = new Reservation({ catwayNumber: req.catwayNumber, clientName, boatName, startDate, endDate });
  await reservation.validate();
  if (await hasOverlap(req.catwayNumber, reservation.startDate, reservation.endDate)) {
    return res.status(409).json({ message: 'Ce catway est déjà réservé sur cette période' });
  }
  await reservation.save();
  res.status(201).json(reservation);
}));

router.put('/:idReservation', asyncHandler(async (req, res) => {
  const reservation = await Reservation.findOne({ _id: req.params.idReservation, catwayNumber: req.catwayNumber });
  if (!reservation) return res.status(404).json({ message: 'Réservation introuvable' });
  const { clientName, boatName, startDate, endDate } = req.body;
  if (clientName !== undefined) reservation.clientName = clientName;
  if (boatName !== undefined) reservation.boatName = boatName;
  if (startDate !== undefined) reservation.startDate = startDate;
  if (endDate !== undefined) reservation.endDate = endDate;
  await reservation.validate();
  if (await hasOverlap(req.catwayNumber, reservation.startDate, reservation.endDate, reservation._id)) {
    return res.status(409).json({ message: 'Ce catway est déjà réservé sur cette période' });
  }
  await reservation.save();
  res.json(reservation);
}));

router.delete('/:idReservation', asyncHandler(async (req, res) => {
  const reservation = await Reservation.findOne({ _id: req.params.idReservation, catwayNumber: req.catwayNumber });
  if (!reservation) return res.status(404).json({ message: 'Réservation introuvable' });
  await reservation.deleteOne();
  res.status(204).end();
}));

module.exports = router;
