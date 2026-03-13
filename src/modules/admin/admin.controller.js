const adminService = require('./admin.service');
const ApiResponse = require('../../common/utils/response');
const { asyncHandler } = require('../../common/middleware/error.middleware');

class AdminController {
  // ========== User Management ==========

  /**
   * Get all users
   * GET /api/v1/admin/users
   */
  getAllUsers = asyncHandler(async (req, res) => {
    const result = await adminService.getAllUsers(req.query);
    return ApiResponse.paginated(
      res,
      result.users,
      result.page,
      parseInt(req.query.limit) || 20,
      result.total,
      'Users retrieved successfully'
    );
  });

  /**
   * Get user by ID
   * GET /api/v1/admin/users/:id
   */
  getUserById = asyncHandler(async (req, res) => {
    const user = await adminService.getUserById(req.params.id);
    return ApiResponse.success(res, user, 'User retrieved successfully');
  });

  /**
   * Update user status
   * PUT /api/v1/admin/users/:id/status
   */
  updateUserStatus = asyncHandler(async (req, res) => {
    const user = await adminService.updateUserStatus(req.params.id, req.body.isActive);
    return ApiResponse.success(res, user, 'User status updated successfully');
  });

  /**
   * Delete user
   * DELETE /api/v1/admin/users/:id
   */
  deleteUser = asyncHandler(async (req, res) => {
    const result = await adminService.deleteUser(req.params.id);
    return ApiResponse.success(res, result, 'User deleted successfully');
  });

  // ========== Worker Management ==========

  /**
   * Get all workers
   * GET /api/v1/admin/workers
   */
  getAllWorkers = asyncHandler(async (req, res) => {
    const result = await adminService.getAllWorkers(req.query);
    return ApiResponse.paginated(
      res,
      result.workers,
      result.page,
      parseInt(req.query.limit) || 20,
      result.total,
      'Workers retrieved successfully'
    );
  });

  /**
   * Get worker by ID
   * GET /api/v1/admin/workers/:id
   */
  getWorkerById = asyncHandler(async (req, res) => {
    const worker = await adminService.getWorkerById(req.params.id);
    return ApiResponse.success(res, worker, 'Worker retrieved successfully');
  });

  /**
   * Update worker KYC status
   * PUT /api/v1/admin/workers/:id/kyc
   */
  updateWorkerKYC = asyncHandler(async (req, res) => {
    const { status, rejectionReason } = req.body;
    const worker = await adminService.updateWorkerKYC(req.params.id, status, rejectionReason);
    return ApiResponse.success(res, worker, 'Worker KYC updated successfully');
  });

  /**
   * Get pending KYC approvals
   * GET /api/v1/admin/kyc/pending
   */
  getPendingKYC = asyncHandler(async (req, res) => {
    const workers = await adminService.getPendingKYC();
    return ApiResponse.success(res, workers, 'Pending KYC approvals retrieved successfully');
  });

  // ========== Job Management ==========

  /**
   * Get all jobs
   * GET /api/v1/admin/jobs
   */
  getAllJobs = asyncHandler(async (req, res) => {
    const result = await adminService.getAllJobs(req.query);
    return ApiResponse.paginated(
      res,
      result.jobs,
      result.page,
      parseInt(req.query.limit) || 20,
      result.total,
      'Jobs retrieved successfully'
    );
  });

  /**
   * Get job by ID
   * GET /api/v1/admin/jobs/:id
   */
  getJobById = asyncHandler(async (req, res) => {
    const job = await adminService.getJobById(req.params.id);
    return ApiResponse.success(res, job, 'Job retrieved successfully');
  });

  /**
   * Manually assign job to worker
   * POST /api/v1/admin/jobs/:id/assign
   */
  manuallyAssignJob = asyncHandler(async (req, res) => {
    const job = await adminService.manuallyAssignJob(req.params.id, req.body.workerId);
    return ApiResponse.success(res, job, 'Job assigned successfully');
  });

  /**
   * Cancel job
   * PUT /api/v1/admin/jobs/:id/cancel
   */
  cancelJob = asyncHandler(async (req, res) => {
    const job = await adminService.cancelJob(req.params.id, req.body.reason);
    return ApiResponse.success(res, job, 'Job cancelled successfully');
  });

  /**
   * Complete job
   * PUT /api/v1/admin/jobs/:id/complete
   */
  completeJob = asyncHandler(async (req, res) => {
    const job = await adminService.completeJob(req.params.id);
    return ApiResponse.success(res, job, 'Job completed successfully');
  });

  // ========== Dispute Management ==========

  /**
   * Get disputed jobs
   * GET /api/v1/admin/disputes
   */
  getDisputedJobs = asyncHandler(async (req, res) => {
    const jobs = await adminService.getDisputedJobs();
    return ApiResponse.success(res, jobs, 'Disputed jobs retrieved successfully');
  });

  /**
   * Resolve dispute
   * POST /api/v1/admin/disputes/:jobId/resolve
   */
  resolveDispute = asyncHandler(async (req, res) => {
    const { resolution, refundAmount } = req.body;
    const job = await adminService.handleDispute(req.params.jobId, resolution, refundAmount);
    return ApiResponse.success(res, job, 'Dispute resolved successfully');
  });

  // ========== Admin Management ==========

  /**
   * Create new admin
   * POST /api/v1/admin/create-admin
   */
  createAdmin = asyncHandler(async (req, res) => {
    const admin = await adminService.createAdmin(req.body);
    return ApiResponse.created(res, admin, 'Admin created successfully');
  });
}

module.exports = new AdminController();
