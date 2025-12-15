const Joi = require('joi');

const submitRatingSchema = Joi.object({
  jobId: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid job ID format',
    'any.required': 'Job ID is required',
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.min': 'Rating must be between 1 and 5',
    'number.max': 'Rating must be between 1 and 5',
    'any.required': 'Rating is required',
  }),
  review: Joi.string().max(1000).optional().allow(''),
});

module.exports = {
  submitRatingSchema,
};
