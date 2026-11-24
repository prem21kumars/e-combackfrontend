import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';

// Layouts
import StoreLayout from '../layouts/StoreLayout';
import AdminLayout from '../layouts/AdminLayout';

// Store Pages
import HomePage from '../pages/home/HomePage';
import ProductsPage from '../pages/products/ProductsPage';
import ProductDetailPage from '../pages/products/ProductDetailPage';
import CartPage from '../pages/cart/CartPage';
import WishlistPage from '../pages/wishlist/WishlistPage';
import CheckoutPage from '../pages/checkout/CheckoutPage';
import OrderConfirmationPage from '../pages/checkout/OrderConfirmationPage';
import ProfilePage from '../pages/account/ProfilePage';
import OrderHistoryPage from '../pages/orders/OrderHistoryPage';
import OrderDetailPage from '../pages/orders/OrderDetailPage';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminProductsPage from '../pages/admin/AdminProductsPage';
import AdminProductFormPage from '../pages/admin/AdminProductFormPage';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminInventoryPage from '../pages/admin/AdminInventoryPage';
import AdminReportsPage from '../pages/admin/AdminReportsPage';

// 404 Not Found Component
const NotFoundPage = () => (
  <div className="container py-5 text-center">
    <div className="bg-white rounded-5 p-5 border shadow-sm mx-auto my-5" style={{ maxWidth: '520px' }}>
      <h1 className="display-1 fw-bolder text-primary mb-2">404</h1>
      <h3 className="fw-bold mb-2">Oops! Toy Not Found</h3>
      <p className="text-muted mb-4">
        Looks like the magical toy or page you're searching for wandered off to another playroom.
      </p>
      <Link to="/" className="btn btn-tw-primary rounded-pill px-4 py-2">
        Return to OO Toys Home
      </Link>
    </div>
  </div>
);

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Customer Store Routes */}
      <Route element={<StoreLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/categories/:categorySlug" element={<ProductsPage />} />
        <Route path="/search" element={<ProductsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/confirmation/:orderId" element={<OrderConfirmationPage />} />
        <Route path="/account" element={<ProfilePage />} />
        <Route path="/account/orders" element={<OrderHistoryPage />} />
        <Route path="/account/orders/:id" element={<OrderDetailPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />

        {/* Auth routes within store layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin Dashboard Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductFormPage />} />
        <Route path="products/:id/edit" element={<AdminProductFormPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="inventory" element={<AdminInventoryPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
