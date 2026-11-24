import apiClient from './apiClient';

/**
 * Cart Service
 * Connects the React Storefront to Spring Boot /api/v1/cart endpoints
 */
export const cartService = {
  /**
   * Fetch current authenticated user's cart
   */
  async getCart() {
    const response = await apiClient.get('/cart');
    return response.data?.data || response.data;
  },

  /**
   * Add a product item with quantity to server cart
   */
  async addItem(productId, quantity = 1) {
    const response = await apiClient.post('/cart/items', {
      productId,
      quantity,
    });
    return response.data?.data || response.data;
  },

  /**
   * Update quantity of a specific cart item
   */
  async updateItem(itemId, quantity) {
    const response = await apiClient.put(`/cart/items/${itemId}`, {
      quantity,
    });
    return response.data?.data || response.data;
  },

  /**
   * Remove item line from server cart
   */
  async removeItem(itemId) {
    const response = await apiClient.delete(`/cart/items/${itemId}`);
    return response.data?.data || response.data;
  },

  /**
   * Clear all items in server cart
   */
  async clearCart() {
    const response = await apiClient.delete('/cart');
    return response.data;
  },
};

export default cartService;

