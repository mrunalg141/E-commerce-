const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  jwtExpire,
  jwtRefreshExpire,
  jwtRefreshMaxAge,
} = require('../config/jwt');
const asyncHandler = require('../middleware/asyncHandler');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
const ACCESS_COOKIE = 'accessToken';
const REFRESH_COOKIE = 'refreshToken';
const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE = jwtRefreshMaxAge;

const cookieOptions = (path, maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path,
  maxAge,
});

const clearAuthCookies = (res) => {
  const { maxAge, ...accessOptions } = cookieOptions('/', ACCESS_COOKIE_MAX_AGE);
  const { maxAge: refreshMaxAge, ...refreshOptions } = cookieOptions('/api/auth', REFRESH_COOKIE_MAX_AGE);
  res.clearCookie(ACCESS_COOKIE, accessOptions);
  res.clearCookie(REFRESH_COOKIE, refreshOptions);
};

const hashRefreshToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const publicUser = (user) => ({
  id: user._id.toString(),
  name: user.name || '',
  email: user.email,
  role: user.role,
});

const createAccessToken = (user) => signAccessToken({
  sub: user._id.toString(),
  email: user.email,
  role: user.role,
  type: 'access',
});

const createRefreshToken = (user) => signRefreshToken({
  sub: user._id.toString(),
  type: 'refresh',
  jti: crypto.randomUUID(),
});

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie(ACCESS_COOKIE, accessToken, cookieOptions('/', ACCESS_COOKIE_MAX_AGE));
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions('/api/auth', REFRESH_COOKIE_MAX_AGE));
};

const register = asyncHandler(async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (name.length < 2 || name.length > 50 || !emailPattern.test(email) || email.length > 254 || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72 || !passwordPattern.test(password)) {
    return res.status(400).json({
      success: false,
      message: 'Provide a name (2-50 characters), a valid email, and a password of at least 8 characters with uppercase, lowercase, and a number.',
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
    message: 'Account created successfully',
  });
});

const login = asyncHandler(async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!emailPattern.test(email) || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72 || !passwordPattern.test(password)) {
    return res.status(400).json({ success: false, message: 'Provide a valid email and a password of at least 8 characters with uppercase, lowercase, and a number.' });
  }

  const user = await User.findOne({ email }).select('+passwordHash +refreshTokenHash');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  user.refreshTokenHash = hashRefreshToken(refreshToken);
  await user.save();
  setAuthCookies(res, accessToken, refreshToken);

  return res.json({
    success: true,
    message: 'Signed in successfully.',
    data: { user: publicUser(user), expiresIn: jwtExpire },
  });
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  if (!refreshToken) {
    clearAuthCookies(res);
    return res.status(401).json({ success: false, message: 'No active refresh session.' });
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    clearAuthCookies(res);
    return res.status(401).json({ success: false, message: 'Refresh token is invalid or expired.' });
  }

  if (decoded.type !== 'refresh' || !mongoose.isValidObjectId(decoded.sub)) {
    clearAuthCookies(res);
    return res.status(401).json({ success: false, message: 'Refresh token is invalid or expired.' });
  }

  const user = await User.findById(decoded.sub).select('+refreshTokenHash');
  if (!user || user.refreshTokenHash !== hashRefreshToken(refreshToken)) {
    clearAuthCookies(res);
    return res.status(401).json({ success: false, message: 'Refresh token is invalid or expired.' });
  }

  const accessToken = createAccessToken(user);
  const rotatedRefreshToken = createRefreshToken(user);
  user.refreshTokenHash = hashRefreshToken(rotatedRefreshToken);
  await user.save();
  setAuthCookies(res, accessToken, rotatedRefreshToken);

  return res.json({ success: true, message: 'Session refreshed.', data: { user: publicUser(user), expiresIn: jwtExpire, refreshExpiresIn: jwtRefreshExpire } });
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded.type === 'refresh' && mongoose.isValidObjectId(decoded.sub)) {
        await User.updateOne(
          { _id: decoded.sub, refreshTokenHash: hashRefreshToken(refreshToken) },
          { $unset: { refreshTokenHash: 1 } },
        );
      }
    } catch (error) {
      if (!['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(error.name)) throw error;
    }
  }

  clearAuthCookies(res);
  return res.json({ success: true, message: 'Signed out successfully.' });
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

module.exports = { register, login, refresh, logout, currentUser };