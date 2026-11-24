import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  LogOut,
  Package,
  Flame
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../data/categories';
import logoImg from '../../assets/Logo-removebg.png';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [ageDropdownOpen, setAgeDropdownOpen] = useState(false);

  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isLoggedIn, isAdmin, logout, demoLoginAdmin, demoLoginCustomer } = useAuth();

  const categoryTimeoutRef = useRef(null);
  const ageTimeoutRef = useRef(null);
  const categoryRef = useRef(null);
  const ageRef = useRef(null);

  const handleCategoryMouseEnter = () => {
    if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
    if (ageTimeoutRef.current) clearTimeout(ageTimeoutRef.current);
    setCategoryDropdownOpen(true);
    setAgeDropdownOpen(false);
  };

  const handleCategoryMouseLeave = () => {
    categoryTimeoutRef.current = setTimeout(() => {
      setCategoryDropdownOpen(false);
    }, 250);
  };

  const handleAgeMouseEnter = () => {
    if (ageTimeoutRef.current) clearTimeout(ageTimeoutRef.current);
    if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
    setAgeDropdownOpen(true);
    setCategoryDropdownOpen(false);
  };

  const handleAgeMouseLeave = () => {
    ageTimeoutRef.current = setTimeout(() => {
      setAgeDropdownOpen(false);
    }, 250);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
      if (ageRef.current && !ageRef.current.contains(event.target)) {
        setAgeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
      if (ageTimeoutRef.current) clearTimeout(ageTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    setCategoryDropdownOpen(false);
    setAgeDropdownOpen(false);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const ageGroups = [
    { label: '0–2 Years', value: '0-2', desc: 'Infants & Toddlers' },
    { label: '3–5 Years', value: '3-5', desc: 'Preschool & Early Play' },
    { label: '6–8 Years', value: '6-8', desc: 'Primary Learners' },
    { label: '9+ Years', value: '9+', desc: 'Big Kids & Pre-teens' },
  ];

  return (
    <header className="sticky-top bg-white border-bottom shadow-sm">
      <div className="container py-2">
        <div className="d-flex align-items-center justify-content-between gap-3">

          {/* Logo */}
          <Link to="/" className="tw-logo text-decoration-none">
            <img
              src={logoImg}
              alt="Logo"
              className="tw-navbar-logo"
            />
          </Link>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="d-none d-md-flex align-items-center flex-grow-1 mx-4"
            style={{ maxWidth: '520px' }}
          >
            <div className="input-group">
              <input
                type="text"
                className="form-control rounded-start-pill border-2 border-primary border-opacity-25 px-3 py-2"
                placeholder="Search 1,000+ magical toys, lego, cars, robots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: '0.95rem' }}
              />
              <button
                type="submit"
                className="btn btn-tw-primary rounded-end-pill px-4"
                title="Search toys"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Right Action Icons */}
          <div className="d-flex align-items-center gap-2 gap-sm-3">

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="position-relative p-2 rounded-circle hover-bg-light text-dark d-flex align-items-center justify-content-center"
              title="Saved Wishlist"
              style={{ width: '42px', height: '42px', background: '#f8fafc' }}
            >
              <Heart size={22} className={wishlistCount > 0 ? 'text-danger' : 'text-secondary'} fill={wishlistCount > 0 ? '#ff6b6b' : 'none'} />
              {wishlistCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.7rem' }}>
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Link */}
            <Link
              to="/cart"
              className="position-relative p-2 rounded-circle text-dark d-flex align-items-center justify-content-center"
              title="View Cart"
              style={{ width: '42px', height: '42px', background: '#f0f9ff' }}
            >
              <ShoppingCart size={22} className="text-primary" />
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary" style={{ fontSize: '0.7rem' }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account Dropdown */}
            <div className="position-relative">
              <button
                type="button"
                className="btn btn-light rounded-pill d-flex align-items-center gap-2 border px-3 py-2"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{ fontSize: '0.9rem', fontWeight: '600' }}
              >
                <User size={18} className="text-primary" />
                <span className="d-none d-lg-inline">
                  {isLoggedIn ? user.name.split(' ')[0] : 'Account'}
                </span>
                <ChevronDown size={14} className="text-muted" />
              </button>

              {userDropdownOpen && (
                <div
                  className="position-absolute end-0 mt-2 py-2 bg-white rounded-4 shadow-lg border"
                  style={{ width: '250px', zIndex: 1050 }}
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  {isLoggedIn ? (
                    <>
                      <div className="px-3 py-2 border-bottom">
                        <div className="fw-bold text-dark">{user.name}</div>
                        <div className="text-muted small text-truncate">{user.email}</div>
                        <span className={`badge mt-1 ${isAdmin ? 'bg-purple' : 'bg-info'}`} style={{ fontSize: '0.72rem' }}>
                          {isAdmin ? 'Demo Administrator' : 'Toy Explorer'}
                        </span>
                      </div>
                      <Link
                        to="/account"
                        className="dropdown-item px-3 py-2 d-flex align-items-center gap-2"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <User size={16} className="text-muted" />
                        My Profile
                      </Link>
                      <Link
                        to="/account/orders"
                        className="dropdown-item px-3 py-2 d-flex align-items-center gap-2"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <Package size={16} className="text-muted" />
                        Order History
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="dropdown-item px-3 py-2 d-flex align-items-center gap-2 text-primary fw-bold"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <ShieldCheck size={16} />
                          Admin Dashboard
                        </Link>
                      )}
                      <div className="dropdown-divider my-1"></div>
                      <button
                        type="button"
                        className="dropdown-item px-3 py-2 text-danger d-flex align-items-center gap-2"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-2 border-bottom text-muted small">
                        Welcome to OO Toys Demo!
                      </div>
                      <Link
                        to="/login"
                        className="dropdown-item px-3 py-2 fw-bold text-primary"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        Sign In / Register
                      </Link>
                      <div className="dropdown-divider my-1"></div>
                      <div className="px-3 py-1 text-muted" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                        QUICK DEMO LOGINS:
                      </div>
                      <button
                        type="button"
                        className="dropdown-item px-3 py-1 small text-dark d-flex align-items-center justify-content-between"
                        onClick={async () => {
                          const res = await demoLoginCustomer();
                          setUserDropdownOpen(false);
                          if (res.success) {
                            navigate('/account');
                          } else {
                            navigate('/login', { state: { error: res.error || 'Customer demo login failed' } });
                          }
                        }}
                      >
                        <span>Demo Customer</span>
                        <span className="badge bg-light text-dark border">1-Click</span>
                      </button>
                      <button
                        type="button"
                        className="dropdown-item px-3 py-1 small text-primary d-flex align-items-center justify-content-between"
                        onClick={async () => {
                          const res = await demoLoginAdmin();
                          setUserDropdownOpen(false);
                          if (res.success) {
                            navigate('/admin');
                          } else {
                            navigate('/login', { state: { error: res.error || 'Admin demo login failed' } });
                          }
                        }}
                      >
                        <span className="fw-bold">Demo Admin</span>
                        <span className="badge bg-warning text-dark">Full Access</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="btn btn-light d-lg-none p-2 rounded-circle"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (under logo on small screens) */}
        <form onSubmit={handleSearchSubmit} className="d-flex d-md-none mt-2">
          <div className="input-group">
            <input
              type="text"
              className="form-control rounded-start-pill border-2 border-primary border-opacity-25 px-3 py-1"
              placeholder="Search toys, lego, cars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '0.9rem' }}
            />
            <button type="submit" className="btn btn-tw-primary rounded-end-pill px-3">
              <Search size={16} />
            </button>
          </div>
        </form>

        {/* Desktop Navigation Links */}
        <nav className="d-none d-lg-flex align-items-center justify-content-between pt-2 border-top mt-2">
          <div className="d-flex align-items-center gap-4">

            <Link
              to="/"
              className={`text-decoration-none fw-bold ${location.pathname === '/' ? 'text-primary' : 'text-dark hover-primary'}`}
            >
              Home
            </Link>

            <Link
              to="/products"
              className={`text-decoration-none fw-bold ${location.pathname === '/products' && !location.search ? 'text-primary' : 'text-dark hover-primary'}`}
            >
              All Toys
            </Link>

            {/* Categories dropdown */}
            <div
              ref={categoryRef}
              className="position-relative py-2"
              onMouseEnter={handleCategoryMouseEnter}
              onMouseLeave={handleCategoryMouseLeave}
            >
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none fw-bold text-dark d-flex align-items-center gap-1"
                onClick={() => setCategoryDropdownOpen((prev) => !prev)}
                aria-expanded={categoryDropdownOpen}
              >
                Categories
                <ChevronDown
                  size={14}
                  style={{
                    transform: categoryDropdownOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease'
                  }}
                />
              </button>

              {categoryDropdownOpen && (
                <div
                  className="position-absolute start-0 pt-1"
                  style={{ top: '100%', zIndex: 1060 }}
                  onMouseEnter={handleCategoryMouseEnter}
                  onMouseLeave={handleCategoryMouseLeave}
                >
                  <div
                    className="py-2 bg-white rounded-4 shadow-lg border"
                    style={{ width: '280px' }}
                  >
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/categories/${cat.slug}`}
                        className="dropdown-item px-3 py-2 d-flex align-items-center gap-2"
                        onClick={() => setCategoryDropdownOpen(false)}
                      >
                        <span
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: cat.color
                          }}
                        />
                        <span>{cat.name}</span>
                      </Link>
                    ))}
                    <div className="dropdown-divider my-1"></div>
                    <Link
                      to="/products"
                      className="dropdown-item px-3 py-2 text-primary fw-bold"
                      onClick={() => setCategoryDropdownOpen(false)}
                    >
                      View All Categories &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Age groups dropdown */}
            <div
              ref={ageRef}
              className="position-relative py-2"
              onMouseEnter={handleAgeMouseEnter}
              onMouseLeave={handleAgeMouseLeave}
            >
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none fw-bold text-dark d-flex align-items-center gap-1"
                onClick={() => setAgeDropdownOpen((prev) => !prev)}
                aria-expanded={ageDropdownOpen}
              >
                Shop By Age
                <ChevronDown
                  size={14}
                  style={{
                    transform: ageDropdownOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease'
                  }}
                />
              </button>

              {ageDropdownOpen && (
                <div
                  className="position-absolute start-0 pt-1"
                  style={{ top: '100%', zIndex: 1060 }}
                  onMouseEnter={handleAgeMouseEnter}
                  onMouseLeave={handleAgeMouseLeave}
                >
                  <div
                    className="py-2 bg-white rounded-4 shadow-lg border"
                    style={{ width: '240px' }}
                  >
                    {ageGroups.map((grp) => (
                      <Link
                        key={grp.value}
                        to={`/products?ageGroup=${grp.value}`}
                        className="dropdown-item px-3 py-2"
                        onClick={() => setAgeDropdownOpen(false)}
                      >
                        <div className="fw-bold">{grp.label}</div>
                        <div className="text-muted small">{grp.desc}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/products?specialOffer=true"
              className="text-decoration-none fw-bold text-danger d-flex align-items-center gap-1"
            >
              <Flame size={16} />
              Hot Deals
            </Link>

            <Link
              to="/products?isNewArrival=true"
              className="text-decoration-none fw-bold text-dark hover-primary"
            >
              New Arrivals
            </Link>
          </div>

          {/* Quick link to Admin Demo */}
          <div>
            <Link
              to="/admin"
              className="badge bg-purple text-white px-3 py-2 rounded-pill text-decoration-none d-inline-flex align-items-center gap-1 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' }}
            >
              <ShieldCheck size={14} />
              Admin Portal
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="mobile-nav-overlay"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="mobile-nav-drawer open d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
                <Link to="/" className="tw-logo text-decoration-none" onClick={() => setMobileMenuOpen(false)}>
                  <img
                    src={logoImg}
                    alt="Logo"
                    className="tw-navbar-logo"
                  />
                </Link>
                <button
                  type="button"
                  className="btn btn-light rounded-circle p-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="nav flex-column gap-2">
                <Link
                  to="/"
                  className="nav-link text-dark fw-bold py-2 px-3 rounded hover-bg-light"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  className="nav-link text-dark fw-bold py-2 px-3 rounded hover-bg-light"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  All Toys
                </Link>
                <div className="px-3 pt-2 text-muted fw-bold small text-uppercase">
                  Categories
                </div>
                {CATEGORIES.slice(0, 5).map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/categories/${cat.slug}`}
                    className="nav-link text-secondary py-1 px-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    • {cat.name}
                  </Link>
                ))}
                <div className="px-3 pt-2 text-muted fw-bold small text-uppercase">
                  Shop By Age
                </div>
                {ageGroups.map((grp) => (
                  <Link
                    key={grp.value}
                    to={`/products?ageGroup=${grp.value}`}
                    className="nav-link text-secondary py-1 px-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    • {grp.label} ({grp.desc})
                  </Link>
                ))}
                <div className="dropdown-divider my-2"></div>
                <Link
                  to="/cart"
                  className="nav-link text-dark fw-bold py-2 px-3 d-flex justify-content-between"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Shopping Cart</span>
                  <span className="badge bg-primary rounded-pill">{cartCount}</span>
                </Link>
                <Link
                  to="/wishlist"
                  className="nav-link text-dark fw-bold py-2 px-3 d-flex justify-content-between"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Wishlist</span>
                  <span className="badge bg-danger rounded-pill">{wishlistCount}</span>
                </Link>
                <Link
                  to="/admin"
                  className="nav-link text-purple fw-bold py-2 px-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Management
                </Link>
              </div>
            </div>

            <div className="pt-4 border-top">
              {isLoggedIn ? (
                <div>
                  <div className="small text-muted mb-2">Signed in as <strong>{user.name}</strong></div>
                  <button
                    type="button"
                    className="btn btn-outline-danger w-100 rounded-pill btn-sm"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="d-grid gap-2">
                  <Link
                    to="/login"
                    className="btn btn-tw-primary btn-sm rounded-pill text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login / Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
