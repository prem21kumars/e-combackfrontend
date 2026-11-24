import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Star,
  Flame,
  ShieldCheck,
  Truck,
  Award,
  Gift,
  CheckCircle,
  GraduationCap
} from 'lucide-react';
import ProductCard from '../../components/products/ProductCard';
import { productService } from '../../services/productService';
import { CATEGORIES } from '../../data/categories';

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [educationalToys, setEducationalToys] = useState([]);
  const [dealToys, setDealToys] = useState([]);
  const [loading, setLoading] = useState(true);

  // Home page newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const all = await productService.getProducts();
        setFeaturedProducts(all.filter((p) => p.isFeatured).slice(0, 4));
        setBestSellers(all.filter((p) => p.isBestSeller).slice(0, 4));
        setNewArrivals(all.filter((p) => p.isNewArrival).slice(0, 4));
        setEducationalToys(all.filter((p) => p.category === 'Educational Toys').slice(0, 4));
        setDealToys(all.filter((p) => p.isSpecialOffer || (p.discountPercentage >= 20)).slice(0, 4));
      } catch (err) {
        console.error('Error loading home products:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const ageCategories = [
    {
      range: '0–2 Years',
      slug: '0-2',
      tagline: 'Infants & Toddlers',
      bgColor: '#e0f2fe',
      borderColor: '#38bdf8',
      image: 'https://i.etsystatic.com/66558843/r/il/51f202/8415066900/il_794xN.8415066900_8l9h.jpg',
    },
    {
      range: '3–5 Years',
      slug: '3-5',
      tagline: 'Early Explorers',
      bgColor: '#fef3c7',
      borderColor: '#fbbf24',
      image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80',
    },
    {
      range: '6–8 Years',
      slug: '6-8',
      tagline: 'Little Thinkers',
      bgColor: '#ffedd5',
      borderColor: '#fb923c',
      image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=600&q=80',
    },
    {
      range: '9+ Years',
      slug: '9+',
      tagline: 'Young Creators',
      bgColor: '#ede9fe',
      borderColor: '#a78bfa',
      image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newsletterEmail || !regex.test(newsletterEmail)) {
      setNewsletterError('Please enter a valid email address.');
      return;
    }
    setNewsletterError('');
    setNewsletterSuccess(true);
  };

  return (
    <div className="home-page pb-5">

      {/* Hero Banner Section */}
      <section
        className="py-5 position-relative overflow-hidden"
        style={{
          background: 'radial-gradient(circle at 10% 20%, #eff6ff 0%, #f0fdf4 40%, #fff7ed 90%)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <div className="container py-3 py-lg-4">
          <div className="row align-items-center g-5">

            <div className="col-lg-6 text-center text-lg-start">
              <div
                className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3 shadow-sm bg-white border"
                style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f97316' }}
              >
                <Sparkles size={16} />
                <span>India's Happiest Toy Destination</span>
              </div>

              <h1 className="hero-title display-4 fw-bolder mb-3" style={{ lineHeight: 1.15 }}>
                Spark Curiosity, <br />
                <span style={{ color: '#0284c7' }}>Build Dreams</span> & <br />
                <span style={{ color: '#ff6b6b' }}>Unwrap Joy!</span>
              </h1>

              <p className="lead text-muted mb-4 fs-6 pe-lg-4">
                Discover over 1,000+ safe, non-toxic educational kits, LEGO building sets, RC high-speed cars, cuddly plushes, and interactive family board games.
              </p>

              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                <Link to="/products" className="btn btn-tw-primary px-4 py-3 fs-6">
                  <span>Explore All Toys</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/categories/educational-toys" className="btn btn-tw-secondary px-4 py-3 fs-6">
                  <GraduationCap size={18} />
                  <span>STEM & Smart Kits</span>
                </Link>
              </div>

              {/* Highlights below hero CTA */}
              <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-4 mt-4 pt-2 text-muted small">
                <div className="d-flex align-items-center gap-1">
                  <Truck size={16} className="text-primary" />
                  <span>Free Pan-India Delivery</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <ShieldCheck size={16} className="text-success" />
                  <span>BIS Non-Toxic Certified</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <Star size={16} className="text-warning" fill="#fbbf24" />
                  <span>4.9/5 from 10k+ Parents</span>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="col-lg-6 text-center">
              <div className="position-relative mx-auto" style={{ maxWidth: '520px' }}>
                <img
                  src="https://i.etsystatic.com/66558843/r/il/51f202/8415066900/il_794xN.8415066900_8l9h.jpg"
                  alt="Joyful child playing with educational wooden blocks"
                  className="rounded-5 shadow-lg w-100 object-fit-cover"
                  style={{ height: '420px', border: '8px solid #ffffff' }}
                />

                {/* Floating playful badge 1 */}
                <div
                  className="position-absolute top-0 start-0 translate-middle-y bg-white rounded-4 p-3 shadow-lg d-none d-sm-flex align-items-center gap-3 animate-float border"
                  style={{ zIndex: 3 }}
                >
                  <div className="rounded-circle p-2 bg-warning-subtle text-warning">
                    <Sparkles size={24} />
                  </div>
                  <div className="text-start">
                    <div className="fw-bold small">100% Kid Safe</div>
                    <small className="text-muted">Eco-friendly materials</small>
                  </div>
                </div>

                {/* Floating playful badge 2 */}
                <div
                  className="position-absolute bottom-0 end-0 translate-middle-y bg-white rounded-4 p-3 shadow-lg d-flex align-items-center gap-3 border"
                  style={{ zIndex: 3 }}
                >
                  <div className="rounded-circle p-2 bg-primary-subtle text-primary">
                    <Flame size={24} />
                  </div>
                  <div className="text-start">
                    <div className="fw-bold small">Up to 25% OFF</div>
                    <small className="text-muted">Use code: TOYJOY10</small>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="container py-5">
        <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-4">
          <div>
            <span className="badge bg-primary-subtle text-primary px-3 py-1 rounded-pill fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>
              Explore Categories
            </span>
            <h2 className="section-title fw-bolder mt-2 mb-0">Shop by Category</h2>
          </div>
          <Link to="/products" className="text-primary fw-bold text-decoration-none mt-2 mt-md-0 d-inline-flex align-items-center gap-1">
            <span>View All Categories</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="category-grid">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/categories/${cat.slug}`}
              className="text-decoration-none text-dark"
            >
              <div
                className="tw-card h-100 p-3 text-center d-flex flex-column align-items-center justify-content-between"
                style={{
                  backgroundColor: '#ffffff',
                  borderColor: 'rgba(0,0,0,0.08)',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-6px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div
                  className="rounded-circle mb-3 overflow-hidden d-flex align-items-center justify-content-center shadow-sm position-relative"
                  style={{ width: '85px', height: '85px', border: `3px solid ${cat.color}`, backgroundColor: cat.bgColor || '#f0f9ff' }}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-100 h-100 object-fit-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span
                    className="fw-bold position-absolute"
                    style={{ color: cat.color, fontSize: '1.4rem', pointerEvents: 'none', zIndex: 0 }}
                  >
                    ★
                  </span>
                </div>
                <h6 className="fw-bold mb-1" style={{ fontSize: '0.9rem' }}>{cat.name}</h6>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>{cat.badgeText}</small>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Shop By Age Group Section */}
      <section className="py-5" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="text-center mb-4">
            <span className="badge bg-warning-subtle text-dark px-3 py-1 rounded-pill fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>
              Tailored For Growth
            </span>
            <h2 className="section-title fw-bolder mt-2">Shop by Age</h2>
            <p className="text-muted">Find age-appropriate toys that stimulate developmental milestones.</p>
          </div>

          <div className="row g-4">
            {ageCategories.map((age) => (
              <div key={age.slug} className="col-6 col-lg-3">
                <Link
                  to={`/products?ageGroup=${age.slug}`}
                  className="text-decoration-none text-dark d-block h-100"
                >
                  <div
                    className="rounded-4 p-4 text-center h-100 d-flex flex-column align-items-center justify-content-between shadow-sm"
                    style={{
                      backgroundColor: age.bgColor,
                      border: `2px solid ${age.borderColor}`,
                      transition: 'all 0.25s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <div
                      className="rounded-circle overflow-hidden mb-3 shadow d-flex align-items-center justify-content-center position-relative"
                      style={{ width: '100px', height: '100px', border: '4px solid #ffffff', backgroundColor: '#ffffff' }}
                    >
                      <img
                        src={age.image}
                        alt={`Toys for ${age.range}`}
                        className="w-100 h-100 object-fit-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span className="fw-bolder fs-4 text-primary position-absolute" style={{ pointerEvents: 'none', zIndex: 0 }}>
                        {age.slug}
                      </span>
                    </div>
                    <div>
                      <h4 className="fw-bolder mb-1">{age.range}</h4>
                      <p className="text-muted small mb-3">{age.tagline}</p>
                    </div>
                    <span className="btn btn-sm btn-light rounded-pill px-3 fw-bold border">
                      Shop {age.range}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-5">
        <div className="d-flex align-items-end justify-content-between mb-4">
          <div>
            <span className="tw-badge tw-badge-featured mb-1">Handpicked</span>
            <h2 className="section-title fw-bolder mb-0">Featured Toys</h2>
          </div>
          <Link to="/products?featured=true" className="text-primary fw-bold text-decoration-none d-inline-flex align-items-center gap-1">
            <span>Explore All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="row g-3 g-md-4">
          {featuredProducts.map((product) => (
            <div key={product.id} className="col-6 col-md-4 col-lg-3">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Promotional Deal Banner */}
      <section className="container my-4">
        <div
          className="rounded-5 p-4 p-md-5 text-white position-relative overflow-hidden shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #7c3aed 50%, #f97316 100%)',
          }}
        >
          <div className="row align-items-center g-4">
            <div className="col-lg-7 text-center text-lg-start">
              <span className="badge bg-warning text-dark px-3 py-1 rounded-pill fw-bolder mb-3">
                🔥 SUPER DEAL OF THE WEEK
              </span>
              <h2 className="display-6 fw-bolder mb-2">Save Up to 25% on Space & Robot STEM Kits</h2>
              <p className="mb-4 text-white-50 fs-6">
                Equip young minds with cutting-edge electronics, block coding, and mechanical assemblies. Limited demo promo!
              </p>
              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                <Link to="/products?specialOffer=true" className="btn btn-tw-yellow px-4 py-2 fs-6">
                  Claim Deal Now
                </Link>
                <div className="d-flex align-items-center gap-2 bg-black bg-opacity-25 px-3 py-2 rounded-pill small">
                  <span>Coupon: <strong>TOYJOY10</strong></span>
                </div>
              </div>
            </div>
            <div className="col-lg-5 text-center">
              <img
                src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80"
                alt="Wooden Toys Play Set"
                className="rounded-4 shadow-lg w-100 object-fit-cover"
                style={{ maxHeight: '280px', border: '4px solid rgba(255,255,255,0.4)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bestselling Toys */}
      <section className="container py-5">
        <div className="d-flex align-items-end justify-content-between mb-4">
          <div>
            <span className="tw-badge tw-badge-sale mb-1">Top Rated</span>
            <h2 className="section-title fw-bolder mb-0">Bestselling Toys</h2>
          </div>
          <Link to="/products?bestSeller=true" className="text-primary fw-bold text-decoration-none d-inline-flex align-items-center gap-1">
            <span>See Best Sellers</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="row g-3 g-md-4">
          {bestSellers.map((product) => (
            <div key={product.id} className="col-6 col-md-4 col-lg-3">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Educational Toys Section */}
      <section className="py-5" style={{ background: '#f0f9ff' }}>
        <div className="container">
          <div className="d-flex align-items-end justify-content-between mb-4">
            <div>
              <span className="badge bg-primary text-white px-3 py-1 rounded-pill fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>
                Brain & STEM Play
              </span>
              <h2 className="section-title fw-bolder mt-1 mb-0">Smart Educational Toys</h2>
            </div>
            <Link to="/categories/educational-toys" className="text-primary fw-bold text-decoration-none d-inline-flex align-items-center gap-1">
              <span>View All STEM</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="row g-3 g-md-4">
            {educationalToys.map((product) => (
              <div key={product.id} className="col-6 col-md-4 col-lg-3">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="container py-5">
        <div className="d-flex align-items-end justify-content-between mb-4">
          <div>
            <span className="tw-badge tw-badge-new mb-1">Fresh in Store</span>
            <h2 className="section-title fw-bolder mb-0">New Arrivals</h2>
          </div>
          <Link to="/products?isNewArrival=true" className="text-primary fw-bold text-decoration-none d-inline-flex align-items-center gap-1">
            <span>View All New</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="row g-3 g-md-4">
          {newArrivals.map((product) => (
            <div key={product.id} className="col-6 col-md-4 col-lg-3">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container my-5">
        <div
          className="rounded-5 p-4 p-md-5 text-center position-relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #fef3c7, #e0f2fe)',
            border: '2px dashed #0284c7',
          }}
        >
          <div className="mx-auto" style={{ maxWidth: '600px' }}>
            <div
              className="mx-auto rounded-circle d-flex align-items-center justify-content-center p-3 mb-3 bg-white shadow-sm"
              style={{ width: '64px', height: '64px', color: '#f97316' }}
            >
              <Gift size={32} />
            </div>
            <h2 className="fw-bolder mb-2">Never Miss a Toy Sale! 🎁</h2>
            <p className="text-muted mb-4">
              Get 10% OFF your first order, access secret flash sales, and discover weekly play tips curated by child educators.
            </p>

            {newsletterSuccess ? (
              <div className="alert alert-success d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill fw-bold">
                <CheckCircle size={20} />
                <span>Thanks for joining the OO Toys family! Check your inbox soon.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                <input
                  type="email"
                  className={`form-control form-control-lg rounded-pill px-4 ${newsletterError ? 'is-invalid' : ''}`}
                  placeholder="Enter your email address..."
                  value={newsletterEmail}
                  onChange={(e) => {
                    setNewsletterEmail(e.target.value);
                    if (newsletterError) setNewsletterError('');
                  }}
                  style={{ maxWidth: '380px' }}
                />
                <button type="submit" className="btn btn-tw-primary btn-lg rounded-pill px-4">
                  Subscribe Free
                </button>
              </form>
            )}

            {newsletterError && (
              <div className="text-danger small mt-2">{newsletterError}</div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
