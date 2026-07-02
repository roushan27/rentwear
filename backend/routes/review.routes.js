const express = require('express');
const router = express.Router();
const { createReview, getProductReviews, getReviewableRentals } = require('../controllers/review.controller');
const protect = require('../middleware/auth.middleware');

router.post('/', protect, createReview);
router.get('/reviewable', protect, getReviewableRentals);
router.get('/product/:productId', getProductReviews);

module.exports = router;