import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit2, Sparkles, Check } from 'lucide-react';
import { productService } from '../../services/productService';
import { CATEGORIES } from '../../data/categories';

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState(CATEGORIES);
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCat, setNewCat] = useState({
    name: '',
    description: '',
    badgeText: 'Curated',
    color: '#0284c7',
    image: 'https://i.etsystatic.com/66558843/r/il/51f202/8415066900/il_794xN.8415066900_8l9h.jpg',
  });

  useEffect(() => {
    productService.getProducts().then(setProducts);
    productService.getCategories().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
      }
    });
  }, []);

  const getProductCount = (categoryName) => {
    return products.filter((p) => p.category?.toLowerCase() === categoryName?.toLowerCase()).length;
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;

    try {
      const created = await productService.createCategory(newCat);
      setCategories([...categories, created]);
    } catch (err) {
      console.warn('Create category error:', err);
    }
    setShowAddModal(false);
    setNewCat({
      name: '',
      description: '',
      badgeText: 'Curated',
      color: '#0284c7',
      image: 'https://i.etsystatic.com/66558843/r/il/51f202/8415066900/il_794xN.8415066900_8l9h.jpg',
    });
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 bg-white p-4 rounded-4 border shadow-sm">
        <div>
          <h1 className="h4 fw-bolder mb-1">Category Management</h1>
          <p className="text-muted small mb-0">Organize toys into parent-friendly collections and age pathways.</p>
        </div>
        <button
          type="button"
          className="btn btn-tw-primary rounded-pill px-4 d-inline-flex align-items-center gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="row g-4">
        {categories.map((cat) => (
          <div key={cat.id} className="col-md-6 col-lg-3">
            <div className="bg-white rounded-4 border p-3 shadow-sm h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="rounded-3 overflow-hidden position-relative mb-3" style={{ height: '140px' }}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-100 h-100 object-fit-cover"
                  />
                  <span
                    className="position-absolute top-0 start-0 m-2 badge text-white"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.badgeText || 'Active'}
                  </span>
                </div>
                <h5 className="fw-bold mb-1">{cat.name}</h5>
                <p className="text-muted small mb-3" style={{ minHeight: '40px' }}>
                  {cat.description}
                </p>
              </div>

              <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                <span className="badge bg-light text-dark border">
                  {getProductCount(cat.name)} Products
                </span>
                <span className="small text-muted">Slug: /{cat.slug}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <>
          <div className="mobile-nav-overlay" onClick={() => setShowAddModal(false)}></div>
          <div className="position-fixed top-50 start-50 translate-middle bg-white rounded-5 p-4 shadow-lg border" style={{ width: '90%', maxWidth: '480px', zIndex: 1100 }}>
            <h5 className="fw-bold mb-3">Create New Toy Category</h5>
            <form onSubmit={handleCreateCategory}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Category Name *</label>
                <input
                  type="text"
                  className="form-control rounded-pill"
                  placeholder="e.g. Musical & Sound Toys"
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Description</label>
                <textarea
                  rows="2"
                  className="form-control rounded-3"
                  placeholder="Summary of toys in this section..."
                  value={newCat.description}
                  onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                ></textarea>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Badge Text</label>
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-pill"
                    placeholder="e.g. Melody & Rhythm"
                    value={newCat.badgeText}
                    onChange={(e) => setNewCat({ ...newCat, badgeText: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Brand Color</label>
                  <input
                    type="color"
                    className="form-control form-control-color w-100 rounded-pill"
                    value={newCat.color}
                    onChange={(e) => setNewCat({ ...newCat, color: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold">Banner Image URL</label>
                <input
                  type="url"
                  className="form-control form-control-sm rounded-pill"
                  value={newCat.image}
                  onChange={(e) => setNewCat({ ...newCat, image: e.target.value })}
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-light rounded-pill px-3" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-tw-primary rounded-pill px-4">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </>
      )}

    </div>
  );
};

export default AdminCategoriesPage;
