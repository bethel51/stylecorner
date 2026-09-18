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
  state: { type: String, default: 'Lagos' },
  lga: { type: String, default: 'Ikeja' },
  street: { type: String, default: '' },
  houseNumber: { type: String, default: '' },
  address: { type: String, default: '' },
  role: { type: String, enum: ['customer', 'staff', 'admin'], default: 'customer' },
  specialties: [{ type: String }],
  services: [{ name: String, price: String }],
  portfolio: [
    {
      service: { type: String, default: 'General' },
      imageUrl: { type: String, required: true },
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      duration: { type: String, default: '' },
      price: { type: String, default: '' },
      clientNote: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  walletBalance: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  otpCode: { type: String },
  otpExpiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
