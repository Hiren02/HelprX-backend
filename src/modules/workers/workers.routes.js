const express = require('express');
const { authenticate, isWorker } = require('../../common/middleware/auth.middleware');
const { validate } = require('../../common/middleware/validation.middleware');
const { uploadKYCDocuments } = require('../../common/middleware/upload.middleware');
const workerController = require('./workers.controller');
const {
  updateProfileSchema,
  updateSkillsSchema,
  updateAvailabilitySchema,
} = require('./workers.validator');

const router = express.Router();

// All routes require authentication
router.use(authenticate);
router.use(isWorker);

router.get('/profile', workerController.getProfile);
router.put('/profile', validate(updateProfileSchema), workerController.updateProfile);
router.put('/skills', validate(updateSkillsSchema), workerController.updateSkills);
router.put('/availability', validate(updateAvailabilitySchema), workerController.updateAvailability);
router.post('/kyc', uploadKYCDocuments, workerController.uploadKYC);
router.get('/stats', workerController.getStats);
router.get('/jobs', workerController.getJobs);

module.exports = router;

