const express = require('express');
const { authenticate, isAdmin } = require('../../common/middleware/auth.middleware');
const analyticsController = require('./analytics.controller');

const router = express.Router();

// All analytics routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

router.get('/overview', analyticsController.getOverview);
router.get('/revenue', analyticsController.getRevenue);
router.get('/jobs', analyticsController.getJobs);
router.get('/workers', analyticsController.getWorkers);
router.get('/users', analyticsController.getUsers);
router.get('/ratings', analyticsController.getRatings);
router.get('/realtime', analyticsController.getRealTime);

module.exports = router;
