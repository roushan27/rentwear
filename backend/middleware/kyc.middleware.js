const User = require('../models/User.model');

const requireKyc = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.kycStatus !== 'verified') {
      return res.status(403).json({
        message: 'KYC verification required before checkout',
        kycStatus: user.kycStatus,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = requireKyc;