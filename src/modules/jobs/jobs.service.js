const { Job, User, Worker, Address, JobCandidate, Rating } = require('../../database/models');
const { JOB_STATUS, CANDIDATE_STATUS, SUCCESS_MESSAGES } = require('../../common/constants');
const walletService = require('../wallet/wallet.service');
const matchingService = require('../matching/matching.service');
const notificationService = require('../notifications/notifications.service');
const pricingService = require('../pricing/pricing.service');
const logger = require('../../common/utils/logger');
const { Op } = require('sequelize');

class JobService {
  /**
   * Create a new job
   */
  async createJob(userId, jobData) {
    const { addressId, serviceType, title, description, attachments, preferredTimeStart, preferredTimeEnd } = jobData;

    // Verify address belongs to user
    const address = await Address.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new Error('Address not found or does not belong to user');
    }

    // Calculate price estimate
    const priceEstimate = await pricingService.calculateEstimate({
      serviceType,
      addressId,
    });

    // Create job
    const job = await Job.create({
      userId,
      addressId,
      serviceType,
      title,
      description,
      attachments: attachments || [],
      preferredTimeStart,
      preferredTimeEnd,
      priceEstimate: Number(priceEstimate.total),
      surgeMultiplier: priceEstimate.surgeMultiplier,
      status: JOB_STATUS.CREATED,
    });

    // Start matching process asynchronously
    this.startMatching(job.id).catch((error) => {
      logger.error(`Matching failed for job ${job.id}:`, error);
    });

