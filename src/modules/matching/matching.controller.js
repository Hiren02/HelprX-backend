const matchingService = require('./matching.service');
const ApiResponse = require('../../common/utils/response');
const { asyncHandler } = require('../../common/middleware/error.middleware');
const { Job } = require('../../database/models');

class MatchingController {
  /**
   * Find matching workers for a job OR preview workers before creating job
   * POST /api/v1/matching/find-workers
   * 
   * Two modes:
   * 1. Preview mode: Pass serviceType + addressId (before job creation)
   * 2. Re-match mode: Pass jobId (for existing job)
   * 
   * Optional: radiusKm (defaults to env MATCHING_RADIUS_KM)
   * Note: maxWorkers and useAI are controlled by backend env variables
   */
  findWorkers = asyncHandler(async (req, res) => {
    const { jobId, serviceType, addressId, radiusKm } = req.body;

    let job;
    let shouldSaveResults = false;

    // Mode 1: Existing job (re-matching)
    if (jobId) {
      job = await Job.findByPk(jobId);
      if (!job) {
        return ApiResponse.notFound(res, 'Job not found');
      }

      // Check if user owns the job or is admin
      if (job.userId !== req.user.id && req.user.role !== 'admin') {
        return ApiResponse.forbidden(res, 'You do not have permission to match workers for this job');
      }

      shouldSaveResults = true;
    } 
    // Mode 2: Preview mode (before job creation)
    else if (serviceType && addressId) {
      const { Address } = require('../../database/models');
      
      // Verify address belongs to user
      const address = await Address.findOne({
        where: { id: addressId, userId: req.user.id },
      });

      if (!address) {
        return ApiResponse.forbidden(res, 'Address not found or does not belong to you');
      }

      // Create a temporary job object for matching (not saved to DB)
      job = {
        id: null,
        serviceType,
        addressId,
        userId: req.user.id,
        address,
      };
    } else {
      return ApiResponse.badRequest(
        res,
        'Either jobId OR (serviceType + addressId) is required'
      );
    }

    // Use backend env variables for maxWorkers and useAI
    // Only radiusKm can be optionally overridden from frontend
    const matchingOptions = {
      maxWorkers: parseInt(process.env.MATCHING_MAX_WORKERS) || 10,
      radiusKm: radiusKm || parseInt(process.env.MATCHING_RADIUS_KM) || 10,
      useAI: process.env.USE_AI_MATCHING === 'true',
    };

    // Find matching workers
    const matches = await matchingService.matchWorkersForJob(job, matchingOptions);

    // Save matching results only for existing jobs
    if (shouldSaveResults && matches.length > 0) {
      await matchingService.saveMatchingResults(jobId, matches);
    }

    return ApiResponse.success(
      res,
      {
        mode: jobId ? 'existing_job' : 'preview',
        jobId: jobId || null,
        searchRadius: matchingOptions.radiusKm,
        totalMatches: matches.length,
        matches: matches.map(m => ({
          workerId: m.worker.id,
          workerName: m.worker.name,
          workerPhone: m.worker.phone,
          distance: parseFloat(m.worker.distance_km).toFixed(2),
          rating: m.worker.avg_rating,
          completedJobs: m.worker.completed_jobs,
          skills: m.worker.skills,
          score: m.score,
          reason: m.matchingReason,
        })),
      },
      `Found ${matches.length} matching workers`
    );
  });

  /**
   * Get matching results for a job
   * GET /api/v1/matching/job/:jobId
   */
  getJobMatches = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    // Get job
    const job = await Job.findByPk(jobId);
    if (!job) {
      return ApiResponse.notFound(res, 'Job not found');
    }

    // Check permissions
    if (job.userId !== req.user.id && req.user.role !== 'admin') {
      return ApiResponse.forbidden(res, 'You do not have permission to view matches for this job');
    }

    // Get job candidates
    const { JobCandidate, Worker } = require('../../database/models');
    const candidates = await JobCandidate.findAll({
      where: { jobId },
      include: [
        {
          model: Worker,
          as: 'worker',
          attributes: ['id', 'name', 'phone', 'avgRating', 'completedJobs', 'skills'],
        },
      ],
      order: [['score', 'DESC']],
    });

    return ApiResponse.success(
      res,
      {
        jobId,
        totalCandidates: candidates.length,
        candidates: candidates.map(c => ({
          candidateId: c.id,
          worker: c.worker,
          score: c.score,
          matchingReason: c.matchingReason,
          status: c.finalStatus,
          respondedAt: c.respondedAt,
        })),
      },
      'Job matches retrieved successfully'
    );
  });

  /**
   * Get best match for a job
   * GET /api/v1/matching/job/:jobId/best
   */
  getBestMatch = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    // Get job
    const job = await Job.findByPk(jobId);
    if (!job) {
      return ApiResponse.notFound(res, 'Job not found');
    }

    // Check permissions
    if (job.userId !== req.user.id && req.user.role !== 'admin') {
      return ApiResponse.forbidden(res, 'You do not have permission to view matches for this job');
    }

    const bestMatch = await matchingService.getBestMatch(jobId);

    if (!bestMatch) {
      return ApiResponse.notFound(res, 'No matches found for this job');
    }

    return ApiResponse.success(
      res,
      {
        candidateId: bestMatch.id,
        worker: bestMatch.worker,
        score: bestMatch.score,
        matchingReason: bestMatch.matchingReason,
      },
      'Best match retrieved successfully'
    );
  });
}

module.exports = new MatchingController();
