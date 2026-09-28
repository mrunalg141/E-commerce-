const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes/index');
const setupSwagger = require('./config/swagger');

const app = express();

/* ✅ 1. Swagger FIRST */
setupSwagger(app);

// Security
app.use(helmet());

// CORS
const localFrontendOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
];
const configuredFrontendOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedFrontendOrigins = new Set([...localFrontendOrigins, ...configuredFrontendOrigins]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedFrontendOrigins.has(origin)) {
      return callback(null, true);
    }

    callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
app.use(morgan('combined'));

// API routes
app.use('/api', routes);

// ❌ Swagger must be ABOVE this
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;
