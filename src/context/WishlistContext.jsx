import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { wishlistService } from '../services/wishlistService';

const WishlistContext = createContext();
const WISHLIST_STORAGE_KEY = 'OO Toys_wishlist';

const mapBackendWishlistItems = (serverItems) => {
  if (!Array.isArray(serverItems)) return [];
  return serverItems.map((item) => ({
    id: item.productId,
    wishlistItemId: item.id,
    name: item.productName,
    sku: item.productSku,
    category: 'Educational Toys',
    price: Number(item.price),
    discountedPrice: Number(item.price),
    discountPercentage: 0,
    image: item.imageUrl || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
    stock: item.inStock ? 20 : 0,
    rating: 4.8,
  }));
};

export const WishlistProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [wishlistItems, setWishlistItems] = useState(() =>
    getStorageItem(WISHLIST_STORAGE_KEY, [])
  );
  const { addToCart } = useCart();

  // Sync wishlist from backend when user logs in
  const syncWithBackendWishlist = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const serverWishlist = await wishlistService.getWishlist();
      if (serverWishlist && Array.isArray(serverWishlist.items)) {
        const mapped = mapBackendWishlistItems(serverWishlist.items);
        if (mapped.length > 0) {
          setWishlistItems(mapped);
        }
      }
    } catch (err) {
      console.warn('Backend wishlist sync note:', err.message);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    syncWithBackendWishlist();
  }, [syncWithBackendWishlist]);

  useEffect(() => {
    setStorageItem(WISHLIST_STORAGE_KEY, wishlistItems);
  }, [wishlistItems]);

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const addToWishlist = async (product) => {
    if (!isInWishlist(product.id)) {
      setWishlistItems((prev) => [...prev, product]);
    }

    if (isLoggedIn) {
      try {
        const serverWishlist = await wishlistService.addToWishlist(product.id);
        if (serverWishlist && Array.isArray(serverWishlist.items)) {
          setWishlistItems(mapBackendWishlistItems(serverWishlist.items));
        }
      } catch (err) {
        console.warn('Backend wishlist add error:', err.message);
      }
    }
  };

  const removeFromWishlist = async (productId) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));

    if (isLoggedIn) {
      try {
        const serverWishlist = await wishlistService.removeFromWishlist(productId);
        if (serverWishlist && Array.isArray(serverWishlist.items)) {
          setWishlistItems(mapBackendWishlistItems(serverWishlist.items));
        }
      } catch (err) {
        console.warn('Backend wishlist remove error:', err.message);
      }
    }
  };

  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const moveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        moveToCart,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
