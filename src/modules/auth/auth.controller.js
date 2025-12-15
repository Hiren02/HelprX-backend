const authService = require('./auth.service');
const ApiResponse = require('../../common/utils/response');
const { asyncHandler } = require('../../common/middleware/error.middleware');
const { SUCCESS_MESSAGES } = require('../../common/constants');

class AuthController {
  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    return ApiResponse.created(res, result, SUCCESS_MESSAGES.REGISTRATION_SUCCESS);
  });

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  login = asyncHandler(async (req, res) => {
    const { phone, password } = req.body;
    const result = await authService.login(phone, password);
    return ApiResponse.success(res, result, SUCCESS_MESSAGES.LOGIN_SUCCESS);
  });

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    return ApiResponse.success(res, result, 'Token refreshed successfully');
  });

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  logout = asyncHandler(async (req, res) => {
    await authService.logout(req.user.id);
    return ApiResponse.success(res, null, SUCCESS_MESSAGES.LOGOUT_SUCCESS);
  });

  /**
   * Change password
   * POST /api/v1/auth/change-password
   */
  changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, oldPassword, newPassword);
    return ApiResponse.success(res, null, 'Password changed successfully');
  });

  /**
   * Get current user
   * GET /api/v1/auth/me
   */
  getUserDetail = asyncHandler(async (req, res) => {
    const userDetail = await authService.getUserDetail(req.user.id);
    return ApiResponse.success(res, userDetail, 'User retrieved successfully');
  });
}

module.exports = new AuthController();
