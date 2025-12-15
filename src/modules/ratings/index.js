const ratingService = require('./ratings.service');
const ratingController = require('./ratings.controller');
const ratingRoutes = require('./ratings.routes');
const ratingValidator = require('./ratings.validator');

module.exports = {
  ratingService,
  ratingController,
  ratingRoutes,
  ratingValidator,
};
