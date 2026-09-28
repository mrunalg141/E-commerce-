const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     responses:
 *       200:
 *         description: API is running
 */
router.get('/health', (req, res) => {
  res.json({ success: true });
});

router.use('/auth', authRoutes);

module.exports = router;
