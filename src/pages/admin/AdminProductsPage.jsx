import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  SlidersHorizontal, 
  Package, 
  Check, 
  X,
  ExternalLink
} from 'lucide-react';
import { productService } from '../../services/productService';
import { CATEGORIES } from '../../data/categories';
import { formatCurrency } from '../../utils/formatters';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await productService.deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      await loadProducts();
    } catch (err) {
      alert('Error deleting product');
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 bg-white p-4 rounded-4 border shadow-sm">
        <div>
          <h1 className="h4 fw-bolder mb-1">Product Management</h1>
          <p className="text-muted small mb-0">Browse, edit, and create toys in the local demo database.</p>
        </div>
        <Link to="/admin/products/new" className="btn btn-tw-primary rounded-pill px-4 d-inline-flex align-items-center gap-2">
          <Plus size={18} />
          <span>Add New Toy</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-4 border shadow-sm d-flex flex-column flex-md-row gap-3 justify-content-between">
        <div className="input-group" style={{ maxWidth: '360px' }}>
          <span className="input-group-text bg-light border-end-0 rounded-start-pill">
            <Search size={16} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control form-control-sm rounded-end-pill border-start-0"
            placeholder="Search toy by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="small text-muted text-nowrap">Filter:</span>
          <select
            className="form-select form-select-sm rounded-pill"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-4 border shadow-sm p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading products...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5">
            <Package size={40} className="text-muted mb-2" />
            <h6>No products matched your search</h6>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-muted text-uppercase">
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price & Discount</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="small">
                {filtered.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="rounded-3 object-fit-cover border"
                          style={{ width: '48px', height: '48px', flexShrink: 0 }}
                        />
                        <div>
                          <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '220px' }}>
                            {prod.name}
                          </div>
                          <span className="badge bg-light text-muted border" style={{ fontSize: '0.7rem' }}>
                            Age {prod.ageGroup}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted fw-mono">{prod.sku}</td>
                    <td>{prod.category}</td>
                    <td>
                      <div className="fw-bold">{formatCurrency(prod.price)}</div>
                      {prod.discountPercentage > 0 && (
                        <small className="text-danger fw-bold">{prod.discountPercentage}% OFF</small>
                      )}
                    </td>
                    <td>
                      <span className={`badge rounded-pill ${prod.stock < 15 ? 'bg-danger' : 'bg-success'}`}>
                        {prod.stock} units
                      </span>
                    </td>
                    <td>★ {prod.rating}</td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <Link
                          to={`/products/${prod.id}`}
                          target="_blank"
                          className="btn btn-light btn-sm rounded-circle p-2 text-muted"
                          title="View on store"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <Link
                          to={`/admin/products/${prod.id}/edit`}
                          className="btn btn-light btn-sm rounded-circle p-2 text-primary"
                          title="Edit product"
                        >
                          <Edit size={15} />
                        </Link>
                        <button
                          type="button"
                          className="btn btn-light btn-sm rounded-circle p-2 text-danger"
                          onClick={() => setDeleteTarget(prod)}
                          title="Delete product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <>
          <div className="mobile-nav-overlay" onClick={() => setDeleteTarget(null)}></div>
          <div className="position-fixed top-50 start-50 translate-middle bg-white rounded-5 p-4 shadow-lg border" style={{ width: '90%', maxWidth: '420px', zIndex: 1100 }}>
            <h5 className="fw-bold mb-2">Delete Product?</h5>
            <p className="text-muted small mb-4">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong> from demo inventory?
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light rounded-pill btn-sm px-3" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger rounded-pill btn-sm px-3" onClick={handleDelete}>
                Delete Product
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default AdminProductsPage;
