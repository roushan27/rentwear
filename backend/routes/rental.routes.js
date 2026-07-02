const express = require('express');
const router = express.Router();
const {
  calculateRentalCost,
  createRental,
  getMyRentals,
  getRentalById,
} = require('../controllers/rental.controller');
const protect = require('../middleware/auth.middleware');
const requireKyc = require('../middleware/kyc.middleware');

router.post('/calculate', protect, calculateRentalCost);
router.post('/book', protect, requireKyc, createRental); // KYC verified hona zaroori
router.get('/my-rentals', protect, getMyRentals);
router.get('/:id', protect, getRentalById);

module.exports = router;