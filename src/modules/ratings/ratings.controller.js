const ratingService = require('./ratings.service');
const ApiResponse = require('../../common/utils/response');
const { asyncHandler } = require('../../common/middleware/error.middleware');

class RatingController {
  /**
   * Submit rating
   * POST /api/v1/ratings
   */
  submitRating = asyncHandler(async (req, res) => {
    const rating = await ratingService.submitRating(req.user.id, req.body);
    return ApiResponse.created(res, rating, 'Rating submitted successfully');
  });

  /**
   * Get worker ratings
   * GET /api/v1/ratings/worker/:workerId
   */
  getWorkerRatings = asyncHandler(async (req, res) => {
    const result = await ratingService.getWorkerRatings(req.params.workerId, req.query);
    
    return ApiResponse.paginated(
      res,
      result.ratings,
      result.page,
      parseInt(req.query.limit) || 20,
      result.total,
      'Ratings retrieved successfully'
    );
  });

  /**
   * Get job rating
   * GET /api/v1/ratings/job/:jobId
   */
  getJobRating = asyncHandler(async (req, res) => {
    const rating = await ratingService.getJobRating(req.params.jobId);
    
    if (!rating) {
      return ApiResponse.notFound(res, 'Rating not found');
    }
    
    return ApiResponse.success(res, rating, 'Rating retrieved successfully');
  });

  /**
   * Get user's ratings
   * GET /api/v1/ratings/my-ratings
   */
  getUserRatings = asyncHandler(async (req, res) => {
    const result = await ratingService.getUserRatings(req.user.id, req.query);
    
    return ApiResponse.paginated(
      res,
      result.ratings,
      result.page,
      parseInt(req.query.limit) || 20,
      result.total,
      'Your ratings retrieved successfully'
    );
  });
}

module.exports = new RatingController();
