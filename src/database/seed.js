const bcrypt = require('bcryptjs');
const User = require('../modules/users/users.model');
const Worker = require('../modules/workers/workers.model');
const Address = require('../modules/addresses/addresses.model');
const logger = require('../common/utils/logger');

// User roles
const USER_ROLES = {
  USER: 'user',
  WORKER: 'worker',
  ADMIN: 'admin',
};

/**
 * Seed database with sample data
 */
const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');

    // Cleanup existing data if it exists
    const phonesToDelete = ['9999999999', '9876543210', '9876543211', '9876543212'];
    await User.destroy({ where: { phone: phonesToDelete }, cascade: true });
    logger.info('🧹 Cleaned up existing sample data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      phone: '9999999999',
      email: 'admin@helprx.com',
      password: adminPassword,
      name: 'Admin User',
      role: USER_ROLES.ADMIN,
      isActive: true,
    });
    logger.info('✅ Admin user created');

    // Create sample users
    const user1Password = await bcrypt.hash('user123', 10);
    const user1 = await User.create({
      phone: '9876543210',
      email: 'user1@example.com',
      password: user1Password,
      name: 'John Doe',
      role: USER_ROLES.USER,
      isActive: true,
    });

    // Create address for user1
    await Address.create({
      userId: user1.id,
      label: 'Home',
      addressLine: '123 Main Street, Sector 15',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      latitude: 19.0760,
      longitude: 72.8777,
      isDefault: true,
    });

    logger.info('✅ Sample users created');

    // Create sample workers
    const worker1Password = await bcrypt.hash('worker123', 10);
    const worker1User = await User.create({
      phone: '9876543211',
      email: 'worker1@example.com',
      password: worker1Password,
      name: 'Rajesh Kumar',
      role: USER_ROLES.WORKER,
      isActive: true,
    });

    const worker1 = await Worker.create({
      userId: worker1User.id,
      phone: '9876543211',
      name: 'Rajesh Kumar',
      skills: [
        { skill: 'plumbing', level: 3 },
        { skill: 'electrical', level: 2 },
      ],
      kycStatus: 'verified',
      latitude: 19.0760,
      longitude: 72.8777,
      availabilityStatus: 'online',
      avgRating: 4.5,
      totalRatings: 25,
      acceptanceRate: 0.85,
      completedJobs: 30,
      bio: 'Experienced plumber with 5 years of experience',
      experienceYears: 5,
    });

    // Add Shop Address for Worker 1
    await Address.create({
      workerId: worker1.id,
      label: 'Rajesh Plumbing Shop',
      addressLine: 'Shop 4, Market Road, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400069',
      latitude: 19.1136,
      longitude: 72.8697,
      isDefault: true,
    });

    const worker2Password = await bcrypt.hash('worker123', 10);
    const worker2User = await User.create({
      phone: '9876543212',
      email: 'worker2@example.com',
      password: worker2Password,
      name: 'Amit Sharma',
      role: USER_ROLES.WORKER,
      isActive: true,
    });

    const worker2 = await Worker.create({
      userId: worker2User.id,
      phone: '9876543212',
      name: 'Amit Sharma',
      skills: [
        { skill: 'electrical', level: 4 },
        { skill: 'ac_repair', level: 3 },
      ],
      kycStatus: 'verified',
      latitude: 19.0800,
      longitude: 72.8800,
      availabilityStatus: 'online',
      avgRating: 4.8,
      totalRatings: 50,
      acceptanceRate: 0.92,
      completedJobs: 55,
      bio: 'Expert electrician and AC repair specialist',
      experienceYears: 8,
    });

    // Add Service Center Address for Worker 2
    await Address.create({
      workerId: worker2.id,
      label: 'Amit Electricals',
      addressLine: 'Unit 12, Industrial Estate, Dadar',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400014',
      latitude: 19.0178,
      longitude: 72.8478,
      isDefault: true,
    });

    logger.info('✅ Sample workers created');
    logger.info('🎉 Database seeding completed successfully');
    logger.info('\n📝 Sample credentials:');
    logger.info('Admin - Phone: 9999999999, Password: admin123');
    logger.info('User - Phone: 9876543210, Password: user123');
    logger.info('Worker 1 - Phone: 9876543211, Password: worker123');
    logger.info('Worker 2 - Phone: 9876543212, Password: worker123');

    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
