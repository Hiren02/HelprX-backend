const { Job, User, Worker, Rating, Transaction, Wallet } = require('../../database/models');
const { sequelize } = require('../../config/database');
const { JOB_STATUS, USER_ROLES } = require('../../common/constants');
const { Op } = require('sequelize');

class AnalyticsService {
  /**
   * Get platform overview statistics
   */
  async getPlatformOverview() {
    const [
      totalUsers,
      totalWorkers,
      totalJobs,
      completedJobs,
      activeJobs,
      totalRevenue,
    ] = await Promise.all([
      User.count({ where: { role: USER_ROLES.USER } }),
      Worker.count(),
      Job.count(),
      Job.count({ where: { status: JOB_STATUS.COMPLETED } }),
      Job.count({ 
        where: { 
          status: { 
            [Op.in]: [JOB_STATUS.CREATED, JOB_STATUS.MATCHING, JOB_STATUS.ASSIGNED, JOB_STATUS.IN_PROGRESS] 
          } 
        } 
      }),
      Transaction.sum('amount', { where: { type: 'credit', status: 'captured' } }),
    ]);

    const avgJobValue = completedJobs > 0 
      ? await Job.findAll({
          where: { status: JOB_STATUS.COMPLETED },
          attributes: [[sequelize.fn('AVG', sequelize.col('final_price')), 'avgPrice']],
          raw: true,
        }).then(result => result[0]?.avgPrice || 0)
      : 0;

    return {
      totalUsers,
      totalWorkers,
      totalJobs,
      completedJobs,
      activeJobs,
      totalRevenue: Number(totalRevenue || 0),
      avgJobValue: Number(parseFloat(avgJobValue || 0).toFixed(2)),
      completionRate: totalJobs > 0 ? Number(((completedJobs / totalJobs) * 100).toFixed(2)) : 0,
    };
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(filters = {}) {
    const { startDate, endDate, groupBy = 'day' } = filters;

    const where = { type: 'credit', status: 'captured' };
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // Get total revenue
    const totalRevenue = await Transaction.sum('amount', { where });

    // Get revenue by period
    let dateFormat;
    switch (groupBy) {
      case 'hour':
        dateFormat = '%Y-%m-%d %H:00:00';
        break;
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%W';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    const revenueByPeriod = await Transaction.findAll({
      where,
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat), 'period'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transactions'],
      ],
      group: ['period'],
      order: [[sequelize.literal('period'), 'ASC']],
      raw: true,
    });

    return {
      totalRevenue: totalRevenue || 0,
      revenueByPeriod,
    };
  }

  /**
   * Get job analytics
   */
  async getJobAnalytics(filters = {}) {
    const { startDate, endDate } = filters;

    const where = {};
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // Jobs by status
    const jobsByStatus = await Job.findAll({
      where,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    // Jobs by service type
    const jobsByService = await Job.findAll({
      where,
      attributes: [
        'service_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('AVG', sequelize.col('final_price')), 'avgPrice'],
      ],
      group: ['service_type'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      raw: true,
    });

    // Average completion time (in hours)
    const avgCompletionTime = await Job.findAll({
      where: { 
        ...where,
        status: JOB_STATUS.COMPLETED,
        startedAt: { [Op.ne]: null },
        completedAt: { [Op.ne]: null },
      },
      attributes: [
        [
          sequelize.fn(
            'AVG',
            sequelize.literal('TIMESTAMPDIFF(HOUR, started_at, completed_at)')
          ),
          'avgHours',
        ],
      ],
      raw: true,
    });

    return {
      jobsByStatus,
      jobsByService,
      avgCompletionTime: avgCompletionTime[0]?.avgHours || 0,
    };
  }

  /**
   * Get worker analytics
   */
  async getWorkerAnalytics() {
    // Workers by KYC status
    const workersByKYC = await Worker.findAll({
      attributes: [
        'kyc_status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['kyc_status'],
      raw: true,
    });

    // Workers by availability
    const workersByAvailability = await Worker.findAll({
      attributes: [
        'availability_status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['availability_status'],
      raw: true,
    });

    // Top rated workers
    const topWorkers = await Worker.findAll({
      where: { avg_rating: { [Op.gte]: 4.0 } },
      order: [['avg_rating', 'DESC'], ['total_ratings', 'DESC']],
      limit: 10,
      attributes: ['id', 'name', 'avg_rating', 'total_ratings', 'completed_jobs'],
    });

    // Average worker stats
    const avgStats = await Worker.findAll({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('avg_rating')), 'avgRating'],
        [sequelize.fn('AVG', sequelize.col('acceptance_rate')), 'avgAcceptanceRate'],
        [sequelize.fn('AVG', sequelize.col('completed_jobs')), 'avgCompletedJobs'],
      ],
      raw: true,
    });

    return {
      workersByKYC,
      workersByAvailability,
      topWorkers,
      avgRating: avgStats[0]?.avgRating || 0,
      avgAcceptanceRate: avgStats[0]?.avgAcceptanceRate || 0,
      avgCompletedJobs: avgStats[0]?.avgCompletedJobs || 0,
    };
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics() {
    // New users by period
    const newUsersByMonth = await User.findAll({
      where: { role: USER_ROLES.USER },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['month'],
      order: [[sequelize.literal('month'), 'DESC']],
      limit: 12,
      raw: true,
    });

    // Active users (users with at least 1 job)
    const activeUsers = await User.count({
      where: { role: USER_ROLES.USER },
      include: [{
        model: Job,
        as: 'jobs',
        required: true,
      }],
      distinct: true,
    });

    // User retention (users with more than 1 job)
    const returningUsers = await sequelize.query(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM jobs
      GROUP BY user_id
      HAVING COUNT(*) > 1
    `, { type: sequelize.QueryTypes.SELECT });

    const totalUsers = await User.count({ where: { role: USER_ROLES.USER } });

    return {
      newUsersByMonth,
      totalUsers,
      activeUsers,
      returningUsers: returningUsers.length,
      retentionRate: totalUsers > 0 ? ((returningUsers.length / totalUsers) * 100).toFixed(2) : 0,
    };
  }

  /**
   * Get rating analytics
   */
  async getRatingAnalytics() {
    // Average rating distribution
    const ratingDistribution = await Rating.findAll({
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['rating'],
      order: [['rating', 'DESC']],
      raw: true,
    });

    // Average platform rating
    const avgRating = await Rating.findAll({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
      ],
      raw: true,
    });

    return {
      ratingDistribution,
      avgPlatformRating: avgRating[0]?.avgRating || 0,
    };
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics() {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      jobsLast24h,
      activeWorkers,
      ongoingJobs,
      recentTransactions,
    ] = await Promise.all([
      Job.count({ where: { createdAt: { [Op.gte]: last24Hours } } }),
      Worker.count({ where: { availability_status: 'online' } }),
      Job.count({ where: { status: JOB_STATUS.IN_PROGRESS } }),
      Transaction.count({ 
        where: { 
          createdAt: { [Op.gte]: last24Hours },
          status: 'captured',
        } 
      }),
    ]);

    return {
      jobsLast24h,
      activeWorkers,
      ongoingJobs,
      recentTransactions,
      timestamp: now,
    };
  }
}

module.exports = new AnalyticsService();
