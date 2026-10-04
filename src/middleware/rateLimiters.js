const rateLimit = require('express-rate-limit');

const createLimiter = (limit, message) => rateLimit({
  windowMs: 15 * 60 * 1000,
  limit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message },
});

const generalLimiter = createLimiter(100, 'Too many requests. Please try again later.');
const loginLimiter = createLimiter(5, 'Too many sign-in attempts. Please try again in 15 minutes.');
const registerLimiter = createLimiter(5, 'Too many registration attempts. Please try again in 15 minutes.');

module.exports = { generalLimiter, loginLimiter, registerLimiter };