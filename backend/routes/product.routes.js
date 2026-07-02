const express = require('express');
const router = express.Router();
const {
  createProduct,
  listUserItem,
  getProducts,
  getProductBySlug,
  getMyListings,
  getPendingListings,
  updateApprovalStatus,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const protect = require('../middleware/auth.middleware');
const protectAdmin = require('../middleware/admin.middleware');
const requireKyc = require('../middleware/kyc.middleware');
const upload = require('../middleware/upload.middleware');

// Public
router.get('/', getProducts);

// User — specific routes (slug route se PEHLE)
router.post('/list-item', protect, requireKyc, upload.array('images', 5), listUserItem);
router.get('/my-listings', protect, getMyListings);

// Admin — specific routes
router.get('/pending', protectAdmin, getPendingListings);
router.put('/:id/approval', protectAdmin, updateApprovalStatus);
router.post('/', protectAdmin, upload.array('images', 5), createProduct);
router.put('/:id', protectAdmin, upload.array('images', 5), updateProduct);
router.delete('/:id', protectAdmin, deleteProduct);

// Public — slug route sabse LAST me
router.get('/:slug', getProductBySlug);

module.exports = router;