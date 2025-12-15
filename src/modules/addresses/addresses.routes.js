const express = require('express');
const { authenticate, isWorker } = require('../../common/middleware/auth.middleware');
const { validate } = require('../../common/middleware/validation.middleware');
const addressController = require('./addresses.controller');
const { createAddressSchema, updateAddressSchema, searchAddressSchema, nearbyAddressSchema } = require('./addresses.validator');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User address routes
router.post('/', validate(createAddressSchema), addressController.createAddress);
router.get('/', addressController.getUserAddresses);
router.get('/search', validate(searchAddressSchema), addressController.searchAddresses);
router.get('/nearby', validate(nearbyAddressSchema), addressController.getNearbyAddresses);
router.get('/:id', addressController.getAddress);
router.put('/:id', validate(updateAddressSchema), addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.put('/:id/set-default', addressController.setDefaultAddress);

// Worker address routes (worker-specific)
router.post('/worker', isWorker, validate(createAddressSchema), addressController.createWorkerAddress);
router.get('/worker/list', isWorker, addressController.getWorkerAddresses);

module.exports = router;
