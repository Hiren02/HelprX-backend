const addressService = require('./addresses.service');
const addressController = require('./addresses.controller');
const addressRoutes = require('./addresses.routes');
const addressValidator = require('./addresses.validator');

module.exports = {
  addressService,
  addressController,
  addressRoutes,
  addressValidator,
};
