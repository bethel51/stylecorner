const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['order', 'booking', 'message', 'system'], default: 'order' },
  orderId: { type: String },
  bookingId: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
