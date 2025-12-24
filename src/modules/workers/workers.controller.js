const workerService = require('./workers.service');
const cloudinaryService = require('../../common/services/cloudinary.service');
const ApiResponse = require('../../common/utils/response');
const { asyncHandler } = require('../../common/middleware/error.middleware');

class WorkerController {
  /**
   * Get worker profile
   * GET /api/v1/workers/profile
   */
  getProfile = asyncHandler(async (req, res) => {
    const worker = await workerService.getWorkerProfile(req.user.id);
    return ApiResponse.success(res, worker, 'Worker profile retrieved successfully');
  });

  /**
   * Update worker profile
   * PUT /api/v1/workers/profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    const worker = await workerService.updateWorkerProfile(req.user.id, req.body);
    return ApiResponse.success(res, worker, 'Profile updated successfully');
  });

  /**
   * Update profile image
   * PUT /api/v1/workers/profile/image
   */
  updateProfileImage = asyncHandler(async (req, res) => {
    console.log('Update Profile Image Request - File:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      hasBuffer: !!req.file.buffer,
      path: req.file.path
    } : 'undefined');
    console.log('Update Profile Image Request - Body:', req.body);

    if (!req.file) {
      return ApiResponse.badRequest(res, 'No image file uploaded');
    }

    let imageUrl = req.file.path;

    // If memory storage is used (req.file.buffer exists but req.file.path doesn't)
    if (!imageUrl && req.file.buffer) {
      const result = await cloudinaryService.uploadImage(req.file.buffer, {
        folder: 'helprx/profiles',
      });
      imageUrl = result.url;
    }

    if (!imageUrl) {
      return ApiResponse.error(res, 'Failed to process image');
    }

    const worker = await workerService.updateWorkerProfile(req.user.id, {
      profileImage: imageUrl,
    });
    return ApiResponse.success(res, worker, 'Profile image updated successfully');
  });

  /**
   * Update skills
   * PUT /api/v1/workers/skills
   */
  updateSkills = asyncHandler(async (req, res) => {
    const worker = await workerService.updateSkills(req.user.id, req.body.skills);
    return ApiResponse.success(res, worker, 'Skills updated successfully');
  });

  /**
   * Update availability
   * PUT /api/v1/workers/availability
   */
  updateAvailability = asyncHandler(async (req, res) => {
    const worker = await workerService.updateAvailability(req.user.id, req.body.status);
    return ApiResponse.success(res, worker, 'Availability updated successfully');
  });

  /**
   * Upload KYC documents
   * POST /api/v1/workers/kyc
   */
  uploadKYC = asyncHandler(async (req, res) => {
    const documents = {};
    const requiredDocs = ['aadhar', 'pan', 'photo']; // drivingLicense is optional based on frontend payload observation, but keeping others
    const missingDocs = [];

    // Support both multipart/form-data (req.files) and JSON base64 (req.body.documents)
    if (req.body.documents && typeof req.body.documents === 'object') {
      const base64Docs = req.body.documents;
      
      for (const docField of requiredDocs) {
        if (base64Docs[docField]) {
          try {
            const result = await cloudinaryService.uploadBase64(base64Docs[docField], {
              folder: 'helprx/kyc',
            });
            documents[docField] = result.url;
          } catch (error) {
            console.error(`Error uploading base64 for ${docField}:`, error);
            return ApiResponse.error(res, `Failed to upload ${docField} document`);
          }
        } else {
          missingDocs.push(docField);
        }
      }
    } else if (req.files) {
      requiredDocs.forEach(docField => {
        if (req.files[docField] && req.files[docField][0]) {
          documents[docField] = req.files[docField][0].path;
        } else {
          missingDocs.push(docField);
        }
      });
    } else {
      return ApiResponse.badRequest(res, 'No files or documents uploaded');
    }

    if (missingDocs.length > 0) {
      return ApiResponse.badRequest(res, `Missing required documents: ${missingDocs.join(', ')}`);
    }

    const worker = await workerService.uploadKYCDocuments(req.user.id, documents);
    return ApiResponse.success(res, worker, 'KYC documents uploaded successfully');
  });

  /**
   * Get worker statistics
   * GET /api/v1/workers/stats
   */
  getStats = asyncHandler(async (req, res) => {
    const stats = await workerService.getWorkerStats(req.user.id, req.query);
    return ApiResponse.success(res, stats, 'Statistics retrieved successfully');
  });

  /**
   * Get worker jobs
   * GET /api/v1/workers/jobs
   */
  getJobs = asyncHandler(async (req, res) => {
    const result = await workerService.getWorkerJobs(req.user.id, req.query);
    return ApiResponse.paginated(
      res,
      result.jobs,
      result.page,
      parseInt(req.query.limit) || 10,
      result.total,
      'Jobs retrieved successfully'
    );
  });

  /**
   * Get worker job inbox
   * GET /api/v1/workers/inbox
   */
  getInbox = asyncHandler(async (req, res) => {
    const result = await workerService.getWorkerInbox(req.user.id, req.query);
    return ApiResponse.paginated(
      res,
      result.invites,
      result.page,
      parseInt(req.query.limit) || 10,
      result.total,
      'Inbox retrieved successfully'
    );
  });
}

module.exports = new WorkerController();
