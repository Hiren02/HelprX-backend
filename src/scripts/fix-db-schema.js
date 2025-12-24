const { sequelize } = require('../config/database');
const logger = require('../common/utils/logger');

async function fixSchema() {
  try {
    logger.info('Starting schema fix...');

    const queryInterface = sequelize.getQueryInterface();
    const tableName = 'job_candidates';

    // 1. Get existing consistency
    const [indexes] = await sequelize.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = '${tableName}';
    `);
    
    logger.info('Current indexes:', indexes);

    // 2. Identify and drop incorrect unique index on job_id if exists
    // We are looking for an index that is UNIQUE and only on (job_id)
    // The name often strictly follows logic or might be auto-generated.
    
    // NOTE: Sequelize sometimes names indexes like table_column_key or table_column.
    // We'll check for any unique index that is JUST on job_id.
    
    for (const idx of indexes) {
      // heuristic parsing of postgres indexdef
      // e.g. "CREATE UNIQUE INDEX job_candidates_job_id ON public.job_candidates USING btree (job_id)"
      if (idx.indexdef.toUpperCase().includes('UNIQUE INDEX') && 
          idx.indexdef.includes('(job_id)') && 
          !idx.indexdef.includes('worker_id')) {
        
        logger.info(`Found incorrect unique index: ${idx.indexname}`);
        await queryInterface.removeIndex(tableName, idx.indexname);
        logger.info(`Removed index: ${idx.indexname}`);
      }
    }
    
    // 3. Ensure composite unique constraint exists
    // We want unique on (job_id, worker_id)
    let hasComposite = false;
    for (const idx of indexes) {
       if (idx.indexdef.toUpperCase().includes('UNIQUE INDEX') && 
           idx.indexdef.includes('job_id') && 
           idx.indexdef.includes('worker_id')) {
         hasComposite = true;
       }
    }

    if (!hasComposite) {
        logger.info('Creating composite unique index...');
        await queryInterface.addIndex(tableName, ['job_id', 'worker_id'], {
            unique: true,
            name: 'job_candidates_job_id_worker_id_unique'
        });
        logger.info('Created composite unique index');
    } else {
        logger.info('Composite unique index already exists');
    }

    logger.info('Schema fix completed successfully');
  } catch (error) {
    logger.error('Schema fix failed:', error);
  } finally {
    process.exit();
  }
}

fixSchema();
