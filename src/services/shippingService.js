import apiClient from './apiClient';

/**
 * Shipping & Logistics Service
 * Connects the React Storefront to Spring Boot /api/v1/shipping endpoints
 */
export const shippingService = {
  /**
   * Get shipment tracking details for a specific customer order
   */
  async getShipmentByOrder(orderNumber) {
    const response = await apiClient.get(`/shipping/orders/${orderNumber}`);
    return response.data?.data || response.data;
  },

  /**
   * Public tracking lookup by carrier tracking number
   */
  async trackShipment(trackingNumber) {
    const response = await apiClient.get(`/shipping/track/${trackingNumber}`);
    return response.data?.data || response.data;
  },

  /**
   * Admin: Fulfill order by creating shipment with carrier and tracking number
   */
  async createShipment(orderId, shipmentData) {
    const response = await apiClient.post(`/admin/shipping/${orderId}`, shipmentData);
    return response.data?.data || response.data;
  },

  /**
   * Admin: Update shipment progress status (e.g. IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED)
   */
  async updateStatus(shipmentId, statusData) {
    const response = await apiClient.put(`/admin/shipping/${shipmentId}/status`, statusData);
    return response.data?.data || response.data;
  },
};

export default shippingService;

