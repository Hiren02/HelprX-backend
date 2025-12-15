/**
 * @swagger
 * /pricing/estimate:
 *   post:
 *     summary: Get price estimate
 *     tags: [Pricing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceType
 *               - addressId
 *             properties:
 *               serviceType:
 *                 type: string
 *                 enum: [plumbing, electrical, tutoring, carpentry, painting, cleaning, pet_care, handyman, ac_repair, appliance_repair, pest_control, gardening, other]
 *               addressId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Price estimate calculated
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
 *                     basePrice:
 *                       type: number
 *                       example: 200
 *                     surgeMultiplier:
 *                       type: number
 *                       example: 1.2
 *                     total:
 *                       type: number
 *                       example: 240
 *                     breakdown:
 *                       type: object
 *                       properties:
 *                         platformFee:
 *                           type: number
 *                         workerEarnings:
 *                           type: number
 */

/**
 * @swagger
 * /pricing/surge:
 *   get:
 *     summary: Get surge pricing info
 *     tags: [Pricing]
 *     parameters:
 *       - in: query
 *         name: serviceType
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: addressId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Surge info retrieved
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
 *                     surgeMultiplier:
 *                       type: number
 *                       example: 1.2
 *                     surgeActive:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: "Surge pricing active"
 */
