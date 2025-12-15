const jobService = require('./jobs.service');
const jobController = require('./jobs.controller');
const jobRoutes = require('./jobs.routes');
const jobValidator = require('./jobs.validator');

module.exports = {
  jobService,
  jobController,
  jobRoutes,
  jobValidator,
};
