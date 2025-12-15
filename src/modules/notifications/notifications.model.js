const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { NOTIFICATION_TYPES, NOTIFICATION_CHANNELS } = require('../../common/constants');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  workerId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'worker_id',
    references: {
      model: 'workers',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isIn: [Object.values(NOTIFICATION_TYPES)],
    },
  },
  channel: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [Object.values(NOTIFICATION_CHANNELS)],
    },
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  data: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional notification data',
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_read',
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'read_at',
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'sent_at',
  },
  deliveryStatus: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending',
    field: 'delivery_status',
    comment: 'pending, sent, failed, delivered',
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'error_message',
  },
}, {
  tableName: 'notifications',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['worker_id'] },
    { fields: ['type'] },
    { fields: ['is_read'] },
    { fields: ['created_at'] },
  ],
});

module.exports = Notification;
