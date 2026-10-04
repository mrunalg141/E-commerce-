const { beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-only-secret-with-at-least-32-characters';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-with-at-least-32-characters';

const User = require('../src/models/User');
const { register, login, refresh, logout, currentUser } = require('../src/controllers/authController');
const { authenticate } = require('../src/middleware/auth');
const { validateRegister, validateLogin } = require('../src/middleware/authValidation');
const { verifyAccessToken, verifyRefreshToken } = require('../src/config/jwt');

const users = [];

User.findOne = (filter) => {
  const query = Promise.resolve(users.find((user) => user.email === filter.email) || null);
  query.select = () => query;
  return query;
};
User.findById = (id) => {
  const query = Promise.resolve(users.find((user) => user._id.toString() === id) || null);
  query.select = () => query;
  return query;
};
User.updateOne = async (filter, update) => {
  const user = users.find((entry) => entry._id.toString() === filter._id.toString() && entry.refreshTokenHash === filter.refreshTokenHash);
  if (user && update.$unset?.refreshTokenHash) user.refreshTokenHash = undefined;
  return { modifiedCount: user ? 1 : 0 };
};
User.prototype.save = async function save() {
  if (users.some((user) => user.email === this.email && !user._id.equals(this._id))) {
    const error = new Error('duplicate key');
    error.code = 11000;
    throw error;
  }
  if (!this._id) this._id = new mongoose.Types.ObjectId();
  if (!users.some((user) => user._id.equals(this._id))) users.push(this);
  return this;
};

const invoke = async (handler, req) => {
  let status = 200;
  let body;
  const res = {
    status(code) { status = code; return this; },
    json(value) { body = value; return this; },
    cookie(name, value, options) { res.cookies[name] = { value, options }; return this; },
    clearCookie(name, options) { res.clearedCookies.push({ name, options }); return this; },
    cookies: {},
    clearedCookies: [],
  };
  await handler(req, res, (error) => { if (error) throw error; });
  return { status, body, cookies: res.cookies, clearedCookies: res.clearedCookies };
};

const validateBody = async (validators, body) => {
  const req = { body };
  for (const validator of validators.slice(0, -1)) await validator.run(req);
  return invoke(validators.at(-1), req);
};

beforeEach(() => users.splice(0, users.length));

test('registration hashes password and only assigns the user role', async () => {
  const result = await invoke(register, {
    body: { name: '  Avery Example  ', email: 'AVERY@example.com', password: 'Secure-pass-123', role: 'admin' },
  });

  assert.equal(result.status, 201);
  assert.deepEqual(result.body, { success: true, message: 'Account created successfully' });
  assert.equal(users[0].name, 'Avery Example');
  assert.equal(users[0].email, 'avery@example.com');
  assert.equal(users[0].role, 'user');
  assert.equal(User.schema.path('passwordHash').options.select, false);
  assert.equal(await bcrypt.compare('Secure-pass-123', users[0].passwordHash), true);
  assert.match(users[0].passwordHash, /^\$2[aby]\$12\$/);
  assert.equal('token' in result.body, false);
  assert.equal('user' in result.body, false);
  assert.equal(result.cookies.accessToken, undefined);
  assert.equal(result.cookies.refreshToken, undefined);
});

test('registration rejects invalid input and duplicate email', async () => {
  const invalid = await invoke(register, { body: { name: 'Avery', email: 'not-an-email', password: 'short' } });
  assert.equal(invalid.status, 400);

  await invoke(register, { body: { name: 'Avery', email: 'avery@example.com', password: 'Secure-pass-123' } });
  const duplicate = await invoke(register, { body: { name: 'Another Avery', email: 'AVERY@example.com', password: 'Secure-pass-123' } });
  assert.equal(duplicate.status, 409);
});

test('auth validation rejects invalid email, name, and weak passwords with clear messages', async () => {
  const badRegister = await validateBody(validateRegister, {
    name: 'A', email: 'not-an-email', password: 'weakpassword',
  });
  assert.equal(badRegister.status, 400);
  assert.equal(typeof badRegister.body.message, 'string');

  const badLogin = await validateBody(validateLogin, {
    email: 'valid@example.com', password: 'weakpassword',
  });
  assert.equal(badLogin.status, 400);
  assert.match(badLogin.body.message, /uppercase/);
});

test('login rejects wrong password and sets HttpOnly access and refresh cookies on success', async () => {
  await invoke(register, { body: { name: 'Avery', email: 'avery@example.com', password: 'Secure-pass-123' } });

  const wrongPassword = await invoke(login, { body: { email: 'avery@example.com', password: 'Wrong-pass-123' } });
  assert.equal(wrongPassword.status, 401);

  const signedIn = await invoke(login, { body: { email: 'AVERY@example.com', password: 'Secure-pass-123' } });
  assert.equal(signedIn.status, 200);
  const accessClaims = verifyAccessToken(signedIn.cookies.accessToken.value);
  assert.equal(accessClaims.sub, users[0]._id.toString());
  assert.equal(accessClaims.exp - accessClaims.iat, 15 * 60);
  assert.equal(verifyRefreshToken(signedIn.cookies.refreshToken.value).type, 'refresh');
  assert.equal(signedIn.cookies.accessToken.options.httpOnly, true);
  assert.equal(signedIn.cookies.refreshToken.options.httpOnly, true);
  assert.equal(signedIn.cookies.accessToken.options.sameSite, 'lax');
  assert.equal(signedIn.cookies.accessToken.options.secure, false);
  assert.equal(signedIn.cookies.accessToken.options.maxAge, 15 * 60 * 1000);
  assert.equal(signedIn.body.data.token, undefined);

  const previousEnvironment = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    const productionLogin = await invoke(login, { body: { email: 'avery@example.com', password: 'Secure-pass-123' } });
    assert.equal(productionLogin.cookies.accessToken.options.secure, true);
    assert.equal(productionLogin.cookies.refreshToken.options.secure, true);
    assert.equal(productionLogin.cookies.accessToken.options.sameSite, 'none');
  } finally {
    process.env.NODE_ENV = previousEnvironment;
  }
});

