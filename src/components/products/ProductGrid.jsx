import React from 'react';
import ProductCard from './ProductCard';
import { PackageOpen } from 'lucide-react';

export const ProductGrid = ({ products = [], loading = false, emptyMessage = 'No magical toys match your search.' }) => {
  if (loading) {
    return (
      <div className="product-grid py-4">
        {[...Array(6)].map((_, idx) => (
          <div key={idx} className="tw-card p-3 placeholder-glow" style={{ height: '360px' }}>
            <div className="placeholder col-12 rounded-4 mb-3" style={{ height: '180px' }}></div>
            <div className="placeholder col-4 mb-2"></div>
            <div className="placeholder col-10 mb-2"></div>
            <div className="placeholder col-6 mb-3"></div>
            <div className="placeholder col-12 rounded-pill py-3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-5 bg-white rounded-4 border my-4 p-5">
        <div 
          className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3"
          style={{ width: '80px', height: '80px', background: '#f0f9ff', color: '#0284c7' }}
        >
          <PackageOpen size={40} />
        </div>
        <h4 className="fw-bold mb-2">No Toys Found</h4>
        <p className="text-muted mb-3">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="product-grid py-2">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
