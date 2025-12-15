const Joi = require('joi');

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  companyName: Joi.string().max(255).optional().allow(''),
  bio: Joi.string().max(1000).optional().allow(''),
  experienceYears: Joi.number().integer().min(0).max(50).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
}).min(1);

const updateSkillsSchema = Joi.object({
  skills: Joi.array()
    .items(
      Joi.object({
        skill: Joi.string().required(),
        level: Joi.number().integer().min(1).max(4).required(),
      })
    )
    .required()
    .messages({
      'any.required': 'Skills array is required',
    }),
});

const updateAvailabilitySchema = Joi.object({
  status: Joi.string().valid('online', 'offline', 'busy').required().messages({
    'any.only': 'Status must be one of: online, offline, busy',
    'any.required': 'Status is required',
  }),
});

const uploadKYCSchema = Joi.object({
  documents: Joi.object({
    aadhar: Joi.string().uri().optional(),
    pan: Joi.string().uri().optional(),
    drivingLicense: Joi.string().uri().optional(),
    photo: Joi.string().uri().optional(),
  })
    .required()
    .messages({
      'any.required': 'Documents object is required',
    }),
});

module.exports = {
  updateProfileSchema,
  updateSkillsSchema,
  updateAvailabilitySchema,
  uploadKYCSchema,
};
