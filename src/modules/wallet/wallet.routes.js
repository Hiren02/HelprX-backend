const express = require('express');
const { authenticate, isWorker } = require('../../common/middleware/auth.middleware');
const { validate } = require('../../common/middleware/validation.middleware');
const walletController = require('./wallet.controller');
const { requestPayoutSchema } = require('./wallet.validator');

const router = express.Router();

// All routes require worker authentication
router.use(authenticate);
router.use(isWorker);

router.get('/balance', walletController.getBalance);
router.get('/transactions', walletController.getTransactions);
router.post('/payout', validate(requestPayoutSchema), walletController.requestPayout);

module.exports = router;
