const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const { signAccessToken } = require('../config/jwt');
const asyncHandler = require('../middleware/asyncHandler');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicUser = (user) => ({
  id: user._id.toString(),
  name: user.name || '',
  email: user.email,
  role: user.role,
});

const createToken = (user) => signAccessToken({
  sub: user._id.toString(),
  email: user.email,
  role: user.role,
});

const register = asyncHandler(async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!name || name.length > 100 || !emailPattern.test(email) || email.length > 254 || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({
      success: false,
      message: 'Provide a name, a valid email, and a password between 8 and 72 bytes.',
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }

  const user = new User({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: 'user',
  });

  try {
    await user.save();
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }
    throw error;
  }

  return res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data: { user: publicUser(user), token: createToken(user) },
  });
});

const login = asyncHandler(async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!emailPattern.test(email) || !password || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ success: false, message: 'Provide a valid email and password.' });
  }

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  return res.json({
    success: true,
    message: 'Signed in successfully.',
    data: { user: publicUser(user), token: createToken(user) },
  });
});

const currentUser = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.user.sub)) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }

  const user = await User.findById(req.user.sub);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }

  return res.json({ success: true, data: { user: publicUser(user) } });
});

module.exports = { register, login, currentUser };