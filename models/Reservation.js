const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    catwayNumber: {
      type: Number,
      required: [true, 'Le numéro du catway est obligatoire'],
      min: [1, 'Le numéro doit être supérieur ou égal à 1']
    },
    clientName: {
      type: String,
      required: [true, 'Le nom du client est obligatoire'],
      trim: true,
      minlength: [2, 'Le nom du client doit contenir au moins 2 caractères'],
      maxlength: [100, 'Le nom du client ne peut pas dépasser 100 caractères']
    },
    boatName: {
      type: String,
      required: [true, 'Le nom du bateau est obligatoire'],
      trim: true,
      maxlength: [100, 'Le nom du bateau ne peut pas dépasser 100 caractères']
    },
    startDate: {
      type: Date,
      required: [true, 'La date de début est obligatoire']
    },
    endDate: {
      type: Date,
      required: [true, 'La date de fin est obligatoire'],
      validate: {
        validator: function (value) {
          return !this.startDate || value > this.startDate;
        },
        message: 'La date de fin doit être postérieure à la date de début'
      }
    }
  },
  { timestamps: true }
);

reservationSchema.index({ catwayNumber: 1, startDate: 1, endDate: 1 });
reservationSchema.set('toJSON', { transform: (_d, ret) => { delete ret.__v; return ret; } });

module.exports = mongoose.model('Reservation', reservationSchema);
