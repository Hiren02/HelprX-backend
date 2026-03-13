const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { TRANSACTION_TYPES, PAYMENT_STATUS } = require('../../common/constants');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  walletId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'wallet_id',
    references: {
      model: 'wallets',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'job_id',
    references: {
      model: 'jobs',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [Object.values(TRANSACTION_TYPES)],
    },
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: PAYMENT_STATUS.PENDING,
    validate: {
      isIn: [Object.values(PAYMENT_STATUS)],
    },
  },
  paymentGateway: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'payment_gateway',
    comment: 'razorpay, stripe, etc.',
  },
  gatewayOrderId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'gateway_order_id',
  },
  gatewayPaymentId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'gateway_payment_id',
  },
  gatewaySignature: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'gateway_signature',
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional transaction metadata',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at',
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'transactions',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['wallet_id'] },
    { fields: ['job_id'] },
    { fields: ['user_id'] },
    { fields: ['type'] },
    { fields: ['status'] },
    { fields: ['gateway_order_id'] },
    { fields: ['gateway_payment_id'] },
  ],
});

module.exports = Transaction;
