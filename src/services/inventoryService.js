import apiClient from './apiClient';

/**
 * Inventory Service
 * Connects the React Storefront to Spring Boot /api/v1 inventory endpoints
 */
export const inventoryService = {
  /**
   * Check stock availability for a specific product
   */
  async checkAvailability(productId) {
    const response = await apiClient.get(`/products/${productId}/availability`);
    return response.data?.data || response.data;
  },

  /**
   * Admin: Get product stock levels (available, reserved, threshold)
   */
  async getInventory(productId) {
    const response = await apiClient.get(`/admin/inventory/${productId}`);
    return response.data?.data || response.data;
  },

  /**
   * Admin: Adjust stock quantity: PUT /api/v1/admin/inventory/{id}
   */
  async adjustStock(productId, options = {}) {
    const qty = options.quantityChange !== undefined ? options.quantityChange : (options.adjustmentQuantity || 0);
    const movType = options.movementType || (qty >= 0 ? 'RESTOCK' : 'MANUAL_ADJUSTMENT');
    const notes = options.notes || options.reason || 'Inventory adjustment from Admin panel';
    const response = await apiClient.put(`/admin/inventory/${productId}`, {
      quantityChange: qty,
      movementType: movType,
      notes: notes,
    });
    return response.data?.data || response.data;
  },

  /**
   * Admin: Stock movement history audit trail
   */
  async getMovements(productId, page = 0, size = 20) {
    const response = await apiClient.get(`/admin/inventory/${productId}/movements`, {
      params: { page, size },
    });
    return response.data?.data || response.data;
  },

  /**
   * Admin: Low stock alerts
   */
  async getLowStockAlerts(page = 0, size = 20) {
    const response = await apiClient.get('/admin/inventory/alerts/low-stock', {
      params: { page, size },
    });
    return response.data?.data || response.data;
  },
};

export default inventoryService;

