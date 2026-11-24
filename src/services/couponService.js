import apiClient from './apiClient';

/**
 * Coupon & Promo Code Service
 * Connects the React Storefront to Spring Boot /api/v1/coupons endpoints
 */
export const couponService = {
  /**
   * Validate coupon against cart subtotal
   * @param {string} code Promo code string (e.g. TOYJOY10, SUPERKID, FIRSTTOY)
   * @param {number} subtotal Current cart total amount
   */
  async validateCoupon(code, subtotal) {
    const response = await apiClient.post('/coupons/validate', {
      code,
      subtotal,
    });
    return response.data?.data || response.data;
  },

  /**
   * Admin: List all coupons
   */
  async getAdminCoupons() {
    const response = await apiClient.get('/admin/coupons');
    return response.data?.data || response.data;
  },

  /**
   * Admin: Create new coupon
   */
  async createCoupon(couponData) {
    const response = await apiClient.post('/admin/coupons', couponData);
    return response.data?.data || response.data;
  },
};

export default couponService;

