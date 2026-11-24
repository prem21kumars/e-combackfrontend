import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, Plus, Minus, Search, CheckCircle2 } from 'lucide-react';
import { productService } from '../../services/productService';
import { inventoryService } from '../../services/inventoryService';
import { formatCurrency } from '../../utils/formatters';

export const AdminInventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState('');

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

  const handleStockUpdate = async (productId, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      await inventoryService.adjustStock(productId, {
        quantityChange: delta,
        movementType: delta >= 0 ? 'RESTOCK' : 'MANUAL_ADJUSTMENT',
        notes: `Admin adjustment of ${delta} units`,
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
      );
      setFeedback(`Updated stock for ID #${productId} to ${newStock} units`);
      setTimeout(() => setFeedback(''), 2500);
    } catch (err) {
      try {
        await productService.updateProduct(productId, { stock: newStock });
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
        );
        setFeedback(`Updated stock for ID #${productId} to ${newStock} units`);
        setTimeout(() => setFeedback(''), 2500);
      } catch (e2) {
        alert('Error updating stock');
      }
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = products.filter((p) => p.stock < 15).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 bg-white p-4 rounded-4 border shadow-sm">
        <div>
          <h1 className="h4 fw-bolder mb-1">Inventory & Stock Tracking</h1>
          <p className="text-muted small mb-0">Monitor warehouse counts, restock low items, and prevent stockouts.</p>
        </div>

        <div className="d-flex gap-2">
          <span className="badge bg-warning-subtle text-dark border px-3 py-2 rounded-pill d-flex align-items-center gap-1">
            <AlertTriangle size={14} className="text-warning" />
            <span>{lowStockCount} Low Stock</span>
          </span>
          {outOfStockCount > 0 && (
            <span className="badge bg-danger rounded-pill px-3 py-2">
              {outOfStockCount} Out of Stock
            </span>
          )}
        </div>
      </div>

      {feedback && (
        <div className="alert alert-success py-2 px-3 small rounded-3 d-flex align-items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white p-3 rounded-4 border shadow-sm">
        <div className="input-group" style={{ maxWidth: '400px' }}>
          <span className="input-group-text bg-light border-end-0 rounded-start-pill">
            <Search size={16} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control form-control-sm rounded-end-pill border-start-0"
            placeholder="Search toy by name, category, or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-4 border shadow-sm p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading inventory...</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-muted text-uppercase">
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Current Stock</th>
                  <th className="text-end">Quick Adjust</th>
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
                          style={{ width: '42px', height: '42px' }}
                        />
                        <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '240px' }}>
                          {prod.name}
                        </div>
                      </div>
                    </td>
                    <td className="text-muted">{prod.sku}</td>
                    <td className="fw-bold">{formatCurrency(prod.price)}</td>
                    <td>
                      {prod.stock === 0 ? (
                        <span className="badge bg-danger rounded-pill">Out of Stock</span>
                      ) : prod.stock < 15 ? (
                        <span className="badge bg-warning text-dark rounded-pill">Low Stock Warning</span>
                      ) : (
                        <span className="badge bg-success-subtle text-success rounded-pill">In Stock</span>
                      )}
                    </td>
                    <td>
                      <span className="fs-6 fw-bold">{prod.stock}</span> units
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex align-items-center border rounded-pill bg-light p-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-light rounded-circle p-1"
                          onClick={() => handleStockUpdate(prod.id, prod.stock, -5)}
                          title="Deduct 5"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-2 fw-bold text-muted" style={{ fontSize: '0.75rem' }}>±5</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-light rounded-circle p-1"
                          onClick={() => handleStockUpdate(prod.id, prod.stock, 5)}
                          title="Add 5"
                        >
                          <Plus size={14} />
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

    </div>
  );
};

export default AdminInventoryPage;
