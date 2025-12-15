const express = require('express');
const { authenticate } = require('../../common/middleware/auth.middleware');
const paymentController = require('./payments.controller');

const router = express.Router();

// Create order and verify payment require authentication
router.post('/create-order', authenticate, paymentController.createOrder);
router.post('/verify', authenticate, paymentController.verifyPayment);

// Webhook doesn't require authentication (verified via signature)
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
