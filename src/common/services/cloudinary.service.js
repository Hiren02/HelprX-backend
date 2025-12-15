const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const logger = require('../utils/logger');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryService {
  /**
   * Upload image to Cloudinary
   * @param {Buffer} fileBuffer - File buffer
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} - Upload result with URL
   */
  async uploadImage(fileBuffer, options = {}) {
    try {
      const { folder = 'helprx', resourceType = 'image', transformation } = options;

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: resourceType,
            transformation,
          },
          (error, result) => {
            if (error) {
              logger.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                width: result.width,
                height: result.height,
                bytes: result.bytes,
              });
            }
          }
        );

        uploadStream.end(fileBuffer);
      });
    } catch (error) {
      logger.error('Error uploading to Cloudinary:', error);
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Upload multiple images
   * @param {Array} files - Array of file buffers
   * @param {Object} options - Upload options
   * @returns {Promise<Array>} - Array of upload results
   */
  async uploadMultipleImages(files, options = {}) {
    try {
      const uploadPromises = files.map(file => 
        this.uploadImage(file.buffer, options)
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      logger.error('Error uploading multiple images:', error);
      throw new Error('Failed to upload images');
    }
  }

  /**
   * Delete image from Cloudinary
   * @param {string} publicId - Public ID of the image
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      logger.info(`Image deleted from Cloudinary: ${publicId}`);
      return result;
    } catch (error) {
      logger.error('Error deleting from Cloudinary:', error);
      throw new Error('Failed to delete image');
    }
  }

  /**
   * Delete multiple images
   * @param {Array} publicIds - Array of public IDs
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteMultipleImages(publicIds) {
    try {
      const result = await cloudinary.api.delete_resources(publicIds);
      logger.info(`Multiple images deleted from Cloudinary: ${publicIds.length}`);
      return result;
    } catch (error) {
      logger.error('Error deleting multiple images:', error);
      throw new Error('Failed to delete images');
    }
  }

  /**
   * Get Cloudinary storage for Multer
   * @param {Object} options - Storage options
   * @returns {CloudinaryStorage} - Multer storage
   */
  getStorage(options = {}) {
    const { folder = 'helprx', allowedFormats = ['jpg', 'jpeg', 'png', 'pdf'] } = options;

    // return new CloudinaryStorage({
    //   cloudinary: cloudinary,
    //   params: {
    //     folder,
    //     allowed_formats: allowedFormats,
    //     transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    //   },
    // });
  }

  /**
   * Create Multer upload middleware
   * @param {Object} options - Upload options
   * @returns {multer} - Multer instance
   */
  createUploadMiddleware(options = {}) {
    const {
      folder = 'helprx',
      maxFileSize = 5 * 1024 * 1024, // 5MB default
      allowedFormats = ['jpg', 'jpeg', 'png', 'pdf'],
      maxFiles = 5,
    } = options;

    const storage = this.getStorage({ folder, allowedFormats });

    return multer({
      storage,
      limits: {
        fileSize: maxFileSize,
        files: maxFiles,
      },
      fileFilter: (req, file, cb) => {
        // Check file type
        const ext = file.originalname.split('.').pop().toLowerCase();
        if (allowedFormats.includes(ext)) {
          cb(null, true);
        } else {
          cb(new Error(`Invalid file type. Allowed: ${allowedFormats.join(', ')}`));
        }
      },
    });
  }
}

module.exports = new CloudinaryService();
