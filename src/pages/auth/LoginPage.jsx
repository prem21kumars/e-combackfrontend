import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Sparkles, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation();
  const [error, setError] = useState(location.state?.error || '');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  const { login, loginWithGoogle, demoLoginCustomer, demoLoginAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = location.state?.from || searchParams.get('redirect') || '/';
  const isFromCheckout = redirectPath === '/checkout' || location.state?.from === '/checkout';

  // Manual Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your email and password.');
      return;
    }
    setError('');
    const res = await login(email, password);
    if (res.success) {
      if (res.user?.role === 'admin' && (!location.state?.from || location.state?.from === '/')) {
        navigate('/admin');
      } else {
        navigate(redirectPath);
      }
    } else {
      setError(res.error || 'Failed to login. Please check your credentials.');
    }
  };

  // Google OAuth Flow
  const handleGoogleSignIn = async (providedEmail = null) => {
    setGoogleLoading(true);
    setError('');
    try {
      // Use provided email or instant one-click Google OAuth simulation
      const res = await loginWithGoogle(null, providedEmail || 'alex.taylor@gmail.com');
      if (res.success) {
        setShowGoogleModal(false);
        if (res.user?.role === 'admin' && (!location.state?.from || location.state?.from === '/')) {
          navigate('/admin');
        } else {
          navigate(redirectPath);
        }
      } else {
        setError(res.error || 'Google authentication failed');
      }
    } catch (err) {
      setError(err.message || 'Google OAuth failed to connect');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Quick Demo Access Helpers
  const handleQuickCustomer = async () => {
    setError('');
    const res = await demoLoginCustomer();
    if (res.success) {
      navigate(redirectPath);
    } else {
      setError(res.error || 'Customer demo login failed. Please check credentials.');
    }
  };

  const handleQuickAdmin = async () => {
    setError('');
    const res = await demoLoginAdmin();
    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.error || 'Admin demo login failed. Please check credentials.');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-5">
          <div className="bg-white rounded-5 p-4 p-md-5 border shadow-sm">

            {/* Brand Header */}
            <div className="text-center mb-4">
              <div className="tw-logo mx-auto mb-2">
                <div className="tw-logo-icon">
                  <Sparkles size={20} />
                </div>
                <span><span className="toy">Toy</span><span className="world">World</span></span>
              </div>
              <h2 className="fw-bolder h4 mb-1">Welcome Back! 👋</h2>
              <p className="text-muted small">Sign in to track orders, manage addresses, and view your wishlist</p>
            </div>

            {/* Checkout Required Notice */}
            {isFromCheckout && (
              <div className="alert alert-info py-2 px-3 small d-flex align-items-center gap-2 mb-3 rounded-3 border-info">
                <Lock size={16} className="text-info flex-shrink-0" />
                <span>Please sign in or register to complete your order checkout.</span>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3 rounded-3">
                <AlertCircle size={16} className="text-danger flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. PRIMARY: Official Google OAuth 2.0 Sign In Button */}
            <button
              type="button"
              className="btn w-100 py-3 rounded-pill border d-flex align-items-center justify-content-center gap-3 fw-bold mb-3 shadow-sm hover-shadow transition-all bg-white text-dark"
              style={{
                borderColor: '#dadce0',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
              }}
              onClick={() => handleGoogleSignIn()}
              disabled={loading || googleLoading}
            >
              {googleLoading ? (
                <div className="spinner-border spinner-border-sm text-primary" role="status" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.96 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              )}
              <span>{googleLoading ? 'Connecting to Google OAuth...' : 'Continue with Google'}</span>
            </button>

            {/* Custom Google Account prompt toggle */}
            <div className="text-center mb-3">
              <button
                type="button"
                className="btn btn-link p-0 text-muted small text-decoration-none"
                style={{ fontSize: '0.8rem' }}
                onClick={() => setShowGoogleModal(!showGoogleModal)}
              >
                {showGoogleModal ? '▲ Close custom Google email' : '▼ Sign in with specific Google Account'}
              </button>
            </div>

            {/* Optional Custom Google Account input */}
            {showGoogleModal && (
              <div className="p-3 mb-3 rounded-4 bg-light border">
                <label className="form-label small fw-bold text-muted mb-1">Your Google Email:</label>
                <div className="input-group mb-2">
                  <input
                    type="email"
                    className="form-control form-control-sm rounded-start-pill"
                    placeholder="yourname@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-primary rounded-end-pill px-3 fw-semibold"
                    onClick={() => handleGoogleSignIn(customGoogleEmail || 'sarah.jenkins@gmail.com')}
                    disabled={googleLoading}
                  >
                    OAuth Connect
                  </button>
                </div>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Sends OpenID Connect token to Spring Boot backend <code>/api/v1/auth/google</code>
                </small>
              </div>
            )}

            {/* Divider */}
            <div className="d-flex align-items-center my-3 text-muted">
              <hr className="flex-grow-1" />
              <span className="px-3 small text-uppercase fw-bold text-secondary" style={{ fontSize: '0.72rem' }}>
                or sign in with email
              </span>
              <hr className="flex-grow-1" />
            </div>

            {/* 2. Manual Email & Password Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 rounded-start-pill">
                    <Mail size={16} className="text-muted" />
                  </span>
                  <input
                    type="email"
                    className="form-control rounded-end-pill border-start-0"
                    placeholder="parent@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <label className="form-label small fw-bold text-muted">Password</label>
                  <Link to="/forgot-password" className="small text-primary text-decoration-none">
                    Forgot Password?
                  </Link>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 rounded-start-pill">
                    <Lock size={16} className="text-muted" />
                  </span>
                  <input
                    type="password"
                    className="form-control rounded-end-pill border-start-0"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-tw-primary w-100 py-3 rounded-pill fw-bold mb-3"
                disabled={loading}
              >
                {loading ? 'Authenticating with Backend...' : 'Sign In'}
              </button>
            </form>

            {/* Registration link */}
            <div className="text-center small text-muted mb-4">
              Don't have an account?{' '}
              <Link to="/register" state={{ from: redirectPath }} className="fw-bold text-primary text-decoration-none">
                Register Free
              </Link>
            </div>

            {/* Subtle Developer Quick-Switch */}
            <div className="pt-3 border-top text-center">
              <div className="text-muted small mb-2" style={{ fontSize: '0.75rem' }}>
                Quick Test Credentials:
              </div>
              <div className="d-flex justify-content-center gap-2 mb-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1"
                  style={{ fontSize: '0.75rem' }}
                  onClick={handleQuickCustomer}
                  disabled={loading || googleLoading}
                >
                  <UserCheck size={13} />
                  <span>Customer (Priya)</span>
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1"
                  style={{ fontSize: '0.75rem' }}
                  onClick={handleQuickAdmin}
                  disabled={loading || googleLoading}
                >
                  <ShieldCheck size={13} />
                  <span>Admin Console</span>
                </button>
              </div>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                Admin: <code>admin@ootoys.com</code> / <code>Admin@123456</code><br />
                Customer: <code>priya@example.com</code> / <code>Customer@123456</code>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
