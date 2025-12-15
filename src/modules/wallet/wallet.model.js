const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Wallet = sequelize.define('Wallet', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  workerId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'worker_id',
    references: {
      model: 'workers',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  balance: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  totalEarnings: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    field: 'total_earnings',
  },
  totalWithdrawn: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    field: 'total_withdrawn',
  },
  pendingAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    field: 'pending_amount',
    comment: 'Amount in escrow for ongoing jobs',
  },
}, {
  tableName: 'wallets',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['worker_id'] },
  ],
});

module.exports = Wallet;
