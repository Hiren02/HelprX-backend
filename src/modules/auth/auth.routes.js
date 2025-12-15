const express = require('express');
const authController = require('./auth.controller');
const { validate } = require('../../common/middleware/validation.middleware');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { authLimiter } = require('../../common/middleware/rate-limit.middleware');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} = require('./auth.validator');

const router = express.Router();

// Apply rate limiting to auth routes
router.use(authLimiter);

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.get('/me', authenticate, authController.getUserDetail);

module.exports = router;
