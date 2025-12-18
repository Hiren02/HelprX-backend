const { Worker, User, Job, Wallet, Rating } = require('../../database/models');
const { WORKER_AVAILABILITY, KYC_STATUS } = require('../../common/constants');

class WorkerService {
  /**
   * Get worker profile
   */
  async getWorkerProfile(userId) {
    const worker = await Worker.findOne({
      where: { userId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Wallet, as: 'wallet' },
      ],
    });

    if (!worker) {
      throw new Error('Worker profile not found');
    }

    return worker;
  }

  /**
   * Update worker profile
   */
  async updateWorkerProfile(userId, updateData) {
    const worker = await Worker.findOne({ where: { userId } });

    if (!worker) {
      throw new Error('Worker profile not found');
    }

    const { name, companyName, bio, experienceYears, latitude, longitude } = updateData;

    await worker.update({
      name: name !== undefined ? name : worker.name,
      companyName: companyName !== undefined ? companyName : worker.companyName,
      bio: bio !== undefined ? bio : worker.bio,
      experienceYears: experienceYears !== undefined ? experienceYears : worker.experienceYears,
      latitude: latitude !== undefined ? latitude : worker.latitude,
      longitude: longitude !== undefined ? longitude : worker.longitude,
    });

    return worker;
  }

  /**
   * Update worker skills
   */
  async updateSkills(userId, skills) {
    const worker = await Worker.findOne({ where: { userId } });

    if (!worker) {
      throw new Error('Worker profile not found');
    }

    // Validate skills format
    if (!Array.isArray(skills)) {
      throw new Error('Skills must be an array');
    }

    for (const skill of skills) {
      if (!skill.skill || !skill.level) {
        throw new Error('Each skill must have a skill name and level');
      }
      if (skill.level < 1 || skill.level > 4) {
        throw new Error('Skill level must be between 1 and 4');
      }
    }

    await worker.update({ skills });
    return worker;
  }

  /**
   * Update availability status
   */
  async updateAvailability(userId, status) {
    const worker = await Worker.findOne({ where: { userId } });

    if (!worker) {
      throw new Error('Worker profile not found');
    }

    if (!Object.values(WORKER_AVAILABILITY).includes(status)) {
      throw new Error('Invalid availability status');
    }

    await worker.update({
      availabilityStatus: status,
      lastActiveAt: new Date(),
    });

    return worker;
  }

  /**
   * Upload KYC documents
   */
  async uploadKYCDocuments(userId, documents) {
    const worker = await Worker.findOne({ where: { userId } });

    if (!worker) {
      throw new Error('Worker profile not found');
    }

    await worker.update({
      kycDocuments: documents,
      kycStatus: KYC_STATUS.SUBMITTED,
    });

    return worker;
  }

  /**
   * Get worker statistics
   */
  async getWorkerStats(userId) {
    const worker = await Worker.findOne({ where: { userId } });

    if (!worker) {
      throw new Error('Worker profile not found');
    }

    const totalJobs = await Job.count({ where: { assignedWorkerId: worker.id } });
    const completedJobs = worker.completedJobs;
    const activeJobs = await Job.count({
      where: {
        assignedWorkerId: worker.id,
        status: ['assigned', 'in_progress'],
      },
    });

    const totalRatings = await Rating.count({ where: { workerId: worker.id } });
    const avgRating = worker.avgRating;

    const wallet = await Wallet.findOne({ where: { workerId: worker.id } });

    return {
      totalJobs,
      completedJobs,
      activeJobs,
      totalRatings,
      avgRating,
      acceptanceRate: worker.acceptanceRate,
      walletBalance: wallet ? wallet.balance : 0,
      totalEarnings: wallet ? wallet.totalEarnings : 0,
    };
  }

  /**
   * Get worker jobs
   */
  async getWorkerJobs(userId, filters = {}) {
    const worker = await Worker.findOne({ where: { userId } });

    if (!worker) {
      throw new Error('Worker profile not found');
    }

    const { status, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    const where = { assignedWorkerId: worker.id };
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Job.findAndCountAll({
      where,
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'phone'] },
        { 
          model: require('../../database/models').Address, 
          as: 'address',
          attributes: ['id', 'addressLine', 'city', 'state', 'pincode']
        },
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
}

module.exports = new WorkerService();
