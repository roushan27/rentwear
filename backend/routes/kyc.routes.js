const express = require('express');
const router = express.Router();
const { uploadKyc, getKycStatus } = require('../controllers/kyc.controller');
const protect = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.post('/upload', protect, upload.single('idProof'), uploadKyc);
router.get('/status', protect, getKycStatus);

module.exports = router;