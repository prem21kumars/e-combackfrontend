import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  ShoppingCart, 
  Tag, 
  Truck, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2,
  X
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';

export const CartPage = () => {
  const { 
    cartItems, 
    cartCount, 
    subtotal, 
    originalTotal, 
    productSavings, 
    shipping, 
    promoDiscount, 
    promoCode, 
    total, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    applyPromoCode, 
    removePromoCode 
  } = useCart();
  const { isLoggedIn } = useAuth();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState(null);
  const navigate = useNavigate();

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyPromoCode(couponInput);
    setCouponMessage(res);
    setCouponInput('');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="bg-white rounded-5 p-5 border shadow-sm mx-auto" style={{ maxWidth: '580px' }}>
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
            style={{ width: '90px', height: '90px', background: '#f0f9ff', color: '#0284c7' }}
          >
            <ShoppingCart size={46} />
          </div>
          <h2 className="fw-bolder mb-2">Your Toy Cart is Empty!</h2>
          <p className="text-muted mb-4">
            Looks like you haven't picked any toys yet. Explore our magical collection of building blocks, RC cars, dolls, and puzzles!
          </p>
          <Link to="/products" className="btn btn-tw-primary btn-lg rounded-pill px-4">
            Start Shopping for Toys
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item active">Shopping Cart ({cartCount} items)</li>
        </ol>
      </nav>

      <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
        <h1 className="h2 fw-bolder mb-0">Shopping Cart</h1>
        <button
          type="button"
          className="btn btn-link text-danger text-decoration-none small"
          onClick={clearCart}
        >
          Clear Cart
        </button>
      </div>

      <div className="row g-4">
        
        {/* Left Column: Cart Items List */}
        <div className="col-lg-8">
          <div className="bg-white rounded-4 border shadow-sm p-3 p-md-4 mb-4">
            <div className="d-flex flex-column gap-3">
              {cartItems.map((item) => (
                <div 
                  key={item.id} 
                  className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 pb-3 border-bottom"
                >
                  {/* Image & Title */}
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="rounded-3 object-fit-cover"
                      style={{ width: '80px', height: '80px', flexShrink: 0 }}
                    />
                    <div>
                      <Link 
                        to={`/products/${item.id}`} 
                        className="fw-bold text-dark text-decoration-none hover-primary d-block mb-1"
                        style={{ fontSize: '0.96rem' }}
                      >
                        {item.name}
                      </Link>
                      <div className="text-muted small mb-1">{item.category}</div>
                      <div className="d-flex align-items-baseline gap-2">
                        <span className="fw-bold text-dark">
                          {formatCurrency(item.discountedPrice)}
                        </span>
                        {item.discountPercentage > 0 && (
                          <span className="text-muted text-decoration-line-through small">
                            {formatCurrency(item.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Controls */}
                  <div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-3">
                    <div className="d-flex align-items-center border rounded-pill bg-light px-2 py-1">
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-dark text-decoration-none px-2 fw-bold"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="px-2 fw-bold small">{item.quantity}</span>
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-dark text-decoration-none px-2 fw-bold"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <div className="text-end" style={{ minWidth: '90px' }}>
                      <div className="fw-bolder">
                        {formatCurrency(item.discountedPrice * item.quantity)}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-light text-danger rounded-circle p-2"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 d-flex justify-content-between align-items-center">
              <Link to="/products" className="btn btn-link text-primary p-0 text-decoration-none d-flex align-items-center gap-1 fw-bold small">
                <ArrowLeft size={16} />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-white rounded-4 border p-3 mb-4">
            <div className="d-flex align-items-center justify-content-between small fw-bold mb-2">
              <span className="d-flex align-items-center gap-1 text-primary">
                <Truck size={16} />
                {shipping === 0 ? '🎉 Congratulations! You unlocked Free Shipping!' : `Add ${formatCurrency(999 - subtotal)} more to get FREE Delivery!`}
              </span>
              <span>{Math.min(100, Math.round((subtotal / 999) * 100))}%</span>
            </div>
            <div className="progress" style={{ height: '8px' }}>
              <div 
                className="progress-bar bg-success rounded-pill" 
                style={{ width: `${Math.min(100, Math.round((subtotal / 999) * 100))}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="col-lg-4">
          <div className="bg-white rounded-4 border shadow-sm p-4 sticky-top" style={{ top: '80px' }}>
            <h5 className="fw-bolder mb-3">Order Summary</h5>

            {/* Promo Code Input */}
            <div className="mb-4 pb-3 border-bottom">
              <label className="form-label small fw-bold text-muted">Promo Code / Coupon</label>
              {promoCode ? (
                <div className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-success-subtle border border-success">
                  <div className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={18} className="text-success" />
                    <div>
                      <div className="fw-bold small text-success">{promoCode.code}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{promoCode.label}</div>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-link text-danger p-1"
                    onClick={removePromoCode}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-start-pill text-uppercase"
                      placeholder="Try TOYJOY10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                    />
                    <button type="submit" className="btn btn-tw-secondary btn-sm rounded-end-pill px-3">
                      Apply
                    </button>
                  </div>
                  {couponMessage && !couponMessage.success && (
                    <small className="text-danger d-block mt-1">{couponMessage.message}</small>
                  )}
                  <small className="text-muted mt-1 d-block" style={{ fontSize: '0.75rem' }}>
                    Tip: Enter <strong>TOYJOY10</strong> for 10% off!
                  </small>
                </form>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="d-flex flex-column gap-2 mb-3">
              <div className="d-flex justify-content-between text-muted small">
                <span>Subtotal ({cartCount} items)</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              {productSavings > 0 && (
                <div className="d-flex justify-content-between text-success small">
                  <span>Product Savings</span>
                  <span>- {formatCurrency(productSavings)}</span>
                </div>
              )}

              {promoDiscount > 0 && (
                <div className="d-flex justify-content-between text-success small">
                  <span>Promo Discount ({promoCode?.code})</span>
                  <span>- {formatCurrency(promoDiscount)}</span>
                </div>
              )}

              <div className="d-flex justify-content-between text-muted small">
                <span>Estimated Shipping</span>
                <span>{shipping === 0 ? <strong className="text-success">FREE</strong> : formatCurrency(shipping)}</span>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-baseline pt-3 border-top mb-4">
              <span className="fw-bold fs-5">Estimated Total</span>
              <span className="display-6 fw-bold text-primary">{formatCurrency(total)}</span>
            </div>

            <button
              type="button"
              className="btn btn-tw-primary w-100 py-3 rounded-pill fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 mb-3"
              onClick={() => {
                if (!isLoggedIn) {
                  navigate('/login', { state: { from: '/checkout' } });
                } else {
                  navigate('/checkout');
                }
              }}
            >
              <span>{isLoggedIn ? 'Proceed to Checkout' : 'Sign In to Checkout'}</span>
              <ArrowRight size={18} />
            </button>

            <div className="text-center">
              <small className="text-muted d-flex align-items-center justify-content-center gap-1">
                <ShieldCheck size={14} className="text-success" />
                <span>Simulated Safe Demo Checkout</span>
              </small>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CartPage;
