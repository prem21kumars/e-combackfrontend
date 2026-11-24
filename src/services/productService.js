import apiClient from './apiClient';
import { INITIAL_PRODUCTS } from '../data/products';
import { CATEGORIES } from '../data/categories';
import { getStorageItem, setStorageItem } from '../utils/storage';

const PRODUCTS_STORAGE_KEY = 'OO Toys_products_v2';
const CATEGORIES_STORAGE_KEY = 'OO Toys_categories_v2';

/**
 * Normalizes Spring Boot ProductSummaryDto / ProductDetailDto into
 * unified frontend product shape compatible with existing UI cards & grids.
 */
export const normalizeProduct = (p) => {
  if (!p) return null;

  const basePrice = Number(p.basePrice ?? p.price ?? 0);
  const salePrice = p.salePrice ? Number(p.salePrice) : null;
  const discountPct = p.discountPercentage !== undefined
    ? Number(p.discountPercentage)
    : (salePrice && basePrice > 0 ? Math.round(((basePrice - salePrice) / basePrice) * 100) : 0);

  const primaryImg = p.primaryImageUrl || (p.images && p.images[0]?.imageUrl) || p.image ||
    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80';

  return {
    ...p,
    id: p.id,
    name: p.name,
    sku: p.sku || `TW-PRD-${String(p.id).padStart(4, '0')}`,
    category: p.categoryName || p.category || 'Educational Toys',
    categoryId: p.categoryId,
    categorySlug: p.categorySlug,
    description: p.description || p.shortDescription || '',
    shortDescription: p.shortDescription || p.description || '',
    price: basePrice,
    basePrice: basePrice,
    salePrice: salePrice,
    discountPercentage: discountPct,
    image: primaryImg,
    primaryImageUrl: primaryImg,
    images: p.images && p.images.length > 0 ? p.images : [{ imageUrl: primaryImg, isPrimary: true }],
    ageGroup: p.ageGroup || (basePrice > 3000 ? '9+' : basePrice > 1500 ? '6-8' : '3-5'),
    stock: p.availableStock !== undefined ? p.availableStock : (p.stock ?? 20),
    availableStock: p.availableStock !== undefined ? p.availableStock : (p.stock ?? 20),
    rating: Number(p.averageRating ?? p.rating ?? 4.8),
    reviewsCount: Number(p.totalReviews ?? p.reviewsCount ?? 45),
    popularity: p.popularity || 85,
    isFeatured: p.featured !== undefined ? p.featured : (p.isFeatured ?? true),
    isNewArrival: p.isNewArrival ?? true,
    isBestSeller: p.isBestSeller ?? (discountPct >= 15),
    isSpecialOffer: p.isSpecialOffer ?? (discountPct > 0),
    isActive: p.status ? p.status === 'PUBLISHED' : (p.isActive !== false),
    features: p.features || ['Child-Safe Non-Toxic Materials', 'Warranty Included', 'Certified Quality'],
  };
};

