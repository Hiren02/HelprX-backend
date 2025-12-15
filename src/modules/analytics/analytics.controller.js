const analyticsService = require('./analytics.service');
const ApiResponse = require('../../common/utils/response');
const { asyncHandler } = require('../../common/middleware/error.middleware');

class AnalyticsController {
  /**
   * Get platform overview
   * GET /api/v1/analytics/overview
   */
  getOverview = asyncHandler(async (req, res) => {
    const overview = await analyticsService.getPlatformOverview();
    return ApiResponse.success(res, overview, 'Platform overview retrieved successfully');
  });

  /**
   * Get revenue analytics
   * GET /api/v1/analytics/revenue
   */
  getRevenue = asyncHandler(async (req, res) => {
    const revenue = await analyticsService.getRevenueAnalytics(req.query);
    return ApiResponse.success(res, revenue, 'Revenue analytics retrieved successfully');
  });

  /**
   * Get job analytics
   * GET /api/v1/analytics/jobs
   */
  getJobs = asyncHandler(async (req, res) => {
    const jobs = await analyticsService.getJobAnalytics(req.query);
    return ApiResponse.success(res, jobs, 'Job analytics retrieved successfully');
  });

  /**
   * Get worker analytics
   * GET /api/v1/analytics/workers
   */
  getWorkers = asyncHandler(async (req, res) => {
    const workers = await analyticsService.getWorkerAnalytics();
    return ApiResponse.success(res, workers, 'Worker analytics retrieved successfully');
  });

  /**
   * Get user analytics
   * GET /api/v1/analytics/users
   */
  getUsers = asyncHandler(async (req, res) => {
    const users = await analyticsService.getUserAnalytics();
    return ApiResponse.success(res, users, 'User analytics retrieved successfully');
  });

  /**
   * Get rating analytics
   * GET /api/v1/analytics/ratings
   */
  getRatings = asyncHandler(async (req, res) => {
    const ratings = await analyticsService.getRatingAnalytics();
    return ApiResponse.success(res, ratings, 'Rating analytics retrieved successfully');
  });

  /**
   * Get real-time metrics
   * GET /api/v1/analytics/realtime
   */
  getRealTime = asyncHandler(async (req, res) => {
    const metrics = await analyticsService.getRealTimeMetrics();
    return ApiResponse.success(res, metrics, 'Real-time metrics retrieved successfully');
  });
}

module.exports = new AnalyticsController();
