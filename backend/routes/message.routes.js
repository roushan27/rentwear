const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversation,
  getMyInbox,
  getUnreadCount,
  markAsRead,
} = require('../controllers/message.controller');
const protect = require('../middleware/auth.middleware');

router.post('/', protect, sendMessage);
router.get('/my-inbox', protect, getMyInbox);
router.get('/unread-count', protect, getUnreadCount);
router.put('/:productId/read', protect, markAsRead);
router.get('/:productId', protect, getConversation);

module.exports = router;