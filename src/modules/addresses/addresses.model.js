const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Address = sequelize.define('Address', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true, // Made optional to support worker addresses
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  workerId: {
    type: DataTypes.UUID,
    allowNull: true, // For worker's shop/service addresses
    field: 'worker_id',
    references: {
      model: 'workers',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  label: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'e.g., Home, Office, Shop, etc.',
  },
  addressLine: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'address_line',
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  pincode: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
    validate: {
      min: -90,
      max: 90,
    },
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
    validate: {
      min: -180,
      max: 180,
    },
  },
  // PostGIS geography point - stored as GEOGRAPHY(POINT, 4326)
  location: {
    type: DataTypes.GEOMETRY('POINT', 4326),
    allowNull: true,
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_default',
  },
}, {
  tableName: 'addresses',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['worker_id'] },
    { fields: ['pincode'] },
    // GIST index for location will be created in migration
  ],
  validate: {
    // Ensure address belongs to either user OR worker, not both
    eitherUserOrWorker() {
      if (!this.userId && !this.workerId) {
        throw new Error('Address must belong to either a user or a worker');
      }
      if (this.userId && this.workerId) {
        throw new Error('Address cannot belong to both user and worker');
      }
    },
  },
  hooks: {
    beforeSave: (address) => {
      // Set location point from latitude and longitude
      if (address.latitude && address.longitude) {
        address.location = {
          type: 'Point',
          coordinates: [address.longitude, address.latitude],
        };
      }
    },
  },
});

module.exports = Address;
