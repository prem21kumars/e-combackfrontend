import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  CreditCard, 
  Banknote, 
  Truck, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Lock,
  UserCheck
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { customerService } from '../../services/customerService';
import { cartService } from '../../services/cartService';
import { formatCurrency } from '../../utils/formatters';

export const CheckoutPage = () => {
  const { cartItems, cartCount, subtotal, shipping, promoDiscount, promoCode, total, clearCart } = useCart();
  const { user, isLoggedIn, demoLoginCustomer } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.addresses?.[0]?.street || '',
    city: user?.addresses?.[0]?.city || '',
    state: user?.addresses?.[0]?.state || 'Karnataka',
    pincode: user?.addresses?.[0]?.pincode || '',
    paymentMethod: 'Razorpay Demo (UPI / Cards)',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        street: prev.street || user.addresses?.[0]?.street || '',
        city: prev.city || user.addresses?.[0]?.city || '',
        state: prev.state || user.addresses?.[0]?.state || 'Karnataka',
        pincode: prev.pincode || user.addresses?.[0]?.pincode || '',
      }));
    }
  }, [user]);

  const [errors, setErrors] = useState({});
  const [checkoutError, setCheckoutError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (cartItems.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="bg-white rounded-5 p-5 border shadow-sm mx-auto" style={{ maxWidth: '480px' }}>
          <h4>No items in cart for checkout</h4>
          <p className="text-muted small">Please select your toys before heading to checkout.</p>
          <Link to="/products" className="btn btn-tw-primary rounded-pill">
            Explore Toys
          </Link>
        </div>
      </div>
    );
  }

  // Mandatory Customer Sign In Gate
  if (!isLoggedIn) {
    return (
      <div className="container py-5 text-center">
        <div className="bg-white rounded-5 p-4 p-md-5 border shadow-sm mx-auto my-4" style={{ maxWidth: '520px' }}>
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
            style={{ width: '84px', height: '84px', background: '#eff6ff', color: '#0284c7' }}
          >
            <Lock size={40} />
          </div>
          <h3 className="fw-bolder mb-2">Customer Sign In Required</h3>
          <p className="text-muted small mb-4">
            Orders can only be placed by registered and authenticated customers. Please sign in or create an account to proceed with your toy purchase.
          </p>

          <div className="d-grid gap-2 mb-4">
            <Link
              to="/login"
              state={{ from: '/checkout' }}
              className="btn btn-tw-primary btn-lg rounded-pill fw-bold"
            >
              Sign In to Place Order
            </Link>

            <Link
              to="/register"
              state={{ from: '/checkout' }}
              className="btn btn-outline-primary rounded-pill fw-semibold"
            >
              Create New Parent Account
            </Link>

            <div className="border-top pt-3 mt-2">
              <span className="small text-muted d-block mb-2">Instant Demo Testing (1-Click):</span>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm rounded-pill w-100"
                onClick={async () => {
                  const res = await demoLoginCustomer();
                  if (!res.success) {
                    alert(res.error || 'Failed to login demo customer');
                  }
                }}
              >
                1-Click Demo Customer Login
              </button>
            </div>
          </div>

          <Link to="/cart" className="text-muted small text-decoration-none">
            &larr; Return to Shopping Cart
          </Link>
        </div>
      </div>
    );
  }

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Valid email is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.street.trim()) errs.street = 'Street address is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.pincode.trim() || formData.pincode.length < 6) errs.pincode = 'Valid 6-digit PIN code required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    if (!validate()) return;

    setCheckoutError('');
    setIsSubmitting(true);
    try {
      // 1. Ensure backend cart has current items before creating order
      if (isLoggedIn && cartItems.length > 0) {
        try {
          const serverCart = await cartService.getCart();
          const serverItems = Array.isArray(serverCart?.items) ? serverCart.items : [];
          const serverProductIds = serverItems.map((i) => i.productId);

          for (const it of cartItems) {
            if (!serverProductIds.includes(it.id)) {
              await cartService.addItem(it.id, it.quantity);
            }
          }
        } catch (syncErr) {
          console.warn('Backend cart pre-sync warning:', syncErr.message);
        }
      }

      // 2. Ensure shipping address in backend database
      let shippingAddressId = null;
      if (isLoggedIn) {
        try {
          const addresses = await customerService.getAddresses();
          if (Array.isArray(addresses) && addresses.length > 0) {
            shippingAddressId = addresses[0].id;
          } else {
            const created = await customerService.createAddress({
              recipientName: formData.name,
              phoneNumber: formData.phone,
              addressLine1: formData.street,
              city: formData.city,
              state: formData.state || 'Karnataka',
              postalCode: formData.pincode,
              country: 'India',
              addressType: 'HOME',
              defaultShipping: true,
              defaultBilling: true,
            });
            shippingAddressId = created?.id;
          }
        } catch (addrErr) {
          console.warn('Backend address resolution warning:', addrErr.message);
        }
      }

      const orderPayload = {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
        },
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          discountedPrice: item.discountedPrice,
          quantity: item.quantity,
          image: item.image,
          category: item.category,
        })),
        subtotal,
        shipping,
        discount: promoDiscount,
        total,
        paymentMethod: formData.paymentMethod,
        shippingAddressId,
        couponCode: promoCode?.code,
      };

      const newOrder = await orderService.createOrder(orderPayload);
      clearCart();
      navigate(`/checkout/confirmation/${newOrder.id}`, { state: { order: newOrder } });
    } catch (err) {
      console.error('Order creation error:', err);
      setCheckoutError(err.message || 'Error placing order on server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/cart">Cart</Link></li>
          <li className="breadcrumb-item active">Checkout</li>
        </ol>
      </nav>

      {/* Demo banner */}
      <div className="alert alert-warning py-3 px-4 rounded-4 mb-4 border-0 d-flex align-items-center gap-3">
        <Sparkles size={24} className="text-warning flex-shrink-0" />
        <div className="small">
          <strong>Demo Simulation Mode:</strong> No actual financial transactions take place. Razorpay and Cash on Delivery choices are completely simulated for frontend testing and future Spring Boot API readiness.
        </div>
      </div>

      {checkoutError && (
        <div className="alert alert-danger py-3 px-4 rounded-4 mb-4 d-flex align-items-center gap-2">
          <AlertCircle size={20} className="text-danger flex-shrink-0" />
          <span>{checkoutError}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder}>
        <div className="row g-4">
          
          {/* Left Column: Contact, Address, Payment Forms */}
          <div className="col-lg-7">
            
            {/* Step 1: Customer Contact */}
            <div className="bg-white rounded-4 border p-4 shadow-sm mb-4">
              <h5 className="fw-bolder mb-3 d-flex align-items-center gap-2">
                <span className="badge bg-primary rounded-circle" style={{ width: '28px', height: '28px', lineHeight: '20px' }}>1</span>
                <span>Contact Details</span>
              </h5>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control rounded-pill ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="Parent / Guardian Name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  {errors.name && <div className="invalid-feedback small">{errors.name}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Email for Order Updates *</label>
                  <input
                    type="email"
                    name="email"
                    className={`form-control rounded-pill ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  {errors.email && <div className="invalid-feedback small">{errors.email}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Mobile Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    className={`form-control rounded-pill ${errors.phone ? 'is-invalid' : ''}`}
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                  {errors.phone && <div className="invalid-feedback small">{errors.phone}</div>}
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Address */}
            <div className="bg-white rounded-4 border p-4 shadow-sm mb-4">
              <h5 className="fw-bolder mb-3 d-flex align-items-center gap-2">
                <span className="badge bg-primary rounded-circle" style={{ width: '28px', height: '28px', lineHeight: '20px' }}>2</span>
                <span>Delivery Address</span>
              </h5>

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-bold text-muted">Street Address & House / Flat No *</label>
                  <input
                    type="text"
                    name="street"
                    className={`form-control rounded-pill ${errors.street ? 'is-invalid' : ''}`}
                    placeholder="House/Flat No., Apartment, Landmark, Street"
                    value={formData.street}
                    onChange={handleInputChange}
                  />
                  {errors.street && <div className="invalid-feedback small">{errors.street}</div>}
                </div>

                <div className="col-md-5">
                  <label className="form-label small fw-bold text-muted">City / District *</label>
                  <input
                    type="text"
                    name="city"
                    className={`form-control rounded-pill ${errors.city ? 'is-invalid' : ''}`}
                    placeholder="Bengaluru"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                  {errors.city && <div className="invalid-feedback small">{errors.city}</div>}
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">State *</label>
                  <input
                    type="text"
                    name="state"
                    className="form-control rounded-pill"
                    placeholder="Karnataka"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-bold text-muted">PIN Code *</label>
                  <input
                    type="text"
                    name="pincode"
                    maxLength={6}
                    className={`form-control rounded-pill ${errors.pincode ? 'is-invalid' : ''}`}
                    placeholder="560001"
                    value={formData.pincode}
                    onChange={handleInputChange}
                  />
                  {errors.pincode && <div className="invalid-feedback small">{errors.pincode}</div>}
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method Selection */}
            <div className="bg-white rounded-4 border p-4 shadow-sm mb-4">
              <h5 className="fw-bolder mb-3 d-flex align-items-center gap-2">
                <span className="badge bg-primary rounded-circle" style={{ width: '28px', height: '28px', lineHeight: '20px' }}>3</span>
                <span>Select Payment Method</span>
              </h5>

              <div className="d-flex flex-column gap-3">
                <label className={`p-3 rounded-4 border d-flex align-items-center justify-content-between cursor-pointer ${formData.paymentMethod.includes('Razorpay') ? 'border-primary bg-primary-subtle' : 'bg-light'}`} style={{ cursor: 'pointer' }}>
                  <div className="d-flex align-items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Razorpay Demo (UPI / Cards)"
                      checked={formData.paymentMethod === 'Razorpay Demo (UPI / Cards)'}
                      onChange={handleInputChange}
                      className="form-check-input"
                    />
                    <CreditCard size={24} className="text-primary" />
                    <div>
                      <div className="fw-bold small">Razorpay Demo Simulation</div>
                      <div className="text-muted small">Instant simulated UPI, Google Pay, Credit/Debit cards</div>
                    </div>
                  </div>
                  <span className="badge bg-primary">Recommended</span>
                </label>

                <label className={`p-3 rounded-4 border d-flex align-items-center justify-content-between cursor-pointer ${formData.paymentMethod.includes('Cash') ? 'border-primary bg-primary-subtle' : 'bg-light'}`} style={{ cursor: 'pointer' }}>
                  <div className="d-flex align-items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on Delivery"
                      checked={formData.paymentMethod === 'Cash on Delivery'}
                      onChange={handleInputChange}
                      className="form-check-input"
                    />
                    <Banknote size={24} className="text-success" />
                    <div>
                      <div className="fw-bold small">Cash on Delivery (COD)</div>
                      <div className="text-muted small">Pay in cash or UPI upon package handover</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="col-lg-5">
            <div className="bg-white rounded-4 border shadow-sm p-4 sticky-top" style={{ top: '80px' }}>
              <h5 className="fw-bolder mb-3">Order Items ({cartCount})</h5>

              {/* Items scroll */}
              <div className="d-flex flex-column gap-3 mb-4 overflow-auto" style={{ maxHeight: '240px' }}>
                {cartItems.map((item) => (
                  <div key={item.id} className="d-flex align-items-center justify-content-between gap-3 pb-2 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="rounded-3 object-fit-cover"
                        style={{ width: '48px', height: '48px' }}
                      />
                      <div>
                        <div className="fw-bold text-dark text-truncate small" style={{ maxWidth: '180px' }}>
                          {item.name}
                        </div>
                        <span className="text-muted small">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="fw-bold small">
                      {formatCurrency(item.discountedPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="d-flex flex-column gap-2 mb-3 small">
                <div className="d-flex justify-content-between text-muted">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="d-flex justify-content-between text-success">
                    <span>Coupon Discount</span>
                    <span>- {formatCurrency(promoDiscount)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between text-muted">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <strong className="text-success">FREE</strong> : formatCurrency(shipping)}</span>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-baseline pt-3 border-top mb-4">
                <span className="fw-bold fs-5">Total Payable</span>
                <span className="display-6 fw-bold text-primary">{formatCurrency(total)}</span>
              </div>

              <button
                type="submit"
                className="btn btn-tw-primary w-100 py-3 rounded-pill fw-bold fs-6 d-flex align-items-center justify-content-center gap-2"
                disabled={isSubmitting}
              >
                <Lock size={18} />
                <span>{isSubmitting ? 'Placing Order...' : `Place Order (${formatCurrency(total)})`}</span>
              </button>

              <div className="text-center mt-3 small text-muted">
                <ShieldCheck size={14} className="text-success me-1" />
                <span>Encrypted simulated checkout. 100% kid-safe store.</span>
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
