const Joi = require('joi');

const requestPayoutSchema = Joi.object({
  amount: Joi.number().positive().min(100).required().messages({
    'number.min': 'Minimum payout amount is ₹100',
    'number.positive': 'Amount must be positive',
    'any.required': 'Amount is required',
  }),
});

module.exports = {
  requestPayoutSchema,
};
