const ApiResponse = require('../utils/response');

/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {String} property - Request property to validate (body, query, params)
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return ApiResponse.badRequest(res, 'Validation failed', errors);
    }

    // Replace request property with validated value
    req[property] = value;
    next();
  };
};

module.exports = { validate };
