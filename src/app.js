const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiters');
const routes = require('./routes/index');
const setupSwagger = require('./config/swagger');

const app = express();

// Security
app.use(helmet());

// CORS
app.use(cors({
  origin: (origin, callback) => {
    callback(null, Boolean(origin && process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL));
  },
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb', parameterLimit: 100 }));
app.use(cookieParser());
app.use(mongoSanitize());

// Logger
app.use(morgan('combined'));
app.use(generalLimiter);

// API documentation
setupSwagger(app);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running.' });
});

// API routes
app.use('/api', routes);

// ❌ Swagger must be ABOVE this
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;
