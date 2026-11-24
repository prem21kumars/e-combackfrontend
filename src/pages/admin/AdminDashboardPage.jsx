import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Clock,
  Boxes,
  ArrowRight,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { adminService } from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AdminDashboardPage = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [prodList, ordList, statsRes] = await Promise.all([
          productService.getProducts(),
          orderService.getAdminOrders ? orderService.getAdminOrders() : orderService.getOrders(),
          adminService.getDashboardStats(),
        ]);
        setProducts(prodList);
        setOrders(ordList);
        if (statsRes) setStats(statsRes);
      } catch (err) {
        console.error('Error loading admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Calculations
  const totalProducts = stats?.totalProducts != null ? Number(stats.totalProducts) : products.length;
  const totalOrders = stats?.totalOrders != null ? Number(stats.totalOrders) : orders.length;
  const totalRevenue = stats?.totalRevenue != null ? Number(stats.totalRevenue) : orders.reduce((sum, ord) => sum + (ord.total || 0), 0);
  const pendingOrders = stats?.pendingOrders != null ? Number(stats.pendingOrders) : orders.filter((o) => ['Ordered', 'Processing'].includes(o.orderStatus)).length;
  const lowStockProducts = products.filter((p) => p.stock < 15);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="d-flex flex-column gap-4">

      {/* Top Banner with Quick Actions */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 bg-white p-4 rounded-4 border shadow-sm">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h1 className="h4 fw-bolder mb-0">OO Toys Operations Dashboard</h1>
            <span className="badge bg-purple text-white rounded-pill px-2 py-1" style={{ background: '#7c3aed', fontSize: '0.72rem' }}>
              Live Demo Mode
            </span>
          </div>
          <p className="text-muted small mb-0">
            Real-time management of toy catalog, customer orders, and warehouse inventory.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Link to="/admin/products/new" className="btn btn-tw-primary btn-sm rounded-pill d-flex align-items-center gap-1 px-3">
            <Plus size={16} />
            <span>Add Toy</span>
          </Link>
          <Link to="/" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
            Storefront
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="row g-3">

        {/* Total Products */}
        <div className="col-sm-6 col-xl-3">
          <div className="bg-white p-3 p-xl-4 rounded-4 border shadow-sm h-100 d-flex flex-column justify-content-between">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-bold text-uppercase">Total Toys</span>
              <div className="rounded-circle p-2 bg-primary-subtle text-primary">
                <Package size={20} />
              </div>
            </div>
            <div>
              <h3 className="fw-bolder mb-1">{totalProducts}</h3>
              <small className="text-muted">Active items across 8 categories</small>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="col-sm-6 col-xl-3">
          <div className="bg-white p-3 p-xl-4 rounded-4 border shadow-sm h-100 d-flex flex-column justify-content-between">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-bold text-uppercase">Total Orders</span>
              <div className="rounded-circle p-2 bg-success-subtle text-success">
                <ShoppingBag size={20} />
              </div>
            </div>
            <div>
              <h3 className="fw-bolder mb-1">{totalOrders}</h3>
              <small className="text-success fw-bold">Live simulated demo queue</small>
            </div>
          </div>
        </div>

        {/* Sales Summary */}
        <div className="col-sm-6 col-xl-3">
          <div className="bg-white p-3 p-xl-4 rounded-4 border shadow-sm h-100 d-flex flex-column justify-content-between">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-bold text-uppercase">Demo Revenue</span>
              <div className="rounded-circle p-2 bg-warning-subtle text-warning">
                <TrendingUp size={20} />
              </div>
            </div>
            <div>
              <h3 className="fw-bolder mb-1 text-primary">{formatCurrency(totalRevenue)}</h3>
              <small className="text-muted">Gross simulated toy sales</small>
            </div>
          </div>
        </div>

        {/* Pending / Attention */}
        <div className="col-sm-6 col-xl-3">
          <div className="bg-white p-3 p-xl-4 rounded-4 border shadow-sm h-100 d-flex flex-column justify-content-between">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-bold text-uppercase">Pending Orders</span>
              <div className="rounded-circle p-2 bg-danger-subtle text-danger">
                <Clock size={20} />
              </div>
            </div>
            <div>
              <h3 className="fw-bolder mb-1 text-danger">{pendingOrders}</h3>
              <small className="text-muted">Require dispatch approval</small>
            </div>
          </div>
        </div>

      </div>

      {/* 2-Columns: Recent Orders & Low Stock Alerts */}
      <div className="row g-4">

        {/* Left: Recent Orders Table */}
        <div className="col-lg-8">
          <div className="bg-white rounded-4 border shadow-sm p-4 h-100">
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
              <h5 className="fw-bolder mb-0">Recent Demo Orders</h5>
              <Link to="/admin/orders" className="text-primary small fw-bold text-decoration-none">
                View All &rarr;
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-muted text-uppercase">
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td className="fw-bold text-primary">{ord.id}</td>
                      <td>
                        <div className="fw-semibold text-dark">{ord.customer?.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{ord.customer?.phone}</div>
                      </td>
                      <td>{ord.items?.length || 1} items</td>
                      <td className="fw-bold">{formatCurrency(ord.total)}</td>
                      <td>
                        <span className={`badge rounded-pill px-2 py-1 ${ord.orderStatus === 'Delivered' ? 'bg-success' :
                            ord.orderStatus === 'Shipped' ? 'bg-info text-dark' :
                              ord.orderStatus === 'Processing' ? 'bg-warning text-dark' : 'bg-primary'
                          }`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td>
                        <Link to={`/admin/orders`} className="btn btn-light btn-sm border rounded-pill py-0 px-2" style={{ fontSize: '0.75rem' }}>
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Low Stock Alert Card */}
        <div className="col-lg-4">
          <div className="bg-white rounded-4 border shadow-sm p-4 h-100">
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
              <div className="d-flex align-items-center gap-2">
                <AlertTriangle size={18} className="text-warning" />
                <h5 className="fw-bolder mb-0">Stock Watchlist</h5>
              </div>
              <span className="badge bg-warning text-dark rounded-pill">{lowStockProducts.length} low</span>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-muted small">All toy inventory levels are healthy!</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {lowStockProducts.slice(0, 5).map((prod) => (
                  <div key={prod.id} className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light border">
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="rounded-2 object-fit-cover"
                        style={{ width: '36px', height: '36px' }}
                      />
                      <div>
                        <div className="fw-semibold small text-truncate" style={{ maxWidth: '140px' }}>
                          {prod.name}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>{prod.category}</div>
                      </div>
                    </div>
                    <span className="badge bg-danger rounded-pill">
                      {prod.stock} left
                    </span>
                  </div>
                ))}

                <Link to="/admin/inventory" className="btn btn-outline-primary btn-sm rounded-pill mt-2">
                  Update Inventory Levels &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboardPage;
