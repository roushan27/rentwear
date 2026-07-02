const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String, // e.g. "Rent Payment", "Deposit Refund", "Overdue Penalty"
      required: true,
    },
    relatedRentalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);