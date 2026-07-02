const Product = require('../models/Product.model');
const Rental = require('../models/Rental.model');
const User = require('../models/User.model');
const Transaction = require('../models/Transaction.model');
const calculateCost = require('../utils/calculateCost');
const { isDateOverlapping, getDatesInRange } = require('../utils/dateOverlap');
const sendEmail = require('../utils/sendEmail');
const { bookingConfirmedEmail } = require('../utils/emailTemplates');

exports.calculateRentalCost = async (req, res) => {
  try {
    const { productId, startDate, endDate } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (isDateOverlapping(product.disabledDates, startDate, endDate)) {
      return res.status(400).json({ message: 'Selected dates are not available' });
    }

    const cost = calculateCost(startDate, endDate, product.rentPerDay, product.securityDeposit);

    res.status(200).json(cost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.createRental = async (req, res) => {
  try {
    const { productId, startDate, endDate } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (isDateOverlapping(product.disabledDates, startDate, endDate)) {
      return res.status(400).json({ message: 'Selected dates are no longer available' });
    }

    const cost = calculateCost(startDate, endDate, product.rentPerDay, product.securityDeposit);

    const user = await User.findById(userId);

    if (user.walletBalance < cost.grandTotal) {
      return res.status(400).json({
        message: 'Insufficient wallet balance',
        required: cost.grandTotal,
        available: user.walletBalance,
      });
    }

    user.walletBalance -= cost.grandTotal;
    await user.save();

    await Transaction.create({
      userId,
      type: 'debit',
      amount: cost.grandTotal,
      reason: 'Rent Payment + Security Deposit',
    });

    const rental = await Rental.create({
      userId,
      productId,
      startDate,
      endDate,
      totalDays: cost.totalDays,
      totalRent: cost.totalRent,
      depositPaid: cost.securityDeposit,
      grandTotal: cost.grandTotal,
      status: 'booked',
    });

    const bookedDates = getDatesInRange(startDate, endDate);
    product.disabledDates.push(...bookedDates);
    await product.save();

    sendEmail({
      to: user.email,
      subject: 'Booking Confirmed — RentWear',
      html: bookingConfirmedEmail(user.name, product.title, startDate, endDate, cost.grandTotal),
    });

    res.status(201).json({ message: 'Booking successful', rental });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMyRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({ userId: req.user.id })
      .populate('productId', 'title images rentPerDay')
      .sort({ createdAt: -1 });

    res.status(200).json(rentals);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getRentalById = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id).populate('productId');

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    res.status(200).json(rental);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
