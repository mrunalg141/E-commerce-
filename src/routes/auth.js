const express = require('express');
const { authenticate } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/authValidation');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiters');
const { register, login, refresh, logout, currentUser } = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Create a customer account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201: { description: Account created; sign in separately to receive an access token }
 *       400: { description: Invalid input }
 *       409: { description: Email already registered }
 */
router.post('/register', registerLimiter, validateRegister, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Sign in to a customer account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Signed in and access token issued }
 *       401: { description: Invalid credentials }
 */
router.post('/login', loginLimiter, validateLogin, login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Rotate the access and refresh cookies
 *     responses:
 *       200: { description: Session refreshed }
 *       401: { description: Missing, invalid, or expired refresh cookie }
 */
router.post('/refresh', refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Revoke the refresh token and clear auth cookies
 *     responses:
 *       200: { description: Signed out }
 */
router.post('/logout', logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the authenticated user
 *     security:
 *       - accessCookie: []
 *     responses:
 *       200: { description: Current user details }
 *       401: { description: Missing or invalid access token }
 */
router.get('/me', authenticate, currentUser);

module.exports = router;