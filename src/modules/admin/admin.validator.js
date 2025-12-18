const Joi = require('joi');

const updateUserStatusSchema = Joi.object({
  isActive: Joi.boolean().required().messages({
    'any.required': 'isActive status is required',
  }),
});

const updateKYCSchema = Joi.object({
  status: Joi.string().valid('verified', 'rejected').required().messages({
    'any.only': 'Status must be either verified or rejected',
    'any.required': 'Status is required',
  }),
  rejectionReason: Joi.string().when('status', {
    is: 'rejected',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

const manualAssignSchema = Joi.object({
  workerId: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid worker ID format',
    'any.required': 'Worker ID is required',
  }),
});

const cancelJobSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required().messages({
    'string.min': 'Reason must be at least 10 characters',
    'any.required': 'Cancellation reason is required',
  }),
});

const resolveDisputeSchema = Joi.object({
  resolution: Joi.string().min(10).max(1000).required().messages({
    'string.min': 'Resolution must be at least 10 characters',
    'any.required': 'Resolution is required',
  }),
  refundAmount: Joi.number().min(0).optional(),
});

const createAdminSchema = Joi.object({
  phone: Joi.string().required().messages({
    'any.required': 'Phone number is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
  name: Joi.string().min(2).max(255).required().messages({
    'any.required': 'Name is required',
  }),
});

const completeJobSchema = Joi.object({
  completionNotes: Joi.string().min(5).max(500).optional().messages({
    'string.min': 'Notes must be at least 5 characters',
  }),
});

module.exports = {
  updateUserStatusSchema,
  updateKYCSchema,
  manualAssignSchema,
  cancelJobSchema,
  resolveDisputeSchema,
  createAdminSchema,
  completeJobSchema,
};
