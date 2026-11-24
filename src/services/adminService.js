import apiClient from './apiClient';

export const adminService = {
  /**
   * Fetch executive dashboard KPIs: GET /api/v1/admin/dashboard
   */
  async getDashboardStats() {
    try {
      const response = await apiClient.get('/admin/dashboard');
      return response.data?.data;
    } catch (err) {
      console.warn('Backend /admin/dashboard call error:', err.message);
      return null;
    }
  },

  /**
   * Fetch daily sales time-series: GET /api/v1/admin/reports/sales
   */
  async getSalesReport(pastDays = 14) {
    try {
      const response = await apiClient.get('/admin/reports/sales', {
        params: { pastDays },
      });
      return response.data?.data || [];
    } catch (err) {
      console.warn('Backend /admin/reports/sales call error:', err.message);
      return [];
    }
  },

  /**
   * Fetch top selling products: GET /api/v1/admin/reports/top-products
   */
  async getTopProducts(limit = 5) {
    try {
      const response = await apiClient.get('/admin/reports/top-products', {
        params: { limit },
      });
      return response.data?.data || [];
    } catch (err) {
      console.warn('Backend /admin/reports/top-products call error:', err.message);
      return [];
    }
  },

  /**
   * Fetch security audit logs: GET /api/v1/admin/audit-logs
   */
  async getAuditLogs(page = 0, size = 20) {
    try {
      const response = await apiClient.get('/admin/audit-logs', {
        params: { page, size },
      });
      return response.data?.data?.content || [];
    } catch (err) {
      console.warn('Backend /admin/audit-logs call error:', err.message);
      return [];
    }
  },
};

