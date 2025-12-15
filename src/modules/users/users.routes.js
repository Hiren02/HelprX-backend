const express = require('express');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { validate } = require('../../common/middleware/validation.middleware');
const userController = require('./users.controller');
const { updateProfileSchema, updatePasswordSchema } = require('./users.validator');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);
router.put('/password', validate(updatePasswordSchema), userController.updatePassword);
router.delete('/account', userController.deactivateAccount);
router.get('/stats', userController.getStats);

module.exports = router;
