const { Rating, Job, Worker, User } = require('../../database/models');
const { MODERATION_STATUS } = require('../../common/constants');

class RatingService {
  /**
   * Submit a rating for a completed job
   */
  async submitRating(userId, ratingData) {
    const { jobId, rating, review } = ratingData;

    // Check if job exists and belongs to user
    const job = await Job.findOne({
      where: { id: jobId, userId },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    // Check if job is completed
    if (job.status !== 'completed') {
      throw new Error('Can only rate completed jobs');
    }

    // Check if already rated
    const existingRating = await Rating.findOne({
      where: { jobId, userId },
    });

    if (existingRating) {
      throw new Error('You have already rated this job');
    }

    // Create rating
    const newRating = await Rating.create({
      jobId,
      userId,
      workerId: job.assignedWorkerId,
      rating,
      review: review || null,
      moderationStatus: MODERATION_STATUS.APPROVED, // Auto-approve for now
    });

    // Update worker's average rating
    await this.updateWorkerRating(job.assignedWorkerId);

    return newRating;
  }

  /**
   * Update worker's average rating
   */
  async updateWorkerRating(workerId) {
    const ratings = await Rating.findAll({
      where: { workerId, moderationStatus: MODERATION_STATUS.APPROVED },
    });

    if (ratings.length === 0) return;

    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    await Worker.update(
      {
        avgRating: Math.round(avgRating * 100) / 100,
        totalRatings: ratings.length,
      },
      { where: { id: workerId } }
    );
  }

  /**
   * Get worker ratings
   */
  async getWorkerRatings(workerId, filters = {}) {
    const { page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    const { count, rows } = await Rating.findAndCountAll({
      where: {
        workerId,
        moderationStatus: MODERATION_STATUS.APPROVED,
      },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: Job, as: 'job', attributes: ['id', 'serviceType', 'title'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    const avgRating = rows.length > 0
      ? rows.reduce((sum, r) => sum + r.rating, 0) / rows.length
      : 0;

    return {
      ratings: rows,
      total: count,
      avgRating: Math.round(avgRating * 100) / 100,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get job rating
   */
  async getJobRating(jobId) {
    const rating = await Rating.findOne({
      where: { jobId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: Worker, as: 'worker', attributes: ['id', 'name'] },
      ],
    });

    return rating;
  }

  /**
   * Get user's ratings (ratings given by user)
   */
  async getUserRatings(userId, filters = {}) {
    const { page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    const { count, rows } = await Rating.findAndCountAll({
      where: { userId },
      include: [
        { model: Worker, as: 'worker', attributes: ['id', 'name'] },
        { model: Job, as: 'job', attributes: ['id', 'serviceType', 'title'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return {
      ratings: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    };
  }
}

module.exports = new RatingService();
