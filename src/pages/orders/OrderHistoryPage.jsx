import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, Calendar, ArrowRight, Eye, AlertCircle } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const OrderHistoryPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await orderService.getOrders();
        setOrders(data);
      } catch (err) {
        console.error('Error fetching order history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter((o) => o.orderStatus.toLowerCase() === statusFilter.toLowerCase());

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-success text-white';
      case 'Shipped':
        return 'bg-info text-dark';
      case 'Processing':
        return 'bg-warning text-dark';
      case 'Cancelled':
        return 'bg-danger text-white';
      case 'Ordered':
      default:
        return 'bg-primary text-white';
    }
  };

  return (
    <div className="container py-4">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/account">Account</Link></li>
          <li className="breadcrumb-item active">Order History</li>
        </ol>
      </nav>

      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 pb-2 border-bottom">
        <div>
          <h1 className="h2 fw-bolder mb-1">My Orders & Tracking</h1>
          <p className="text-muted small mb-0">Review past purchases and live delivery status milestones.</p>
        </div>

        {/* Filter Tabs */}
        <div className="d-flex flex-wrap gap-2 mt-3 mt-md-0">
          {['all', 'Ordered', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              className={`btn btn-sm rounded-pill px-3 ${statusFilter === st ? 'btn-primary' : 'btn-light border'}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === 'all' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading orders...</span>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-5 p-5 border text-center my-4">
          <Package size={48} className="text-muted mb-3" />
          <h4 className="fw-bold mb-2">No Orders Found</h4>
          <p className="text-muted small mb-3">No orders match the selected status filter.</p>
          <Link to="/products" className="btn btn-tw-primary rounded-pill btn-sm px-4">
            Browse Toys
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredOrders.map((ord) => (
            <div key={ord.id} className="bg-white rounded-4 border p-4 shadow-sm hover-shadow transition">
              <div className="row align-items-center g-3">
                
                {/* Order ID & Date */}
                <div className="col-md-3">
                  <div className="fw-bolder text-primary mb-1">{ord.id}</div>
                  <div className="text-muted small d-flex align-items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatDate(ord.date)}</span>
                  </div>
                </div>

                {/* Status Badge & Payment Method */}
                <div className="col-md-3">
                  <span className={`badge rounded-pill px-3 py-1 fw-bold ${getStatusBadge(ord.orderStatus)}`}>
                    {ord.orderStatus}
                  </span>
                  <div className="text-muted small mt-1">{ord.paymentMethod}</div>
                </div>

                {/* Items Preview */}
                <div className="col-md-3">
                  <div className="d-flex align-items-center gap-2">
                    {ord.items.slice(0, 3).map((item, idx) => (
                      <img
                        key={idx}
                        src={item.image}
                        alt={item.name}
                        className="rounded-3 object-fit-cover border"
                        style={{ width: '42px', height: '42px' }}
                        title={item.name}
                      />
                    ))}
                    {ord.items.length > 3 && (
                      <span className="badge bg-light text-dark border rounded-circle p-2 small">
                        +{ord.items.length - 3}
                      </span>
                    )}
                  </div>
                  <small className="text-muted d-block mt-1">
                    {ord.items.reduce((s, i) => s + i.quantity, 0)} items
                  </small>
                </div>

                {/* Total & Action */}
                <div className="col-md-3 text-md-end">
                  <div className="fw-bolder fs-5 text-dark mb-1">
                    {formatCurrency(ord.total)}
                  </div>
                  <Link
                    to={`/account/orders/${ord.id}`}
                    className="btn btn-outline-primary btn-sm rounded-pill px-3 d-inline-flex align-items-center gap-1"
                  >
                    <Eye size={14} />
                    <span>View Details</span>
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
