const cloudinaryService = require('../services/cloudinary.service');

/**
 * Middleware for uploading KYC documents
 * Supports multiple files: aadhar, pan, drivingLicense, photo
 */
const uploadKYCDocuments = cloudinaryService.createUploadMiddleware({
  folder: 'helprx/kyc',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
  maxFiles: 4,
}).fields([
  { name: 'aadhar', maxCount: 1 },
  { name: 'pan', maxCount: 1 },
  { name: 'drivingLicense', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
]);

/**
 * Middleware for uploading job attachments
 * Supports multiple images
 */
const uploadJobAttachments = cloudinaryService.createUploadMiddleware({
  folder: 'helprx/jobs',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFormats: ['jpg', 'jpeg', 'png'],
  maxFiles: 5,
}).array('attachments', 5);

/**
 * Middleware for uploading single profile picture
 */
const uploadProfilePicture = cloudinaryService.createUploadMiddleware({
  folder: 'helprx/profiles',
  maxFileSize: 2 * 1024 * 1024, // 2MB
  allowedFormats: ['jpg', 'jpeg', 'png'],
  maxFiles: 1,
}).single('profilePicture');

module.exports = {
  uploadKYCDocuments,
  uploadJobAttachments,
  uploadProfilePicture,
};
