const walletService = require('./wallet.service');
const walletController = require('./wallet.controller');
const walletRoutes = require('./wallet.routes');
const walletValidator = require('./wallet.validator');

module.exports = {
  walletService,
  walletController,
  walletRoutes,
  walletValidator,
};
