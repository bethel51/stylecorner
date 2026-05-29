const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientPhone: { type: String },
  stylist: { type: String, required: true },
  service: { type: String, required: true },
  price: { type: Number, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  staff: { type: String }, // Expert who accepted the booking
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
