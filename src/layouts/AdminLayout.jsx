import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  ShoppingBag,
  Boxes,
  BarChart3,
  Store,
  Menu,
  X,
  ShieldAlert,
  LogOut,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import Toast from '../components/common/Toast';
import logoImg from '../assets/Logo-removebg.png';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all demo products & orders back to initial catalog?')) {
      await productService.resetToDefaults();
      window.location.reload();
    }
  };

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="container py-5 text-center">
        <div className="bg-white rounded-5 p-5 border shadow-sm mx-auto my-5" style={{ maxWidth: '520px' }}>
          <ShieldAlert size={48} className="text-danger mb-3" />
          <h2 className="fw-bolder mb-2 text-danger">Access Denied</h2>
          <p className="text-muted mb-4">
            You do not have administrative privileges to access this console.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Link to="/" className="btn btn-tw-primary rounded-pill px-4">
              Return to Storefront
            </Link>
            <button
              type="button"
              className="btn btn-outline-danger rounded-pill px-4"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="admin-backdrop d-md-none"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`admin-sidebar bg-white border-end d-flex flex-column justify-content-between p-3 ${sidebarOpen ? 'show' : ''
          }`}
        style={{ width: '270px', minWidth: '270px' }}
      >
        <div>
          {/* Logo & Close */}
          <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
            <Link to="/admin" className="d-inline-flex align-items-center text-decoration-none">
              <img
                src={logoImg}
                alt="Logo"
                style={{ height: '100px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>
            <button
              type="button"
              className="btn btn-light d-md-none p-1 rounded-circle"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Admin Navigation Menu */}
          <div className="text-muted small fw-bold px-2 mb-2 text-uppercase" style={{ fontSize: '0.75rem' }}>
            Operations & Catalog
          </div>
          <nav className="nav flex-column gap-1">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 fw-semibold ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover-bg-light'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </NavLink>

            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 fw-semibold ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover-bg-light'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Package size={18} />
              <span>Products</span>
            </NavLink>

            <NavLink
              to="/admin/products/new"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 fw-semibold ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover-bg-light'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <PlusCircle size={18} />
              <span>Add Product</span>
            </NavLink>

            <NavLink
              to="/admin/categories"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 fw-semibold ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover-bg-light'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <FolderTree size={18} />
              <span>Categories</span>
            </NavLink>

            <NavLink
              to="/admin/orders"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 fw-semibold ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover-bg-light'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <ShoppingBag size={18} />
              <span>Orders</span>
            </NavLink>

            <NavLink
              to="/admin/inventory"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 fw-semibold ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover-bg-light'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Boxes size={18} />
              <span>Inventory</span>
            </NavLink>

            <NavLink
              to="/admin/reports"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 fw-semibold ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover-bg-light'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <BarChart3 size={18} />
              <span>Reports</span>
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-3 border-top">
          <div className="d-grid gap-2">
            <Link
              to="/"
              className="btn btn-outline-primary btn-sm rounded-pill d-flex align-items-center justify-content-center gap-2"
            >
              <Store size={16} />
              <span>View Customer Store</span>
            </Link>

            <button
              type="button"
              className="btn btn-light btn-sm rounded-pill text-muted d-flex align-items-center justify-content-center gap-2"
              onClick={handleResetData}
              title="Reset all demo data back to factory dataset"
            >
              <RotateCcw size={14} />
              <span>Reset Demo Data</span>
            </button>

            <button
              type="button"
              className="btn btn-link text-danger btn-sm text-decoration-none d-flex align-items-center justify-content-center gap-1"
              onClick={handleLogout}
            >
              <LogOut size={14} />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-grow-1 d-flex flex-column min-vh-100 overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <button
              type="button"
              className="btn btn-light d-md-none p-2 rounded-3"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <Link to="/admin" className="d-inline-flex align-items-center text-decoration-none">
              <img
                src={logoImg}
                alt="Logo"
                style={{ height: '100px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-sm-block">
              <div className="fw-bold small">{user?.name || 'Administrator'}</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user?.email || 'Operations Admin'}</div>
            </div>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
              style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #7c3aed, #0284c7)' }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {/* Admin Content Outlet */}
        <main className="p-3 p-md-4 flex-grow-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      <Toast />
    </div>
  );
};

export default AdminLayout;
