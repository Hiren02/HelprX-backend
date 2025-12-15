const Joi = require('joi');

const matchWorkersSchema = Joi.object({
  // Mode 1: Existing job (re-matching)
  jobId: Joi.string().uuid().optional(),
  
  // Mode 2: Preview mode (before job creation)
  serviceType: Joi.string().optional(),
  addressId: Joi.string().uuid().optional(),
  
  // Optional: Custom search radius (defaults to env MATCHING_RADIUS_KM)
  radiusKm: Joi.number().min(1).max(50).optional(),
  
  // Note: maxWorkers and useAI are controlled by backend env variables
})
  .or('jobId', 'serviceType') // At least one must be present
  .with('serviceType', 'addressId') // If serviceType, addressId is required
  .messages({
    'object.missing': 'Either jobId OR (serviceType + addressId) is required',
  });

module.exports = {
  matchWorkersSchema,
};
