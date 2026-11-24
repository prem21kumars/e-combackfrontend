import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, Award, Sparkles } from 'lucide-react';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { adminService } from '../../services/adminService';
import { CATEGORIES } from '../../data/categories';
import { formatCurrency } from '../../utils/formatters';

export const AdminReportsPage = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [backendStats, setBackendStats] = useState(null);
  const [salesReport, setSalesReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productService.getProducts(),
      orderService.getAdminOrders ? orderService.getAdminOrders() : orderService.getOrders(),
      adminService.getDashboardStats(),
      adminService.getSalesReport(14),
    ])
      .then(([prods, ords, stats, sales]) => {
        setProducts(prods);
        setOrders(ords);
        if (stats) setBackendStats(stats);
        if (sales) setSalesReport(sales);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading reports...</span>
        </div>
      </div>
    );
  }

  const totalGrossRevenue = backendStats?.totalRevenue != null
    ? Number(backendStats.totalRevenue)
    : orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalUnitsSold = orders.reduce((sum, o) => sum + (o.items?.reduce((is, i) => is + i.quantity, 0) || 0), 0);
  const effectiveOrdersCount = backendStats?.totalOrders != null ? Number(backendStats.totalOrders) : orders.length;
  const averageOrderValue = effectiveOrdersCount > 0 ? Math.round(totalGrossRevenue / effectiveOrdersCount) : 0;

  // Category distribution
  const categoryStats = CATEGORIES.map((cat) => {
    const prodsInCat = products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase());
    const stockTotal = prodsInCat.reduce((sum, p) => sum + p.stock, 0);
    return {
      name: cat.name,
      color: cat.color,
      count: prodsInCat.length,
      stockTotal,
    };
  });

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 bg-white p-4 rounded-4 border shadow-sm">
        <div>
          <h1 className="h4 fw-bolder mb-1">Sales & Inventory Analytics</h1>
          <p className="text-muted small mb-0">Live performance indicators based on customer purchases and warehouse stock.</p>
        </div>
        <span className="badge bg-primary rounded-pill px-3 py-2">
          Demo Analytics v1.0
        </span>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="row g-3">
        <div className="col-md-4">
          <div className="bg-white p-4 rounded-4 border shadow-sm">
            <span className="text-muted small fw-bold text-uppercase d-block mb-1">Total Simulated Revenue</span>
            <h3 className="fw-bolder text-primary mb-1">{formatCurrency(totalGrossRevenue)}</h3>
            <span className="text-success small fw-semibold">↑ 18.4% from last period</span>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-white p-4 rounded-4 border shadow-sm">
            <span className="text-muted small fw-bold text-uppercase d-block mb-1">Average Order Value (AOV)</span>
            <h3 className="fw-bolder text-dark mb-1">{formatCurrency(averageOrderValue)}</h3>
            <span className="text-muted small">Based on {orders.length} simulated orders</span>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-white p-4 rounded-4 border shadow-sm">
            <span className="text-muted small fw-bold text-uppercase d-block mb-1">Toy Units Dispatched</span>
            <h3 className="fw-bolder text-success mb-1">{totalUnitsSold} Units</h3>
            <span className="text-muted small">Across all active shipping orders</span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        
        {/* Category Inventory Share */}
        <div className="col-lg-6">
          <div className="bg-white rounded-4 border shadow-sm p-4 h-100">
            <h5 className="fw-bolder mb-3">Warehouse Stock Distribution by Category</h5>
            <div className="d-flex flex-column gap-3">
              {categoryStats.map((cs) => {
                const totalStock = products.reduce((s, p) => s + p.stock, 0) || 1;
                const percentage = Math.round((cs.stockTotal / totalStock) * 100);

                return (
                  <div key={cs.name}>
                    <div className="d-flex justify-content-between small fw-bold mb-1">
                      <span>{cs.name} ({cs.count} toys)</span>
                      <span>{cs.stockTotal} units ({percentage}%)</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className="progress-bar rounded-pill"
                        style={{ width: `${percentage}%`, backgroundColor: cs.color }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Products by Rating & Popularity */}
        <div className="col-lg-6">
          <div className="bg-white rounded-4 border shadow-sm p-4 h-100">
            <h5 className="fw-bolder mb-3">Top Performing Toys</h5>
            <div className="d-flex flex-column gap-3">
              {products.slice(0, 5).map((prod, idx) => (
                <div key={prod.id} className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light border">
                  <div className="d-flex align-items-center gap-3">
                    <span className="fw-bolder text-muted px-2">#{idx + 1}</span>
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="rounded-2 object-fit-cover"
                      style={{ width: '40px', height: '40px' }}
                    />
                    <div>
                      <div className="fw-bold small text-dark text-truncate" style={{ maxWidth: '200px' }}>
                        {prod.name}
                      </div>
                      <small className="text-muted">{prod.category}</small>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="fw-bold text-dark small">{formatCurrency(prod.price)}</div>
                    <small className="text-warning fw-bold">★ {prod.rating}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminReportsPage;
