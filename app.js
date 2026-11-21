require('dotenv').config();
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const Reservation = require('./models/Reservation');
const { requireAuth, requirePage, optionalAuth } = require('./middlewares/auth');
const { asyncHandler, notFound, errorHandler } = require('./middlewares/errors');

const app = express();
app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Pages
app.get('/', optionalAuth, (req, res) => {
  if (req.user) return res.redirect('/dashboard');
  res.render('index');
});
app.get('/docs', (_req, res) => res.render('docs'));
app.get('/dashboard', requirePage, (req, res) => res.render('dashboard', { user: req.user }));

// API
app.use('/', require('./routes/auth'));
app.use('/users', requireAuth, require('./routes/users'));
app.use('/catways', requireAuth, require('./routes/catways'));

// Complément pratique pour le tableau de bord : toutes les réservations
app.get('/reservations', requireAuth, asyncHandler(async (_req, res) => {
  res.json(await Reservation.find().sort({ startDate: 1 }));
}));

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET manquant dans le fichier .env');

connectDB()
  .then(() => app.listen(port, () => console.log(`Port de Plaisance Russell : http://localhost:${port}`)))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
