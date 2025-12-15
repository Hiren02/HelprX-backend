const express = require('express');
const jobController = require('./jobs.controller');
const { validate } = require('../../common/middleware/validation.middleware');
const { authenticate, isWorker } = require('../../common/middleware/auth.middleware');
const { uploadJobAttachments } = require('../../common/middleware/upload.middleware');
const { jobCreationLimiter } = require('../../common/middleware/rate-limit.middleware');
const { createJobSchema } = require('./jobs.validator');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User routes - Create job with file upload
router.post('/', jobCreationLimiter, uploadJobAttachments, validate(createJobSchema), jobController.createJob);
router.get('/', jobController.getUserJobs);
router.get('/:id', jobController.getJob);
router.put('/:id/cancel', jobController.cancelJob);

// Worker routes
router.post('/:id/accept', isWorker, jobController.acceptJob);
router.post('/:id/decline', isWorker, jobController.declineJob);
router.post('/:id/start', isWorker, jobController.startJob);
router.post('/:id/complete', isWorker, jobController.completeJob);

module.exports = router;
