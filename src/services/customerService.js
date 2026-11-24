import apiClient from './apiClient';

/**
 * Customer & Address Service
 * Connects the React Storefront to Spring Boot /api/v1/customers endpoints
 */
export const customerService = {
  /**
   * Get current customer's profile
   */
  async getProfile() {
    const response = await apiClient.get('/customers/me');
    return response.data?.data || response.data;
  },

  /**
   * Update customer profile info
   */
  async updateProfile(profileData) {
    const response = await apiClient.put('/customers/me', profileData);
    return response.data?.data || response.data;
  },

  /**
   * Get all saved delivery addresses
   */
  async getAddresses() {
    const response = await apiClient.get('/customers/me/addresses');
    return response.data?.data || response.data;
  },

  /**
   * Add a new shipping/billing address
   */
  async createAddress(addressData) {
    const response = await apiClient.post('/customers/me/addresses', addressData);
    return response.data?.data || response.data;
  },

  /**
   * Update an existing address
   */
  async updateAddress(addressId, addressData) {
    const response = await apiClient.put(`/customers/me/addresses/${addressId}`, addressData);
    return response.data?.data || response.data;
  },

  /**
   * Delete an address
   */
  async deleteAddress(addressId) {
    const response = await apiClient.delete(`/customers/me/addresses/${addressId}`);
    return response.data;
  },

  /**
   * Set an address as default shipping address
   */
  async setDefaultAddress(addressId) {
    const response = await apiClient.patch(`/customers/me/addresses/${addressId}/default`);
    return response.data?.data || response.data;
  },
};

export default customerService;

