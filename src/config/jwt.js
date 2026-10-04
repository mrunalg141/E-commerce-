/* module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key',
  jwtExpire: process.env.JWT_EXPIRE || '15m',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
};
**/
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
const isConfiguredSecret = (secret) => typeof secret === 'string' && secret.length >= 32 && !/[<>]/.test(secret);
if (!isConfiguredSecret(jwtSecret) || !isConfiguredSecret(jwtRefreshSecret) || jwtSecret === jwtRefreshSecret) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be distinct secrets with at least 32 characters each.');
}

const jwtRefreshExpire = process.env.JWT_REFRESH_EXPIRE || '7d';
const refreshExpiry = jwtRefreshExpire.match(/^(\d+)([smhd])$/);
if (!refreshExpiry) {
  throw new Error('JWT_REFRESH_EXPIRE must use seconds, minutes, hours, or days (for example, 7d).');
}

const jwtConfig = {
  jwtSecret,
  jwtRefreshSecret,
  jwtExpire: '15m',
  jwtRefreshExpire,
  jwtRefreshMaxAge: Number(refreshExpiry[1]) * ({ s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[refreshExpiry[2]]),
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

