const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  userName: { type: String },
  type: {
    type: String,
    enum: ['wallet_topup', 'service_earning', 'service_payment', 'store_purchase', 'withdrawal'],
    required: true,
  },
  amount: { type: Number, required: true },
  direction: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  reference: { type: String, required: true },
  status: {
    type: String,
    enum: ['success', 'pending', 'failed'],
    default: 'success',
  },
  description: { type: String },
  metadata: {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    withdrawalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Withdrawal' },
    bankDetails: {
      bankName: String,
      accountNumber: String,
      accountName: String,
    },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);
