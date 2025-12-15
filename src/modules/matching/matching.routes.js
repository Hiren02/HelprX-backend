const express = require('express');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { validate } = require('../../common/middleware/validation.middleware');
const matchingController = require('./matching.controller');
const { matchWorkersSchema } = require('./matching.validator');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Find matching workers for a job
router.post('/find-workers', validate(matchWorkersSchema), matchingController.findWorkers);

// Get matching results for a job
router.get('/job/:jobId', matchingController.getJobMatches);

// Get best match for a job
router.get('/job/:jobId/best', matchingController.getBestMatch);

module.exports = router;
