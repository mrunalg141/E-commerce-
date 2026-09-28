/* module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key',
  jwtExpire: process.env.JWT_EXPIRE || '15m',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
};
**/
const jwt = require('jsonwebtoken');

const jwtConfig = {
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key',
  jwtExpire: process.env.JWT_EXPIRE || '15m',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
};

// Sign access token
const signAccessToken = (payload) =>
  jwt.sign(payload, jwtConfig.jwtSecret, { expiresIn: jwtConfig.jwtExpire });

// Sign refresh token
const signRefreshToken = (payload) =>
  jwt.sign(payload, jwtConfig.jwtRefreshSecret, { expiresIn: jwtConfig.jwtRefreshExpire });

// Verify access token
const verifyAccessToken = (token) =>
  jwt.verify(token, jwtConfig.jwtSecret);

// Verify refresh token
const verifyRefreshToken = (token) =>
  jwt.verify(token, jwtConfig.jwtRefreshSecret);

module.exports = {
  ...jwtConfig,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};

