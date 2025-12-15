const { SERVICE_TYPES, DEFAULTS } = require('../../common/constants');

class PricingService {
  /**
   * Calculate price estimate for a job
   */
  async calculateEstimate(jobData) {
    const { serviceType, addressId } = jobData;

    // Get base price for service type
    const basePrice = this.getBasePrice(serviceType);

    // Calculate surge multiplier
    const surgeMultiplier = await this.calculateSurgeMultiplier(serviceType, addressId);

    // Calculate total
    const total = basePrice * surgeMultiplier;

    return {
      basePrice,
      surgeMultiplier,
      total: Math.round(total * 100) / 100,
    };
  }

  /**
   * Get base price for service type
   */
  getBasePrice(serviceType) {
    const basePrices = {
      [SERVICE_TYPES.PLUMBING]: 200,
      [SERVICE_TYPES.ELECTRICAL]: 250,
      [SERVICE_TYPES.TUTORING]: 300,
      [SERVICE_TYPES.CARPENTRY]: 350,
      [SERVICE_TYPES.PAINTING]: 400,
      [SERVICE_TYPES.CLEANING]: 150,
      [SERVICE_TYPES.PET_CARE]: 180,
      [SERVICE_TYPES.HANDYMAN]: 200,
      [SERVICE_TYPES.AC_REPAIR]: 300,
      [SERVICE_TYPES.APPLIANCE_REPAIR]: 250,
      [SERVICE_TYPES.PEST_CONTROL]: 280,
      [SERVICE_TYPES.GARDENING]: 220,
      [SERVICE_TYPES.OTHER]: 200,
    };

    return basePrices[serviceType] || DEFAULTS.BASE_SERVICE_FEE;
  }

  /**
   * Calculate surge multiplier based on demand
   */
  async calculateSurgeMultiplier(serviceType, addressId) {
    // Simple surge logic - can be enhanced with real-time demand data
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();

    let multiplier = 1.0;

    // Peak hours (9 AM - 6 PM on weekdays)
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 9 && hour <= 18) {
      multiplier = 1.2;
    }

    // Weekend surge
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      multiplier = 1.3;
    }

    // Late night/early morning
    if (hour >= 22 || hour <= 6) {
      multiplier = 1.5;
    }

    // Cap at max surge multiplier
    const maxSurge = parseFloat(process.env.SURGE_MULTIPLIER_MAX) || DEFAULTS.SURGE_MULTIPLIER_MAX;
    return Math.min(multiplier, maxSurge);
  }

  /**
   * Calculate platform fee and worker earnings
   */
  calculateBreakdown(finalPrice) {
    const platformFeePercent = parseFloat(process.env.PLATFORM_COMMISSION_PERCENT) || DEFAULTS.PLATFORM_COMMISSION_PERCENT;
    const platformFee = (finalPrice * platformFeePercent) / 100;
    const workerEarnings = finalPrice - platformFee;

    return {
      finalPrice,
      platformFee: Math.round(platformFee * 100) / 100,
      workerEarnings: Math.round(workerEarnings * 100) / 100,
      platformFeePercent,
    };
  }
}

module.exports = new PricingService();
