const Rental = require('../models/Rental.model');
const Product = require('../models/Product.model');
const User = require('../models/User.model');
const Transaction = require('../models/Transaction.model');
const sendEmail = require('../utils/sendEmail');
const { orderStatusEmail } = require('../utils/emailTemplates');

// @desc    Update rental status (Admin only)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['booked', 'shipped', 'active', 'returned', 'completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    rental.status = status;
    await rental.save();

    if (status === 'returned') {
      const refundUser = await User.findById(rental.userId);
      refundUser.walletBalance += rental.depositPaid;
      await refundUser.save();

      await Transaction.create({
        userId: rental.userId,
        type: 'credit',
        amount: rental.depositPaid,
        reason: 'Security Deposit Refund',
        relatedRentalId: rental._id,
      });

      rental.status = 'completed';
      await rental.save();
    }

    const user = await User.findById(rental.userId);
    const product = await Product.findById(rental.productId);

    if (user && product) {
      sendEmail({
        to: user.email,
        subject: `Order ${rental.status} — RentWear`,
        html: orderStatusEmail(user.name, product.title, rental.status),
      });
    }

    res.status(200).json({ message: `Order status updated to ${status}`, rental });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Rental.find()
      .populate('userId', 'name email')
      .populate('productId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
