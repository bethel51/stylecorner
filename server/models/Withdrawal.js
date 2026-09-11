const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  expertName: { type: String, required: true },
  amount: { type: Number, required: true },
  bankName: { type: String, required: true },
  bankCode: { type: String, required: true },
  accountNumber: { type: String, required: true },
  accountName: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected'],
    default: 'pending',
  },
  reference: { type: String },
  paystackTransferCode: { type: String },
  rejectionReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  settledAt: { type: Date },
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
