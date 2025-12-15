const paymentService = require('./payments.service');
const ApiResponse = require('../../common/utils/response');
const { asyncHandler } = require('../../common/middleware/error.middleware');

class PaymentController {
  /**
   * Create payment order
   * POST /api/v1/payments/create-order
   */
  createOrder = asyncHandler(async (req, res) => {
    const order = await paymentService.createOrder(req.user.id, req.body);
    return ApiResponse.created(res, order, 'Payment order created (Razorpay integration pending)');
  });

  /**
   * Verify payment
   * POST /api/v1/payments/verify
   */
  verifyPayment = asyncHandler(async (req, res) => {
    const result = await paymentService.verifyPayment(req.body);
    return ApiResponse.success(res, result, 'Payment verified (Razorpay integration pending)');
  });

  /**
   * Handle webhook
   * POST /api/v1/payments/webhook
   */
  handleWebhook = asyncHandler(async (req, res) => {
    const result = await paymentService.handleWebhook(req.body);
    return ApiResponse.success(res, result, 'Webhook received');
  });
}

module.exports = new PaymentController();
