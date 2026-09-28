const { beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

process.env.JWT_SECRET = 'test-only-secret-with-at-least-32-characters';

const User = require('../src/models/User');
const { register, login, currentUser } = require('../src/controllers/authController');
const { authenticate } = require('../src/middleware/auth');
const { verifyAccessToken } = require('../src/config/jwt');

const users = [];

User.findOne = (filter) => {
  const query = Promise.resolve(users.find((user) => user.email === filter.email) || null);
  query.select = () => query;
  return query;
};
User.findById = async (id) => users.find((user) => user._id.toString() === id) || null;
User.prototype.save = async function save() {
  if (users.some((user) => user.email === this.email)) {
    const error = new Error('duplicate key');
    error.code = 11000;
    throw error;
  }
  this._id = new mongoose.Types.ObjectId();
  users.push(this);
  return this;
};

const invoke = async (handler, req) => {
  let status = 200;
  let body;
  const res = {
    status(code) { status = code; return this; },
    json(value) { body = value; return this; },
  };
  await handler(req, res, (error) => { if (error) throw error; });
  return { status, body };
};

beforeEach(() => users.splice(0, users.length));

test('registration hashes password and only assigns the user role', async () => {
  const result = await invoke(register, {
    body: { name: '  Avery Example  ', email: 'AVERY@example.com', password: 'secure-pass-123', role: 'admin' },
  });

  assert.equal(result.status, 201);
  assert.equal(result.body.data.user.name, 'Avery Example');
  assert.equal(result.body.data.user.email, 'avery@example.com');
  assert.equal(result.body.data.user.role, 'user');
  assert.equal('passwordHash' in result.body.data.user, false);
  assert.equal(await bcrypt.compare('secure-pass-123', users[0].passwordHash), true);
  assert.equal(verifyAccessToken(result.body.data.token).role, 'user');
});

test('registration rejects invalid input and duplicate email', async () => {
  const invalid = await invoke(register, { body: { name: 'Avery', email: 'not-an-email', password: 'short' } });
  assert.equal(invalid.status, 400);

  await invoke(register, { body: { name: 'Avery', email: 'avery@example.com', password: 'secure-pass-123' } });
  const duplicate = await invoke(register, { body: { name: 'Another Avery', email: 'AVERY@example.com', password: 'secure-pass-123' } });
  assert.equal(duplicate.status, 409);
});

test('login issues a token only for a matching password', async () => {
  await invoke(register, { body: { name: 'Avery', email: 'avery@example.com', password: 'secure-pass-123' } });

  const wrongPassword = await invoke(login, { body: { email: 'avery@example.com', password: 'wrong-password' } });
  assert.equal(wrongPassword.status, 401);

  const signedIn = await invoke(login, { body: { email: 'AVERY@example.com', password: 'secure-pass-123' } });
  assert.equal(signedIn.status, 200);
  assert.equal(verifyAccessToken(signedIn.body.data.token).sub, users[0]._id.toString());
});

test('current-user endpoint requires and verifies a bearer token', async () => {
  await invoke(register, { body: { name: 'Avery', email: 'avery@example.com', password: 'secure-pass-123' } });
  const missingToken = await invoke(authenticate, { headers: {} });
  assert.equal(missingToken.status, 401);

  const signedIn = await invoke(login, { body: { email: 'avery@example.com', password: 'secure-pass-123' } });
  const req = { headers: { authorization: `Bearer ${signedIn.body.data.token}` } };
  let authenticated = false;
  authenticate(req, { status() { return this; }, json() {} }, () => { authenticated = true; });
  assert.equal(authenticated, true);

  const current = await invoke(currentUser, { user: req.user });
  assert.equal(current.status, 200);
  assert.equal(current.body.data.user.email, 'avery@example.com');
  assert.equal('passwordHash' in current.body.data.user, false);
});