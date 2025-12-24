const { JobCandidate, Job, Worker, User, Address, sequelize } = require('../database/models');
const { v4: uuidv4 } = require('uuid');

async function testJobCandidate() {
  try {
    console.log('Connecting to DB...');
    await sequelize.authenticate();
    console.log('Connected.');

    // 1. Create a dummy user, address, worker, and job to satisfy constraints
    const userId = uuidv4();
    const addressId = uuidv4();
    const workerUserId = uuidv4();
    const workerId = uuidv4();
    const worker2Id = uuidv4();
    const jobId = uuidv4();

    console.log('Creating dummy data...');
    // We need to be careful with foreign keys. 
    // Assuming tables exist.
    
    // We might fail if we don't creating referencing records.
    // For this test, we might just try to validate the JobCandidate model directly without saving, 
    // or try to save if we can easily create dependencies.
    // Given the complexity of creating a full graph, let's try `validate()` first.
    
    const candidate1 = JobCandidate.build({
      jobId: jobId,
      workerId: workerId,
      finalStatus: 'pending'
    });

    const candidate2 = JobCandidate.build({
      jobId: jobId, // SAME jobId
      workerId: worker2Id, // DIFFERENT workerId
      finalStatus: 'pending'
    });

    console.log('Validating candidate 1...');
    await candidate1.validate();
    console.log('Candidate 1 valid.');

    console.log('Validating candidate 2...');
    await candidate2.validate();
    console.log('Candidate 2 valid.');

    console.log('Attempting bulkCreate with same jobId...');
    // We can't save without FKs, but we can catch the validation error if it occurs before FK check?
    // Or we can mock the saving.
    
    // Actually, "job_id must be unique" is usually a validation error from Sequelize.
    // If it was a DB constraint error, it would say "duplicate key value violates..."
    
    // Let's inspect the model attributes
    console.log('JobCandidate attributes for jobId:');
    console.log(JobCandidate.rawAttributes.jobId);

  } catch (error) {
    console.error('Error during test:', error);
    if (error.errors) {
        error.errors.forEach(e => console.error(`${e.path}: ${e.message}`));
    }
  } finally {
    process.exit();
  }
}

testJobCandidate();
