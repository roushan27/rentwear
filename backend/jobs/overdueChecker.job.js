const cron = require('node-cron');
const dayjs = require('dayjs');
const Rental = require('../models/Rental.model');
const User = require('../models/User.model');
const Transaction = require('../models/Transaction.model');

const DAILY_PENALTY = 200; // ₹200 per day overdue (tum apna amount set kar sakte ho)

const checkOverdueRentals = async () => {
  try {
    const today = dayjs().format('YYYY-MM-DD');

    // 1️⃣ Naye overdue rentals find karo (endDate nikal gaya, status abhi 'active' hai)
    const newlyOverdue = await Rental.find({
      endDate: { $lt: today },
      status: 'active',
    });

    for (const rental of newlyOverdue) {
      rental.status = 'overdue';
      await rental.save();
      console.log(`⚠️ Rental ${rental._id} marked as OVERDUE`);
    }

    // 2️⃣ Already overdue rentals — unse roz penalty katni hai
    const overdueRentals = await Rental.find({ status: 'overdue' });

    for (const rental of overdueRentals) {
      const user = await User.findById(rental.userId);

      if (!user) continue;

      // Wallet se penalty deduct karo (negative bhi ho sakta hai, real app me credit limit handle karenge)
      user.walletBalance -= DAILY_PENALTY;
      await user.save();

      rental.penaltyAmount += DAILY_PENALTY;
      await rental.save();

      await Transaction.create({
        userId: rental.userId,
        type: 'debit',
        amount: DAILY_PENALTY,
        reason: 'Overdue Daily Penalty',
        relatedRentalId: rental._id,
      });

      console.log(`💸 Penalty of ₹${DAILY_PENALTY} deducted for rental ${rental._id}`);
    }

    console.log(`✅ Overdue check completed at ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
  } catch (error) {
    console.error('❌ Overdue checker error:', error.message);
  }
};

// Har raat 12:00 AM (midnight) chalega
const startOverdueCron = () => {
  cron.schedule('0 0 * * *', () => {
    console.log('🕛 Running overdue checker job...');
    checkOverdueRentals();
  });
  console.log('⏰ Overdue cron job scheduled (runs daily at midnight)');
};

module.exports = { startOverdueCron, checkOverdueRentals };