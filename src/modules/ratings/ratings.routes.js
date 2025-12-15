const express = require('express');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { validate } = require('../../common/middleware/validation.middleware');
const ratingController = require('./ratings.controller');
const { submitRatingSchema } = require('./ratings.validator');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Submit rating
router.post('/', validate(submitRatingSchema), ratingController.submitRating);

// Get user's own ratings
router.get('/my-ratings', ratingController.getUserRatings);

// Get worker ratings (public)
router.get('/worker/:workerId', ratingController.getWorkerRatings);

// Get job rating
router.get('/job/:jobId', ratingController.getJobRating);

module.exports = router;
