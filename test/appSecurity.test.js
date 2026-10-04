const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = 'security-test-access-secret-with-at-least-32-chars';
process.env.JWT_REFRESH_SECRET = 'security-test-refresh-secret-with-at-least-32-chars';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.NODE_ENV = 'test';

const app = require('../src/app');
const errorHandler = require('../src/middleware/errorHandler');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
});

test('root health route is available and preserves the success/message envelope', async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true, message: 'API is running.' });
});

test('CORS allows only the configured frontend origin', async () => {
  const allowed = await fetch(`${baseUrl}/api/health`, { headers: { Origin: process.env.FRONTEND_URL } });
  assert.equal(allowed.headers.get('access-control-allow-origin'), process.env.FRONTEND_URL);
  assert.equal(allowed.headers.get('access-control-allow-credentials'), 'true');

  const denied = await fetch(`${baseUrl}/api/health`, { headers: { Origin: 'https://untrusted.example' } });
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
});

test('JSON body limit rejects payloads larger than 10kb', async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: process.env.FRONTEND_URL },
    body: JSON.stringify({ data: 'x'.repeat(11 * 1024) }),
  });
  assert.equal(response.status, 413);
  assert.deepEqual(Object.keys(await response.json()).sort(), ['message', 'success']);
});

test('strict registration limiter blocks the sixth attempt in a 15-minute window', async () => {
  const sendAttempt = () => fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: process.env.FRONTEND_URL },
    body: JSON.stringify({}),
  });

  let lastResponse;
  for (let attempt = 0; attempt < 6; attempt += 1) lastResponse = await sendAttempt();
  assert.equal(lastResponse.status, 429);
  assert.deepEqual(await lastResponse.json(), {
    success: false,
    message: 'Too many registration attempts. Please try again in 15 minutes.',
  });
});

test('production error responses hide internal messages and stack traces', () => {
  const previousEnvironment = process.env.NODE_ENV;
  const previousConsoleError = console.error;
  let statusCode;
  let responseBody;
  process.env.NODE_ENV = 'production';
  console.error = () => {};

  try {
    errorHandler(new Error('database credentials leaked'), {}, {
      status(code) { statusCode = code; return this; },
      json(body) { responseBody = body; return this; },
    }, () => {});
  } finally {
    process.env.NODE_ENV = previousEnvironment;
    console.error = previousConsoleError;
  }

  assert.equal(statusCode, 500);
  assert.deepEqual(responseBody, { success: false, message: 'Internal server error.' });
});