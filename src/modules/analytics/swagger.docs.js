/**
 * @swagger
 * /analytics/overview:
 *   get:
 *     summary: Get platform overview
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     description: Admin-only endpoint
 *     responses:
 *       200:
 *         description: Platform overview retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       example: 1500
 *                     totalWorkers:
 *                       type: integer
 *                       example: 350
 *                     totalJobs:
 *                       type: integer
 *                       example: 5000
 *                     completedJobs:
 *                       type: integer
 *                       example: 4200
 *                     activeJobs:
 *                       type: integer
 *                       example: 150
 *                     totalRevenue:
 *                       type: number
 *                       example: 2500000
 *                     avgJobValue:
 *                       type: string
 *                       example: "595.24"
 *                     completionRate:
 *                       type: string
 *                       example: "84.00"
 */

/**
 * @swagger
 * /analytics/revenue:
 *   get:
 *     summary: Get revenue analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     description: Admin-only endpoint
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [hour, day, week, month]
 *           default: day
 *     responses:
 *       200:
 *         description: Revenue analytics retrieved
 */

/**
 * @swagger
 * /analytics/jobs:
 *   get:
 *     summary: Get job analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     description: Admin-only endpoint. Returns jobs by status, service type, and average completion time
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Job analytics retrieved
 */

/**
 * @swagger
 * /analytics/workers:
 *   get:
 *     summary: Get worker analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     description: Admin-only endpoint. Returns worker distribution by KYC, availability, top workers
 *     responses:
 *       200:
 *         description: Worker analytics retrieved
 */

/**
 * @swagger
 * /analytics/users:
 *   get:
 *     summary: Get user analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     description: Admin-only endpoint. Returns new users by month, active users, retention rate
 *     responses:
 *       200:
 *         description: User analytics retrieved
 */

/**
 * @swagger
 * /analytics/ratings:
 *   get:
 *     summary: Get rating analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     description: Admin-only endpoint. Returns rating distribution and average platform rating
 *     responses:
 *       200:
 *         description: Rating analytics retrieved
 */

/**
 * @swagger
 * /analytics/realtime:
 *   get:
 *     summary: Get real-time metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     description: Admin-only endpoint. Returns last 24h activity
 *     responses:
 *       200:
 *         description: Real-time metrics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobsLast24h:
 *                       type: integer
 *                       example: 45
 *                     activeWorkers:
 *                       type: integer
 *                       example: 120
 *                     ongoingJobs:
 *                       type: integer
 *                       example: 23
 *                     recentTransactions:
 *                       type: integer
 *                       example: 67
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 */
