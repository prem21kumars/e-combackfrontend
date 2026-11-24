import apiClient from './apiClient';

/**
 * Payment Service
 * Connects the React Storefront to Spring Boot /api/v1/payments endpoints
 */
export const paymentService = {
  /**
   * Initiate a Razorpay payment order for a confirmed checkout order
   */
  async createRazorpayOrder(orderNumber) {
    const response = await apiClient.post('/payments/razorpay/order', {
      orderNumber,
    });
    return response.data?.data || response.data;
  },

  /**
   * Cryptographically verify payment signature returned by Razorpay checkout modal
   */
  async verifyPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    const response = await apiClient.post('/payments/razorpay/verify', {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });
    return response.data?.data || response.data;
  },

  /**
   * Admin: Process refund for an order
   */
  async processRefund(orderNumber, { amount, reason }) {
    const response = await apiClient.post(`/admin/payments/refund/${orderNumber}`, {
      amount,
      reason,
    });
    return response.data?.data || response.data;
  },
};

export default paymentService;

