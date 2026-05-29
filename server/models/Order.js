const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  item: { type: String, required: true },
  price: { type: Number, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, default: 'pending' },
  paymentRef: { type: String }, // For Paystack reference
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
