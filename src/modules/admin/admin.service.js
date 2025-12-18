const { User, Worker, Job, Rating, JobCandidate, Address } = require('../../database/models');
const { USER_ROLES, JOB_STATUS, KYC_STATUS } = require('../../common/constants');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const notificationService = require('../notifications/notifications.service');

class AdminService {
  /**
   * Get all users with pagination and filters
   */
  async getAllUsers(filters = {}) {
    const { page = 1, limit = 20, role, isActive, search } = filters;
    const offset = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password', 'refreshToken'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return {
      users: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get user details by ID
   */
  async getUserById(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'refreshToken'] },
      include: [
        { model: Address, as: 'addresses' },
        { model: Job, as: 'jobs', limit: 5, order: [['created_at', 'DESC']] },
      ],
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user status (activate/deactivate)
   */
  async updateUserStatus(userId, isActive) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.update({ isActive });
    return user;
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === USER_ROLES.ADMIN) {
      throw new Error('Cannot delete admin users');
    }

    await user.update({ isActive: false });
    return { message: 'User deactivated successfully' };
  }

  /**
   * Get all workers with filters
   */
  async getAllWorkers(filters = {}) {
    const { page = 1, limit = 20, kycStatus, availabilityStatus, search } = filters;
    const offset = (page - 1) * limit;

    const where = {};
    if (kycStatus) where.kycStatus = kycStatus;
    if (availabilityStatus) where.availabilityStatus = availabilityStatus;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Worker.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'isActive'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return {
      workers: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get worker details by ID
   */
  async getWorkerById(workerId) {
    const worker = await Worker.findByPk(workerId, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password', 'refreshToken'] } },
        { model: Job, as: 'assignedJobs', limit: 10, order: [['created_at', 'DESC']] },
        { model: Rating, as: 'ratings', limit: 10, order: [['created_at', 'DESC']] },
      ],
    });

    if (!worker) {
      throw new Error('Worker not found');
    }

    return worker;
  }

  /**
   * Approve or reject worker KYC
   */
  async updateWorkerKYC(workerId, status, rejectionReason = null) {
    const worker = await Worker.findByPk(workerId, {
      include: [{ model: User, as: 'user' }],
    });

    if (!worker) {
      throw new Error('Worker not found');
    }

    const updateData = { kycStatus: status };
    if (status === KYC_STATUS.REJECTED && rejectionReason) {
      updateData.kycRejectionReason = rejectionReason;
    }

    await worker.update(updateData);

    // Send notification
    const notificationType = status === KYC_STATUS.VERIFIED ? 'kyc_approved' : 'kyc_rejected';
    await notificationService.sendInAppNotification(
      worker.userId,
      {
        title: status === KYC_STATUS.VERIFIED ? 'KYC Approved' : 'KYC Rejected',
        body: status === KYC_STATUS.VERIFIED 
          ? 'Your KYC has been verified. You can now accept jobs.'
          : `Your KYC was rejected. Reason: ${rejectionReason}`,
        data: { workerId: worker.id },
      },
      notificationType
    );

    return worker;
  }

  /**
   * Get all jobs with filters
   */
  async getAllJobs(filters = {}) {
    const { page = 1, limit = 20, status, serviceType, search } = filters;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (serviceType) where.serviceType = serviceType;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Job.findAndCountAll({
      where,
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'phone'] },
        { model: Worker, as: 'assignedWorker', attributes: ['id', 'name', 'phone'] },
        { model: Address, as: 'address', attributes: ['addressLine', 'city', 'state'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return {
      jobs: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Manually assign worker to job
   */
  async manuallyAssignJob(jobId, workerId) {
    const job = await Job.findByPk(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status !== JOB_STATUS.CREATED && job.status !== JOB_STATUS.MATCHING) {
      throw new Error('Job cannot be manually assigned in current status');
    }

    const worker = await Worker.findByPk(workerId);
    if (!worker) {
      throw new Error('Worker not found');
    }

    if (worker.kycStatus !== KYC_STATUS.VERIFIED) {
      throw new Error('Worker KYC is not verified');
    }

    await job.update({
      assignedWorkerId: workerId,
      status: JOB_STATUS.ASSIGNED,
      assignedAt: new Date(),
    });

    // Notify worker
    await notificationService.sendJobNotification(worker.userId, job, 'job_assigned');

    // Notify customer
    await notificationService.sendJobNotification(job.userId, job, 'job_assigned');

    return job;
  }

  /**
   * Cancel job (admin override)
   */
  async cancelJob(jobId, reason) {
    const job = await Job.findByPk(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status === JOB_STATUS.COMPLETED || job.status === JOB_STATUS.CANCELLED) {
      throw new Error('Job is already completed or cancelled');
    }

    await job.update({
      status: JOB_STATUS.CANCELLED,
      cancellationReason: reason,
      cancelledBy: 'admin',
      cancelledAt: new Date(),
    });

    // Notify both parties
    await notificationService.sendJobNotification(job.userId, job, 'job_cancelled');
    if (job.assignedWorkerId) {
      const worker = await Worker.findByPk(job.assignedWorkerId);
      await notificationService.sendJobNotification(worker.userId, job, 'job_cancelled');
    }

    return job;
  }

  /**
   * Handle dispute
   */
  async handleDispute(jobId, resolution, refundAmount = 0) {
    const job = await Job.findByPk(jobId, {
      include: [
        { model: User, as: 'customer' },
        { model: Worker, as: 'assignedWorker' },
      ],
    });

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status !== JOB_STATUS.DISPUTED) {
      throw new Error('Job is not in disputed status');
    }

    await job.update({
      status: JOB_STATUS.COMPLETED,
      disputeResolution: resolution,
      refundAmount,
      resolvedAt: new Date(),
    });

    // Handle refund if applicable
    if (refundAmount > 0) {
      // TODO: Process refund through payment gateway
    }

    // Notify both parties
    await notificationService.sendInAppNotification(
      job.userId,
      {
        title: 'Dispute Resolved',
        body: `Your dispute for job #${job.id} has been resolved. ${resolution}`,
        data: { jobId: job.id },
      },
      'system_alert'
    );

    if (job.assignedWorker) {
      await notificationService.sendInAppNotification(
        job.assignedWorker.userId,
        {
          title: 'Dispute Resolved',
          body: `Dispute for job #${job.id} has been resolved. ${resolution}`,
          data: { jobId: job.id },
        },
        'system_alert'
      );
    }

    return job;
  }

  /**
   * Get pending KYC approvals
   */
  async getPendingKYC() {
    const workers = await Worker.findAll({
      where: { kycStatus: KYC_STATUS.SUBMITTED },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
      ],
      order: [['created_at', 'ASC']],
    });

    return workers;
  }

  /**
   * Get disputed jobs
   */
  async getDisputedJobs() {
    const jobs = await Job.findAll({
      where: { status: JOB_STATUS.DISPUTED },
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'phone'] },
        { model: Worker, as: 'assignedWorker', attributes: ['id', 'name', 'phone'] },
        { model: Address, as: 'address' },
      ],
      order: [['created_at', 'ASC']],
    });

    return jobs;
  }

  /**
   * Create admin user
   */
  async createAdmin(adminData) {
    const { phone, email, password, name } = adminData;

    // Check if user exists
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ phone }, { email }] },
    });

    if (existingUser) {
      throw new Error('User with this phone or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await User.create({
      phone,
      email,
      password: hashedPassword,
      name,
      role: USER_ROLES.ADMIN,
      isActive: true,
    });

    return admin;
  }
}

module.exports = new AdminService();
