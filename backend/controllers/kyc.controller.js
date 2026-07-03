const User = require('../models/User.model');
const { getImageUrl } = require('../utils/normalizeImage');

// @desc    Upload KYC document
// @route   POST /api/kyc/upload
exports.uploadKyc = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a document' });
    }

    const idProofUrl = getImageUrl(req.file);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        idProofUrl,
        kycStatus: 'pending', // admin approve karega
      },
      { returnDocument: 'after' }
    ).select('-password');

    res.status(200).json({
      message: 'KYC document uploaded successfully. Waiting for admin approval.',
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get my KYC status
// @route   GET /api/kyc/status
exports.getKycStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('kycStatus idProofUrl');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};