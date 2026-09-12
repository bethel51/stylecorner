const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientPhone: { type: String },
  stylist: { type: String, required: true },
  stylistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  stylistEmail: { type: String },
  service: { type: String, required: true },
  location: { type: String },
  price: { type: Number, required: true },
  discountApplied: { type: Number, default: 0 },
  date: { type: String, required: true },
  time: { type: String, required: true },
  staff: { type: String }, // Expert who accepted the booking
  paymentStatus: { type: String, default: 'unpaid' },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'completed', 'cancelled', 'rejected'], 
    default: 'pending' 
  },
  reminderSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
