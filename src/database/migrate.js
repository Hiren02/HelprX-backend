const { sequelize } = require('../config/database');
const logger = require('../common/utils/logger');

// Import all models to register them with Sequelize
require('../modules/users/users.model');
require('../modules/addresses/addresses.model');
require('../modules/workers/workers.model');
require('../modules/jobs/jobs.model');
require('../modules/jobs/job-candidates.model');
require('../modules/notifications/notifications.model');
require('../modules/payments/transactions.model');
require('../modules/ratings/ratings.model');
require('../modules/wallet/wallet.model');

/**
 * Run database migrations
 * This creates all tables with PostGIS support
 */
const runMigrations = async () => {
  try {
    logger.info('Starting database migrations...');

    // Enable PostGIS extension
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    logger.info('✅ PostGIS extension enabled');

    // Sync all models (creates tables)
    await sequelize.sync({ force: false, alter: true });
    logger.info('✅ Database tables created/updated');

    // Create GIST indexes for geography columns
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_addresses_location 
      ON addresses USING GIST (location);
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_workers_location 
      ON workers USING GIST (location);
    `);

    logger.info('✅ Spatial indexes created');
    logger.info('🎉 Migrations completed successfully');

    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();
