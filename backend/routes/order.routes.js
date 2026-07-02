const express = require('express');
const router = express.Router();
const { updateOrderStatus, getAllOrders } = require('../controllers/order.controller');
const protectAdmin = require('../middleware/admin.middleware');

router.get('/', protectAdmin, getAllOrders);
router.put('/:id/status', protectAdmin, updateOrderStatus);

module.exports = router;