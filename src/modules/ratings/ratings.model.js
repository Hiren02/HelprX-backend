const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { MODERATION_STATUS } = require('../../common/constants');

const Rating = sequelize.define('Rating', {
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
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'SET NULL',
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
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  review: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  moderationStatus: {
    type: DataTypes.STRING(50),
    defaultValue: MODERATION_STATUS.APPROVED,
    field: 'moderation_status',
    validate: {
      isIn: [Object.values(MODERATION_STATUS)],
    },
  },
  moderationNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'moderation_notes',
  },
  moderatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'moderated_at',
  },
  moderatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'moderated_by',
  },
}, {
  tableName: 'ratings',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['job_id'] },
    { fields: ['user_id'] },
    { fields: ['worker_id'] },
    { fields: ['rating'] },
    { fields: ['moderation_status'] },
    { unique: true, fields: ['job_id', 'user_id'] },
  ],
});

module.exports = Rating;
