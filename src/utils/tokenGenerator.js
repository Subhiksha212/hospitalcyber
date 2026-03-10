const crypto = require('crypto');

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const generateExpiry = (hours = 24) => {
  return Date.now() + hours * 60 * 60 * 1000;
};

module.exports = { generateToken, generateExpiry };