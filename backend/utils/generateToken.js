const jwt = require('jsonwebtoken');

const generateToken = (id, secret = process.env.JWT_SECRET) => {
  return jwt.sign({ id }, secret, { expiresIn: '7d' });
};

module.exports = generateToken;