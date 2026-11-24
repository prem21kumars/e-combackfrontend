import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Share2,
  Check,
  ArrowLeft,
  ChevronRight,
  Send
} from 'lucide-react';
import { productService } from '../../services/productService';
import { reviewService } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatCurrency } from '../../utils/formatters';
import ProductCard from '../../components/products/ProductCard';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description'); // 'description', 'specifications', 'reviews'
  const [selectedImage, setSelectedImage] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  // Demo review state
  const [reviews, setReviews] = useState([
    {
      id: 1,
      author: 'Sunita Mehra',
      rating: 5,
      date: '2 days ago',
      comment: 'Superb quality and completely safe for my 4-year old! Kept them engaged for hours.',
    },
    {
      id: 2,
      author: 'Deepak Rao',
      rating: 5,
      date: '1 week ago',
      comment: 'Arrived in great packaging. The build quality exceeds expectations for this price.',
    },
  ]);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const found = await productService.getProductById(id);
        setProduct(found);
        setSelectedImage(found.image);

        // Fetch related products in same category
        const all = await productService.getProducts({ category: found.category });
        setRelatedProducts(all.filter((p) => p.id !== found.id).slice(0, 4));

        // Fetch server reviews
        try {
          const revs = await reviewService.getProductReviews(id);
          const content = revs?.content || (Array.isArray(revs) ? revs : []);
          if (content.length > 0) {
            setReviews(content.map((r) => ({
              id: r.id,
              author: r.userName || r.userEmail?.split('@')[0] || 'Verified Buyer',
              rating: r.rating,
              date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent',
              comment: r.comment || r.title,
            })));
          }
        } catch (revErr) {}
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary my-5" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <h2>Toy Not Found</h2>
        <p className="text-muted">The requested toy product does not exist or has been removed.</p>
        <Link to="/products" className="btn btn-tw-primary">
          Return to Catalogue
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const discountedPrice = product.discountPercentage > 0
    ? Math.round(product.price - (product.price * product.discountPercentage) / 100)
    : product.price;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const authorName = newReviewAuthor.trim() || user?.name || 'Happy Parent';
    if (!newReviewComment.trim()) return;

    const newRev = {
      id: Date.now(),
      author: authorName,
      rating: Number(newReviewRating),
      date: 'Just now',
      comment: newReviewComment.trim(),
    };

    setReviews([newRev, ...reviews]);
    setNewReviewAuthor('');
    setNewReviewComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);

    // Call backend API if authenticated
    if (isLoggedIn && product?.id) {
      try {
        await reviewService.addReview(product.id, {
          rating: Number(newReviewRating),
          title: authorName,
          comment: newRev.comment,
        });
      } catch (err) {
        console.warn('Backend review submission warning:', err.message);
      }
    }
  };

  // Multiple realistic image angles demo
  const galleryImages = [
    product.image,
    'https://i.etsystatic.com/66558843/r/il/51f202/8415066900/il_794xN.8415066900_8l9h.jpg',
    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
  ];

  return (
    <div className="container py-4">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/products">All Toys</Link></li>
          <li className="breadcrumb-item"><Link to={`/categories/${product.category.toLowerCase().replace(/\s+/g, '-')}`}>{product.category}</Link></li>
          <li className="breadcrumb-item active text-truncate" style={{ maxWidth: '240px' }}>{product.name}</li>
        </ol>
      </nav>

      {/* Main Product Showcase */}
      <div className="row g-5">

        {/* Left: Gallery Images */}
        <div className="col-lg-6">
          <div className="bg-white rounded-5 p-3 border shadow-sm position-relative overflow-hidden mb-3">
            <div className="position-absolute top-0 start-0 m-3 d-flex flex-column gap-2" style={{ zIndex: 2 }}>
              {product.discountPercentage > 0 && (
                <span className="tw-badge tw-badge-sale fs-6 py-2 px-3">
                  {product.discountPercentage}% OFF
                </span>
              )}
              {product.isNewArrival && (
                <span className="tw-badge tw-badge-new fs-6 py-2 px-3">
                  New Arrival
                </span>
              )}
            </div>

            <button
              type="button"
              className="btn position-absolute top-0 end-0 m-3 p-2 rounded-circle bg-white shadow-sm border d-flex align-items-center justify-content-center"
              onClick={() => toggleWishlist(product)}
              style={{ zIndex: 3, width: '44px', height: '44px' }}
              title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart
                size={22}
                className={isFavorited ? 'text-danger' : 'text-muted'}
                fill={isFavorited ? '#ff6b6b' : 'none'}
              />
            </button>

            <img
              src={selectedImage}
              alt={product.name}
              className="w-100 rounded-4 object-fit-cover"
              style={{ maxHeight: '460px', minHeight: '340px' }}
            />
          </div>

          {/* Thumbnails */}
          <div className="d-flex gap-3">
            {galleryImages.map((img, i) => (
              <button
                key={i}
                type="button"
                className={`p-1 bg-white rounded-3 border ${selectedImage === img ? 'border-primary border-3' : 'opacity-75'}`}
                onClick={() => setSelectedImage(img)}
                style={{ width: '80px', height: '80px', overflow: 'hidden' }}
              >
                <img src={img} alt="Thumbnail" className="w-100 h-100 object-fit-cover rounded" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="col-lg-6">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 fw-bold">
              {product.category}
            </span>
            <span className="tw-age-pill">
              Recommended Age: {product.ageGroup} Years
            </span>
          </div>

          <h1 className="h2 fw-bolder mb-2 text-dark">{product.name}</h1>

          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="d-flex text-warning">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill={i < Math.floor(product.rating || 5) ? '#fbbf24' : 'none'}
                  stroke="#fbbf24"
                />
              ))}
            </div>
            <span className="fw-bold">{product.rating}</span>
            <span className="text-muted small">({product.reviewsCount || 40} verified ratings)</span>
            <span className="text-muted small">|</span>
            <span className="text-muted small">SKU: <strong>{product.sku}</strong></span>
          </div>

          {/* Pricing block */}
          <div className="bg-light p-3 rounded-4 mb-4 border d-flex align-items-baseline gap-3">
            <span className="display-6 fw-bold text-dark">
              {formatCurrency(discountedPrice)}
            </span>
            {product.discountPercentage > 0 && (
              <>
                <span className="fs-5 text-muted text-decoration-line-through">
                  {formatCurrency(product.price)}
                </span>
                <span className="badge bg-danger rounded-pill px-3 py-1 fw-bold">
                  Save {formatCurrency(product.price - discountedPrice)} ({product.discountPercentage}% OFF)
                </span>
              </>
            )}
          </div>

          {/* Short description */}
          <p className="text-muted mb-4 lead fs-6">
            {product.description}
          </p>

          {/* Features Highlights */}
          {product.features && product.features.length > 0 && (
            <div className="mb-4">
              <h6 className="fw-bold mb-2">Key Highlights:</h6>
              <ul className="list-unstyled d-flex flex-column gap-2 small">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="d-flex align-items-center gap-2">
                    <Check size={16} className="text-success" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Stock Availability */}
          <div className="mb-4">
            {product.stock > 0 ? (
              <div className="d-flex align-items-center gap-2">
                <span className="tw-badge tw-badge-stock">
                  In Stock ({product.stock} units ready to ship)
                </span>
                <span className="text-muted small">Dispatches tomorrow</span>
              </div>
            ) : (
              <span className="tw-badge tw-badge-low">Out of Stock</span>
            )}
          </div>

          {/* Quantity and Add to Cart Action */}
          <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
            <div className="d-flex align-items-center border rounded-pill bg-white px-2 py-1 shadow-sm">
              <button
                type="button"
                className="btn btn-sm btn-link text-dark text-decoration-none px-2 fw-bold"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <span className="px-3 fw-bold">{quantity}</span>
              <button
                type="button"
                className="btn btn-sm btn-link text-dark text-decoration-none px-2 fw-bold"
                onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className={`btn flex-grow-1 py-3 rounded-pill fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 ${isAdded ? 'btn-success' : 'btn-tw-primary'
                }`}
              onClick={handleAddToCart}
            >
              {isAdded ? (
                <>
                  <Check size={20} />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  <span>Add to Cart ({formatCurrency(discountedPrice * quantity)})</span>
                </>
              )}
            </button>
          </div>

          {/* Trust Guarantee Box */}
          <div className="p-3 rounded-4 bg-white border d-flex flex-column gap-2 small text-muted">
            <div className="d-flex align-items-center gap-2">
              <Truck size={16} className="text-primary flex-shrink-0" />
              <span><strong>Free Delivery:</strong> Eligible on orders above ₹999</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <ShieldCheck size={16} className="text-success flex-shrink-0" />
              <span><strong>Safety Promise:</strong> 100% Non-toxic certified and safety tested</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <RotateCcw size={16} className="text-danger flex-shrink-0" />
              <span><strong>Easy Returns:</strong> 7-day replacement guarantee</span>
            </div>
          </div>

        </div>

      </div>

      {/* Tabs: Description, Specifications, Reviews */}
      <div className="mt-5 pt-3">
        <ul className="nav nav-tabs border-bottom-2 gap-2">
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link fw-bold px-4 py-2 ${activeTab === 'description' ? 'active text-primary' : 'text-muted'}`}
              onClick={() => setActiveTab('description')}
            >
              Detailed Description
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link fw-bold px-4 py-2 ${activeTab === 'specifications' ? 'active text-primary' : 'text-muted'}`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications & Safety
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link fw-bold px-4 py-2 ${activeTab === 'reviews' ? 'active text-primary' : 'text-muted'}`}
              onClick={() => setActiveTab('reviews')}
            >
              Customer Reviews ({reviews.length})
            </button>
          </li>
        </ul>

        <div className="bg-white p-4 rounded-bottom-4 border border-top-0 mb-5">
          {activeTab === 'description' && (
            <div>
              <h5 className="fw-bold mb-3">About this Toy</h5>
              <p className="text-muted leading-relaxed">
                {product.description}
              </p>
              <p className="text-muted leading-relaxed">
                Specially designed to inspire open-ended play, creativity, and hand-eye coordination. Children will enjoy hours of imaginative play while naturally developing spatial reasoning and cognitive skills.
              </p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <tbody>
                  <tr>
                    <th className="bg-light" style={{ width: '30%' }}>SKU Identifier</th>
                    <td>{product.sku}</td>
                  </tr>
                  <tr>
                    <th className="bg-light">Category</th>
                    <td>{product.category}</td>
                  </tr>
                  <tr>
                    <th className="bg-light">Age Recommendation</th>
                    <td>{product.ageGroup} Years</td>
                  </tr>
                  <tr>
                    <th className="bg-light">Safety Standards</th>
                    <td>BIS (Bureau of Indian Standards), EN71, ASTM F963 certified</td>
                  </tr>
                  <tr>
                    <th className="bg-light">Material</th>
                    <td>BPA-free non-toxic polymers & child-safe smooth rounded finishes</td>
                  </tr>
                  <tr>
                    <th className="bg-light">Country of Origin</th>
                    <td>India</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h5 className="fw-bold mb-0">Parent Ratings & Feedback</h5>
                <span className="badge bg-warning text-dark px-3 py-1 rounded-pill">
                  ★ {product.rating} / 5.0 Average
                </span>
              </div>

              {/* Review list */}
              <div className="d-flex flex-column gap-3 mb-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-3 rounded-3 bg-light border">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <strong className="text-dark">{rev.author}</strong>
                        <span className="badge bg-success-subtle text-success small">Verified Buyer</span>
                      </div>
                      <span className="text-muted small">{rev.date}</span>
                    </div>
                    <div className="d-flex text-warning mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < rev.rating ? '#fbbf24' : 'none'}
                          stroke="#fbbf24"
                        />
                      ))}
                    </div>
                    <p className="text-muted small mb-0">{rev.comment}</p>
                  </div>
                ))}
              </div>

              {/* Add Demo Review Form */}
              <div className="p-3 rounded-4 border bg-white">
                <h6 className="fw-bold mb-3">Leave a Demo Review</h6>
                {reviewSubmitted && (
                  <div className="alert alert-success py-2 small mb-3">
                    Your demo review was posted successfully!
                  </div>
                )}
                <form onSubmit={handleReviewSubmit}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Your Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm rounded-pill"
                        placeholder="e.g. Ramesh Kumar"
                        value={newReviewAuthor}
                        onChange={(e) => setNewReviewAuthor(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Rating</label>
                      <select
                        className="form-select form-select-sm rounded-pill"
                        value={newReviewRating}
                        onChange={(e) => setNewReviewRating(e.target.value)}
                      >
                        <option value="5">★★★★★ (5 - Excellent)</option>
                        <option value="4">★★★★☆ (4 - Great)</option>
                        <option value="3">★★★☆☆ (3 - Good)</option>
                        <option value="2">★★☆☆☆ (2 - Fair)</option>
                        <option value="1">★☆☆☆☆ (1 - Poor)</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Your Review</label>
                    <textarea
                      rows="3"
                      className="form-control rounded-3"
                      placeholder="Share what your kid loved about this toy..."
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-tw-primary btn-sm rounded-pill px-4">
                    <Send size={14} />
                    <span>Submit Demo Review</span>
                  </button>
                </form>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <section className="mt-5">
          <div className="d-flex align-items-end justify-content-between mb-4">
            <div>
              <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>
                Similar Magic
              </span>
              <h3 className="fw-bolder mt-1 mb-0">You May Also Like</h3>
            </div>
            <Link to={`/categories/${product.category.toLowerCase().replace(/\s+/g, '-')}`} className="text-primary fw-bold text-decoration-none">
              View Category &rarr;
            </Link>
          </div>

          <div className="row g-3 g-md-4">
            {relatedProducts.map((p) => (
              <div key={p.id} className="col-6 col-md-3">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetailPage;
