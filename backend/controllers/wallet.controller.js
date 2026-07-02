const crypto = require('crypto');
const razorpayInstance = require('../config/razorpay');
const User = require('../models/User.model');
const Transaction = require('../models/Transaction.model');

// @desc    Create Razorpay order (wallet me paisa add karne ke liye)
// @route   POST /api/wallet/create-order
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body; // amount in INR (rupees)

    if (!amount || amount < 1) {
      return res.status(400).json({ message: 'Enter a valid amount' });
    }

    const options = {
      amount: amount * 100, // Razorpay paisa me leta hai (1 rupee = 100 paisa)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID, // frontend ko ye chahiye checkout kholne ke liye
    });
  } catch (error) {
    res.status(500).json({ message: 'Razorpay order creation failed', error: error.message });
  }
};

// @desc    Verify payment & credit wallet
// @route   POST /api/wallet/verify-payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    // Signature verify karo — ye sabse important security step hai
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Signature sahi hai — wallet credit karo
    const user = await User.findById(req.user.id);
    user.walletBalance += Number(amount);
    await user.save();

    await Transaction.create({
      userId: req.user.id,
      type: 'credit',
      amount: Number(amount),
      reason: 'Wallet Top-up via Razorpay',
    });

    res.status(200).json({
      message: 'Payment verified, wallet credited',
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get wallet transaction history
// @route   GET /api/wallet/history
exports.getWalletHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get wallet balance
// @route   GET /api/wallet/balance
exports.getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('walletBalance');
    res.status(200).json({ walletBalance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};