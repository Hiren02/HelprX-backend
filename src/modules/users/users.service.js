const { User, Address } = require('../../database/models');
const bcrypt = require('bcryptjs');

class UserService {
  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'refreshToken'] },
      include: [
        { 
          model: Address, 
          as: 'addresses',
          limit: 5,
          order: [['created_at', 'DESC']],
        },
      ],
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, updateData) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const { name, email } = updateData;

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('Email already in use');
      }
    }

    await user.update({
      name: name !== undefined ? name : user.name,
      email: email !== undefined ? email : user.email,
    });

    // Return user without sensitive data
    const updatedUser = user.toJSON();
    delete updatedUser.password;
    delete updatedUser.refreshToken;

    return updatedUser;
  }

  /**
   * Update user password
   */
  async updatePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({ password: hashedPassword });
  }

  /**
   * Deactivate user account
   */
  async deactivateAccount(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    await user.update({ isActive: false });
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId) {
    const { Job, Rating } = require('../../database/models');

    const totalJobs = await Job.count({ where: { userId } });
    const completedJobs = await Job.count({ 
      where: { userId, status: 'completed' } 
    });
    const activeJobs = await Job.count({ 
      where: { 
        userId, 
        status: ['created', 'matching', 'assigned', 'in_progress'] 
      } 
    });
    const ratingsGiven = await Rating.count({ where: { userId } });

    return {
      totalJobs,
      completedJobs,
      activeJobs,
      ratingsGiven,
    };
  }
}

module.exports = new UserService();
