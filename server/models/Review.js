const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  bookingId: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerName: { type: String, required: true },
  stylistName: { type: String, required: true },
  serviceName: { type: String, default: 'Grooming Service' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);
