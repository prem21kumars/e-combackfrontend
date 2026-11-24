import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useParams } from 'react-router-dom';
import { 
  Filter, 
  SlidersHorizontal, 
  RotateCcw, 
  Search, 
  ChevronRight, 
  Sparkles,
  X
} from 'lucide-react';
import ProductGrid from '../../components/products/ProductGrid';
import { productService } from '../../services/productService';
import { CATEGORIES } from '../../data/categories';

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter state synced with URL search params
  const currentCategory = categorySlug || searchParams.get('category') || 'all';
  const currentAge = searchParams.get('ageGroup') || 'all';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sortBy') || 'popularity';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const isSpecialOffer = searchParams.get('specialOffer') === 'true';
  const isNewArrival = searchParams.get('isNewArrival') === 'true';

  // Pagination / Load more
  const [visibleCount, setVisibleCount] = useState(12);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await productService.getProducts({
          category: currentCategory,
          ageGroup: currentAge,
          search: currentSearch,
          sortBy: currentSort,
          minPrice: currentMinPrice,
          maxPrice: currentMaxPrice,
        });

        let filtered = data;
        if (isSpecialOffer) {
          filtered = filtered.filter((p) => p.isSpecialOffer || (p.discountPercentage >= 20));
        }
        if (isNewArrival) {
          filtered = filtered.filter((p) => p.isNewArrival);
        }

        setProducts(filtered);
      } catch (err) {
        console.error('Error fetching catalogue:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    currentCategory, 
    currentAge, 
    currentSearch, 
    currentSort, 
    currentMinPrice, 
    currentMaxPrice,
    isSpecialOffer,
    isNewArrival
  ]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
    setVisibleCount(12);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setVisibleCount(12);
  };

  const activeCategoryObj = CATEGORIES.find(
    (c) => c.slug === currentCategory || c.name.toLowerCase() === currentCategory.toLowerCase()
  );

  const displayedProducts = products.slice(0, visibleCount);

  return (
    <div className="container py-4">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
          <li className="breadcrumb-item active" aria-current="page">
            {activeCategoryObj ? activeCategoryObj.name : 'Toy Catalogue'}
          </li>
        </ol>
      </nav>

      {/* Header Banner if Category active */}
      {activeCategoryObj ? (
        <div 
          className="rounded-4 p-4 mb-4 text-white position-relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${activeCategoryObj.color}, #1e293b)` }}
        >
          <div className="row align-items-center g-3">
            <div className="col-md-8">
              <span className="badge bg-white text-dark px-3 py-1 rounded-pill mb-2 fw-bold">
                {activeCategoryObj.badgeText}
              </span>
              <h2 className="display-6 fw-bold mb-1">{activeCategoryObj.name}</h2>
              <p className="mb-0 text-white-50">{activeCategoryObj.description}</p>
            </div>
            <div className="col-md-4 text-md-end d-none d-md-block">
              <img
                src={activeCategoryObj.image}
                alt={activeCategoryObj.name}
                className="rounded-4 shadow object-fit-cover"
                style={{ width: '120px', height: '100px', border: '3px solid white' }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 pb-2 border-bottom">
          <div>
            <h1 className="fw-bolder h2 mb-1">Explore Toys</h1>
            <p className="text-muted small mb-0">
              Showing {products.length} {products.length === 1 ? 'toy' : 'toys'}
              {currentSearch && ` matching "${currentSearch}"`}
            </p>
          </div>

          {/* Mobile Filter Button */}
          <button
            type="button"
            className="btn btn-outline-primary rounded-pill d-md-none mt-3 mt-md-0 d-flex align-items-center justify-content-center gap-2"
            onClick={() => setMobileFilterOpen(true)}
          >
            <SlidersHorizontal size={16} />
            <span>Filters & Sort</span>
          </button>
        </div>
      )}

      <div className="row g-4">
        
        {/* Desktop Sidebar Filters */}
        <aside className="col-md-3 d-none d-md-block">
          <div className="bg-white p-4 rounded-4 border sticky-top" style={{ top: '80px', zIndex: 10 }}>
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
              <div className="fw-bold d-flex align-items-center gap-2">
                <SlidersHorizontal size={18} className="text-primary" />
                <span>Filters</span>
              </div>
              <button
                type="button"
                className="btn btn-link p-0 text-danger text-decoration-none small d-flex align-items-center gap-1"
                onClick={clearAllFilters}
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            {/* Keyword Search */}
            <div className="mb-4">
              <label className="form-label fw-bold small text-muted text-uppercase">Search</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control form-control-sm rounded-start-pill"
                  placeholder="Keyword..."
                  value={currentSearch}
                  onChange={(e) => updateParam('search', e.target.value)}
                />
                {currentSearch && (
                  <button 
                    className="btn btn-sm btn-light border"
                    type="button"
                    onClick={() => updateParam('search', '')}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="mb-4">
              <label className="form-label fw-bold small text-muted text-uppercase">Category</label>
              <div className="d-flex flex-column gap-1">
                <button
                  type="button"
                  className={`btn btn-sm text-start rounded-pill px-3 py-1 ${
                    currentCategory === 'all' ? 'btn-primary text-white' : 'btn-light'
                  }`}
                  onClick={() => updateParam('category', 'all')}
                >
                  All Categories
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`btn btn-sm text-start rounded-pill px-3 py-1 ${
                      currentCategory === cat.slug || currentCategory === cat.name
                        ? 'btn-primary text-white'
                        : 'btn-light'
                    }`}
                    onClick={() => updateParam('category', cat.slug)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Group */}
            <div className="mb-4">
              <label className="form-label fw-bold small text-muted text-uppercase">Age Group</label>
              <div className="d-flex flex-wrap gap-2">
                {['all', '0-2', '3-5', '6-8', '9+'].map((age) => (
                  <button
                    key={age}
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 ${
                      currentAge === age ? 'btn-primary' : 'btn-outline-secondary'
                    }`}
                    onClick={() => updateParam('ageGroup', age)}
                  >
                    {age === 'all' ? 'All Ages' : `${age} Yrs`}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-4">
              <label className="form-label fw-bold small text-muted text-uppercase">Price Range (₹)</label>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="number"
                  className="form-control form-control-sm rounded-3"
                  placeholder="Min"
                  value={currentMinPrice}
                  onChange={(e) => updateParam('minPrice', e.target.value)}
                />
                <span className="text-muted">-</span>
                <input
                  type="number"
                  className="form-control form-control-sm rounded-3"
                  placeholder="Max"
                  value={currentMaxPrice}
                  onChange={(e) => updateParam('maxPrice', e.target.value)}
                />
              </div>
            </div>

            {/* Quick Deals toggles */}
            <div className="mb-3">
              <label className="form-label fw-bold small text-muted text-uppercase">Special Deals</label>
              <div className="form-check form-switch mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="filterSpecialOffer"
                  checked={isSpecialOffer}
                  onChange={(e) => updateParam('specialOffer', e.target.checked ? 'true' : '')}
                />
                <label className="form-check-label small" htmlFor="filterSpecialOffer">
                  High Discount Deals (20%+ OFF)
                </label>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="filterNewArrival"
                  checked={isNewArrival}
                  onChange={(e) => updateParam('isNewArrival', e.target.checked ? 'true' : '')}
                />
                <label className="form-check-label small" htmlFor="filterNewArrival">
                  New Arrivals Only
                </label>
              </div>
            </div>

          </div>
        </aside>

        {/* Product List Content */}
        <div className="col-md-9">
          
          {/* Top Sort & Filter Bar */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 bg-white p-3 rounded-4 border mb-3">
            <div className="small text-muted">
              Showing <strong>{Math.min(displayedProducts.length, products.length)}</strong> of <strong>{products.length}</strong> items
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted text-nowrap">Sort By:</span>
              <select
                className="form-select form-select-sm rounded-pill"
                value={currentSort}
                onChange={(e) => updateParam('sortBy', e.target.value)}
                style={{ width: '190px' }}
              >
                <option value="popularity">Popularity / Trending</option>
                <option value="rating">Highest Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Product Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Active Filter Pills */}
          {(currentCategory !== 'all' || currentAge !== 'all' || currentSearch || currentMinPrice || currentMaxPrice || isSpecialOffer || isNewArrival) && (
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              <span className="small text-muted">Active:</span>
              {currentCategory !== 'all' && (
                <span className="badge bg-light text-dark border rounded-pill d-flex align-items-center gap-1 px-3 py-2">
                  Category: {currentCategory}
                  <button type="button" className="btn-close btn-close-sm" style={{ fontSize: '0.6rem' }} onClick={() => updateParam('category', 'all')} />
                </span>
              )}
              {currentAge !== 'all' && (
                <span className="badge bg-light text-dark border rounded-pill d-flex align-items-center gap-1 px-3 py-2">
                  Age: {currentAge}
                  <button type="button" className="btn-close btn-close-sm" style={{ fontSize: '0.6rem' }} onClick={() => updateParam('ageGroup', 'all')} />
                </span>
              )}
              {currentSearch && (
                <span className="badge bg-light text-dark border rounded-pill d-flex align-items-center gap-1 px-3 py-2">
                  Search: "{currentSearch}"
                  <button type="button" className="btn-close btn-close-sm" style={{ fontSize: '0.6rem' }} onClick={() => updateParam('search', '')} />
                </span>
              )}
              <button 
                type="button" 
                className="btn btn-link btn-sm text-danger p-0 text-decoration-none ms-2"
                onClick={clearAllFilters}
              >
                Clear All
              </button>
            </div>
          )}

          {/* Products Grid */}
          <ProductGrid 
            products={displayedProducts} 
            loading={loading} 
            emptyMessage="No toys match the selected filters. Try broadening your criteria."
          />

          {/* Load More Button */}
          {products.length > visibleCount && (
            <div className="text-center mt-4 pt-3">
              <button
                type="button"
                className="btn btn-tw-outline px-5 py-2 fw-bold"
                onClick={() => setVisibleCount((prev) => prev + 8)}
              >
                Load More Toys ({products.length - visibleCount} remaining)
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Mobile Filters Drawer Modal */}
      {mobileFilterOpen && (
        <>
          <div className="mobile-nav-overlay" onClick={() => setMobileFilterOpen(false)} />
          <div className="mobile-nav-drawer open p-4">
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
              <h5 className="fw-bold mb-0">Filters & Sort</h5>
              <button type="button" className="btn btn-light rounded-circle p-2" onClick={() => setMobileFilterOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold small text-muted">Category</label>
              <select
                className="form-select rounded-pill"
                value={currentCategory}
                onChange={(e) => updateParam('category', e.target.value)}
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold small text-muted">Age Group</label>
              <div className="d-flex flex-wrap gap-2">
                {['all', '0-2', '3-5', '6-8', '9+'].map((age) => (
                  <button
                    key={age}
                    type="button"
                    className={`btn btn-sm rounded-pill ${currentAge === age ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => updateParam('ageGroup', age)}
                  >
                    {age === 'all' ? 'All' : `${age} Yrs`}
                  </button>
                ))}
              </div>
            </div>

            <div className="d-grid gap-2 pt-3 border-top">
              <button
                type="button"
                className="btn btn-tw-primary rounded-pill py-2"
                onClick={() => setMobileFilterOpen(false)}
              >
                Apply Filters
              </button>
              <button
                type="button"
                className="btn btn-light rounded-pill py-2"
                onClick={() => {
                  clearAllFilters();
                  setMobileFilterOpen(false);
                }}
              >
                Reset All
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default ProductsPage;