    return job;
  }

  /**
   * Start matching process for a job
   */
  async startMatching(jobId) {
    // Update job status to matching
    await Job.update(
      { status: JOB_STATUS.MATCHING },
      { where: { id: jobId } }
    );

    const job = await Job.findByPk(jobId, {
      include: [{ model: Address, as: 'address' }],
    });

    // Find matching workers
    const matchedWorkers = await matchingService.matchWorkersForJob(job);

    if (matchedWorkers.length === 0) {
      logger.warn(`No workers found for job ${jobId}`);
      return;
    }

    // Save matching results
    await matchingService.saveMatchingResults(jobId, matchedWorkers);

    // Notify top workers
    await this.notifyWorkers(job, matchedWorkers.slice(0, 5));

    logger.info(`Notified ${Math.min(5, matchedWorkers.length)} workers for job ${jobId}`);
  }

  /**
   * Notify workers about new job
   */
  async notifyWorkers(job, matchedWorkers) {
    for (const match of matchedWorkers) {
      await notificationService.sendJobNotification(match.worker.id, job, 'job_available');
      
      // Update delivered timestamp
      await JobCandidate.update(
        { deliveredAt: new Date() },
        { where: { jobId: job.id, workerId: match.worker.id } }
      );
    }
  }

  /**
   * Worker accepts a job
   */
  async acceptJob(workerId, jobId) {
    const transaction = await require('../../config/database').sequelize.transaction();

    try {
      const candidate = await JobCandidate.findOne({
        where: { jobId, workerId },
        transaction,
      });

      if (!candidate) {
        throw new Error('Job candidate not found or you were not invited');
      }

      if (candidate.finalStatus !== CANDIDATE_STATUS.PENDING) {
        throw new Error('You have already responded to this job');
      }

      // Check if job is still available AND lock the row
      const job = await Job.findByPk(jobId, { transaction, lock: transaction.LOCK.UPDATE });
      
      if (!job) {
        throw new Error('Job not found');
      }

      if (job.status !== JOB_STATUS.MATCHING) {
        // If assignedWorkerId is set, someone else took it
        if (job.assignedWorkerId) {
           throw new Error('This job has already been accepted by another worker');
        }
        throw new Error('Job is no longer available');
      }

      if (job.assignedWorkerId) {
        throw new Error('This job has already been accepted by another worker');
      }

      // Update candidate status
      await candidate.update({
        acceptedAt: new Date(),
        finalStatus: CANDIDATE_STATUS.ACCEPTED,
      }, { transaction });

      // Assign job to worker
      await job.update({
        assignedWorkerId: workerId,
        status: JOB_STATUS.ASSIGNED, // Or SCHEDULED depending on flow, usually ASSIGNED first
      }, { transaction });

      // Decline other candidates
      await JobCandidate.update(
        { finalStatus: CANDIDATE_STATUS.DECLINED },
        { 
          where: { 
            jobId, 
            workerId: { [require('sequelize').Op.ne]: workerId } 
          },
          transaction 
        }
      );

      await transaction.commit();

      // Notify customer (outside transaction)
      const enrichedJob = await Job.findByPk(jobId, {
        include: [{ model: Worker, as: 'assignedWorker', attributes: ['id', 'name'] }]
      });
      await notificationService.sendJobNotification(job.userId, enrichedJob, 'job_assigned');

      return job;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Worker declines a job
   */
  async declineJob(workerId, jobId, reason) {
    const candidate = await JobCandidate.findOne({
      where: { jobId, workerId },
    });

    if (!candidate) {
      throw new Error('Job candidate not found');
    }

    await candidate.update({
      declinedAt: new Date(),
      finalStatus: CANDIDATE_STATUS.DECLINED,
      declineReason: reason,
    });
  }

  /**
   * Start a job
   */
  async startJob(workerId, jobId) {
    const job = await Job.findOne({
      where: { id: jobId, assignedWorkerId: workerId },
    });

    if (!job) {
      throw new Error('Job not found or not assigned to you');
    }

    if (job.status !== JOB_STATUS.ASSIGNED) {
      throw new Error('Job cannot be started');
    }

    await job.update({
      status: JOB_STATUS.IN_PROGRESS,
      startedAt: new Date(),
    });

    // Notify customer
    await notificationService.sendJobNotification(job.userId, job, 'job_started');

    return job;
  }

  /**
   * Complete a job
   */
  async completeJob(workerId, jobId, finalPrice) {
    const job = await Job.findOne({
      where: { id: jobId, assignedWorkerId: workerId },
    });

    if (!job) {
      throw new Error('Job not found or not assigned to you');
    }

    if (job.status !== JOB_STATUS.IN_PROGRESS) {
      throw new Error('Job is not in progress');
    }

    // Calculate platform fee and worker earnings
    const platformFeePercent = parseFloat(process.env.PLATFORM_COMMISSION_PERCENT) || 15;
    const platformFee = (finalPrice * platformFeePercent) / 100;
    const workerEarnings = finalPrice - platformFee;

    await job.update({
      status: JOB_STATUS.COMPLETED,
      completedAt: new Date(),
      finalPrice: Number(finalPrice),
      platformFee: Number(platformFee),
      workerEarnings: Number(workerEarnings),
    });

    // Update worker stats
    await Worker.increment('completedJobs', { where: { id: workerId } });

    // Credit worker wallet
    // Credit worker wallet
    console.log(`Crediting wallet for worker ${workerId} with amount ${workerEarnings} for job ${job.id}`);
    try {
      await walletService.creditWallet(
        workerId,
        workerEarnings,
        job.id,
        `Payment for Job: ${job.title}`
      );
      console.log('Wallet credited successfully');
    } catch (error) {
      console.error('Failed to credit wallet:', error);
      // We might want to throw or handle this - for now logging to diagnose
    }

    // Notify customer
    await notificationService.sendJobNotification(job.userId, job, 'job_completed');

    return job;
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId, userId, reason, cancelledBy = 'user') {
    const job = await Job.findOne({
      where: { id: jobId, userId },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    if ([JOB_STATUS.COMPLETED, JOB_STATUS.CANCELLED].includes(job.status)) {
      throw new Error('Job cannot be cancelled');
    }

    await job.update({
      status: JOB_STATUS.CANCELLED,
      cancelledAt: new Date(),
      cancellationReason: reason,
      cancelledBy,
    });

    // Notify worker if assigned
    if (job.assignedWorkerId) {
      await notificationService.sendJobNotification(job.assignedWorkerId, job, 'job_cancelled');
    }

    return job;
  }

  /**
   * Get job details
   */
  async getJobById(jobId, userId) {
    const job = await Job.findOne({
      where: { id: jobId },
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'phone'] },
        { model: Address, as: 'address' },
        { model: Worker, as: 'assignedWorker', attributes: ['id', 'name', 'phone', 'avgRating', 'profileImage'] },
      ],
    });

    if (!job) {
      throw new Error('Job not found');
    }

    // Check access permissions
    if (job.userId !== userId) {
      // Check if user is the assigned worker
      const worker = await Worker.findOne({ where: { userId } });
      if (!worker || job.assignedWorkerId !== worker.id) {
        throw new Error('Access denied');
      }
    }

    return job;
  }

  /**
   * Get user's jobs
   */
  async getUserJobs(userId, filters = {}) {
    const { status, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Job.findAndCountAll({
      where,
      include: [
        { model: Address, as: 'address' },
        { model: Worker, as: 'assignedWorker', attributes: ['id', 'name', 'avgRating', 'profileImage'] },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return {
      jobs: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get worker's jobs
   */
  async getWorkerJobs(workerId, filters = {}) {
    const { status, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    const where = { assignedWorkerId: workerId };
    if (status) {
      if (status === 'active') {
        where.status = { [Op.in]: [JOB_STATUS.ASSIGNED, JOB_STATUS.IN_PROGRESS] };
      } else if (status === 'history') {
        where.status = { [Op.in]: [JOB_STATUS.COMPLETED, JOB_STATUS.CANCELLED, JOB_STATUS.DISPUTED] };
      } else {
        where.status = status;
      }
    }

    const { count, rows } = await Job.findAndCountAll({
      where,
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'phone'] },
        { model: Address, as: 'address' },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return {
      jobs: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }
}

module.exports = new JobService();
