import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle,
  Heart
} from 'lucide-react';
import { CATEGORIES } from '../../data/categories';

export const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newsletterEmail || !emailRegex.test(newsletterEmail)) {
      setNewsletterError('Please provide a valid email address.');
      return;
    }
    setNewsletterError('');
    setNewsletterSubscribed(true);
  };

  return (
    <footer className="bg-white border-top mt-5 pt-5 pb-4">
      {/* Trust Highlights Section */}
      <div className="container pb-5 border-bottom">
        <div className="row g-4 text-center text-md-start">
          <div className="col-6 col-md-3">
            <div className="d-flex flex-column flex-md-row align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center p-3"
                style={{ background: '#e0f2fe', color: '#0284c7' }}
              >
                <Truck size={28} />
              </div>
              <div>
                <h6 className="mb-0 fw-bold">Superfast Shipping</h6>
                <small className="text-muted">Free on orders above ₹999</small>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="d-flex flex-column flex-md-row align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center p-3"
                style={{ background: '#d1fae5', color: '#10b981' }}
              >
                <ShieldCheck size={28} />
              </div>
              <div>
                <h6 className="mb-0 fw-bold">Child Safe Certified</h6>
                <small className="text-muted">100% Non-toxic & BPA free</small>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="d-flex flex-column flex-md-row align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center p-3"
                style={{ background: '#ffe3e3', color: '#ff6b6b' }}
              >
                <RotateCcw size={28} />
              </div>
              <div>
                <h6 className="mb-0 fw-bold">Easy 7-Day Returns</h6>
                <small className="text-muted">Hassle-free replacement</small>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="d-flex flex-column flex-md-row align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center p-3"
                style={{ background: '#fef3c7', color: '#d97706' }}
              >
                <Sparkles size={28} />
              </div>
              <div>
                <h6 className="mb-0 fw-bold">100% Authentic Toys</h6>
                <small className="text-muted">Direct from certified makers</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="container py-5">
        <div className="row g-4">

          {/* Brand Info */}
          <div className="col-lg-4 col-md-6">
            <Link to="/" className="tw-logo text-decoration-none mb-3 d-inline-block">
              <div className="tw-logo-icon">
                <Sparkles size={20} />
              </div>
              <span><span className="toy">OO</span><span className="world">Toys</span></span>
            </Link>
            <p className="text-muted small pe-lg-3">
              OO Toys is a joyful wonderland bringing smiles, creativity, and educational magic to kids of all ages. Crafted with love for curious young dreamers.
            </p>
            <div className="d-flex flex-column gap-2 text-muted small mt-3">
              <div className="d-flex align-items-center gap-2">
                <MapPin size={16} className="text-primary flex-shrink-0" />
                <span>108/1C, Periyar Nagar, Vellapalayam, Pollachi</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Phone size={16} className="text-primary flex-shrink-0" />
                <span>+91 90428 70071 / 8610059694 -TOYS (Mon-Sat, 9AM-8PM)</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Mail size={16} className="text-primary flex-shrink-0" />
                <span>ootoysinfo@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold mb-3">Popular Categories</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-muted">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/categories/${cat.slug}`} className="hover-primary">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold mb-3">Customer Hub</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-muted">
              <li><Link to="/products" className="hover-primary">Browse All Toys</Link></li>
              <li><Link to="/cart" className="hover-primary">Shopping Cart</Link></li>
              <li><Link to="/wishlist" className="hover-primary">My Wishlist</Link></li>
              <li><Link to="/account/orders" className="hover-primary">Track Order</Link></li>
              <li><Link to="/account" className="hover-primary">My Profile</Link></li>
              <li><Link to="/admin" className="hover-primary text-purple fw-bold">Admin Demo</Link></li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="col-lg-4 col-md-6">
            <div className="p-4 rounded-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <h6 className="fw-bold mb-1">Join the OO Toys Family! 🎉</h6>
              <p className="text-muted small mb-3">
                Subscribe to get surprise coupons, secret toy releases, and creative parenting play guides.
              </p>

              {newsletterSubscribed ? (
                <div className="alert alert-success py-2 px-3 small d-flex align-items-center gap-2 mb-0">
                  <CheckCircle size={18} />
                  <span>Yay! You're subscribed for toy discounts!</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit}>
                  <div className="input-group mb-2">
                    <input
                      type="email"
                      className={`form-control rounded-start-pill ${newsletterError ? 'is-invalid' : ''}`}
                      placeholder="Enter your email address..."
                      value={newsletterEmail}
                      onChange={(e) => {
                        setNewsletterEmail(e.target.value);
                        if (newsletterError) setNewsletterError('');
                      }}
                      style={{ fontSize: '0.9rem' }}
                    />
                    <button type="submit" className="btn btn-tw-secondary rounded-end-pill px-3">
                      Join
                    </button>
                  </div>
                  {newsletterError && (
                    <small className="text-danger d-block mb-1">{newsletterError}</small>
                  )}
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                    * We strictly respect your privacy. Unsubscribe anytime.
                  </small>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Demo Architecture Notice & Copyright */}
      <div className="container pt-4 border-top">
        <div className="row align-items-center g-3">
          <div className="col-md-7 text-center text-md-start">
            <div className="badge bg-light text-dark border px-3 py-2 mb-1">
              ✨ Frontend-Only Architecture Phase
            </div>
            <p className="text-muted small mb-0 mt-1">
              &copy; {new Date().getFullYear()} OOToys.
            </p>
          </div>
          <div className="col-md-5 text-center text-md-end">
            <div className="d-flex align-items-center justify-content-center justify-content-md-end gap-2 text-muted small">
              <span>Made with</span>
              <Heart size={16} className="text-danger" fill="#ff6b6b" />
              <span>for happy kids worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
