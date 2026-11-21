const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Le nom d'utilisateur est obligatoire"],
      trim: true,
      minlength: [3, "Le nom d'utilisateur doit contenir au moins 3 caractères"],
      maxlength: [30, "Le nom d'utilisateur ne peut pas dépasser 30 caractères"]
    },
    email: {
      type: String,
      required: [true, "L'adresse e-mail est obligatoire"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "L'adresse e-mail n'est pas valide"]
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire'],
      minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères']
    }
  },
  { timestamps: true }
);

// La validation (longueur) porte sur le mot de passe en clair, avant le hachage.
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
