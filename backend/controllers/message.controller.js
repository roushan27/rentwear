const Message = require('../models/Message.model');
const Product = require('../models/Product.model');
const sendEmail = require('../utils/sendEmail');
const { newMessageEmail } = require('../utils/emailTemplates');
const User = require('../models/User.model');

// Simple bad-word/contact-info filter — phone number ya email leak hone se roke
const containsContactInfo = (text) => {
  const phoneRegex = /(\+?\d[\s-]?){9,}/; // 9+ consecutive digits
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  return phoneRegex.test(text) || emailRegex.test(text);
};

// @desc    Send a message about a product (buyer → seller, or reply)
// @route   POST /api/messages
exports.sendMessage = async (req, res) => {
  try {
    const { productId, text } = req.body;
    const senderId = req.user.id;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    if (containsContactInfo(text)) {
      return res.status(400).json({
        message: 'For your safety, sharing phone numbers or emails in chat is not allowed. Please continue communication within the app.',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (!product.owner) {
      return res.status(400).json({ message: 'This item does not have a listed owner to contact' });
    }

    const sellerId = product.owner.toString();

    // Agar sender khud seller hai, to already existing conversation me se buyer nikalo
    let buyerId;
    if (senderId === sellerId) {
      const existingMessage = await Message.findOne({ productId, sellerId }).sort({ createdAt: 1 });
      if (!existingMessage) {
        return res.status(400).json({ message: 'No buyer has contacted you about this item yet' });
      }
      buyerId = existingMessage.buyerId;
    } else {
      buyerId = senderId;
    }

    const message = await Message.create({
      productId,
      buyerId,
      sellerId,
      senderId,
      text: text.trim(),
    });

    const receiverId = senderId === sellerId ? message.buyerId : sellerId;
    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (receiver && sender) {
      sendEmail({
        to: receiver.email,
        subject: 'New message on RentWear',
        html: newMessageEmail(receiver.name, sender.name, product.title),
      });
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get conversation for a product (between logged-in user and the other party)
// @route   GET /api/messages/:productId
exports.getConversation = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const messages = await Message.find({
      productId,
      $or: [{ buyerId: userId }, { sellerId: userId }],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all my conversations (inbox — grouped by product)
// @route   GET /api/messages/my-inbox
exports.getMyInbox = async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await Message.find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
    })
      .populate('productId', 'title images')
      .populate('buyerId', 'name')
      .populate('sellerId', 'name')
      .sort({ createdAt: -1 });

    // Group by product+other-party, sirf latest message rakho
    const seen = new Map();
    for (const msg of messages) {
      const key = `${msg.productId?._id}-${msg.buyerId?._id}-${msg.sellerId?._id}`;
      if (!seen.has(key)) seen.set(key, msg);
    }

    res.status(200).json(Array.from(seen.values()));
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
// @desc    Get unread message count (for navbar badge)
// @route   GET /api/messages/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Message.countDocuments({
      $or: [{ buyerId: userId }, { sellerId: userId }],
      senderId: { $ne: userId }, // sirf dusre ke bheje hue
      isRead: false,
    });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Mark all messages in a conversation as read
// @route   PUT /api/messages/:productId/read
exports.markAsRead = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    await Message.updateMany(
      {
        productId,
        $or: [{ buyerId: userId }, { sellerId: userId }],
        senderId: { $ne: userId },
        isRead: false,
      },
      { isRead: true }
    );

    res.status(200).json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};