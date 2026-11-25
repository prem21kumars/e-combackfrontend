import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  Heart, 
  ShieldCheck, 
  LogOut, 
  Check, 
  Plus,
  Trash2,
  Edit2,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  QrCode,
  Key,
  Copy,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { authService } from '../../services/authService';
import { customerService } from '../../services/customerService';

export const ProfilePage = () => {
  const { user, isLoggedIn, updateProfile, logout, isAdmin, demoLoginCustomer, setMfaStatus } = useAuth();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [feedback, setFeedback] = useState('');

  // Address state
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    title: 'Home',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  // Two-Factor Authentication (2FA) state
  const [isMfaActive, setIsMfaActive] = useState(!!user?.mfaEnabled);
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [mfaSetupData, setMfaSetupData] = useState(null);
  const [mfaCodeInput, setMfaCodeInput] = useState('');
  const [disableCodeInput, setDisableCodeInput] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState('');
  const [mfaFeedback, setMfaFeedback] = useState(null);
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedRecovery, setCopiedRecovery] = useState(false);

  useEffect(() => {
    if (user) {
      setIsMfaActive(!!user.mfaEnabled);
    }
  }, [user]);

  useEffect(() => {
    if (isLoggedIn) {
      customerService.getAddresses()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setAddresses(data.map((a) => ({
              id: a.id,
              title: a.addressType || 'Home',
              street: a.addressLine1 + (a.addressLine2 ? ', ' + a.addressLine2 : ''),
              city: a.city,
              state: a.state,
              pincode: a.postalCode,
              isDefault: a.defaultShipping,
            })));
          }
        })
        .catch(() => {});
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="container py-5 text-center">
        <div className="bg-white rounded-5 p-5 border shadow-sm mx-auto" style={{ maxWidth: '480px' }}>
          <User size={48} className="text-primary mb-3" />
          <h3 className="fw-bold mb-2">Sign In Required</h3>
          <p className="text-muted small mb-4">You need to sign in to view and manage your profile details.</p>
          <div className="d-grid gap-2">
            <Link to="/login" className="btn btn-tw-primary rounded-pill">
              Sign In to Account
            </Link>
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill btn-sm"
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
      </div>
    );
  }

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const res = await updateProfile({
      name: formData.name,
      phone: formData.phone,
    });
    if (res.success) {
      setFeedback('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.street || !newAddr.city) return;
    try {
      const created = await customerService.createAddress({
        recipientName: user?.name || 'Customer',
        phoneNumber: user?.phone || '9876543210',
        addressLine1: newAddr.street,
        city: newAddr.city,
        state: newAddr.state || 'Karnataka',
        postalCode: newAddr.pincode || '560001',
        country: 'India',
        addressType: 'HOME',
        defaultShipping: addresses.length === 0,
        defaultBilling: addresses.length === 0,
      });
      const newCard = {
        id: created?.id || `addr_${Date.now()}`,
        title: newAddr.title || 'Home',
        street: newAddr.street,
        city: newAddr.city,
        state: newAddr.state,
        pincode: newAddr.pincode,
        isDefault: addresses.length === 0,
      };
      setAddresses([...addresses, newCard]);
    } catch (err) {
      const updated = [
        ...addresses,
        {
          ...newAddr,
          id: `addr_${Date.now()}`,
          isDefault: addresses.length === 0,
        },
      ];
      setAddresses(updated);
      await updateProfile({ addresses: updated });
    }
    setShowAddAddress(false);
    setNewAddr({ title: 'Home', street: '', city: '', state: '', pincode: '' });
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      if (typeof addrId === 'number' || !String(addrId).startsWith('addr_')) {
        await customerService.deleteAddress(addrId);
      }
    } catch (err) {}
    const updated = addresses.filter((a) => a.id !== addrId);
    setAddresses(updated);
    await updateProfile({ addresses: updated });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (newPassword !== confirmNewPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!._-]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setPwdError('New password must contain at least 8 characters, with 1 uppercase, 1 lowercase, 1 number, and 1 special symbol (@#$%^&+=!._-).');
      return;
    }

    setPwdLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setPwdSuccess('Password changed successfully in backend database!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPwdError(err.message || 'Failed to change password');
    } finally {
      setPwdLoading(false);
    }
  };

  // MFA Handlers
  const handleStartMfaSetup = async () => {
    setMfaLoading(true);
    setMfaError('');
    try {
      const data = await authService.initiateMfaSetup();
      setMfaSetupData(data);
      setMfaCodeInput('');
      setRecoveryCodes([]);
      setShowMfaModal(true);
    } catch (err) {
      setMfaFeedback({ type: 'error', text: err.message || 'Failed to initiate 2FA setup' });
    } finally {
      setMfaLoading(false);
    }
  };

  const handleActivateMfa = async (e) => {
    e.preventDefault();
    if (!mfaCodeInput || mfaCodeInput.trim().length !== 6) {
      setMfaError('Please enter a 6-digit code from Google Authenticator.');
      return;
    }
    setMfaLoading(true);
    setMfaError('');
    try {
      const codes = await authService.activateMfa(mfaCodeInput.trim());
      setRecoveryCodes(codes || []);
      setIsMfaActive(true);
      setMfaStatus(true);
      setMfaFeedback({ type: 'success', text: 'Google Authenticator 2FA activated successfully!' });
    } catch (err) {
      setMfaError(err.message || 'Verification failed. Incorrect 6-digit code.');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisableMfa = async (e) => {
    e.preventDefault();
    if (!disableCodeInput || disableCodeInput.trim().length !== 6) {
      setMfaError('Please enter the 6-digit code from your app.');
      return;
    }
    setMfaLoading(true);
    setMfaError('');
    try {
      await authService.disableMfa(disableCodeInput.trim());
      setIsMfaActive(false);
      setMfaStatus(false);
      setShowDisableModal(false);
      setDisableCodeInput('');
      setMfaFeedback({ type: 'success', text: 'Two-Factor Authentication has been disabled.' });
    } catch (err) {
      setMfaError(err.message || 'Failed to disable. Invalid 6-digit code.');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="container py-4">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item active">Customer Profile</li>
        </ol>
      </nav>

      <div className="row g-4">
        
        {/* Left Side: Profile Summary Card */}
        <div className="col-lg-4">
          <div className="bg-white rounded-5 border p-4 shadow-sm text-center mb-4">
            <div 
              className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center text-white display-6 fw-bold"
              style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #0284c7, #f97316)' }}
            >
              {user.name.charAt(0)}
            </div>
            <h4 className="fw-bolder mb-1">{user.name}</h4>
            <p className="text-muted small mb-3">{user.email}</p>
            
            <div className="d-flex justify-content-center gap-2 mb-4">
              <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1">
                Toy Explorer
              </span>
              {isAdmin && (
                <span className="badge bg-purple rounded-pill px-3 py-1 text-white" style={{ background: '#7c3aed' }}>
                  Admin
                </span>
              )}
            </div>

            <div className="d-grid gap-2 border-top pt-3">
              <Link 
                to="/account/orders" 
                className="btn btn-light rounded-pill d-flex align-items-center justify-content-between px-3 py-2 text-dark"
              >
                <div className="d-flex align-items-center gap-2">
                  <Package size={18} className="text-primary" />
                  <span className="small fw-semibold">My Orders</span>
                </div>
                <span className="text-muted small">&rarr;</span>
              </Link>

              <Link 
                to="/wishlist" 
                className="btn btn-light rounded-pill d-flex align-items-center justify-content-between px-3 py-2 text-dark"
              >
                <div className="d-flex align-items-center gap-2">
                  <Heart size={18} className="text-danger" />
                  <span className="small fw-semibold">Saved Wishlist</span>
                </div>
                <span className="badge bg-danger rounded-pill">{wishlistCount}</span>
              </Link>

              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="btn btn-light rounded-pill d-flex align-items-center justify-content-between px-3 py-2 text-purple"
                >
                  <div className="d-flex align-items-center gap-2">
                    <ShieldCheck size={18} className="text-purple" />
                    <span className="small fw-bold">Admin Dashboard</span>
                  </div>
                  <span className="text-muted small">&rarr;</span>
                </Link>
              )}

              <button
                type="button"
                className="btn btn-outline-danger btn-sm rounded-pill mt-2 d-flex align-items-center justify-content-center gap-2"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Profile Details & Addresses */}
        <div className="col-lg-8">
          
          {feedback && (
            <div className="alert alert-success py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
              <Check size={18} />
              <span>{feedback}</span>
            </div>
          )}

          {/* Personal Info Box */}
          <div className="bg-white rounded-4 border p-4 shadow-sm mb-4">
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
              <h5 className="fw-bolder mb-0">Personal Information</h5>
              {!isEditing ? (
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm rounded-pill d-flex align-items-center gap-1"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-light btn-sm rounded-pill"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleProfileSave}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Full Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-pill"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control form-control-sm rounded-pill"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-tw-primary btn-sm rounded-pill px-4">
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="row g-3 text-muted small">
                <div className="col-sm-6">
                  <span className="d-block fw-bold text-dark">Full Name:</span>
                  <span>{user.name}</span>
                </div>
                <div className="col-sm-6">
                  <span className="d-block fw-bold text-dark">Email Address:</span>
                  <span>{user.email}</span>
                </div>
                <div className="col-sm-6">
                  <span className="d-block fw-bold text-dark">Contact Phone:</span>
                  <span>{user.phone || 'Not provided'}</span>
                </div>
                <div className="col-sm-6">
                  <span className="d-block fw-bold text-dark">Account Type:</span>
                  <span className="text-capitalize">{user.role || 'Customer'} (Demo Mode)</span>
                </div>
              </div>
            )}
          </div>

          {/* Saved Delivery Addresses */}
          <div className="bg-white rounded-4 border p-4 shadow-sm">
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
              <h5 className="fw-bolder mb-0">Saved Delivery Addresses</h5>
              <button
                type="button"
                className="btn btn-tw-primary btn-sm rounded-pill d-flex align-items-center gap-1"
                onClick={() => setShowAddAddress(!showAddAddress)}
              >
                <Plus size={14} />
                <span>Add Address</span>
              </button>
            </div>

            {showAddAddress && (
              <form onSubmit={handleAddAddress} className="p-3 rounded-4 bg-light mb-4 border">
                <h6 className="fw-bold mb-3">Add New Delivery Address</h6>
                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Address Label</label>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-pill"
                      placeholder="e.g. Home, Office"
                      value={newAddr.title}
                      onChange={(e) => setNewAddr({ ...newAddr, title: e.target.value })}
                    />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label small fw-bold">Street Address</label>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-pill"
                      placeholder="House/Flat No, Street, Landmark"
                      value={newAddr.street}
                      onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">City</label>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-pill"
                      placeholder="e.g. Bengaluru"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">State</label>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-pill"
                      placeholder="Karnataka"
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">PIN Code</label>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-pill"
                      placeholder="560001"
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    />
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-tw-primary btn-sm rounded-pill px-3">
                    Save Address
                  </button>
                  <button
                    type="button"
                    className="btn btn-light btn-sm rounded-pill"
                    onClick={() => setShowAddAddress(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {addresses.length === 0 ? (
              <p className="text-muted small mb-0">No saved addresses yet. Add one for rapid 1-click checkout!</p>
            ) : (
              <div className="row g-3">
                {addresses.map((addr) => (
                  <div key={addr.id} className="col-md-6">
                    <div className="p-3 rounded-4 border bg-light h-100 position-relative">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="badge bg-secondary rounded-pill">{addr.title || 'Home'}</span>
                        <button
                          type="button"
                          className="btn btn-link text-danger p-0"
                          onClick={() => handleDeleteAddress(addr.id)}
                          title="Delete address"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="text-dark fw-bold small">{addr.street}</div>
                      <div className="text-muted small">
                        {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.pincode ? `- ${addr.pincode}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Security & Password Settings */}
          <div className="bg-white rounded-4 border p-4 shadow-sm mt-4">
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
              <div className="d-flex align-items-center gap-2">
                <Lock size={18} className="text-primary" />
                <h5 className="fw-bolder mb-0">Security & Password</h5>
              </div>
              <span className="badge bg-light text-muted border">Direct Backend Sync</span>
            </div>

            {pwdSuccess && (
              <div className="alert alert-success py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                <Check size={16} />
                <span>{pwdSuccess}</span>
              </div>
            )}

            {pwdError && (
              <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                <AlertCircle size={16} />
                <span>{pwdError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">Current Password</label>
                  <div className="input-group input-group-sm">
                    <input
                      type={showCurrentPwd ? 'text' : 'password'}
                      className="form-control rounded-start-pill"
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-end-pill px-2"
                      onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                    >
                      {showCurrentPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">New Password</label>
                  <div className="input-group input-group-sm">
                    <input
                      type={showNewPwd ? 'text' : 'password'}
                      className="form-control rounded-start-pill"
                      placeholder="Min 8 chars, 1 uppercase, symbol"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-end-pill px-2"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                    >
                      {showNewPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control form-control-sm rounded-pill"
                    placeholder="Repeat new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={pwdLoading}
                className="btn btn-tw-primary btn-sm rounded-pill px-4"
              >
                {pwdLoading ? 'Updating Password...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* Two-Factor Authentication (Google Authenticator TOTP) */}
          <div className="bg-white rounded-4 border p-4 shadow-sm mt-4">
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
              <div className="d-flex align-items-center gap-2">
                <ShieldCheck size={20} className={isMfaActive ? 'text-success' : 'text-primary'} />
                <h5 className="fw-bolder mb-0">Two-Factor Authentication (2FA)</h5>
              </div>
              {isMfaActive ? (
                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1">
                  Active &amp; Protected
                </span>
              ) : (
                <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-3 py-1">
                  Not Enabled
                </span>
              )}
            </div>

            <p className="text-muted small mb-3">
              Enhance account security using <strong>Google Authenticator</strong> (or any TOTP app). When active, you will be prompted for a 6-digit verification code generated on your phone whenever you sign in.
            </p>

            {mfaFeedback && (
              <div
                className={`alert ${
                  mfaFeedback.type === 'error' ? 'alert-danger' : 'alert-success'
                } py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2`}
              >
                {mfaFeedback.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
                <span>{mfaFeedback.text}</span>
              </div>
            )}

            {!isMfaActive ? (
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 rounded-4 bg-light border">
                <div>
                  <div className="fw-bold small text-dark mb-1 d-flex align-items-center gap-2">
                    <QrCode size={16} className="text-primary" />
                    <span>Set up Google Authenticator (TOTP)</span>
                  </div>
                  <div className="text-muted small">
                    Scan a QR code on your mobile phone and link your authenticator app.
                  </div>
                </div>
                <button
                  type="button"
                  disabled={mfaLoading}
                  onClick={handleStartMfaSetup}
                  className="btn btn-tw-primary btn-sm rounded-pill px-4 shadow-sm"
                >
                  {mfaLoading ? 'Generating QR...' : 'Enable Google 2FA'}
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-4 bg-success-subtle bg-opacity-10 border border-success-subtle">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div>
                    <div className="fw-bold small text-success d-flex align-items-center gap-2">
                      <Check size={16} />
                      Google Authenticator is actively securing this account
                    </div>
                    <div className="text-muted small mt-1">
                      Your login requires entering the 6-digit code from Google Authenticator.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMfaError('');
                      setDisableCodeInput('');
                      setShowDisableModal(true);
                    }}
                    className="btn btn-outline-danger btn-sm rounded-pill px-3"
                  >
                    Disable 2FA
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 2FA Setup Modal */}
      {showMfaModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 1050 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '520px' }}>
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom pb-3">
                <div className="d-flex align-items-center gap-2">
                  <ShieldCheck size={22} className="text-primary" />
                  <h5 className="modal-title fw-bold">Set up Google Authenticator</h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowMfaModal(false)}
                />
              </div>

              <div className="modal-body p-4">
                {mfaError && (
                  <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{mfaError}</span>
                  </div>
                )}

                {recoveryCodes.length === 0 ? (
                  <>
                    <div className="text-center mb-3">
                      <p className="text-muted small mb-3">
                        <strong>Step 1:</strong> Open <strong>Google Authenticator</strong> on your phone and scan this QR code:
                      </p>
                      {mfaSetupData?.qrCodeDataUri ? (
                        <div className="d-inline-block p-2 bg-white rounded-3 border shadow-sm">
                          <img
                            src={mfaSetupData.qrCodeDataUri}
                            alt="Google Authenticator QR Code"
                            style={{ width: '190px', height: '190px', display: 'block' }}
                          />
                        </div>
                      ) : (
                        <div className="spinner-border text-primary my-4" />
                      )}
                    </div>

                    <div className="bg-light p-3 rounded-3 border mb-4">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="small text-muted fw-bold">Can't scan? Enter key manually:</span>
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 text-decoration-none d-flex align-items-center gap-1"
                          onClick={() => {
                            if (mfaSetupData?.secretKey) {
                              navigator.clipboard.writeText(mfaSetupData.secretKey);
                              setCopiedKey(true);
                              setTimeout(() => setCopiedKey(false), 2000);
                            }
                          }}
                        >
                          <Copy size={13} />
                          <span className="small">{copiedKey ? 'Copied!' : 'Copy Key'}</span>
                        </button>
                      </div>
                      <code className="text-primary fw-bold text-break user-select-all" style={{ fontSize: '0.85rem' }}>
                        {mfaSetupData?.secretKey || 'Generating...'}
                      </code>
                    </div>

                    <form onSubmit={handleActivateMfa}>
                      <div className="mb-3">
                        <label className="form-label small fw-bold">
                          <strong>Step 2:</strong> Enter the 6-digit code shown in Google Authenticator:
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          autoFocus
                          required
                          className="form-control form-control-lg text-center rounded-pill fw-bold"
                          style={{ letterSpacing: '0.4rem', fontSize: '1.4rem' }}
                          placeholder="123456"
                          value={mfaCodeInput}
                          onChange={(e) => setMfaCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        />
                      </div>

                      <div className="d-grid gap-2">
                        <button
                          type="submit"
                          disabled={mfaLoading || mfaCodeInput.length !== 6}
                          className="btn btn-tw-primary rounded-pill py-2 fw-bold"
                        >
                          {mfaLoading ? 'Verifying...' : 'Verify & Activate 2FA'}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div>
                    <div className="text-center mb-3">
                      <div className="rounded-circle bg-success-subtle text-success d-inline-flex p-3 mb-2">
                        <Check size={36} />
                      </div>
                      <h5 className="fw-bold text-success mb-1">2FA Activated Successfully!</h5>
                      <p className="text-muted small">
                        Save these emergency recovery codes in a safe place. If you ever lose access to your authenticator app, each code can be used once to sign in.
                      </p>
                    </div>

                    <div className="bg-light p-3 rounded-3 border mb-3">
                      <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
                        <span className="small fw-bold text-dark">One-Time Recovery Codes</span>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm rounded-pill px-2 py-0 d-flex align-items-center gap-1"
                          onClick={() => {
                            navigator.clipboard.writeText(recoveryCodes.join('\n'));
                            setCopiedRecovery(true);
                            setTimeout(() => setCopiedRecovery(false), 2000);
                          }}
                        >
                          <Copy size={12} />
                          <span style={{ fontSize: '0.75rem' }}>{copiedRecovery ? 'Copied All!' : 'Copy All'}</span>
                        </button>
                      </div>
                      <div className="row g-2 text-center">
                        {recoveryCodes.map((code, idx) => (
                          <div key={idx} className="col-6">
                            <div className="bg-white rounded border py-1 px-2 font-monospace small fw-bold text-dark">
                              {code}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-tw-primary w-100 rounded-pill py-2"
                      onClick={() => setShowMfaModal(false)}
                    >
                      Done &amp; Saved Codes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disable 2FA Confirmation Modal */}
      {showDisableModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 1050 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom pb-3">
                <div className="d-flex align-items-center gap-2">
                  <ShieldAlert size={22} className="text-danger" />
                  <h5 className="modal-title fw-bold">Disable 2FA</h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDisableModal(false)}
                />
              </div>

              <form onSubmit={handleDisableMfa} className="modal-body p-4">
                <p className="text-muted small mb-3">
                  To disable Two-Factor Authentication, please enter the current 6-digit code from Google Authenticator to confirm your identity.
                </p>

                {mfaError && (
                  <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{mfaError}</span>
                  </div>
                )}

                <div className="mb-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoFocus
                    required
                    className="form-control form-control-lg text-center rounded-pill fw-bold"
                    style={{ letterSpacing: '0.4rem', fontSize: '1.4rem' }}
                    placeholder="123456"
                    value={disableCodeInput}
                    onChange={(e) => setDisableCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    disabled={mfaLoading || disableCodeInput.length !== 6}
                    className="btn btn-danger rounded-pill py-2 fw-bold"
                  >
                    {mfaLoading ? 'Disabling...' : 'Confirm & Disable 2FA'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-light rounded-pill py-2"
                    onClick={() => setShowDisableModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
