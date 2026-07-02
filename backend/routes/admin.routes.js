const express = require('express');
const router = express.Router();
const { triggerOverdueCheck } = require('../controllers/admin.controller');
const { getDashboardCharts } = require('../controllers/admin.controller');
const {
  registerAdmin,
  loginAdmin,
  getPendingKyc,
  updateKycStatus,
  getDashboardStats,
} = require('../controllers/admin.controller');
const protectAdmin = require('../middleware/admin.middleware');

router.post('/register', registerAdmin); // sirf ek baar use karo
router.post('/login', loginAdmin);

router.get('/kyc/pending', protectAdmin, getPendingKyc);
router.put('/kyc/:userId', protectAdmin, updateKycStatus);
router.get('/dashboard', protectAdmin, getDashboardStats);
router.post('/trigger-overdue-check', protectAdmin, triggerOverdueCheck);
router.get('/dashboard/charts', protectAdmin, getDashboardCharts);
module.exports = router;