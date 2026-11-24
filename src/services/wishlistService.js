import apiClient from './apiClient';

/**
 * Wishlist Service
 * Connects the React Storefront to Spring Boot /api/v1/wishlist endpoints
 */
export const wishlistService = {
  /**
   * Get user's saved wishlist
   */
  async getWishlist() {
    const response = await apiClient.get('/wishlist');
    return response.data?.data || response.data;
  },

  /**
   * Save a product to wishlist
   */
  async addToWishlist(productId) {
    const response = await apiClient.post(`/wishlist/${productId}`);
    return response.data?.data || response.data;
  },

  /**
   * Remove a product from wishlist
   */
  async removeFromWishlist(productId) {
    const response = await apiClient.delete(`/wishlist/${productId}`);
    return response.data?.data || response.data;
  },

  /**
   * Check if a product is saved in user's wishlist
   */
  async checkSavedStatus(productId) {
    const response = await apiClient.get(`/wishlist/check/${productId}`);
    return response.data?.data || response.data;
  },
};

export default wishlistService;

