const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.model');
const User = require('../models/User.model');
const { checkOverdueRentals } = require('../jobs/overdueChecker.job');
const Rental = require('../models/Rental.model');
const sendEmail = require('../utils/sendEmail');
const { kycStatusEmail } = require('../utils/emailTemplates');

const generateAdminToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ADMIN_SECRET, { expiresIn: '7d' });
};

exports.triggerOverdueCheck = async (req, res) => {
  try {
    await checkOverdueRentals();
    res.status(200).json({ message: 'Overdue check completed manually' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Register admin (sirf ek baar manually use karo, phir route hata dena)
// @route   POST /api/admin/register
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({ name, email, password: hashedPassword });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateAdminToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Admin login
// @route   POST /api/admin/login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateAdminToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all users with pending KYC
// @route   GET /api/admin/kyc/pending
exports.getPendingKyc = async (req, res) => {
  try {
    const users = await User.find({ kycStatus: 'pending', idProofUrl: { $ne: '' } }).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Approve or Reject KYC
// @route   PUT /api/admin/kyc/:userId
exports.updateKycStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { kycStatus: status },
      { returnDocument: 'after' }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    sendEmail({
      to: user.email,
      subject: status === 'verified' ? 'Identity Verified — RentWear' : 'KYC Update — RentWear',
      html: kycStatusEmail(user.name, status),
    });

    res.status(200).json({ message: `KYC ${status}`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
// @desc    Dashboard stats
// @route   GET /api/admin/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const pendingKyc = await User.countDocuments({ kycStatus: 'pending', idProofUrl: { $ne: '' } });
    const verifiedKyc = await User.countDocuments({ kycStatus: 'verified' });

    res.status(200).json({ totalUsers, pendingKyc, verifiedKyc });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Dashboard chart data (revenue trend + order status breakdown)
// @route   GET /api/admin/dashboard/charts
exports.getDashboardCharts = async (req, res) => {
  try {
    const statusCounts = await Rental.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const ordersByStatus = statusCounts.map((s) => ({ status: s._id, count: s.count }));

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const revenueTrend = await Rental.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$grandTotal' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalRevenueAgg = await Rental.aggregate([
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    res.status(200).json({
      ordersByStatus,
      revenueTrend: revenueTrend.map((r) => ({ date: r._id, revenue: r.revenue, orders: r.orders })),
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
