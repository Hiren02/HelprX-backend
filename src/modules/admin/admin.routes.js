const express = require('express');
const { authenticate, isAdmin } = require('../../common/middleware/auth.middleware');
const { validate } = require('../../common/middleware/validation.middleware');
const adminController = require('./admin.controller');
const {
  updateUserStatusSchema,
  updateKYCSchema,
  manualAssignSchema,
  cancelJobSchema,
  resolveDisputeSchema,
  createAdminSchema,
} = require('./admin.validator');

const router = express.Router();

// All admin routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

// ========== User Management ==========
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/status', validate(updateUserStatusSchema), adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// ========== Worker Management ==========
router.get('/workers', adminController.getAllWorkers);
router.get('/workers/:id', adminController.getWorkerById);
router.put('/workers/:id/kyc', validate(updateKYCSchema), adminController.updateWorkerKYC);
router.get('/kyc/pending', adminController.getPendingKYC);

// ========== Job Management ==========
router.get('/jobs', adminController.getAllJobs);
router.post('/jobs/:id/assign', validate(manualAssignSchema), adminController.manuallyAssignJob);
router.put('/jobs/:id/cancel', validate(cancelJobSchema), adminController.cancelJob);

// ========== Dispute Management ==========
router.get('/disputes', adminController.getDisputedJobs);
router.post('/disputes/:jobId/resolve', validate(resolveDisputeSchema), adminController.resolveDispute);

// ========== Admin Management ==========
router.post('/create-admin', validate(createAdminSchema), adminController.createAdmin);

module.exports = router;
