import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatCurrency } from '../../utils/formatters';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAdded, setIsAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.image);

  if (!product) return null;

  const isFavorited = isInWishlist(product.id);
  const discountedPrice = product.discountPercentage > 0
    ? Math.round(product.price - (product.price * product.discountPercentage) / 100)
    : product.price;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleImageError = () => {
    // Graceful fallback image
    setImgSrc('https://i.etsystatic.com/66558843/r/il/51f202/8415066900/il_794xN.8415066900_8l9h.jpg');
  };

  return (
    <div className="tw-card h-100 d-flex flex-column position-relative">
      {/* Top badges */}
      <div className="position-absolute top-0 start-0 m-3 d-flex flex-column gap-1" style={{ zIndex: 2 }}>
        {product.discountPercentage > 0 && (
          <span className="tw-badge tw-badge-sale">
            {product.discountPercentage}% OFF
          </span>
        )}
        {product.isNewArrival && (
          <span className="tw-badge tw-badge-new">
            New
          </span>
        )}
        {product.isFeatured && (
          <span className="tw-badge tw-badge-featured">
            Featured
          </span>
        )}
      </div>

      {/* Wishlist Heart button */}
      <button
        type="button"
        className="btn position-absolute top-0 end-0 m-3 p-2 rounded-circle bg-white shadow-sm border-0 d-flex align-items-center justify-content-center"
        onClick={handleToggleWishlist}
        title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
        style={{ zIndex: 3, width: '36px', height: '36px' }}
      >
        <Heart 
          size={18} 
          className={isFavorited ? 'text-danger' : 'text-muted'} 
          fill={isFavorited ? '#ff6b6b' : 'none'} 
        />
      </button>

      {/* Product Image Link */}
      <Link 
        to={`/products/${product.id}`}
        className="d-block overflow-hidden position-relative bg-light text-center"
        style={{ height: '220px' }}
      >
        <img
          src={imgSrc}
          alt={product.name}
          onError={handleImageError}
          className="w-100 h-100"
          style={{ 
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          loading="lazy"
        />
      </Link>

      {/* Card Body */}
      <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
        <div>
          {/* Category & Age pill */}
          <div className="d-flex align-items-center justify-content-between gap-1 mb-2">
            <span className="text-muted small fw-semibold text-truncate">
              {product.category}
            </span>
            <span className="tw-age-pill">
              Age {product.ageGroup}
            </span>
          </div>

          {/* Title */}
          <h6 className="card-title fw-bold mb-2">
            <Link 
              to={`/products/${product.id}`} 
              className="text-dark hover-primary text-decoration-none"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: '2.5rem',
                fontSize: '0.98rem',
              }}
            >
              {product.name}
            </Link>
          </h6>

          {/* Rating */}
          <div className="d-flex align-items-center gap-1 mb-2">
            <div className="d-flex text-warning">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < Math.floor(product.rating || 5) ? '#fbbf24' : 'none'}
                  stroke="#fbbf24"
                />
              ))}
            </div>
            <span className="small fw-bold text-dark ms-1">{product.rating}</span>
            <span className="text-muted small">({product.reviewsCount || 40})</span>
          </div>
        </div>

        {/* Pricing & Add To Cart Button */}
        <div className="pt-2 border-top mt-2">
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

          <div className="d-flex gap-2">
            <button
              type="button"
              className={`btn w-100 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2 ${
                isAdded ? 'btn-success' : 'btn-tw-primary'
              }`}
              onClick={handleAddToCart}
              style={{ fontSize: '0.88rem' }}
            >
              {isAdded ? (
                <>
                  <Check size={16} />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={16} />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductCard;
