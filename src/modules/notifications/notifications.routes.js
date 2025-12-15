const express = require('express');
const { authenticate } = require('../../common/middleware/auth.middleware');
const ApiResponse = require('../../common/utils/response');
const notificationService = require('./notifications.service');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user notifications
router.get('/', async (req, res) => {
  try {
    const result = await notificationService.getUserNotifications(req.user.id, req.query);
    
    return ApiResponse.paginated(
      res,
      result.notifications,
      parseInt(req.query.page) || 1,
      parseInt(req.query.limit) || 20,
      result.total,
      'Notifications retrieved successfully'
    );
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user.id);
    return ApiResponse.success(res, null, 'Notification marked as read');
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
});

// Mark all as read
router.put('/read-all', async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    return ApiResponse.success(res, null, 'All notifications marked as read');
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
});

module.exports = router;
