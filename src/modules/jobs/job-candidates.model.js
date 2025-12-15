const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { CANDIDATE_STATUS } = require('../../common/constants');

const JobCandidate = sequelize.define('JobCandidate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'job_id',
    references: {
      model: 'jobs',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  workerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'worker_id',
    references: {
      model: 'workers',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  score: {
    type: DataTypes.DECIMAL(7, 4),
    allowNull: true,
    comment: 'ML matching score or heuristic score',
  },
  matchingReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'matching_reason',
    comment: 'Explanation of why this worker was matched',
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'delivered_at',
    comment: 'When notification was sent to worker',
  },
  acceptedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'accepted_at',
  },
  declinedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'declined_at',
  },
  timedOutAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'timed_out_at',
  },
  finalStatus: {
    type: DataTypes.STRING(50),
    defaultValue: CANDIDATE_STATUS.PENDING,
    field: 'final_status',
    validate: {
      isIn: [Object.values(CANDIDATE_STATUS)],
    },
  },
  declineReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'decline_reason',
  },
}, {
  tableName: 'job_candidates',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['job_id'] },
    { fields: ['worker_id'] },
    { fields: ['final_status'] },
    { unique: true, fields: ['job_id', 'worker_id'] },
  ],
});

module.exports = JobCandidate;
