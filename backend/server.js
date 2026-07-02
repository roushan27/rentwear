const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { startOverdueCron } = require('./jobs/overdueChecker.job');

dotenv.config();
connectDB();
startOverdueCron();

const app = express();

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/kyc', require('./routes/kyc.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/rentals', require('./routes/rental.routes'));
app.use('/api/wallet', require('./routes/wallet.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/wishlist', require('./routes/wishlist.routes'));

app.get('/', (req, res) => {
  res.send('🚀 RentWear API is running...');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});