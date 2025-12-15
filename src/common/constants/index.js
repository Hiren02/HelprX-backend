/**
 * Application Constants
 */

// User Roles
const USER_ROLES = {
  USER: 'user',
  WORKER: 'worker',
  ADMIN: 'admin',
};

// Job Status
const JOB_STATUS = {
  CREATED: 'created',
  MATCHING: 'matching',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
};

// Job Candidate Status
const CANDIDATE_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  TIMED_OUT: 'timed_out',
};

// Worker Availability Status
const WORKER_AVAILABILITY = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BUSY: 'busy',
};

// KYC Status
const KYC_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

// Service Types
const SERVICE_TYPES = {
  PLUMBING: 'plumbing',
  ELECTRICAL: 'electrical',
  TUTORING: 'tutoring',
  CARPENTRY: 'carpentry',
  PAINTING: 'painting',
  CLEANING: 'cleaning',
  PET_CARE: 'pet_care',
  HANDYMAN: 'handyman',
  AC_REPAIR: 'ac_repair',
  APPLIANCE_REPAIR: 'appliance_repair',
  PEST_CONTROL: 'pest_control',
  GARDENING: 'gardening',
  OTHER: 'other',
};

// Notification Types
const NOTIFICATION_TYPES = {
  JOB_CREATED: 'job_created',
  JOB_ASSIGNED: 'job_assigned',
  JOB_ACCEPTED: 'job_accepted',
  JOB_DECLINED: 'job_declined',
  JOB_STARTED: 'job_started',
  JOB_COMPLETED: 'job_completed',
  JOB_CANCELLED: 'job_cancelled',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_FAILED: 'payment_failed',
  RATING_RECEIVED: 'rating_received',
  PAYOUT_PROCESSED: 'payout_processed',
  KYC_APPROVED: 'kyc_approved',
  KYC_REJECTED: 'kyc_rejected',
  SYSTEM_ALERT: 'system_alert',
};

// Notification Channels
const NOTIFICATION_CHANNELS = {
  PUSH: 'push',
  SMS: 'sms',
  EMAIL: 'email',
  IN_APP: 'in_app',
};

// Payment Status
const PAYMENT_STATUS = {
  PENDING: 'pending',
  AUTHORIZED: 'authorized',
  CAPTURED: 'captured',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// Transaction Types
const TRANSACTION_TYPES = {
  CREDIT: 'credit',
  DEBIT: 'debit',
  REFUND: 'refund',
  PAYOUT: 'payout',
  COMMISSION: 'commission',
};

// Payout Status
const PAYOUT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// Dispute Status
const DISPUTE_STATUS = {
  OPEN: 'open',
  UNDER_REVIEW: 'under_review',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

// Rating Moderation Status
const MODERATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FLAGGED: 'flagged',
};

// Skill Levels
const SKILL_LEVELS = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
};

// Default Values
const DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
  MATCHING_RADIUS_KM: 10,
  MATCHING_MAX_WORKERS: 10,
  WORKER_ACCEPTANCE_TIMEOUT_MINUTES: 5,
  MIN_WORKER_RATING: 3.0,
  BASE_SERVICE_FEE: 50,
  PLATFORM_COMMISSION_PERCENT: 15,
  SURGE_MULTIPLIER_MAX: 2.5,
};

// Error Messages
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_EXISTS: 'User already exists',
  WORKER_EXISTS: 'Worker already exists',
  INVALID_TOKEN: 'Invalid or expired token',
  JOB_NOT_FOUND: 'Job not found',
  WORKER_NOT_FOUND: 'Worker not found',
  USER_NOT_FOUND: 'User not found',
  INSUFFICIENT_BALANCE: 'Insufficient wallet balance',
  PAYMENT_FAILED: 'Payment processing failed',
  ALREADY_RATED: 'You have already rated this job',
};

// Success Messages
const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  JOB_CREATED: 'Job created successfully',
  JOB_UPDATED: 'Job updated successfully',
  JOB_CANCELLED: 'Job cancelled successfully',
  PAYMENT_SUCCESS: 'Payment processed successfully',
  RATING_SUBMITTED: 'Rating submitted successfully',
  PAYOUT_REQUESTED: 'Payout requested successfully',
};

module.exports = {
  USER_ROLES,
  JOB_STATUS,
  CANDIDATE_STATUS,
  WORKER_AVAILABILITY,
  KYC_STATUS,
  SERVICE_TYPES,
  NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS,
  PAYMENT_STATUS,
  TRANSACTION_TYPES,
  PAYOUT_STATUS,
  DISPUTE_STATUS,
  MODERATION_STATUS,
  SKILL_LEVELS,
  DEFAULTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
