const walletService = require('./wallet.service');
const ApiResponse = require('../../common/utils/response');
const { asyncHandler } = require('../../common/middleware/error.middleware');

class WalletController {
  /**
   * Get wallet balance
   * GET /api/v1/wallet/balance
   */
  getBalance = asyncHandler(async (req, res) => {
    const wallet = await walletService.getWalletBalance(req.user.id);
    return ApiResponse.success(res, wallet, 'Wallet balance retrieved successfully');
  });

  /**
   * Get transaction history
   * GET /api/v1/wallet/transactions
   */
  getTransactions = asyncHandler(async (req, res) => {
    const result = await walletService.getTransactions(req.user.id, req.query);
    
    return ApiResponse.paginated(
      res,
      result.transactions,
      result.page,
      parseInt(req.query.limit) || 20,
      result.total,
      'Transactions retrieved successfully'
    );
  });

  /**
   * Request payout
   * POST /api/v1/wallet/payout
   */
  requestPayout = asyncHandler(async (req, res) => {
    const result = await walletService.requestPayout(req.user.id, req.body.amount);
    return ApiResponse.created(res, result, 'Payout requested successfully');
  });
}

module.exports = new WalletController();
