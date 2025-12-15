/**
 * @swagger
 * /matching/find-workers:
 *   post:
 *     summary: Find matching workers (Preview or Re-match)
 *     description: |
 *       Two modes:
 *       1. Preview mode - Pass serviceType + addressId (before job creation)
 *       2. Re-match mode - Pass jobId (for existing job)
 *       
 *       Note: maxWorkers and useAI are controlled by backend env variables.
 *       Only radiusKm can be optionally customized.
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 title: Preview Mode
 *                 required:
 *                   - serviceType
 *                   - addressId
 *                 properties:
 *                   serviceType:
 *                     type: string
 *                     enum: [plumbing, electrical, tutoring, carpentry, painting, cleaning, pet_care, handyman, ac_repair, appliance_repair, pest_control, gardening, other]
 *                     example: "plumbing"
 *                   addressId:
 *                     type: string
 *                     format: uuid
 *                   radiusKm:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 50
 *                     example: 15
 *                     description: Optional - defaults to env MATCHING_RADIUS_KM
 *               - type: object
 *                 title: Re-match Mode
 *                 required:
 *                   - jobId
 *                 properties:
 *                   jobId:
 *                     type: string
 *                     format: uuid
 *                   radiusKm:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 50
 *                     description: Optional - defaults to env MATCHING_RADIUS_KM
 *     responses:
 *       200:
 *         description: Workers found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Found 5 matching workers"
 *                 data:
 *                   type: object
 *                   properties:
 *                     mode:
 *                       type: string
 *                       enum: [preview, existing_job]
 *                       example: "preview"
 *                     jobId:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                     searchRadius:
 *                       type: number
 *                       example: 15
 *                     totalMatches:
 *                       type: integer
 *                       example: 5
 *                     matches:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           workerId:
 *                             type: string
 *                             format: uuid
 *                           workerName:
 *                             type: string
 *                             example: "Rajesh Kumar"
 *                           workerPhone:
 *                             type: string
 *                             example: "9876543211"
 *                           distance:
 *                             type: string
 *                             example: "2.50"
 *                           rating:
 *                             type: number
 *                             example: 4.8
 *                           completedJobs:
 *                             type: integer
 *                             example: 45
 *                           skills:
 *                             type: array
 *                             items:
 *                               type: object
 *                           score:
 *                             type: number
 *                             example: 0.92
 *                           reason:
 *                             type: string
 *                             example: "Very close to job location, Highly rated"
 */

/**
 * @swagger
 * /matching/job/{jobId}:
 *   get:
 *     summary: Get matching results for a job
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Job matches retrieved successfully
 */

/**
 * @swagger
 * /matching/job/{jobId}/best:
 *   get:
 *     summary: Get best match for a job
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Best match retrieved successfully
 */
