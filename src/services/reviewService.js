import apiClient from './apiClient';

/**
 * Product Review Service
 * Connects the React Storefront to Spring Boot /api/v1/products/{id}/reviews endpoints
 */
export const reviewService = {
  /**
   * Get approved reviews for a product
   */
  async getProductReviews(productId, page = 0, size = 10) {
    const response = await apiClient.get(`/products/${productId}/reviews`, {
      params: { page, size },
    });
    return response.data?.data || response.data;
  },

  /**
   * Submit a new review for a product (requires authentication)
   */
  async addReview(productId, reviewData) {
    const response = await apiClient.post(`/products/${productId}/reviews`, reviewData);
    return response.data?.data || response.data;
  },

  /**
   * Admin: Approve or reject a review
   */
  async moderateReview(reviewId, approved) {
    const response = await apiClient.patch(`/admin/reviews/${reviewId}/approval`, null, {
      params: { approved },
    });
    return response.data;
  },
};

export default reviewService;

