const addressService = require('./addresses.service');
const { Worker } = require('../../database/models');
const ApiResponse = require('../../common/utils/response');
const { asyncHandler } = require('../../common/middleware/error.middleware');

class AddressController {
  /**
   * Create a new address
   * POST /api/v1/addresses
   */
  createAddress = asyncHandler(async (req, res) => {
    const address = await addressService.createAddress(req.user.id, req.body);
    return ApiResponse.created(res, address, 'Address created successfully');
  });

  /**
   * Get all user addresses
   * GET /api/v1/addresses
   */
  getUserAddresses = asyncHandler(async (req, res) => {
    const result = await addressService.getUserAddresses(req.user.id, req.query);
    
    return ApiResponse.paginated(
      res,
      result.addresses,
      result.page,
      parseInt(req.query.limit) || 10,
      result.total,
      'Addresses retrieved successfully'
    );
  });

  /**
   * Get single address
   * GET /api/v1/addresses/:id
   */
  getAddress = asyncHandler(async (req, res) => {
    const address = await addressService.getAddressById(req.params.id, req.user.id);
    return ApiResponse.success(res, address, 'Address retrieved successfully');
  });

  /**
   * Update address
   * PUT /api/v1/addresses/:id
   */
  updateAddress = asyncHandler(async (req, res) => {
    const address = await addressService.updateAddress(
      req.params.id,
      req.user.id,
      req.body
    );
    return ApiResponse.success(res, address, 'Address updated successfully');
  });

  /**
   * Delete address
   * DELETE /api/v1/addresses/:id
   */
  deleteAddress = asyncHandler(async (req, res) => {
    const result = await addressService.deleteAddress(req.params.id, req.user.id);
    return ApiResponse.success(res, result, 'Address deleted successfully');
  });

  /**
   * Set default address
   * PUT /api/v1/addresses/:id/set-default
   */
  setDefaultAddress = asyncHandler(async (req, res) => {
    const address = await addressService.setDefaultAddress(req.params.id, req.user.id);
    return ApiResponse.success(res, address, 'Default address set successfully');
  });

  /**
   * Search addresses
   * GET /api/v1/addresses/search?q=searchTerm
   */
  searchAddresses = asyncHandler(async (req, res) => {
    const { q } = req.query;
    const addresses = await addressService.searchAddresses(req.user.id, q);
    return ApiResponse.success(res, addresses, 'Search results retrieved successfully');
  });

  /**
   * Get nearby addresses
   * GET /api/v1/addresses/nearby?latitude=19.076&longitude=72.877&radius=10
   */
  getNearbyAddresses = asyncHandler(async (req, res) => {
    const { latitude, longitude, radius } = req.query;
    const addresses = await addressService.getNearbyAddresses(
      req.user.id,
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(radius) || 10
    );
    return ApiResponse.success(res, addresses, 'Nearby addresses retrieved successfully');
  });

  /**
   * Create a new worker address
   * POST /api/v1/addresses/worker
   */
  createWorkerAddress = asyncHandler(async (req, res) => {
   
    const worker = await Worker.findOne({ where: { userId: req.user.id } });

    if (!worker) {
      return ApiResponse.notFound(res, 'Worker profile not found');
    }

    const address = await addressService.createAddress(worker.id, req.body, 'worker');
    return ApiResponse.created(res, address, 'Address created successfully');
  });

  /**
   * Get all worker addresses
   * GET /api/v1/addresses/worker/list
   */
  getWorkerAddresses = asyncHandler(async (req, res) => {
    const worker = await Worker.findOne({ where: { userId: req.user.id } });

    if (!worker) {
      return ApiResponse.notFound(res, 'Worker profile not found');
    }

    const result = await addressService.getUserAddresses(worker.id, 'worker', req.query);

    return ApiResponse.paginated(
      res,
      result.addresses,
      result.page,
      parseInt(req.query.limit) || 10,
      result.total,
      'Addresses retrieved successfully'
    );
  });
}

module.exports = new AddressController();
