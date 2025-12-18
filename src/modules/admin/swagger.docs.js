/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Admin-only endpoint
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, worker, admin]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or phone
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *   delete:
 *     summary: Delete user (soft delete)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deactivated successfully
 */

/**
 * @swagger
 * /admin/users/{id}/status:
 *   put:
 *     summary: Update user status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User status updated
 */

/**
 * @swagger
 * /admin/workers:
 *   get:
 *     summary: Get all workers
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: kycStatus
 *         schema:
 *           type: string
 *           enum: [pending, submitted, verified, rejected]
 *       - in: query
 *         name: availabilityStatus
 *         schema:
 *           type: string
 *           enum: [online, offline, busy]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workers retrieved successfully
 */

/**
 * @swagger
 * /admin/workers/{id}:
 *   get:
 *     summary: Get worker by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Worker retrieved with jobs and ratings
 */

/**
 * @swagger
 * /admin/workers/{id}/kyc:
 *   put:
 *     summary: Update worker KYC status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [verified, rejected]
 *               rejectionReason:
 *                 type: string
 *                 description: Required if status is rejected
 *     responses:
 *       200:
 *         description: KYC status updated
 */

/**
 * @swagger
 * /admin/kyc/pending:
 *   get:
 *     summary: Get pending KYC approvals
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending KYC workers retrieved
 */

/**
 * @swagger
 * /admin/jobs:
 *   get:
 *     summary: Get all jobs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: serviceType
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
 */

/**
 * @swagger
 * /admin/jobs/{id}/assign:
 *   post:
 *     summary: Manually assign job to worker
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workerId
 *             properties:
 *               workerId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Job assigned successfully
 */

/**
 * @swagger
 * /admin/jobs/{id}/cancel:
 *   put:
 *     summary: Cancel job (admin override)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 minLength: 10
 *     responses:
 *       200:
 *         description: Job cancelled successfully
 */

/**
 * @swagger
 * /admin/jobs/{id}/complete:
 *   put:
 *     summary: Complete job (admin override)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               completionNotes:
 *                 type: string
 *                 description: Optional notes (currently for logging only)
 *     responses:
 *       200:
 *         description: Job completed successfully
 */

/**
 * @swagger
 * /admin/disputes:
 *   get:
 *     summary: Get disputed jobs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Disputed jobs retrieved
 */

/**
 * @swagger
 * /admin/disputes/{jobId}/resolve:
 *   post:
 *     summary: Resolve dispute
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resolution
 *             properties:
 *               resolution:
 *                 type: string
 *                 minLength: 10
 *                 example: "Refund issued to customer. Worker payment withheld."
 *               refundAmount:
 *                 type: number
 *                 example: 250
 *     responses:
 *       200:
 *         description: Dispute resolved successfully
 */

/**
 * @swagger
 * /admin/create-admin:
 *   post:
 *     summary: Create new admin user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - email
 *               - password
 *               - name
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9999999998"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin2@helprx.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "admin123"
 *               name:
 *                 type: string
 *                 example: "Admin User"
 *     responses:
 *       201:
 *         description: Admin created successfully
 */
