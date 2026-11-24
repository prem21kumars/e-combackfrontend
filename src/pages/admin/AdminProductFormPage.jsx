import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { productService } from '../../services/productService';
import { CATEGORIES } from '../../data/categories';

export const AdminProductFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [categoriesList, setCategoriesList] = useState(CATEGORIES);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Educational Toys',
    categoryId: 1,
    ageGroup: '3-5',
    price: '',
    discountPercentage: '0',
    stock: '20',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
    description: '',
    isFeatured: false,
    isNewArrival: true,
    isSpecialOffer: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleFillSample = () => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      name: `Galaxy Space Explorer Robot #${randomId}`,
      sku: `TOY-BOT-${randomId}`,
      category: 'Educational Toys',
      categoryId: 1,
      ageGroup: '6-8',
      price: '1899',
      discountPercentage: '10',
      stock: '30',
      image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
      description: 'An interactive robotic toy featuring infrared sensors, voice commands, and programmable movement blocks for young engineers.',
      isFeatured: true,
      isNewArrival: true,
      isSpecialOffer: true,
    });
    setErrors({});
    setGlobalError('');
  };

  // Fetch categories dynamically from backend
  useEffect(() => {
    productService.getCategories()
      .then((cats) => {
        if (Array.isArray(cats) && cats.length > 0) {
          setCategoriesList(cats);
        }
      })
      .catch((err) => console.warn('Could not load categories:', err));
  }, []);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      productService.getProductById(id)
        .then((prod) => {
          setFormData({
            name: prod.name || '',
            sku: prod.sku || '',
            category: prod.category || 'Educational Toys',
            categoryId: prod.categoryId || 1,
            ageGroup: prod.ageGroup || '3-5',
            price: String(prod.price || ''),
            discountPercentage: String(prod.discountPercentage || 0),
            stock: String(prod.stock || 0),
            image: prod.image || '',
            description: prod.description || '',
            isFeatured: Boolean(prod.isFeatured),
            isNewArrival: Boolean(prod.isNewArrival),
            isSpecialOffer: Boolean(prod.isSpecialOffer),
          });
        })
        .catch((err) => {
          alert('Could not find product');
          navigate('/admin/products');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'category') {
      const selectedCat = categoriesList.find((c) => c.name === value || c.slug === value);
      setFormData((prev) => ({
        ...prev,
        category: value,
        categoryId: selectedCat?.backendId || 1,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (globalError) setGlobalError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Toy name is required';
    if (!formData.price || Number(formData.price) <= 0) errs.price = 'Valid price greater than 0 is required';
    if (!formData.stock || Number(formData.stock) < 0) errs.stock = 'Valid stock count is required';
    if (!formData.image.trim()) errs.image = 'Image URL is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      const missingFields = Object.keys(errs).join(', ');
      setGlobalError(`Please fill in required fields: ${missingFields}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    setGlobalError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGlobalError('');
    setSuccessMsg('');
    try {
      if (isEditMode) {
        await productService.updateProduct(id, formData);
        setSuccessMsg('Toy updated successfully! Redirecting...');
      } else {
        await productService.createProduct(formData);
        setSuccessMsg('Toy created and saved to backend database! Redirecting...');
      }
      setTimeout(() => {
        navigate('/admin/products');
      }, 700);
    } catch (err) {
      setGlobalError(err.message || 'Error saving toy to catalog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between bg-white p-4 rounded-4 border shadow-sm">
        <div className="d-flex align-items-center gap-3">
          <Link to="/admin/products" className="btn btn-light rounded-circle p-2">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="h4 fw-bolder mb-0">
              {isEditMode ? `Edit Toy: ${formData.name}` : 'Add New Toy to Catalog'}
            </h1>
            <p className="text-muted small mb-0">Manage pricing, specifications, and inventory levels.</p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {!isEditMode && (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary rounded-pill px-3 py-2 d-flex align-items-center gap-2 fw-semibold"
              onClick={handleFillSample}
            >
              <Sparkles size={16} />
              <span>Fill Sample Toy</span>
            </button>
          )}
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-4 border shadow-sm p-4 p-md-5">
        
        {/* Global Error Alert */}
        {globalError && (
          <div className="alert alert-danger py-3 px-4 d-flex align-items-center gap-2 mb-4 rounded-4">
            <AlertCircle size={20} className="text-danger flex-shrink-0" />
            <span className="fw-semibold small">{globalError}</span>
          </div>
        )}

        {/* Global Success Alert */}
        {successMsg && (
          <div className="alert alert-success py-3 px-4 d-flex align-items-center gap-2 mb-4 rounded-4">
            <Sparkles size={20} className="text-success flex-shrink-0" />
            <span className="fw-semibold small">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-4">

            {/* Left Column: Core Fields */}
            <div className="col-lg-8">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-bold text-muted">Toy Name *</label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control rounded-pill ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="e.g. Galaxy Explorers Spaceship Brick Set"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && <div className="invalid-feedback small">{errors.name}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Category *</label>
                  <select
                    name="category"
                    className="form-select rounded-pill"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {categoriesList.map((c) => (
                      <option key={c.id || c.backendId} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Age Group *</label>
                  <select
                    name="ageGroup"
                    className="form-select rounded-pill"
                    value={formData.ageGroup}
                    onChange={handleChange}
                  >
                    <option value="0-2">0-2 Years (Infants & Toddlers)</option>
                    <option value="3-5">3-5 Years (Preschool)</option>
                    <option value="6-8">6-8 Years (Early Grade)</option>
                    <option value="9+">9+ Years (Big Kids)</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">Original Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    className={`form-control rounded-pill ${errors.price ? 'is-invalid' : ''}`}
                    placeholder="1499"
                    value={formData.price}
                    onChange={handleChange}
                  />
                  {errors.price && <div className="invalid-feedback small">{errors.price}</div>}
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">Discount % (0-90)</label>
                  <input
                    type="number"
                    name="discountPercentage"
                    className="form-control rounded-pill"
                    placeholder="15"
                    value={formData.discountPercentage}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">Inventory Stock Units *</label>
                  <input
                    type="number"
                    name="stock"
                    className={`form-control rounded-pill ${errors.stock ? 'is-invalid' : ''}`}
                    placeholder="25"
                    value={formData.stock}
                    onChange={handleChange}
                  />
                  {errors.stock && <div className="invalid-feedback small">{errors.stock}</div>}
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold text-muted">Toy Description *</label>
                  <textarea
                    rows="4"
                    name="description"
                    className={`form-control rounded-4 ${errors.description ? 'is-invalid' : ''}`}
                    placeholder="Detailed explanation of features, child development benefits, and materials..."
                    value={formData.description}
                    onChange={handleChange}
                  ></textarea>
                  {errors.description && <div className="invalid-feedback small">{errors.description}</div>}
                </div>
              </div>
            </div>

            {/* Right Column: Image Preview & Badges */}
            <div className="col-lg-4">
              <div className="p-3 rounded-4 bg-light border mb-4">
                <label className="form-label small fw-bold text-muted d-flex align-items-center gap-1">
                  <ImageIcon size={16} />
                  <span>Image Preview</span>
                </label>
                <div className="rounded-3 overflow-hidden bg-white border text-center mb-3" style={{ height: '200px' }}>
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-100 h-100 object-fit-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                </div>
                <input
                  type="url"
                  name="image"
                  className="form-control form-control-sm rounded-pill"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={handleChange}
                />
                <small className="text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
                  Enter a direct image URL or Unsplash photo link.
                </small>
              </div>

              {/* Promotional Flags */}
              <div className="p-3 rounded-4 bg-light border">
                <label className="form-label small fw-bold text-muted mb-2">Display Badges</label>
                <div className="form-check mb-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    className="form-check-input"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                  />
                  <label className="form-check-label small" htmlFor="isFeatured">
                    Featured on Homepage
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input
                    type="checkbox"
                    id="isNewArrival"
                    name="isNewArrival"
                    className="form-check-input"
                    checked={formData.isNewArrival}
                    onChange={handleChange}
                  />
                  <label className="form-check-label small" htmlFor="isNewArrival">
                    Mark as New Arrival
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="isSpecialOffer"
                    name="isSpecialOffer"
                    className="form-check-input"
                    checked={formData.isSpecialOffer}
                    onChange={handleChange}
                  />
                  <label className="form-check-label small" htmlFor="isSpecialOffer">
                    Highlight as Special Offer
                  </label>
                </div>
              </div>
            </div>

          </div>

          <div className="d-flex flex-column flex-sm-row justify-content-end align-items-center gap-3 pt-4 border-top mt-4">
            {globalError && (
              <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-0 me-auto rounded-3">
                <AlertCircle size={16} className="text-danger flex-shrink-0" />
                <span className="fw-semibold">{globalError}</span>
              </div>
            )}
            <Link to="/admin/products" className="btn btn-light rounded-pill px-4">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-tw-primary rounded-pill px-5 d-flex align-items-center gap-2"
              disabled={loading}
            >
              <Save size={18} />
              <span>{loading ? 'Saving to Database...' : isEditMode ? 'Update Toy' : 'Create Toy'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductFormPage;
