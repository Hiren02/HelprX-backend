const jobService = require('./jobs.service');
const ApiResponse = require('../../common/utils/response');
const { asyncHandler } = require('../../common/middleware/error.middleware');
const { SUCCESS_MESSAGES } = require('../../common/constants');

class JobController {
  /**
   * Create a new job
   * POST /api/v1/jobs
   */
  createJob = asyncHandler(async (req, res) => {
    // Handle uploaded attachments from Cloudinary
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push(file.path); // Cloudinary URL
      });
    }

    const jobData = {
      ...req.body,
      attachments: attachments.length > 0 ? attachments : req.body.attachments || [],
    };

    const job = await jobService.createJob(req.user.id, jobData);
    return ApiResponse.created(res, job, SUCCESS_MESSAGES.JOB_CREATED);
  });

  /**
   * Get job details
   * GET /api/v1/jobs/:id
   */
  getJob = asyncHandler(async (req, res) => {
    const job = await jobService.getJobById(req.params.id, req.user.id);
    return ApiResponse.success(res, job, 'Job retrieved successfully');
  });

  /**
   * Get user's jobs
   * GET /api/v1/jobs
   */
  getUserJobs = asyncHandler(async (req, res) => {
    const result = await jobService.getUserJobs(req.user.id, req.query);
    return ApiResponse.paginated(
      res,
      result.jobs,
      parseInt(req.query.page) || 1,
      parseInt(req.query.limit) || 10,
      result.total,
      'Jobs retrieved successfully'
    );
  });

  /**
   * Cancel a job
   * PUT /api/v1/jobs/:id/cancel
   */
  cancelJob = asyncHandler(async (req, res) => {
    const job = await jobService.cancelJob(
      req.params.id,
      req.user.id,
      req.body.cancellationReason
    );
    return ApiResponse.success(res, job, SUCCESS_MESSAGES.JOB_CANCELLED);
  });

  /**
   * Worker accepts a job
   * POST /api/v1/jobs/:id/accept
   */
  acceptJob = asyncHandler(async (req, res) => {
    // Get worker ID from user
    const { Worker } = require('../../database/models');
    const worker = await Worker.findOne({ where: { userId: req.user.id } });
    
    if (!worker) {
      return ApiResponse.forbidden(res, 'Worker profile not found');
    }

    const job = await jobService.acceptJob(worker.id, req.params.id);
    return ApiResponse.success(res, job, 'Job accepted successfully');
  });

  /**
   * Worker declines a job
   * POST /api/v1/jobs/:id/decline
   */
  declineJob = asyncHandler(async (req, res) => {
    const { Worker } = require('../../database/models');
    const worker = await Worker.findOne({ where: { userId: req.user.id } });
    
    if (!worker) {
      return ApiResponse.forbidden(res, 'Worker profile not found');
    }

    await jobService.declineJob(worker.id, req.params.id, req.body.reason);
    return ApiResponse.success(res, null, 'Job declined successfully');
  });

  /**
   * Worker starts a job
   * POST /api/v1/jobs/:id/start
   */
  startJob = asyncHandler(async (req, res) => {
    const { Worker } = require('../../database/models');
    const worker = await Worker.findOne({ where: { userId: req.user.id } });
    
    if (!worker) {
      return ApiResponse.forbidden(res, 'Worker profile not found');
    }

    const job = await jobService.startJob(worker.id, req.params.id);
    return ApiResponse.success(res, job, 'Job started successfully');
  });

  /**
   * Worker completes a job
   * POST /api/v1/jobs/:id/complete
   */
  completeJob = asyncHandler(async (req, res) => {
    const { Worker } = require('../../database/models');
    const worker = await Worker.findOne({ where: { userId: req.user.id } });
    
    if (!worker) {
      return ApiResponse.forbidden(res, 'Worker profile not found');
    }

    const job = await jobService.completeJob(
      worker.id,
      req.params.id,
      req.body.finalPrice
    );
    return ApiResponse.success(res, job, 'Job completed successfully');
  });
}

module.exports = new JobController();
