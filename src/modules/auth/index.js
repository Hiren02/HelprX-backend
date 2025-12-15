const authService = require('./auth.service');
const authController = require('./auth.controller');
const authRoutes = require('./auth.routes');
const authValidator = require('./auth.validator');

module.exports = {
  authService,
  authController,
  authRoutes,
  authValidator,
};
