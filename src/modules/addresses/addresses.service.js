
const { Address, Worker } = require('../../database/models');
const { Op } = require('sequelize');

class AddressService {
  /**
   * Create a new address
   * Supports both user and worker addresses
   */
  async createAddress(ownerId, addressData, ownerType = 'user') {
    const { label, addressLine, landmark, city, state, pincode, latitude, longitude } = addressData;

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
      where: { userId: ownerId },
    });

    if (ownerType === 'worker' && existingAddresses > 0) {
        throw new Error('Worker can only have one service address. Please update the existing one.');
    }

    const isDefault = existingAddresses === 0 ? true : addressData.isDefault || false;

    // If setting as default, unset other defaults
    if (isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { userId: ownerId } }
      );
    }

    // Create address with proper ownership
    const address = await Address.create({
      userId: ownerId,
      label,
      addressLine,
      landmark,
      city,
      state,
      pincode,
      latitude,
      longitude,
      isDefault,
    });

    // Sync worker location if this is a worker's address
    if (ownerType === 'worker') {
      await Worker.update(
        { latitude, longitude },
        { where: { userId: ownerId } }
      );
    }

    return address;
  }

  /**
   * Get addresses for user or worker
   */
  async getUserAddresses(ownerId, ownerType = 'user', filters = {}) {
    console.log("ownerId", ownerId, "ownerType", ownerType);
    const { page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    const where = { userId: ownerId };

    const { count, rows } = await Address.findAndCountAll({
      where,
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      addresses: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get a single address by ID
   */
  async getAddressById(addressId, ownerId, ownerType = 'user') {
    const where = { 
      id: addressId,
      userId: ownerId
    };

    const address = await Address.findOne({ where });

    if (!address) {
      throw new Error('Address not found');
    }

    return address;
  }

  /**
   * Update an address
   */
  async updateAddress(addressId, ownerId, updateData, ownerType = 'user') {
    const address = await this.getAddressById(addressId, ownerId, ownerType);

    const { label, addressLine, landmark, city, state, pincode, latitude, longitude } = updateData;

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
      landmark: landmark !== undefined ? landmark : address.landmark,
      city: city !== undefined ? city : address.city,
      state: state !== undefined ? state : address.state,
      pincode: pincode !== undefined ? pincode : address.pincode,
      latitude: latitude !== undefined ? latitude : address.latitude,
      longitude: longitude !== undefined ? longitude : address.longitude,
    });

    // Sync worker location if this is a worker's address
    if (ownerType === 'worker') {
      await Worker.update(
        { 
          latitude: latitude !== undefined ? latitude : address.latitude,
          longitude: longitude !== undefined ? longitude : address.longitude
        },
        { where: { userId: ownerId } }
      );
    }

    return address;
  }

  /**
   * Delete an address
   */
  async deleteAddress(addressId, userId) {
    const address = await this.getAddressById(addressId, userId);

    // Check if this address is being used in any active jobs
    const { Job } = require('../../database/models');
    const jobCount = await Job.count({ where: { addressId: address.id, status: { [Op.notIn]: ['completed', 'cancelled'] } } });

    if (jobCount > 0) {
      throw new Error('Cannot delete address used in active jobs');
    }

    await address.destroy();
    return true;
  }

  /**
   * Set an address as default
   */
  async setDefaultAddress(addressId, userId) {
    const address = await this.getAddressById(addressId, userId);

    // Unset current default
    await Address.update({ isDefault: false }, { where: { userId, isDefault: true } });

    // Set new default
    address.isDefault = true;
    await address.save();

    // Also update user's defaultAddressId
    const { User } = require('../../database/models');
    await User.update({ defaultAddressId: address.id }, { where: { id: userId } });

    return address;
  }

  /**
   * Search for an address by query
   */
  async searchAddresses(ownerId, query) {
    return await Address.findAll({
      where: {
        userId: ownerId,
        [Op.or]: [
          { label: { [Op.iLike]: `%${query}%` } },
          { addressLine: { [Op.iLike]: `%${query}%` } },
          { city: { [Op.iLike]: `%${query}%` } },
        ],
      },
      limit: 10,
    });
  }

  /**
   * Get nearby addresses using PostGIS
   */
  async getNearbyAddresses(latitude, longitude, radiusKm = 10) {
    const { sequelize } = require('../../database/models');
    const radiusMeters = radiusKm * 1000;

    const query = `
      SELECT *, 
      ST_Distance(
        location, 
        ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
      ) AS distance
      FROM addresses
      WHERE ST_DWithin(
        location, 
        ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, 
        :radiusMeters
      )
      ORDER BY distance ASC
    `;

    const results = await sequelize.query(query, {
      replacements: { longitude, latitude, radiusMeters },
      type: sequelize.QueryTypes.SELECT,
      model: Address,
      mapToModel: true,
    });

    return results;
  }
}

module.exports = new AddressService();
