const userService = require('./users.service');
const userController = require('./users.controller');
const userRoutes = require('./users.routes');
const userValidator = require('./users.validator');

module.exports = {
  userService,
  userController,
  userRoutes,
  userValidator,
};
