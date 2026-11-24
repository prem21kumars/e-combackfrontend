import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { formatCurrency } from '../../utils/formatters';

export const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, moveToCart, clearWishlist, wishlistCount } = useWishlist();

  if (wishlistItems.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="bg-white rounded-5 p-5 border shadow-sm mx-auto" style={{ maxWidth: '540px' }}>
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
            style={{ width: '90px', height: '90px', background: '#ffe3e3', color: '#ff6b6b' }}
          >
            <Heart size={44} />
          </div>
          <h2 className="fw-bolder mb-2">Your Wishlist is Empty!</h2>
          <p className="text-muted mb-4">
            Save your favorite toys, building blocks, and games here so you never lose track of what your kids love.
          </p>
          <Link to="/products" className="btn btn-tw-primary btn-lg rounded-pill px-4">
            Discover Popular Toys
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item active">My Wishlist ({wishlistCount} toys)</li>
        </ol>
      </nav>

      <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
        <div>
          <h1 className="h2 fw-bolder mb-1">My Saved Wishlist</h1>
          <p className="text-muted small mb-0">Items saved for future birthdays, holidays, and celebrations.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-danger btn-sm rounded-pill"
          onClick={clearWishlist}
        >
          Clear All
        </button>
      </div>

      <div className="row g-4">
        {wishlistItems.map((product) => {
          const discountedPrice = product.discountPercentage > 0
            ? Math.round(product.price - (product.price * product.discountPercentage) / 100)
            : product.price;

          return (
            <div key={product.id} className="col-6 col-md-4 col-lg-3">
              <div className="tw-card h-100 d-flex flex-column justify-content-between p-3 position-relative">
                <button
                  type="button"
                  className="btn btn-light position-absolute top-0 end-0 m-2 rounded-circle p-1 text-danger border"
                  onClick={() => removeFromWishlist(product.id)}
                  title="Remove from wishlist"
                  style={{ width: '32px', height: '32px' }}
                >
                  <Trash2 size={16} />
                </button>

                <Link to={`/products/${product.id}`} className="text-center d-block mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="rounded-3 object-fit-cover w-100"
                    style={{ height: '180px' }}
                  />
                </Link>

                <div>
                  <div className="small text-muted mb-1">{product.category}</div>
                  <h6 className="fw-bold mb-2">
                    <Link to={`/products/${product.id}`} className="text-dark text-decoration-none hover-primary line-clamp-2">
                      {product.name}
                    </Link>
                  </h6>

                  <div className="d-flex align-items-baseline gap-2 mb-3">
                    <span className="fw-bolder fs-5 text-dark">
                      {formatCurrency(discountedPrice)}
                    </span>
                    {product.discountPercentage > 0 && (
                      <span className="text-muted text-decoration-line-through small">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-tw-primary btn-sm rounded-pill w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={() => moveToCart(product)}
                >
                  <ShoppingCart size={15} />
                  <span>Move to Cart</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
