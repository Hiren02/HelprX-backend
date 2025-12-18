
const { Address } = require('../../database/models');
const { Op } = require('sequelize');

class AddressService {
  /**
   * Create a new address
   * Supports both user and worker addresses
   */
  async createAddress(ownerId, addressData, ownerType = 'user') {
    const { label, addressLine, city, state, pincode, latitude, longitude } = addressData;

    // Validate owner type
    if (!['user', 'worker'].includes(ownerType)) {
      throw new Error('Owner type must be either "user" or "worker"');
    }

    // Validate coordinates
    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required');
    }

    if (latitude < -90 || latitude > 90) {
      throw new Error('Invalid latitude. Must be between -90 and 90');
    }

    if (longitude < -180 || longitude > 180) {
      throw new Error('Invalid longitude. Must be between -180 and 180');
    }

    // If this is the first address, make it default
    const existingAddresses = await Address.count({
      where: ownerType === 'user' ? { userId: ownerId } : { workerId: ownerId },
    });

    const isDefault = existingAddresses === 0 ? true : addressData.isDefault || false;

    // If setting as default, unset other defaults
    if (isDefault) {
      await Address.update(
        { isDefault: false },
        { where: ownerType === 'user' ? { userId: ownerId } : { workerId: ownerId } }
      );
    }

    // Create address with proper ownership
    const address = await Address.create({
      [ownerType === 'user' ? 'userId' : 'workerId']: ownerId,
      label,
      addressLine,
      city,
      state,
      pincode,
      latitude,
      longitude,
      isDefault,
    });

    return address;
  }

  /**
   * Get addresses for user or worker
   */
  async getUserAddresses(ownerId, ownerType = 'user', filters = {}) {
    console.log("ownerId",ownerId)
    const { page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    const where = { user_id: ownerId };

    const { count, rows } = await Address.findAndCountAll({
      where,
      order: [['is_default', 'DESC'], ['created_at', 'DESC']],
      limit,
      offset,
    });

    return {
      addresses: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get a single address by ID
   */
  async getAddressById(addressId, userId) {
    const address = await Address.findOne({
      where: { id: addressId, user_id: userId },
    });

    if (!address) {
      throw new Error('Address not found');
    }

    return address;
  }

  /**
   * Update an address
   */
  async updateAddress(addressId, userId, updateData) {
    const address = await this.getAddressById(addressId, userId);

    const { label, addressLine, city, state, pincode, latitude, longitude } = updateData;

    // Validate coordinates if provided
    if (latitude !== undefined) {
      if (latitude < -90 || latitude > 90) {
        throw new Error('Invalid latitude. Must be between -90 and 90');
      }
    }

    if (longitude !== undefined) {
      if (longitude < -180 || longitude > 180) {
        throw new Error('Invalid longitude. Must be between -180 and 180');
      }
    }

    // Update address
    await address.update({
      label: label !== undefined ? label : address.label,
      addressLine: addressLine !== undefined ? addressLine : address.addressLine,
      city: city !== undefined ? city : address.city,
      state: state !== undefined ? state : address.state,
      pincode: pincode !== undefined ? pincode : address.pincode,
      latitude: latitude !== undefined ? latitude : address.latitude,
      longitude: longitude !== undefined ? longitude : address.longitude,
    });

    return address;
  }

  /**
   * Delete an address
   */
  async deleteAddress(addressId, userId) {
    const address = await this.getAddressById(addressId, userId);

    // Check if this address is being used in any active jobs
    const { Job } = require('../../database/models');
    const activeJob = await Job.findOne({
      where: {
        addressId,
        status: {
          [Op.in]: ['created', 'matching', 'assigned', 'in_progress'],
        },
      },
    });

    if (activeJob) {
      throw new Error('Cannot delete address. It is being used in an active job.');
    }

    await address.destroy();
    return { message: 'Address deleted successfully' };
  }

  /**
   * Set default address for user
   */
  async setDefaultAddress(addressId, userId) {
    const address = await this.getAddressById(addressId, userId);

    // Update user's default address
    const { User } = require('../../database/models');
    await User.update(
      { defaultAddressId: addressId },
      { where: { id: userId } }
    );

    return address;
  }

  /**
   * Search addresses by city or pincode
   */
  async searchAddresses(userId, searchTerm) {
    const addresses = await Address.findAll({
      where: {
        userId,
        [Op.or]: [
          { city: { [Op.iLike]: `%${searchTerm}%` } },
          { pincode: { [Op.iLike]: `%${searchTerm}%` } },
          { addressLine: { [Op.iLike]: `%${searchTerm}%` } },
        ],
      },
      order: [['createdAt', 'DESC']],
    });

    return addresses;
  }

  /**
   * Get addresses near a location (within radius)
   */
  async getNearbyAddresses(userId, latitude, longitude, radiusKm = 10) {
    const { sequelize } = require('../../config/database');

    const query = `
      SELECT 
        *,
        ST_Distance(
          location::geography,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
        ) / 1000 AS distance_km
      FROM addresses
      WHERE 
        user_id = :userId
        AND ST_DWithin(
          location::geography,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
          :radiusMeters
        )
      ORDER BY distance_km ASC
    `;

    const addresses = await sequelize.query(query, {
      replacements: {
        userId,
        latitude,
        longitude,
        radiusMeters: radiusKm * 1000,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    return addresses;
  }
}

module.exports = new AddressService();
