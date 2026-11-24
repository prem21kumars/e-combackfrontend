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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { authService } from '../../services/authService';
import { customerService } from '../../services/customerService';

export const ProfilePage = () => {
  const { user, isLoggedIn, updateProfile, logout, isAdmin, demoLoginCustomer } = useAuth();
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

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
