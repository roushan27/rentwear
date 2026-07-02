const dayjs = require('dayjs');

const calculateCost = (startDate, endDate, rentPerDay, securityDeposit) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  const totalDays = end.diff(start, 'day') + 1; // dono din count honge

  if (totalDays <= 0) {
    throw new Error('End date must be after start date');
  }

  const totalRent = totalDays * rentPerDay;
  const grandTotal = totalRent + securityDeposit;

  return { totalDays, totalRent, securityDeposit, grandTotal };
};

module.exports = calculateCost;