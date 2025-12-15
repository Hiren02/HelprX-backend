const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { WORKER_AVAILABILITY, KYC_STATUS } = require('../../common/constants');

const Worker = sequelize.define('Worker', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  companyName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'company_name',
  },
  skills: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of {skill: string, level: number}',
  },
  kycStatus: {
    type: DataTypes.STRING(50),
    defaultValue: KYC_STATUS.PENDING,
    field: 'kyc_status',
    validate: {
      isIn: [Object.values(KYC_STATUS)],
    },
  },
  kycDocuments: {
    type: DataTypes.JSONB,
    defaultValue: {},
    field: 'kyc_documents',
    comment: 'Stores document URLs and metadata',
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    validate: {
      min: -90,
      max: 90,
    },
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    validate: {
      min: -180,
      max: 180,
    },
  },
  location: {
    type: DataTypes.GEOMETRY('POINT', 4326),
    allowNull: true,
  },
  availabilityStatus: {
    type: DataTypes.STRING(20),
    defaultValue: WORKER_AVAILABILITY.OFFLINE,
    field: 'availability_status',
    validate: {
      isIn: [Object.values(WORKER_AVAILABILITY)],
    },
  },
  avgRating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
    field: 'avg_rating',
    validate: {
      min: 0,
      max: 5,
    },
  },
  totalRatings: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_ratings',
  },
  acceptanceRate: {
    type: DataTypes.DECIMAL(5, 4),
    defaultValue: 0,
    field: 'acceptance_rate',
    validate: {
      min: 0,
      max: 1,
    },
  },
  completedJobs: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'completed_jobs',
  },
  lastActiveAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_active_at',
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  experienceYears: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'experience_years',
  },
  profileImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'profile_image',
  },
}, {
  tableName: 'workers',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['phone'] },
    { fields: ['availability_status'] },
    { fields: ['kyc_status'] },
    { fields: ['avg_rating'] },
  ],
  hooks: {
    beforeSave: (worker) => {
      if (worker.latitude && worker.longitude) {
        worker.location = {
          type: 'Point',
          coordinates: [worker.longitude, worker.latitude],
        };
      }
    },
  },
});

module.exports = Worker;
