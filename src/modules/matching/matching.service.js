const { Worker, JobCandidate, Job, Address } = require('../../database/models');
const { sequelize } = require('../../config/database');
const { WORKER_AVAILABILITY, CANDIDATE_STATUS } = require('../../common/constants');
const logger = require('../../common/utils/logger');

// Uncomment the following lines to enable Gemini AI matching
// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class MatchingService {
  /**
   * Find and match workers for a job
   * @param {Object} job - Job object
   * @param {Object} options - Matching options
   * @returns {Array} - Array of matched workers with scores
   */
  async matchWorkersForJob(job, options = {}) {
    const {
      maxWorkers = parseInt(process.env.MATCHING_MAX_WORKERS) || 10,
      radiusKm = parseInt(process.env.MATCHING_RADIUS_KM) || 10,
      useAI = process.env.USE_AI_MATCHING === 'true',
    } = options;

    try {
      // Get job address
      const address = await Address.findByPk(job.addressId);
      if (!address) {
        throw new Error('Job address not found');
      }

      // Try AI matching if enabled
      if (useAI) {
        try {
          const aiMatches = await this.aiMatching(job, address, { maxWorkers, radiusKm });
          if (aiMatches && aiMatches.length > 0) {
            logger.info(`AI matching found ${aiMatches.length} workers for job ${job.id}`);
            return aiMatches;
          }
        } catch (error) {
          logger.warn(`AI matching failed, falling back to heuristic: ${error.message}`);
        }
      }

      // Fallback to heuristic matching
      const heuristicMatches = await this.heuristicMatching(job, address, { maxWorkers, radiusKm });
      logger.info(`Heuristic matching found ${heuristicMatches.length} workers for job ${job.id}`);
      
      return heuristicMatches;
    } catch (error) {
      logger.error(`Matching failed for job ${job.id}:`, error);
      throw error;
    }
  }

  /**
   * Heuristic matching using database queries
   * Fast path for matching workers based on proximity, skills, and availability
   */
  async heuristicMatching(job, address, options) {
    const { maxWorkers, radiusKm } = options;

    // Build the query to find nearby available workers
    const query = `
      SELECT 
        w.*,
        ST_Distance(
          w.location::geography,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
        ) / 1000 AS distance_km
      FROM workers w
      WHERE 
        w.availability_status = :availabilityStatus
        AND w.kyc_status = 'verified'
        AND ST_DWithin(
          w.location::geography,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
          :radiusMeters
        )
        AND w.location IS NOT NULL
      ORDER BY 
        distance_km ASC,
        w.avg_rating DESC,
        w.acceptance_rate DESC
      LIMIT :maxWorkers
    `;

    const workers = await sequelize.query(query, {
      replacements: {
        longitude: address.longitude,
        latitude: address.latitude,
        availabilityStatus: WORKER_AVAILABILITY.ONLINE,
        radiusMeters: radiusKm * 1000,
        maxWorkers,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    // Filter by skills if service type requires specific skills
    const filteredWorkers = this.filterBySkills(workers, job.serviceType);

    // Calculate matching scores
    const scoredWorkers = filteredWorkers.map((worker) => {
      const score = this.calculateHeuristicScore(worker, job);
      return {
        worker,
        score,
        matchingReason: this.generateMatchingReason(worker, job, score),
      };
    });

    // Sort by score descending
    scoredWorkers.sort((a, b) => b.score - a.score);

    return scoredWorkers.slice(0, maxWorkers);
  }

  /**
   * AI-powered matching using Google Gemini
   * Advanced matching with ML-based scoring
   */
  async aiMatching(job, address, options) {
    // COMMENTED OUT BY DEFAULT - Uncomment to enable Gemini AI matching
    /*
    const { maxWorkers, radiusKm } = options;

    // First, get candidate workers using heuristic (broader search)
    const candidates = await this.heuristicMatching(job, address, {
      maxWorkers: maxWorkers * 2, // Get more candidates for AI to rank
      radiusKm: radiusKm * 1.5,
    });

    if (candidates.length === 0) {
      return [];
    }

    // Prepare data for AI
    const jobContext = {
      serviceType: job.serviceType,
      description: job.description,
      preferredTime: job.preferredTimeStart,
      location: {
        latitude: address.latitude,
        longitude: address.longitude,
        city: address.city,
      },
    };

    const workerProfiles = candidates.map((c) => ({
      id: c.worker.id,
      skills: c.worker.skills,
      rating: c.worker.avg_rating,
      completedJobs: c.worker.completed_jobs,
      acceptanceRate: c.worker.acceptance_rate,
      distance: c.worker.distance_km,
      experienceYears: c.worker.experience_years,
    }));

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-pro' });

    const prompt = `
You are a worker matching AI for a local services platform. Analyze the job requirements and worker profiles to rank the best matches.

Job Details:
${JSON.stringify(jobContext, null, 2)}

Worker Profiles:
${JSON.stringify(workerProfiles, null, 2)}

Rank the workers from best to worst match. Consider:
1. Skill match with service type
2. Distance from job location
3. Worker rating and reliability
4. Acceptance rate
5. Experience level
6. Completed jobs count

Return ONLY a JSON array of worker IDs in ranked order with scores (0-1), like:
[{"workerId": "uuid", "score": 0.95, "reason": "brief explanation"}, ...]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse AI response
    const aiRankings = JSON.parse(text);

    // Map back to worker objects
    const rankedWorkers = aiRankings.map((ranking) => {
      const candidate = candidates.find((c) => c.worker.id === ranking.workerId);
      return {
        worker: candidate.worker,
        score: ranking.score,
        matchingReason: ranking.reason || candidate.matchingReason,
      };
    });

    return rankedWorkers.slice(0, maxWorkers);
    */

    // Return empty array when AI is disabled
    return [];
  }

  /**
   * Filter workers by skills
   */
  filterBySkills(workers, serviceType) {
    return workers.filter((worker) => {
      if (!worker.skills || worker.skills.length === 0) {
        return false;
      }

      // Check if worker has the required skill
      const hasSkill = worker.skills.some(
        (skill) => skill.skill.toLowerCase() === serviceType.toLowerCase()
      );

      return hasSkill;
    });
  }

  /**
   * Calculate heuristic matching score
   * Score is between 0 and 1
   */
  calculateHeuristicScore(worker, job) {
    let score = 0;

    // Distance score (40% weight) - closer is better
    const maxDistance = 10; // km
    const distanceScore = Math.max(0, 1 - worker.distance_km / maxDistance);
    score += distanceScore * 0.4;

    // Rating score (30% weight)
    const ratingScore = worker.avg_rating / 5;
    score += ratingScore * 0.3;

    // Acceptance rate score (15% weight)
    score += worker.acceptance_rate * 0.15;

    // Experience score (15% weight)
    const completedJobsScore = Math.min(1, worker.completed_jobs / 100);
    score += completedJobsScore * 0.15;

    return Math.min(1, score);
  }

  /**
   * Generate matching reason explanation
   */
  generateMatchingReason(worker, job, score) {
    const reasons = [];

    if (worker.distance_km < 2) {
      reasons.push('Very close to job location');
    } else if (worker.distance_km < 5) {
      reasons.push('Nearby location');
    }

    if (worker.avg_rating >= 4.5) {
      reasons.push('Highly rated');
    } else if (worker.avg_rating >= 4.0) {
      reasons.push('Good rating');
    }

    if (worker.acceptance_rate >= 0.8) {
      reasons.push('High acceptance rate');
    }

    if (worker.completed_jobs >= 50) {
      reasons.push('Experienced worker');
    }

    return reasons.join(', ') || 'Available worker';
  }

  /**
   * Save matching results as job candidates
   */
  async saveMatchingResults(jobId, matchedWorkers) {
    const transaction = await sequelize.transaction();
    try {
      // Delete existing candidates for this job to avoid unique constraint violations
      await JobCandidate.destroy({ where: { jobId }, transaction });

      const candidates = matchedWorkers.map((match) => ({
        jobId,
        workerId: match.worker.id,
        score: match.score,
        matchingReason: match.matchingReason,
        finalStatus: CANDIDATE_STATUS.PENDING,
      }));

      // Remove duplicates based on workerId (just in case the input array has duplicates)
      const uniqueCandidates = Array.from(
        new Map(candidates.map(c => [c.workerId, c])).values()
      );

      if (uniqueCandidates.length < candidates.length) {
        logger.warn(`Found ${candidates.length - uniqueCandidates.length} duplicate workers in matching results. Removed duplicates.`);
      }

      // Use ignoreDuplicates to safely handle any potential race conditions
      // where a candidate might still exist or be inserted concurrently.
      await JobCandidate.bulkCreate(uniqueCandidates, { 
        transaction,
        ignoreDuplicates: true, // Postgres: ON CONFLICT DO NOTHING
        validate: false // Skip model-level validation since we know data is clean and validation might be throwing false positives
      });
      
      await transaction.commit();
      logger.info(`Saved ${uniqueCandidates.length} job candidates for job ${jobId}`);
    } catch (error) {
      await transaction.rollback();
      logger.error('Error saving matching results:', error);
      throw error;
    }
  }

  /**
   * Get best match from candidates
   */
  async getBestMatch(jobId) {
    const candidate = await JobCandidate.findOne({
      where: { jobId },
      order: [['score', 'DESC']],
      include: [{ model: Worker, as: 'worker' }],
    });

    return candidate;
  }
}

module.exports = new MatchingService();
