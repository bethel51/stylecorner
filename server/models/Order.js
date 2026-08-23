const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, default: 'Customer' },
  item: { type: String, required: true },
  price: { type: Number, required: true },
  totalPrice: { type: Number },
  address: { type: String, required: true },
  state: { type: String, default: '' },
  lga: { type: String, default: '' },
  street: { type: String, default: '' },
  houseNumber: { type: String, default: '' },
  phone: { type: String, required: true },
  status: { type: String, default: 'processing' },
  trackingStatus: { type: String, default: 'Order Placed' },
  trackingNumber: { type: String, default: '' },
  estimatedDelivery: { type: String, default: '' },
  paymentRef: { type: String }, // For Paystack reference
  messages: [
    {
      sender: { type: String, required: true },
      senderRole: { type: String, default: 'customer' },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);

