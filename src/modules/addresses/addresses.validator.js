const Joi = require('joi');

const createAddressSchema = Joi.object({
  label: Joi.string().max(100).optional().allow(''),
  addressLine: Joi.string().required().messages({
    'any.required': 'Address line is required',
  }),
  landmark: Joi.string().max(255).optional().allow(''),
  city: Joi.string().max(100).required().messages({
    'any.required': 'City is required',
  }),
  state: Joi.string().max(100).required().messages({
    'any.required': 'State is required',
  }),
  pincode: Joi.string().max(20).required().messages({
    'any.required': 'Pincode is required',
  }),
  latitude: Joi.number().min(-90).max(90).required().messages({
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90',
    'any.required': 'Latitude is required',
  }),
  longitude: Joi.number().min(-180).max(180).required().messages({
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180',
    'any.required': 'Longitude is required',
  }),
});

const updateAddressSchema = Joi.object({
  label: Joi.string().max(100).optional().allow(''),
  addressLine: Joi.string().optional(),
  landmark: Joi.string().max(255).optional().allow(''),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(100).optional(),
  pincode: Joi.string().max(20).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
}).min(1); // At least one field must be provided

const searchAddressSchema = Joi.object({
  q: Joi.string().min(2).required().messages({
    'string.min': 'Search term must be at least 2 characters',
    'any.required': 'Search term is required',
  }),
});

const nearbyAddressSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  radius: Joi.number().min(0.1).max(100).default(10),
});

module.exports = {
  createAddressSchema,
  updateAddressSchema,
  searchAddressSchema,
  nearbyAddressSchema,
};
