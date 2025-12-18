const workerService = require('./workers.service');
const ApiResponse = require('../../common/utils/response');
const { asyncHandler } = require('../../common/middleware/error.middleware');

class WorkerController {
  /**
   * Get worker profile
   * GET /api/v1/workers/profile
   */
  getProfile = asyncHandler(async (req, res) => {
    const worker = await workerService.getWorkerProfile(req.user.id);
    return ApiResponse.success(res, worker, 'Worker profile retrieved successfully');
  });

  /**
   * Update worker profile
   * PUT /api/v1/workers/profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    const worker = await workerService.updateWorkerProfile(req.user.id, req.body);
    return ApiResponse.success(res, worker, 'Profile updated successfully');
  });

  /**
   * Update skills
   * PUT /api/v1/workers/skills
   */
  updateSkills = asyncHandler(async (req, res) => {
    const worker = await workerService.updateSkills(req.user.id, req.body.skills);
    return ApiResponse.success(res, worker, 'Skills updated successfully');
  });

  /**
   * Update availability
   * PUT /api/v1/workers/availability
   */
  updateAvailability = asyncHandler(async (req, res) => {
    const worker = await workerService.updateAvailability(req.user.id, req.body.status);
    return ApiResponse.success(res, worker, 'Availability updated successfully');
  });

  /**
   * Upload KYC documents
   * POST /api/v1/workers/kyc
   */
  uploadKYC = asyncHandler(async (req, res) => {
    // Files are uploaded via Cloudinary middleware
    // req.files contains the uploaded files
    const documents = {};
    const requiredDocs = ['aadhar', 'pan', 'drivingLicense', 'photo'];
    const missingDocs = [];

    if (!req.files) {
        return ApiResponse.badRequest(res, 'No files uploaded');
    }

    requiredDocs.forEach(docField => {
        if (req.files[docField] && req.files[docField][0]) {
            documents[docField] = req.files[docField][0].path;
        } else {
            missingDocs.push(docField);
        }
    });

    if (missingDocs.length > 0) {
      return ApiResponse.badRequest(res, `Missing required documents: ${missingDocs.join(', ')}`);
    }

    const worker = await workerService.uploadKYCDocuments(req.user.id, documents);
    return ApiResponse.success(res, worker, 'KYC documents uploaded successfully');
  });

  /**
   * Get worker statistics
   * GET /api/v1/workers/stats
   */
  getStats = asyncHandler(async (req, res) => {
    const stats = await workerService.getWorkerStats(req.user.id);
    return ApiResponse.success(res, stats, 'Statistics retrieved successfully');
  });

  /**
   * Get worker jobs
   * GET /api/v1/workers/jobs
   */
  getJobs = asyncHandler(async (req, res) => {
    const result = await workerService.getWorkerJobs(req.user.id, req.query);
    return ApiResponse.paginated(
      res,
      result.jobs,
      result.page,
      parseInt(req.query.limit) || 10,
      result.total,
      'Jobs retrieved successfully'
    );
  });
}

module.exports = new WorkerController();
