import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && orderId) {
      orderService.getOrderById(orderId)
        .then((data) => setOrder(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [orderId, order]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading confirmation...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="mx-auto text-center" style={{ maxWidth: '680px' }}>

        {/* Success Icon */}
        <div
          className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow"
          style={{ width: '88px', height: '88px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff' }}
        >
          <CheckCircle2 size={48} />
        </div>

        <span className="badge bg-warning-subtle text-dark px-3 py-1 rounded-pill fw-bold mb-2">
          ✨ Simulated Demo Order Confirmed
        </span>

        <h1 className="display-6 fw-bolder mb-2">Hooray! Your Toys Are On Their Way! 🎉</h1>
        <p className="text-muted lead fs-6 mb-4">
          Thank you for exploring with OO Toys! Your demo order has been logged into our local store registry.
        </p>

        {/* Order Reference Box */}
        <div className="bg-white rounded-5 border p-4 p-md-5 text-start shadow-sm mb-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pb-3 border-bottom mb-4">
            <div>
              <span className="text-muted small d-block">Demo Order Identifier</span>
              <h5 className="fw-bolder mb-0 text-primary">{order?.id || orderId}</h5>
            </div>
            <div className="text-md-end">
              <span className="text-muted small d-block">Simulated Date</span>
              <strong className="text-dark small">{formatDate(order?.date || new Date())}</strong>
            </div>
          </div>

          {/* Delivery & Payment Metadata */}
          <div className="row g-3 mb-4 small">
            <div className="col-sm-6">
              <div className="p-3 rounded-4 bg-light h-100">
                <div className="fw-bold text-dark d-flex align-items-center gap-1 mb-1">
                  <MapPin size={16} className="text-primary" />
                  <span>Delivering To</span>
                </div>
                <div className="text-dark">{order?.customer?.name}</div>
                <div className="text-muted">{order?.customer?.address?.street}</div>
                <div className="text-muted">
                  {order?.customer?.address?.city}, {order?.customer?.address?.state} - {order?.customer?.address?.pincode}
                </div>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="p-3 rounded-4 bg-light h-100">
                <div className="fw-bold text-dark d-flex align-items-center gap-1 mb-1">
                  <Truck size={16} className="text-success" />
                  <span>Order Status & Tracking</span>
                </div>
                <div className="text-dark">Status: <span className="badge bg-success-subtle text-success">{order?.orderStatus || 'Ordered'}</span></div>
                <div className="text-muted">Payment: {order?.paymentMethod}</div>
                <div className="text-muted">Tracking Code: <strong>{order?.trackingNumber || 'TRK-DEMO-9912'}</strong></div>
              </div>
            </div>
          </div>

          {/* Ordered Items List */}
          <h6 className="fw-bold mb-3">Order Items:</h6>
          <div className="d-flex flex-column gap-2 mb-4">
            {order?.items?.map((item, idx) => (
              <div key={idx} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="rounded-3 object-fit-cover"
                    style={{ width: '48px', height: '48px' }}
                  />
                  <div>
                    <div className="fw-semibold small text-dark">{item.name}</div>
                    <small className="text-muted">Qty: {item.quantity}</small>
                  </div>
                </div>
                <span className="fw-bold small">{formatCurrency(item.discountedPrice * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="d-flex justify-content-between align-items-baseline pt-2">
            <span className="fw-bold text-dark fs-5">Total Paid (Demo)</span>
            <span className="display-6 fw-bold text-primary">{formatCurrency(order?.total || 0)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-wrap gap-3 justify-content-center">
          <Link to={`/account/orders/${order?.id || orderId}`} className="btn btn-tw-primary rounded-pill px-4 py-3 fw-bold">
            <Package size={18} />
            <span>Track Order Timeline</span>
          </Link>
          <Link to="/products" className="btn btn-tw-outline rounded-pill px-4 py-3 fw-bold">
            <ShoppingBag size={18} />
            <span>Explore More Toys</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmationPage;
