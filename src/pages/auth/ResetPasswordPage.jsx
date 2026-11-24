import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/authService';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Password reset token is missing.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!._-]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must contain at least 8 characters, with at least one uppercase letter, one lowercase letter, one number, and one special character (@#$%^&+=!._-).');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="bg-white rounded-5 p-4 p-md-5 border shadow-sm text-center">

            <div className="tw-logo mx-auto mb-2">
              <div className="tw-logo-icon">
                <Sparkles size={20} />
              </div>
              <span><span className="toy">Toy</span><span className="world">World</span></span>
            </div>

            <h2 className="fw-bolder h4 mb-2">Create New Password</h2>
            <p className="text-muted small mb-4">
              Enter your secure new password below to regain access to your OO Toys account.
            </p>

            {error && (
              <div className="alert alert-danger py-2 px-3 small rounded-4 d-flex align-items-center gap-2 mb-3 text-start">
                <AlertCircle size={16} className="text-danger flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success ? (
              <div className="p-4 rounded-4 bg-success-subtle text-success text-center mb-4 border border-success">
                <CheckCircle2 size={40} className="mx-auto mb-2" />
                <h6 className="fw-bold mb-1">Password Reset Successfully!</h6>
                <p className="small text-muted mb-0">
                  Your password has been securely updated. Redirecting to sign in...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="text-start mb-4">
                {!searchParams.get('token') && (
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Recovery Token</label>
                    <input
                      type="text"
                      className="form-control rounded-pill"
                      placeholder="Paste your reset token"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">New Password *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 rounded-start-pill">
                      <Lock size={16} className="text-muted" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control border-start-0 border-end-0"
                      placeholder="At least 8 chars, 1 uppercase, 1 special"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="input-group-text bg-light border-start-0 rounded-end-pill"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} className="text-muted" /> : <Eye size={16} className="text-muted" />}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted">Confirm New Password *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 rounded-start-pill">
                      <Lock size={16} className="text-muted" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control rounded-end-pill border-start-0"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-tw-primary w-100 py-3 rounded-pill fw-bold"
                  disabled={loading}
                >
                  {loading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </form>
            )}

            <div>
              <Link to="/login" className="text-primary text-decoration-none small fw-bold d-inline-flex align-items-center gap-1">
                <ArrowLeft size={16} />
                <span>Back to Sign In</span>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

