const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { JOB_STATUS } = require('../../common/constants');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
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
  addressId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'address_id',
    references: {
      model: 'addresses',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  assignedWorkerId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'assigned_worker_id',
    references: {
      model: 'workers',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  serviceType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'service_type',
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of attachment URLs',
  },
  preferredTimeStart: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'preferred_time_start',
  },
  preferredTimeEnd: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'preferred_time_end',
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: JOB_STATUS.CREATED,
    validate: {
      isIn: [Object.values(JOB_STATUS)],
    },
  },
  priceEstimate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'price_estimate',
  },
  finalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'final_price',
  },
  platformFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'platform_fee',
  },
  workerEarnings: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'worker_earnings',
  },
  surgeMultiplier: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 1.0,
    field: 'surge_multiplier',
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'started_at',
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at',
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'cancelled_at',
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cancellation_reason',
  },
  cancelledBy: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'cancelled_by',
    comment: 'user or worker',
  },
}, {
  tableName: 'jobs',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['assigned_worker_id'] },
    { fields: ['address_id'] },
    { fields: ['status'] },
    { fields: ['service_type'] },
    { fields: ['created_at'] },
  ],
});

module.exports = Job;
