const workerService = require('./workers.service');
const workerController = require('./workers.controller');
const workerRoutes = require('./workers.routes');
const workerValidator = require('./workers.validator');

module.exports = {
  workerService,
  workerController,
  workerRoutes,
  workerValidator,
};