export const productService = {
  /**
   * Fetch all products from Spring Boot API: GET /api/v1/products
   */
  async getProducts(params = {}) {
    try {
      const apiParams = {
        page: 0,
        size: 50,
      };

      if (params.search) apiParams.search = params.search;
      if (params.minPrice) apiParams.minPrice = params.minPrice;
      if (params.maxPrice) apiParams.maxPrice = params.maxPrice;
      if (params.featured !== undefined) apiParams.featured = params.featured;

      if (params.sortBy) {
        if (params.sortBy === 'price-asc') {
          apiParams.sortBy = 'basePrice';
          apiParams.direction = 'asc';
        } else if (params.sortBy === 'price-desc') {
          apiParams.sortBy = 'basePrice';
          apiParams.direction = 'desc';
        } else if (params.sortBy === 'name-asc') {
          apiParams.sortBy = 'name';
          apiParams.direction = 'asc';
        }
      }

      const response = await apiClient.get('/products', { params: apiParams });
      const paged = response.data.data;
      const serverItems = Array.isArray(paged?.content) ? paged.content : [];

      if (serverItems.length > 0) {
        let normalized = serverItems.map(normalizeProduct);

        // Apply client-side category/age filter if requested
        if (params.category && params.category !== 'all') {
          const catLower = params.category.toLowerCase().replace(/-/g, ' ');
          normalized = normalized.filter((p) =>
            p.category.toLowerCase() === catLower ||
            p.category.toLowerCase().replace(/\s+/g, '-') === params.category.toLowerCase() ||
            p.categorySlug === params.category
          );
        }

        if (params.ageGroup && params.ageGroup !== 'all') {
          normalized = normalized.filter((p) => p.ageGroup === params.ageGroup);
        }

        return normalized;
      }
    } catch (err) {
      console.warn('Backend /products call failed, falling back to local dataset:', err.message);
    }

    // Fallback to local storage or INITIAL_PRODUCTS
    const local = getStorageItem(PRODUCTS_STORAGE_KEY, INITIAL_PRODUCTS);
    return local.map(normalizeProduct);
  },

  /**
   * Fetch single product by ID: GET /api/v1/products/{id}
   */
  async getProductById(id) {
    try {
      const response = await apiClient.get(`/products/${id}`);
      if (response.data?.data) {
        return normalizeProduct(response.data.data);
      }
    } catch (err) {
      console.warn(`Backend /products/${id} failed, trying local fallback:`, err.message);
    }

    const local = getStorageItem(PRODUCTS_STORAGE_KEY, INITIAL_PRODUCTS);
    const found = local.find((p) => String(p.id) === String(id));
    if (!found) {
      throw new Error(`Product with ID ${id} not found`);
    }
    return normalizeProduct(found);
  },

  /**
   * Fetch all categories: GET /api/v1/categories
   */
  async getCategories() {
    try {
      const response = await apiClient.get('/categories?hierarchical=false');
      const cats = response.data?.data;
      if (Array.isArray(cats) && cats.length > 0) {
        return cats.map((c) => ({
          id: c.slug || String(c.id),
          backendId: c.id,
          slug: c.slug,
          name: c.name,
          description: c.description || 'Explore our vibrant toy collection.',
          image: c.imageUrl || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
          icon: 'Sparkles',
          badgeText: 'Active',
          bgColor: '#e0f2fe',
          color: '#0284c7',
        }));
      }
    } catch (err) {
      console.warn('Backend /categories failed, falling back to local categories:', err.message);
    }

    return getStorageItem(CATEGORIES_STORAGE_KEY, CATEGORIES);
  },

  /**
   * Admin: Add new category: POST /api/v1/admin/categories
   */
  async createCategory(categoryData) {
    const slug = categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    try {
      const payload = {
        name: categoryData.name,
        slug: slug,
        description: categoryData.description || categoryData.name,
        imageUrl: categoryData.image || null,
        parentId: categoryData.parentId ? Number(categoryData.parentId) : null,
        displayOrder: Number(categoryData.displayOrder || 0),
        active: true,
      };
      const response = await apiClient.post('/admin/categories', payload);
      const created = response.data?.data;
      return {
        id: created?.slug || String(created?.id || slug),
        backendId: created?.id,
        slug: created?.slug || slug,
        name: created?.name || categoryData.name,
        description: created?.description || categoryData.description,
        image: created?.imageUrl || categoryData.image,
        badgeText: 'Curated',
        color: categoryData.color || '#0284c7',
      };
    } catch (err) {
      console.warn('Backend /admin/categories creation failed, saving locally:', err.message);
      const local = getStorageItem(CATEGORIES_STORAGE_KEY, CATEGORIES);
      const newCat = {
        id: slug,
        slug,
        name: categoryData.name,
        description: categoryData.description || '',
        image: categoryData.image,
        badgeText: categoryData.badgeText || 'Curated',
        color: categoryData.color || '#0284c7',
      };
      setStorageItem(CATEGORIES_STORAGE_KEY, [...local, newCat]);
      return newCat;
    }
  },

  /**
   * Admin: Add new product: POST /api/v1/admin/products
   */
  async createProduct(productData) {
    try {
      const payload = {
        name: productData.name,
        sku: productData.sku || `TW-PRD-${Date.now().toString().slice(-4)}`,
        description: productData.description || productData.name,
        shortDescription: productData.shortDescription || (productData.description ? productData.description.slice(0, 150) : productData.name),
        categoryId: Number(productData.categoryId || 1),
        basePrice: Number(productData.price),
        salePrice: productData.discountPercentage > 0
          ? Number((productData.price * (1 - productData.discountPercentage / 100)).toFixed(2))
          : null,
        initialStock: Number(productData.stock || 20),
        featured: Boolean(productData.isFeatured),
        status: 'PUBLISHED',
        images: productData.image
          ? [
              {
                imageUrl: productData.image,
                altText: productData.name,
                primary: true,
                displayOrder: 0,
              },
            ]
          : [],
      };

      const response = await apiClient.post('/admin/products', payload);
      return normalizeProduct(response.data.data);
    } catch (err) {
      console.warn('Backend /admin/products creation failed, falling back to local:', err.message);
      const local = getStorageItem(PRODUCTS_STORAGE_KEY, INITIAL_PRODUCTS);
      const newId = local.length > 0 ? Math.max(...local.map((p) => p.id)) + 1 : 1;
      const newProduct = normalizeProduct({ id: newId, ...productData });
      setStorageItem(PRODUCTS_STORAGE_KEY, [newProduct, ...local]);
      return newProduct;
    }
  },

  /**
   * Admin: Update product: PUT /api/v1/admin/products/{id}
   */
  async updateProduct(id, productData) {
    try {
      const payload = {
        name: productData.name,
        sku: productData.sku,
        description: productData.description,
        shortDescription: productData.shortDescription,
        categoryId: Number(productData.categoryId || 1),
        basePrice: Number(productData.price),
        salePrice: productData.discountPercentage > 0
          ? Number((productData.price * (1 - productData.discountPercentage / 100)).toFixed(2))
          : null,
        featured: Boolean(productData.isFeatured),
        status: productData.isActive === false ? 'ARCHIVED' : 'PUBLISHED',
      };

      const response = await apiClient.put(`/admin/products/${id}`, payload);
      return normalizeProduct(response.data.data);
    } catch (err) {
      console.warn(`Backend /admin/products/${id} update failed:`, err.message);
      const local = getStorageItem(PRODUCTS_STORAGE_KEY, INITIAL_PRODUCTS);
      const idx = local.findIndex((p) => String(p.id) === String(id));
      if (idx !== -1) {
        local[idx] = normalizeProduct({ ...local[idx], ...productData });
        setStorageItem(PRODUCTS_STORAGE_KEY, local);
        return local[idx];
      }
      throw err;
    }
  },

  /**
   * Admin: Delete product: DELETE /api/v1/admin/products/{id}
   */
  async deleteProduct(id) {
    try {
      await apiClient.delete(`/admin/products/${id}`);
      return true;
    } catch (err) {
      console.warn(`Backend /admin/products/${id} delete failed:`, err.message);
      const local = getStorageItem(PRODUCTS_STORAGE_KEY, INITIAL_PRODUCTS);
      const filtered = local.filter((p) => String(p.id) !== String(id));
      setStorageItem(PRODUCTS_STORAGE_KEY, filtered);
      return true;
    }
  },

  /**
   * Reset local storage
   */
  async resetToDefaults() {
    setStorageItem(PRODUCTS_STORAGE_KEY, INITIAL_PRODUCTS);
    setStorageItem(CATEGORIES_STORAGE_KEY, CATEGORIES);
    return INITIAL_PRODUCTS;
  },
};
