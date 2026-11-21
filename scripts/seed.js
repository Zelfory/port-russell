// Importe catways.json et reservations.json (si les collections sont vides)
// et crée un compte administrateur à partir du fichier .env.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Catway = require('../models/Catway');
const Reservation = require('../models/Reservation');
const User = require('../models/User');

const read = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', name), 'utf8'));

(async () => {
  await connectDB();

  if ((await Catway.countDocuments()) === 0) {
    const docs = await Catway.insertMany(read('catways.json'));
    console.log(`${docs.length} catways importés`);
  } else console.log('Catways déjà présents : import ignoré');

  if ((await Reservation.countDocuments()) === 0) {
    const docs = await Reservation.insertMany(read('reservations.json'));
    console.log(`${docs.length} réservations importées`);
  } else console.log('Réservations déjà présentes : import ignoré');

  const { ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    if (!(await User.exists({ email: ADMIN_EMAIL.toLowerCase() }))) {
      await User.create({ username: ADMIN_USERNAME || 'capitaine', email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      console.log(`Utilisateur créé : ${ADMIN_EMAIL}`);
    } else console.log('Utilisateur admin déjà présent');
  }

  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
