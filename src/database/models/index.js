const { sequelize } = require('../../config/database');

// Import all models
const User = require('../../modules/users/users.model');
const Address = require('../../modules/addresses/addresses.model');
const Worker = require('../../modules/workers/workers.model');
const Job = require('../../modules/jobs/jobs.model');
const JobCandidate = require('../../modules/jobs/job-candidates.model');
const Rating = require('../../modules/ratings/ratings.model');
const Wallet = require('../../modules/wallet/wallet.model');
const Transaction = require('../../modules/payments/transactions.model');
const Notification = require('../../modules/notifications/notifications.model');

// Define associations

// User associations
User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
User.hasOne(Worker, { foreignKey: 'userId', as: 'workerProfile' });
User.hasMany(Job, { foreignKey: 'userId', as: 'jobs' });
User.hasMany(Rating, { foreignKey: 'userId', as: 'ratingsGiven' });
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

// Address associations
Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Address.belongsTo(Worker, { foreignKey: 'workerId', as: 'worker' }); // New association
Address.hasMany(Job, { foreignKey: 'addressId', as: 'jobs' });

// Worker associations
Worker.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Worker.hasMany(Job, { foreignKey: 'assignedWorkerId', as: 'assignedJobs' });
Worker.hasMany(JobCandidate, { foreignKey: 'workerId', as: 'jobCandidates' });
Worker.hasMany(Rating, { foreignKey: 'workerId', as: 'ratingsReceived' });
Worker.hasOne(Wallet, { foreignKey: 'workerId', as: 'wallet' });
Worker.hasMany(Notification, { foreignKey: 'workerId', as: 'notifications' });

// Job associations
Job.belongsTo(User, { foreignKey: 'userId', as: 'customer' });
Job.belongsTo(Address, { foreignKey: 'addressId', as: 'address' });
Job.belongsTo(Worker, { foreignKey: 'assignedWorkerId', as: 'assignedWorker' });
Job.hasMany(JobCandidate, { foreignKey: 'jobId', as: 'candidates' });
Job.hasOne(Rating, { foreignKey: 'jobId', as: 'rating' });
Job.hasMany(Transaction, { foreignKey: 'jobId', as: 'transactions' });

// JobCandidate associations
JobCandidate.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
JobCandidate.belongsTo(Worker, { foreignKey: 'workerId', as: 'worker' });

// Rating associations
Rating.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Rating.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Rating.belongsTo(Worker, { foreignKey: 'workerId', as: 'worker' });

// Wallet associations
Wallet.belongsTo(Worker, { foreignKey: 'workerId', as: 'worker' });
Wallet.hasMany(Transaction, { foreignKey: 'walletId', as: 'transactions' });

// Transaction associations
Transaction.belongsTo(Wallet, { foreignKey: 'walletId', as: 'wallet' });
Transaction.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Notification.belongsTo(Worker, { foreignKey: 'workerId', as: 'worker' });

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  Address,
  Worker,
  Job,
  JobCandidate,
  Rating,
  Wallet,
  Transaction,
  Notification,
};
