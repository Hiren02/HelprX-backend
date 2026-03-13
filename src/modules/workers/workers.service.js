const { Worker, User, Job, Wallet, Rating } = require('../../database/models');
const { WORKER_AVAILABILITY, KYC_STATUS, JOB_STATUS } = require('../../common/constants');
const { Op } = require('sequelize');
const walletService = require('../wallet/wallet.service');

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

    const { name, companyName, bio, experienceYears, latitude, longitude, profileImage } = updateData;

    await worker.update({
      name: name !== undefined ? name : worker.name,
      companyName: companyName !== undefined ? companyName : worker.companyName,
      bio: bio !== undefined ? bio : worker.bio,
      experienceYears: experienceYears !== undefined ? experienceYears : worker.experienceYears,
      latitude: latitude !== undefined ? latitude : worker.latitude,
      longitude: longitude !== undefined ? longitude : worker.longitude,
      profileImage: profileImage !== undefined ? profileImage : worker.profileImage,
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

    const updateData = {
      kycDocuments: documents,
      kycStatus: KYC_STATUS.SUBMITTED,
    };

    // Sync photo to profileImage if provided
    if (documents.photo) {
      updateData.profileImage = documents.photo;
    }

    await worker.update(updateData);

    return worker;
  }

  /**
   * Get worker statistics
   */
  async getWorkerStats(userId, filters = {}) {
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
    const historicalEarnings = await walletService.getHistoricalEarnings(wallet ? wallet.id : null, filters);

    return {
      totalJobs,
      completedJobs,
      activeJobs,
      totalRatings,
      avgRating: Number(avgRating || 0),
      acceptanceRate: Number(worker.acceptanceRate || 0),
      walletBalance: Number(wallet ? wallet.balance : 0),
      totalEarnings: Number(wallet ? wallet.totalEarnings : 0),
      dailyEarnings: historicalEarnings,
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

    const { status, search, minPrice, maxPrice, serviceType, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    const where = { assignedWorkerId: worker.id };
    if (status) {
      if (status === 'active') {
        where.status = { [Op.in]: [JOB_STATUS.ASSIGNED, JOB_STATUS.IN_PROGRESS] };
      } else if (status === 'history') {
        where.status = { [Op.in]: [JOB_STATUS.COMPLETED, JOB_STATUS.CANCELLED, JOB_STATUS.DISPUTED] };
      } else if (status !== 'new') { // 'new' is handled by inbox
        where.status = status;
      }
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (minPrice || maxPrice) {
      where.priceEstimate = {};
      if (minPrice) where.priceEstimate[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.priceEstimate[Op.lte] = parseFloat(maxPrice);
    }

    if (serviceType) {
      where.serviceType = serviceType;
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

  /**
   * Get worker job inbox (pending invites)
   */
  async getWorkerInbox(userId, filters = {}) {
    const worker = await Worker.findOne({ where: { userId } });

    if (!worker) {
      throw new Error('Worker profile not found');
    }

    const { search, minPrice, maxPrice, serviceType, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    // We want to find jobs where:
    // 1. Worker is a candidate
    // 2. Candidate status is PENDING (or as filtered)
    // 3. Job is not yet assigned (optional, but good for UX)

    // Using raw query or Sequelize include is tricky for "Job -> Candidate -> Worker" 
    // when starting from Worker.
    // Easier: Find Candidates for this worker -> Get associated Jobs.

    const { JobCandidate } = require('../../database/models');
    const { CANDIDATE_STATUS } = require('../../common/constants');

    const where = { 
      workerId: worker.id,
      finalStatus: CANDIDATE_STATUS.PENDING 
    };

    const jobWhere = { status: 'matching' };

    if (search) {
      jobWhere[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (minPrice || maxPrice) {
      jobWhere.priceEstimate = {};
      if (minPrice) jobWhere.priceEstimate[Op.gte] = parseFloat(minPrice);
      if (maxPrice) jobWhere.priceEstimate[Op.lte] = parseFloat(maxPrice);
    }

    if (serviceType) {
      jobWhere.serviceType = serviceType;
    }

    const { count, rows } = await JobCandidate.findAndCountAll({
      where,
      include: [
        {
          model: Job,
          as: 'job',
          where: jobWhere, // Use the filters here
          include: [
            { model: User, as: 'customer', attributes: ['id', 'name', 'phone'] },
            { 
              model: require('../../database/models').Address, 
              as: 'address',
              attributes: ['id', 'addressLine', 'city', 'state', 'pincode'] 
            },
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return {
      invites: rows.map(candidate => ({
        ...candidate.job.toJSON(),
        candidateId: candidate.id,
        receivedAt: candidate.createdAt,
        score: candidate.score,
        matchingReason: candidate.matchingReason,
      })),
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    };
  }
}

module.exports = new WorkerService();
