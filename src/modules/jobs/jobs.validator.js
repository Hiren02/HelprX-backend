const Joi = require('joi');

const createJobSchema = Joi.object({
  addressId: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid address ID format',
    'any.required': 'Address ID is required',
  }),
  serviceType: Joi.string().required().messages({
    'any.required': 'Service type is required',
  }),
  title: Joi.string().min(5).max(255).required().messages({
    'string.min': 'Title must be at least 5 characters',
    'any.required': 'Title is required',
  }),
  description: Joi.string().min(10).max(2000).optional().allow(''),
  attachments: Joi.array().items(Joi.string().uri()).optional(),
  preferredTimeStart: Joi.date().optional(),
  preferredTimeEnd: Joi.date().optional(),
});

const updateJobStatusSchema = Joi.object({
  status: Joi.string().valid('in_progress', 'completed', 'cancelled').required(),
  finalPrice: Joi.number().positive().optional(),
  cancellationReason: Joi.string().when('status', {
    is: 'cancelled',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

const acceptJobSchema = Joi.object({
  jobId: Joi.string().uuid().required(),
});

const declineJobSchema = Joi.object({
  jobId: Joi.string().uuid().required(),
  reason: Joi.string().min(5).max(500).optional(),
});

module.exports = {
  createJobSchema,
  updateJobStatusSchema,
  acceptJobSchema,
  declineJobSchema,
};
