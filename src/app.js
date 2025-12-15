const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
require('dotenv').config();

const logger = require('./common/utils/logger');
const { errorHandler, notFoundHandler } = require('./common/middleware/error.middleware');
const { apiLimiter } = require('./common/middleware/rate-limit.middleware');

// Import routes
const authRoutes = require('./modules/auth/auth.routes');
const jobRoutes = require('./modules/jobs/jobs.routes');
const userRoutes = require('./modules/users/users.routes');
const workerRoutes = require('./modules/workers/workers.routes');
const addressRoutes = require('./modules/addresses/addresses.routes');
const ratingRoutes = require('./modules/ratings/ratings.routes');
const notificationRoutes = require('./modules/notifications/notifications.routes');
const pricingRoutes = require('./modules/pricing/pricing.routes');
const walletRoutes = require('./modules/wallet/wallet.routes');
const paymentRoutes = require('./modules/payments/payments.routes');
const matchingRoutes = require('./modules/matching/matching.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const adminRoutes = require('./modules/admin/admin.routes');

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'HelprX API Documentation',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/workers', workerRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1/ratings', ratingRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/pricing', pricingRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/matching', matchingRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/admin', adminRoutes);

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;
