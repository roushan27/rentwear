const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getWalletHistory,
  getWalletBalance,
} = require('../controllers/wallet.controller');
const protect = require('../middleware/auth.middleware');

router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/history', protect, getWalletHistory);
router.get('/balance', protect, getWalletBalance);

module.exports = router;