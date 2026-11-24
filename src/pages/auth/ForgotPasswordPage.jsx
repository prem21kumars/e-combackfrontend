import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    try {
      const res = await authService.forgotPassword(email);
      setSubmitted(true);
      if (res.token) {
        setResetToken(res.token);
      }
    } catch (err) {
      setError(err.message || 'Error processing request');
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

            <h2 className="fw-bolder h4 mb-2">Reset Password</h2>
            <p className="text-muted small mb-4">
              Enter the email associated with your OO Toys account to receive recovery instructions.
            </p>

            {error && (
              <div className="alert alert-danger py-2 px-3 small rounded-pill d-flex align-items-center gap-2 mb-3">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {submitted ? (
              <div className="p-4 rounded-4 bg-success-subtle text-success text-center mb-4 border border-success">
                <CheckCircle2 size={40} className="mx-auto mb-2" />
                <h6 className="fw-bold mb-1">Recovery Link Generated!</h6>
                <p className="small text-muted mb-3">
                  Instructions for <strong>{email}</strong> have been processed by the server.
                </p>
                {resetToken && (
                  <div className="mb-3">
                    <Link
                      to={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                      className="btn btn-tw-primary btn-sm rounded-pill px-4 py-2 d-inline-flex align-items-center gap-1"
                    >
                      <span>Proceed to Set New Password</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="text-start mb-4">
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

                <button 
                  type="submit" 
                  className="btn btn-tw-primary w-100 py-3 rounded-pill fw-bold"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Send Recovery Link'}
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

export default ForgotPasswordPage;
