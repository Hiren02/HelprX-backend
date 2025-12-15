/**
 * @swagger
 * /wallet/balance:
 *   get:
 *     summary: Get wallet balance
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     description: Worker-only endpoint
 *     responses:
 *       200:
 *         description: Wallet balance retrieved
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     workerId:
 *                       type: string
 *                       format: uuid
 *                     balance:
 *                       type: number
 *                       example: 5000.00
 *                     totalEarnings:
 *                       type: number
 *                       example: 50000.00
 *                     totalWithdrawn:
 *                       type: number
 *                       example: 45000.00
 *                     pendingAmount:
 *                       type: number
 *                       example: 500.00
 */

/**
 * @swagger
 * /wallet/transactions:
 *   get:
 *     summary: Get transaction history
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     description: Worker-only endpoint
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [credit, debit, payout]
 *     responses:
 *       200:
 *         description: Transactions retrieved
 */

/**
 * @swagger
 * /wallet/payout:
 *   post:
 *     summary: Request payout
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     description: Worker-only endpoint. Minimum payout ₹100
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 100
 *                 example: 1000
 *     responses:
 *       200:
 *         description: Payout requested successfully
 *       400:
 *         description: Insufficient balance or amount below minimum
 */
