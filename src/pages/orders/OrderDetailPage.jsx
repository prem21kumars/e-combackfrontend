import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  MapPin, 
  CreditCard, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  XCircle,
  Sparkles
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const found = await orderService.getOrderById(id);
        setOrder(found);
      } catch (err) {
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    setCancelLoading(true);
    setCancelError('');
    try {
      const updated = await orderService.requestCancellation(order.orderNumber || order.id, cancelReason);
      setOrder(updated);
      setCancelSuccess(true);
      setCancelModalOpen(false);
    } catch (err) {
      setCancelError(err.message || 'Could not cancel order');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading details...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5 text-center">
        <h4>Order Not Found</h4>
        <p className="text-muted">The requested order was not found in demo storage.</p>
        <Link to="/account/orders" className="btn btn-tw-primary rounded-pill">
          Back to Orders
        </Link>
      </div>
    );
  }

  const orderStatusUpper = (order.orderStatus || '').toUpperCase();
  const isCancelled = orderStatusUpper === 'CANCELLED';
  const isCompleted = ['SHIPPED', 'DELIVERED'].includes(orderStatusUpper);
  const isEligibleStatus = !isCancelled && !isCompleted && [
    'ORDERED', 'PENDING', 'PAYMENT_PENDING', 'CONFIRMED', 'PROCESSING'
  ].includes(orderStatusUpper);

  // 1-Day (24-Hour) Rule:
  // Normal customers can only cancel within 24 hours of placement.
  // After 24 hours (1 day), only an administrator can change or cancel the order.
  const isAdmin = user?.role === 'admin' || user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_SUPER_ADMIN';
  const orderDate = order.createdAt || order.date;
  const orderTimestamp = orderDate ? new Date(orderDate).getTime() : Date.now();
  const hoursSinceOrder = (Date.now() - orderTimestamp) / (1000 * 60 * 60);
  const isWithinOneDay = hoursSinceOrder <= 24;

  const canCancel = isEligibleStatus && (isAdmin || isWithinOneDay);
  const isPastOneDay = isEligibleStatus && !isWithinOneDay && !isAdmin;

  const getStepIndex = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'DELIVERED': return 3;
      case 'SHIPPED': return 2;
      case 'PROCESSING': return 1;
      case 'ORDERED':
      case 'CONFIRMED':
      case 'PAYMENT_PENDING':
      case 'PENDING':
      default:
        return 0;
    }
  };
  const steps = ['Ordered', 'Processing', 'Shipped', 'Delivered'];
  const currentStepIndex = getStepIndex(order.orderStatus);

  return (
    <div className="container py-4">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/account/orders">My Orders</Link></li>
          <li className="breadcrumb-item active">{order.id}</li>
        </ol>
      </nav>

      {/* Top Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-3 border-bottom mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h1 className="h3 fw-bolder mb-0">Order {order.id}</h1>
            <span className={`badge rounded-pill px-3 py-1 ${isCancelled ? 'bg-danger' : 'bg-primary'}`}>
              {order.orderStatus}
            </span>
          </div>
          <span className="text-muted small">Placed on {formatDate(order.date)}</span>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          {canCancel && (
            <button
              type="button"
              className="btn btn-danger btn-sm rounded-pill px-3 d-inline-flex align-items-center gap-1 shadow-sm"
              onClick={() => {
                setCancelError('');
                setCancelModalOpen(true);
              }}
            >
              <XCircle size={15} />
              <span>Cancel Order</span>
            </button>
          )}

          {isPastOneDay && (
            <div className="badge bg-warning-subtle text-dark border px-3 py-2 rounded-pill small d-inline-flex align-items-center gap-1" title="Customer cancellation window has expired (1 day / 24 hours limit)">
              <Clock size={13} className="text-warning-emphasis" />
              <span>1-Day cancellation limit passed. Only Admin can cancel.</span>
            </div>
          )}

          <Link to="/account/orders" className="btn btn-light btn-sm rounded-pill px-3 border">
            Back to Orders
          </Link>
        </div>
      </div>

      {cancelSuccess && (
        <div className="alert alert-success alert-dismissible fade show rounded-4 shadow-sm mb-4" role="alert">
          <div className="d-flex align-items-center gap-2">
            <CheckCircle size={18} />
            <span><strong>Order Cancelled:</strong> Order #{order.id} has been cancelled successfully.</span>
          </div>
          <button type="button" className="btn-close" onClick={() => setCancelSuccess(false)}></button>
        </div>
      )}

      {/* Timeline Stepper */}
      <div className="bg-white rounded-5 border p-4 shadow-sm mb-4">
        <h5 className="fw-bolder mb-4">Delivery Progress</h5>
        
        {isCancelled ? (
          <div className="alert alert-danger d-flex align-items-center gap-2 rounded-4 mb-0">
            <XCircle size={22} />
            <div>
              <strong>Order Cancelled</strong> - This simulated order was cancelled per customer request.
            </div>
          </div>
        ) : (
          <div className="position-relative py-3">
            <div className="row text-center position-relative">
              {steps.map((st, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={st} className="col-3 position-relative">
                    <div 
                      className={`rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2 shadow-sm ${
                        isPassed ? 'bg-success text-white' : 'bg-light text-muted border'
                      }`}
                      style={{ width: '44px', height: '44px', zIndex: 2, position: 'relative' }}
                    >
                      {isPassed ? <CheckCircle size={22} /> : <Clock size={20} />}
                    </div>
                    <div className={`fw-bold small ${isCurrent ? 'text-primary' : isPassed ? 'text-dark' : 'text-muted'}`}>
                      {st}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Milestone logs */}
        {order.statusTimeline && (
          <div className="mt-4 pt-3 border-top">
            <h6 className="fw-bold small text-muted text-uppercase mb-3">Milestone Activity Log</h6>
            <div className="d-flex flex-column gap-2 small">
              {order.statusTimeline.map((tl, index) => (
                <div key={index} className="d-flex align-items-start gap-2 text-muted">
                  <span className="badge bg-light text-dark border">{tl.status}</span>
                  <span>{tl.notes}</span>
                  <span className="ms-auto text-nowrap" style={{ fontSize: '0.75rem' }}>
                    {formatDate(tl.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2-Columns: Delivery info & Items breakdown */}
      <div className="row g-4">
        
        {/* Left Column: Items */}
        <div className="col-lg-8">
          <div className="bg-white rounded-4 border p-4 shadow-sm mb-4">
            <h5 className="fw-bolder mb-3">Ordered Toys</h5>
            <div className="d-flex flex-column gap-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="d-flex align-items-center justify-content-between pb-3 border-bottom">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="rounded-3 object-fit-cover"
                      style={{ width: '64px', height: '64px' }}
                    />
                    <div>
                      <Link to={`/products/${item.id}`} className="fw-bold text-dark text-decoration-none hover-primary">
                        {item.name}
                      </Link>
                      <div className="text-muted small">Category: {item.category}</div>
                      <div className="text-muted small">Unit Price: {formatCurrency(item.discountedPrice)}</div>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="text-muted small">Qty: {item.quantity}</div>
                    <div className="fw-bold">{formatCurrency(item.discountedPrice * item.quantity)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Payment info */}
        <div className="col-lg-4">
          <div className="bg-white rounded-4 border p-4 shadow-sm mb-4">
            <h5 className="fw-bolder mb-3">Delivery Address</h5>
            <div className="text-dark fw-bold">{order.customer?.name}</div>
            <div className="text-muted small">{order.customer?.email}</div>
            <div className="text-muted small mb-2">{order.customer?.phone}</div>
            <div className="p-3 bg-light rounded-3 text-muted small">
              <MapPin size={16} className="text-primary me-1" />
              <span>{order.customer?.address?.street}, {order.customer?.address?.city}, {order.customer?.address?.state} - {order.customer?.address?.pincode}</span>
            </div>
          </div>

          <div className="bg-white rounded-4 border p-4 shadow-sm">
            <h5 className="fw-bolder mb-3">Payment Summary</h5>
            <div className="d-flex justify-content-between text-muted small mb-2">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="d-flex justify-content-between text-success small mb-2">
                <span>Discount</span>
                <span>- {formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="d-flex justify-content-between text-muted small mb-2">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? 'FREE' : formatCurrency(order.shipping)}</span>
            </div>
            <div className="d-flex justify-content-between fw-bold fs-5 pt-2 border-top">
              <span>Total Paid</span>
              <span className="text-primary">{formatCurrency(order.total)}</span>
            </div>
            <div className="badge bg-light text-dark border w-100 py-2 mt-3 text-start small">
              Method: <strong>{order.paymentMethod}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Cancellation Modal */}
      {cancelModalOpen && (
        <>
          <div className="mobile-nav-overlay" onClick={() => !cancelLoading && setCancelModalOpen(false)}></div>
          <div 
            className="position-fixed top-50 start-50 translate-middle bg-white rounded-5 p-4 shadow-lg border"
            style={{ width: '90%', maxWidth: '480px', zIndex: 1100 }}
          >
            <div className="d-flex align-items-center justify-content-between pb-2 border-bottom mb-3">
              <h5 className="fw-bold mb-0 text-danger d-flex align-items-center gap-2">
                <AlertTriangle size={20} />
                <span>Cancel Order</span>
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => !cancelLoading && setCancelModalOpen(false)}
              ></button>
            </div>

            <p className="text-muted small mb-2">
              Are you sure you want to cancel order <strong>{order.id}</strong>?
            </p>

            <div className="alert alert-info py-2 px-3 rounded-3 small mb-3">
              {isAdmin ? (
                <span>🛡️ <strong>Admin Authority:</strong> You can cancel or update this order at any stage.</span>
              ) : (
                <span>⏱️ <strong>Cancellation Policy:</strong> Orders can be cancelled within 24 hours (1 day) of placement.</span>
              )}
            </div>

            {cancelError && (
              <div className="alert alert-danger py-2 px-3 rounded-3 small mb-3">
                {cancelError}
              </div>
            )}

            <div className="mb-4">
              <label className="form-label small fw-bold">Reason for Cancellation</label>
              <select
                className="form-select form-select-sm rounded-pill"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                disabled={cancelLoading}
              >
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                <option value="Need to change delivery address or contact info">Need to change delivery address or contact info</option>
                <option value="Delivery time too long">Delivery time too long</option>
                <option value="Customer requested cancellation">Customer requested cancellation</option>
              </select>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light btn-sm rounded-pill px-3"
                onClick={() => setCancelModalOpen(false)}
                disabled={cancelLoading}
              >
                Keep Order
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm rounded-pill px-4 fw-bold"
                onClick={handleCancelOrder}
                disabled={cancelLoading}
              >
                {cancelLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Cancelling...
                  </>
                ) : (
                  'Confirm Cancel'
                )}
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default OrderDetailPage;
