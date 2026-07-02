const express = require('express');
const router = express.Router();
const { toggleWishlist, getWishlist, getWishlistIds } = require('../controllers/wishlist.controller');
const protect = require('../middleware/auth.middleware');

router.post('/toggle', protect, toggleWishlist);
router.get('/', protect, getWishlist);
router.get('/ids', protect, getWishlistIds);

module.exports = router;