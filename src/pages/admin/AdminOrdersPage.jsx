import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Eye, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  User,
  Filter
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAdminOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateAdminOrderStatus(orderId, newStatus, `Status updated by Admin to ${newStatus}`);
      await loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleViewOrder = async (ord) => {
    setSelectedOrder(ord);
    try {
      const fullDetail = await orderService.getOrderById(ord.orderNumber || ord.id);
      if (fullDetail && fullDetail.items && fullDetail.items.length > 0) {
        setSelectedOrder(fullDetail);
      }
    } catch (err) {
      console.warn('Could not fetch full order details:', err);
    }
  };

  const filtered = orders.filter((o) => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 bg-white p-4 rounded-4 border shadow-sm">
        <div>
          <h1 className="h4 fw-bolder mb-1">Customer Orders Management</h1>
          <p className="text-muted small mb-0">Review pending orders, advance fulfillment stages, and track simulated packages.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-4 border shadow-sm d-flex flex-column flex-md-row gap-3 justify-content-between">
        <div className="input-group" style={{ maxWidth: '360px' }}>
          <span className="input-group-text bg-light border-end-0 rounded-start-pill">
            <Search size={16} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control form-control-sm rounded-end-pill border-start-0"
            placeholder="Search by Order ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="small text-muted text-nowrap">Filter Status:</span>
          <select
            className="form-select form-select-sm rounded-pill"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="all">All Statuses</option>
            <option value="Ordered">Ordered</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-4 border shadow-sm p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading orders...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <ShoppingBag size={40} className="mb-2" />
            <h6>No orders found</h6>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-muted text-uppercase">
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Update Status</th>
                  <th className="text-end">Details</th>
                </tr>
              </thead>
              <tbody className="small">
                {filtered.map((ord) => (
                  <tr key={ord.id}>
                    <td className="fw-bold text-primary">{ord.id}</td>
                    <td className="text-muted">{formatDate(ord.date)}</td>
                    <td>
                      <div className="fw-bold text-dark">{ord.customer?.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{ord.customer?.email}</div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {ord.items?.length || 1} items
                      </span>
                    </td>
                    <td className="fw-bolder">{formatCurrency(ord.total)}</td>
                    <td>
                      <span className={`badge ${
                        (ord.paymentMethod || '').toLowerCase().includes('cash') || (ord.paymentMethod || '').toLowerCase().includes('cod')
                          ? 'bg-success-subtle text-success border border-success'
                          : 'bg-primary-subtle text-primary border border-primary'
                      } rounded-pill px-2 py-1`}>
                        {(ord.paymentMethod || '').toLowerCase().includes('cash') || (ord.paymentMethod || '').toLowerCase().includes('cod') ? 'COD' : 'Razorpay'}
                      </span>
                    </td>
                    <td>
                      <select
                        className={`form-select form-select-sm rounded-pill fw-bold ${
                          ord.orderStatus === 'Delivered' ? 'border-success text-success' :
                          ord.orderStatus === 'Shipped' ? 'border-info text-info' :
                          ord.orderStatus === 'Processing' ? 'border-warning text-warning' :
                          ord.orderStatus === 'Cancelled' ? 'border-danger text-danger' : 'border-primary text-primary'
                        }`}
                        value={ord.orderStatus}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        style={{ width: '150px' }}
                      >
                        <option value="Ordered">Ordered</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm rounded-circle p-2"
                        onClick={() => handleViewOrder(ord)}
                        title="View Full Order Breakdown"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <>
          <div className="mobile-nav-overlay" onClick={() => setSelectedOrder(null)}></div>
          <div className="position-fixed top-50 start-50 translate-middle bg-white rounded-5 p-4 shadow-lg border" style={{ width: '92%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', zIndex: 1100 }}>
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
              <div>
                <h5 className="fw-bold mb-0">Order: {selectedOrder.id}</h5>
                <small className="text-muted">{formatDate(selectedOrder.date)}</small>
              </div>
              <span className="badge bg-primary rounded-pill px-3 py-2">{selectedOrder.orderStatus}</span>
            </div>

            {/* Customer Details */}
            <div className="p-3 rounded-4 bg-light mb-3 small">
              <div className="fw-bold text-dark mb-1">Customer Delivery Information:</div>
              <div><strong>Name:</strong> {selectedOrder.customer?.name || 'Customer'}</div>
              <div><strong>Phone:</strong> {selectedOrder.customer?.phone || 'Not Provided'}</div>
              <div><strong>Email:</strong> {selectedOrder.customer?.email || 'Not Provided'}</div>
              <div>
                <strong>Address:</strong>{' '}
                {selectedOrder.customer?.address?.street || selectedOrder.customer?.address?.city
                  ? [
                      selectedOrder.customer.address.street,
                      selectedOrder.customer.address.city,
                      selectedOrder.customer.address.state
                        ? `${selectedOrder.customer.address.state} - ${selectedOrder.customer.address.pincode}`
                        : selectedOrder.customer.address.pincode
                    ].filter(Boolean).join(', ')
                  : 'Not Provided'}
              </div>
              <div className="mt-1 d-flex align-items-center gap-2">
                <strong>Payment Method:</strong>
                <span className={`badge ${
                  (selectedOrder.paymentMethod || '').toLowerCase().includes('cash') || (selectedOrder.paymentMethod || '').toLowerCase().includes('cod')
                    ? 'bg-success-subtle text-success border border-success'
                    : 'bg-primary-subtle text-primary border border-primary'
                } rounded-pill px-2 py-1`}>
                  {selectedOrder.paymentMethod || 'Cash on Delivery (COD)'}
                </span>
                {selectedOrder.paymentStatus && (
                  <span className="badge bg-light text-muted border rounded-pill px-2 py-1">
                    {selectedOrder.paymentStatus}
                  </span>
                )}
              </div>
              <div><strong>Tracking Code:</strong> {selectedOrder.trackingNumber || 'TRK-IND-000001'}</div>
            </div>

            {/* Items */}
            <h6 className="fw-bold small text-muted text-uppercase mb-2">Ordered Toys:</h6>
            <div className="d-flex flex-column gap-2 mb-3">
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between py-2 border-bottom small">
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1'}
                        alt={item.name}
                        className="rounded object-fit-cover"
                        style={{ width: '36px', height: '36px' }}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1'; }}
                      />
                      <div>
                        <div className="fw-semibold">{item.name}</div>
                        {item.sku && <div className="text-muted" style={{ fontSize: '0.75rem' }}>SKU: {item.sku}</div>}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted me-2">x{item.quantity}</span>
                      <strong>{formatCurrency((item.discountedPrice || item.price || 0) * (item.quantity || 1))}</strong>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted small py-2">No items found for this order.</div>
              )}
            </div>

            <div className="d-flex justify-content-between fw-bolder fs-5 pt-2 border-top mb-4">
              <span>Total:</span>
              <span className="text-primary">{formatCurrency(selectedOrder.total)}</span>
            </div>

            <div className="d-flex justify-content-between align-items-center">
              {!['CANCELLED', 'DELIVERED'].includes((selectedOrder.orderStatus || '').toUpperCase()) && (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm rounded-pill px-3"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to cancel order ${selectedOrder.id}?`)) {
                      handleStatusChange(selectedOrder.backendId || selectedOrder.id, 'Cancelled');
                    }
                  }}
                >
                  Cancel Order (Admin Override)
                </button>
              )}
              <button type="button" className="btn btn-tw-primary rounded-pill btn-sm px-4 ms-auto" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default AdminOrdersPage;
