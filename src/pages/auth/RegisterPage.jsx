import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, Phone, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    pincode: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const { register, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || new URLSearchParams(location.search).get('redirect') || '/account';

  const handleGoogleSignUp = async () => {
    try {
      const res = await loginWithGoogle(null, 'new.parent@gmail.com');
      if (res.success) {
        navigate(redirectPath);
      } else {
        setError(res.error || 'Google Sign-up failed');
      }
    } catch (err) {
      setError(err.message || 'Google OAuth failed');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in required fields.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    const pwdRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!._-]).*$/;
    if (!pwdRegex.test(formData.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@#$%^&+=!._-).');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const res = await register(formData);
    if (res.success) {
      navigate(redirectPath);
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-9 col-lg-6">
          <div className="bg-white rounded-5 p-4 p-md-5 border shadow-sm">

            <div className="text-center mb-4">
              <div className="tw-logo mx-auto mb-2">
                <div className="tw-logo-icon">
                  <Sparkles size={20} />
                </div>
                <span><span className="toy">Toy</span><span className="world">World</span></span>
              </div>
              <h2 className="fw-bolder h4 mb-1">Create Parent Account 🎈</h2>
              <p className="text-muted small">Join OO Toys for discounts, wishlists, and order tracking</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small mb-3">
                {error}
              </div>
            )}

            {/* Primary Google OAuth Sign Up */}
            <button
              type="button"
              className="btn w-100 py-3 rounded-pill border d-flex align-items-center justify-content-center gap-3 fw-bold mb-3 shadow-sm bg-white text-dark"
              style={{ borderColor: '#dadce0', fontSize: '0.95rem' }}
              onClick={handleGoogleSignUp}
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.96 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Sign Up with Google</span>
            </button>

            <div className="d-flex align-items-center my-3 text-muted">
              <hr className="flex-grow-1" />
              <span className="px-3 small text-uppercase fw-bold text-secondary" style={{ fontSize: '0.72rem' }}>
                or register with email
              </span>
              <hr className="flex-grow-1" />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-12">
                  <label className="form-label small fw-bold text-muted">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control rounded-pill"
                    placeholder="e.g. Ananya Patel"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control rounded-pill"
                    placeholder="ananya@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control rounded-pill"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold text-muted">Delivery Address (Optional)</label>
                  <input
                    type="text"
                    name="street"
                    className="form-control rounded-pill"
                    placeholder="Street Address, Apartment / Flat"
                    value={formData.street}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">City</label>
                  <input
                    type="text"
                    name="city"
                    className="form-control rounded-pill"
                    placeholder="Bengaluru"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">PIN Code</label>
                  <input
                    type="text"
                    name="pincode"
                    className="form-control rounded-pill"
                    placeholder="560001"
                    value={formData.pincode}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Password *</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control rounded-pill"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control rounded-pill"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 mt-1">
                  <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                    Password must be at least 8 characters and include uppercase, lowercase, number, and special character (e.g. <code>Parent@123</code>).
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-tw-primary w-100 py-3 rounded-pill fw-bold mb-3"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Register Account'}
              </button>
            </form>

            <div className="text-center small text-muted">
              Already have an account?{' '}
              <Link to="/login" className="fw-bold text-primary text-decoration-none">
                Sign In
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
