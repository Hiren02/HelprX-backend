const { sequelize, JobCandidate } = require('../database/models');
const { v4: uuidv4 } = require('uuid');

async function reproduce() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // INSPECT MODEL ATTRIBUTES
    const jobIdAttr = JobCandidate.rawAttributes.jobId;
    const workerIdAttr = JobCandidate.rawAttributes.workerId;
    
    console.log('--- MODEL INSPECTION ---');
    console.log('JobId Unique:', jobIdAttr.unique);
    console.log('WorkerId Unique:', workerIdAttr.unique);
    console.log('Indexes:', JobCandidate.options.indexes);
    console.log('------------------------');

    // 1. Create dummy IDs
    const jobId = uuidv4();
    const workerId1 = uuidv4();
    const workerId2 = uuidv4();

    console.log('Attempting to bulkCreate candidates...');
    
    // 2. Try to insert
    // Note: We are using dummy IDs, so foreign key constraints might fail first if we don't mock them
    // But we are interested in UNIQUE constraints on jobId/workerId.
    // If we get FK error, that's fine, it means Unique check passed or wasn't reached.
    // To be safe, we should try catch specifically for Unique errors.
    
    // Actually, to test REAL behavior, we need valid FKs or we need to disable FK checks.
    // Disabling FK checks is risky/complex in script.
    
    // Let's just create a dummy job and worker? No, too much setup.
    // Let's rely on the fact that Unique validation usually happens BEFORE FK check in Sequelize if it's a validation error.
    // If it's a DB error, FK will trigger first.
    
    // Let's try to define a model ON THE FLY that mimics the schema but without FK references?
    // No, better to use the real model.

    try {
        const candidates = [
            { jobId, workerId: workerId1, score: 0.9 },
            { jobId, workerId: workerId2, score: 0.8 } // Same Job, different worker. Should be allowed.
        ];
        
        // This fails FK constraint usually.
        await JobCandidate.bulkCreate(candidates, { validate: true });
        console.log('Success (unexpected because of FK)');
    } catch (error) {
        console.log('Error caught!');
        console.log('Error Name:', error.name);
        if (error.errors) {
            console.log('Validation Errors:', error.errors.map(e => ({
                message: e.message,
                type: e.type,
                path: e.path,
                validatorKey: e.validatorKey
            })));
        }
        
        // If it is FK error, it says "foreign key constraint".
        // If it is Unique Job error, it says "must be unique".
    }

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await sequelize.close();
  }
}

reproduce();
