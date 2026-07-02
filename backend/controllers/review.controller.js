const Review = require('../models/Review.model');
const Rental = require('../models/Rental.model');

// @desc    Create a review (only for completed rentals, one per rental)
// @route   POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { rentalId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!rentalId || !rating) {
      return res.status(400).json({ message: 'Rental and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const rental = await Rental.findById(rentalId);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }
    if (rental.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only review your own rentals' });
    }
    if (rental.status !== 'completed') {
      return res.status(400).json({ message: 'You can only review completed rentals' });
    }

    const existing = await Review.findOne({ rentalId });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this rental' });
    }

    const review = await Review.create({
      productId: rental.productId,
      userId,
      rentalId,
      rating,
      comment: comment || '',
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all reviews for a product (with average rating)
// @route   GET /api/reviews/product/:productId
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.status(200).json({
      reviews,
      avgRating: Math.round(avgRating * 10) / 10,
      count: reviews.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get rentals eligible for review (completed, not yet reviewed) — used by frontend
// @route   GET /api/reviews/reviewable
exports.getReviewableRentals = async (req, res) => {
  try {
    const userId = req.user.id;

    const completedRentals = await Rental.find({ userId, status: 'completed' }).populate('productId', 'title images');
    const reviewedRentalIds = (await Review.find({ userId }).select('rentalId')).map(r => r.rentalId.toString());

    const reviewable = completedRentals.filter(r => !reviewedRentalIds.includes(r._id.toString()));

    res.status(200).json(reviewable);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};