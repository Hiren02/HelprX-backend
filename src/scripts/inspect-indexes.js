const { sequelize } = require('../config/database');

async function inspectIndexes() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const [results] = await sequelize.query(`
      SELECT 
        tablename, 
        indexname, 
        indexdef 
      FROM 
        pg_indexes 
      WHERE 
        tablename = 'job_candidates';
    `);

    console.log('Indexes on job_candidates table:');
    results.forEach(row => {
      console.log(`- ${row.indexname}: ${row.indexdef}`);
    });

  } catch (error) {
    console.error('Error inspecting indexes:', error);
  } finally {
    await sequelize.close();
  }
}

inspectIndexes();
