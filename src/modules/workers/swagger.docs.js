/**
 * @swagger
 * /workers/profile:
 *   get:
 *     summary: Get worker profile
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Worker profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Worker'
 *   put:
 *     summary: Update worker profile
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               companyName:
 *                 type: string
 *               bio:
 *                 type: string
 *               experienceYears:
 *                 type: integer
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */

/**
 * @swagger
 * /workers/skills:
 *   put:
 *     summary: Update worker skills
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - skills
 *             properties:
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     skill:
 *                       type: string
 *                       enum: [plumbing, electrical, tutoring, carpentry, painting, cleaning, pet_care, handyman, ac_repair, appliance_repair, pest_control, gardening]
 *                     level:
 *                       type: integer
 *                       minimum: 1
 *                       maximum: 4
 *                       description: "1=Beginner, 2=Intermediate, 3=Advanced, 4=Expert"
 *                 example:
 *                   - skill: "plumbing"
 *                     level: 4
 *                   - skill: "electrical"
 *                     level: 3
 *     responses:
 *       200:
 *         description: Skills updated successfully
 */

/**
 * @swagger
 * /workers/availability:
 *   put:
 *     summary: Update availability status
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
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
 *                 enum: [online, offline, busy]
 *     responses:
 *       200:
 *         description: Availability updated successfully
 */

/**
 * @swagger
 * /workers/kyc:
 *   post:
 *     summary: Upload KYC documents
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               aadhar:
 *                 type: string
 *                 format: binary
 *                 description: Aadhar card document
 *               pan:
 *                 type: string
 *                 format: binary
 *                 description: PAN card document
 *               drivingLicense:
 *                 type: string
 *                 format: binary
 *                 description: Driving license
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Profile photo
 *     responses:
 *       200:
 *         description: KYC documents uploaded successfully
 */

/**
 * @swagger
 * /workers/stats:
 *   get:
 *     summary: Get worker statistics
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                     totalJobs:
 *                       type: integer
 *                     completedJobs:
 *                       type: integer
 *                     activeJobs:
 *                       type: integer
 *                     totalRatings:
 *                       type: integer
 *                     avgRating:
 *                       type: number
 *                     acceptanceRate:
 *                       type: number
 *                     walletBalance:
 *                       type: number
 *                     totalEarnings:
 *                       type: number
 */

/**
 * @swagger
 * /workers/jobs:
 *   get:
 *     summary: Get worker's jobs
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
 */
