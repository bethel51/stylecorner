const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  title: { type: String, default: '' },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  role: { type: String, enum: ['customer', 'staff'], default: 'customer' },
  specialties: [{ type: String }],
  services: [{ name: String, price: String }],
  isVerified: { type: Boolean, default: false },
  otpCode: { type: String },
  otpExpiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
