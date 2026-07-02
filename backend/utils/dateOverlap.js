const dayjs = require('dayjs');

// Check karta hai ki naya date-range kisi existing booking se overlap to nahi kar raha
const isDateOverlapping = (existingDisabledDates, startDate, endDate) => {
  const requestedDates = [];
  let current = dayjs(startDate);
  const end = dayjs(endDate);

  while (current.isBefore(end) || current.isSame(end)) {
    requestedDates.push(current.format('YYYY-MM-DD'));
    current = current.add(1, 'day');
  }

  return requestedDates.some(date => existingDisabledDates.includes(date));
};

// Saari dates ka array banata hai start se end tak (disabledDates me push karne ke liye)
const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  let current = dayjs(startDate);
  const end = dayjs(endDate);

  while (current.isBefore(end) || current.isSame(end)) {
    dates.push(current.format('YYYY-MM-DD'));
    current = current.add(1, 'day');
  }

  return dates;
};

module.exports = { isDateOverlapping, getDatesInRange };