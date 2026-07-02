const User = require('../models/User.model');

// @desc    Toggle product in wishlist (add if not present, remove if present)
// @route   POST /api/wishlist/toggle
exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);

    const index = user.wishlist.findIndex((id) => id.toString() === productId);

    let added;
    if (index > -1) {
      user.wishlist.splice(index, 1);
      added = false;
    } else {
      user.wishlist.push(productId);
      added = true;
    }

    await user.save();
    res.status(200).json({ added, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get my wishlist (populated with product details)
// @route   GET /api/wishlist
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.status(200).json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get just the IDs (lightweight — used to mark hearts on product cards)
// @route   GET /api/wishlist/ids
exports.getWishlistIds = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('wishlist');
    res.status(200).json(user.wishlist.map((id) => id.toString()));
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};