test('cookie auth rejects missing and expired access tokens', async () => {
  const missingToken = await invoke(authenticate, { cookies: {} });
  assert.equal(missingToken.status, 401);

  const expiredToken = jwt.sign({ sub: new mongoose.Types.ObjectId().toString(), type: 'access' }, process.env.JWT_SECRET, { expiresIn: -1 });
  const expired = await invoke(authenticate, { cookies: { accessToken: expiredToken } });
  assert.equal(expired.status, 401);
  assert.match(expired.body.message, /expired/);
});

test('refresh rotates cookies and logout invalidates the refresh token', async () => {
  await invoke(register, { body: { name: 'Avery', email: 'avery@example.com', password: 'Secure-pass-123' } });
  const signedIn = await invoke(login, { body: { email: 'avery@example.com', password: 'Secure-pass-123' } });
  const firstRefreshToken = signedIn.cookies.refreshToken.value;
  assert.equal(users[0].refreshTokenHash.length, 64);

  const refreshed = await invoke(refresh, { cookies: { refreshToken: firstRefreshToken } });
  assert.equal(refreshed.status, 200);
  assert.notEqual(refreshed.cookies.refreshToken.value, firstRefreshToken);
  assert.equal(users[0].refreshTokenHash.length, 64);

  const signedOut = await invoke(logout, { cookies: { refreshToken: refreshed.cookies.refreshToken.value } });
  assert.equal(signedOut.status, 200);
  assert.equal(users[0].refreshTokenHash, undefined);
  assert.deepEqual(signedOut.clearedCookies.map((cookie) => cookie.name).sort(), ['accessToken', 'refreshToken']);
});

test('current-user endpoint reads the authenticated cookie user', async () => {
  await invoke(register, { body: { name: 'Avery', email: 'avery@example.com', password: 'Secure-pass-123' } });
  const signedIn = await invoke(login, { body: { email: 'avery@example.com', password: 'Secure-pass-123' } });
  const req = { cookies: { accessToken: signedIn.cookies.accessToken.value } };
  let authenticated = false;
  authenticate(req, { status() { return this; }, json() {} }, () => { authenticated = true; });
  assert.equal(authenticated, true);

  const current = await invoke(currentUser, { user: req.user });
  assert.equal(current.status, 200);
  assert.equal(current.body.data.user.email, 'avery@example.com');
  assert.equal('passwordHash' in current.body.data.user, false);
});