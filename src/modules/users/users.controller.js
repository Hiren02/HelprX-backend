const userService = require('./users.service');
const ApiResponse = require('../../common/utils/response');
const { asyncHandler } = require('../../common/middleware/error.middleware');

class UserController {
  /**
   * Get user profile
   * GET /api/v1/users/profile
   */
  getProfile = asyncHandler(async (req, res) => {
    const user = await userService.getUserProfile(req.user.id);
    return ApiResponse.success(res, user, 'Profile retrieved successfully');
  });

  /**
   * Update user profile
   * PUT /api/v1/users/profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    const user = await userService.updateUserProfile(req.user.id, req.body);
    return ApiResponse.success(res, user, 'Profile updated successfully');
  });

  /**
   * Update password
   * PUT /api/v1/users/password
   */
  updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    await userService.updatePassword(req.user.id, currentPassword, newPassword);
    return ApiResponse.success(res, null, 'Password updated successfully');
  });

  /**
   * Deactivate account
   * DELETE /api/v1/users/account
   */
  deactivateAccount = asyncHandler(async (req, res) => {
    await userService.deactivateAccount(req.user.id);
    return ApiResponse.success(res, null, 'Account deactivated successfully');
  });

  /**
   * Get user statistics
   * GET /api/v1/users/stats
   */
  getStats = asyncHandler(async (req, res) => {
    const stats = await userService.getUserStats(req.user.id);
    return ApiResponse.success(res, stats, 'Statistics retrieved successfully');
  });
}

module.exports = new UserController();
