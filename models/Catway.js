const mongoose = require('mongoose');

const catwaySchema = new mongoose.Schema(
  {
    catwayNumber: {
      type: Number,
      required: [true, 'Le numéro du catway est obligatoire'],
      unique: true,
      min: [1, 'Le numéro doit être supérieur ou égal à 1'],
      validate: { validator: Number.isInteger, message: 'Le numéro doit être un entier' }
    },
    catwayType: {
      type: String,
      required: [true, 'Le type du catway est obligatoire'],
      enum: { values: ['long', 'short'], message: 'Le type doit être "long" ou "short"' }
    },
    catwayState: {
      type: String,
      required: [true, "L'état du catway est obligatoire"],
      trim: true,
      minlength: [3, "La description de l'état doit contenir au moins 3 caractères"],
      maxlength: [300, "La description de l'état ne peut pas dépasser 300 caractères"]
    }
  },
  { timestamps: true }
);

catwaySchema.set('toJSON', { transform: (_d, ret) => { delete ret.__v; return ret; } });

module.exports = mongoose.model('Catway', catwaySchema);
