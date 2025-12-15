const express = require('express');
const { authenticate } = require('../../common/middleware/auth.middleware');
const ApiResponse = require('../../common/utils/response');
const pricingService = require('./pricing.service');

const router = express.Router();

// Get price estimate
router.post('/estimate', async (req, res) => {
  try {
    const estimate = await pricingService.calculateEstimate(req.body);
    return ApiResponse.success(res, estimate, 'Price estimate calculated');
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
});

// Get surge info
router.get('/surge', async (req, res) => {
  try {
    const { serviceType, addressId } = req.query;
    const surgeMultiplier = await pricingService.calculateSurgeMultiplier(serviceType, addressId);
    
    return ApiResponse.success(res, {
      surgeMultiplier,
      surgeActive: surgeMultiplier > 1.0,
      message: surgeMultiplier > 1.0 ? 'Surge pricing active' : 'Normal pricing',
    }, 'Surge info retrieved');
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
});

module.exports = router;
