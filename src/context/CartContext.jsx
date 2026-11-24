import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { useAuth } from './AuthContext';
import { cartService } from '../services/cartService';

const CartContext = createContext();
const CART_STORAGE_KEY = 'OO Toys_cart';
const PROMO_STORAGE_KEY = 'OO Toys_promo';

const VALID_PROMOS = {
  TOYJOY10: { type: 'percent', value: 10, label: '10% OFF Special Joy Discount' },
  SUPERKID: { type: 'flat', value: 300, minOrder: 1500, label: '₹300 OFF SuperKid Bonus' },
  FIRSTTOY: { type: 'percent', value: 15, label: '15% First Order Welcome' },
};

const mapBackendCartItems = (serverItems) => {
  if (!Array.isArray(serverItems)) return [];
  return serverItems.map((item) => ({
    id: item.productId,
    cartItemId: item.id,
    name: item.productName,
    sku: item.productSku,
    category: 'Educational Toys',
    price: Number(item.unitPrice),
    discountedPrice: Number(item.unitPrice),
    discountPercentage: 0,
    image: item.imageUrl || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
    stock: item.availableStock,
    quantity: item.quantity,
  }));
};

export const CartProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [cartItems, setCartItems] = useState(() => getStorageItem(CART_STORAGE_KEY, []));
  const [promoCode, setPromoCode] = useState(() => getStorageItem(PROMO_STORAGE_KEY, null));
  const [notification, setNotification] = useState(null);
  const hasSyncedRef = useRef(false);

  // Sync cart from backend when user logs in (and push guest items if backend cart is empty)
  useEffect(() => {
    if (!isLoggedIn) {
      hasSyncedRef.current = false;
      return;
    }
    if (hasSyncedRef.current) return;
    hasSyncedRef.current = true;

    const syncCart = async () => {
      try {
        const serverCart = await cartService.getCart();
        const serverItems = Array.isArray(serverCart?.items) ? serverCart.items : [];
        const localItems = getStorageItem(CART_STORAGE_KEY, []);

        if (serverItems.length === 0 && localItems.length > 0) {
          for (const item of localItems) {
            try {
              await cartService.addItem(item.id, item.quantity);
            } catch (e) {
              console.warn(`Could not sync item ${item.id} to server cart:`, e.message);
            }
          }
          const updated = await cartService.getCart();
          if (updated && Array.isArray(updated.items) && updated.items.length > 0) {
            setCartItems(mapBackendCartItems(updated.items));
          }
        } else if (serverItems.length > 0) {
          setCartItems(mapBackendCartItems(serverItems));
        }
      } catch (err) {
        console.warn('Backend cart sync note:', err.message);
      }
    };

    syncCart();
  }, [isLoggedIn]);

  useEffect(() => {
    setStorageItem(CART_STORAGE_KEY, cartItems);
  }, [cartItems]);

  useEffect(() => {
    if (promoCode) {
      setStorageItem(PROMO_STORAGE_KEY, promoCode);
    } else {
      localStorage.removeItem(PROMO_STORAGE_KEY);
    }
  }, [promoCode]);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  /**
   * Add product to cart with chosen quantity
   */
  const addToCart = async (product, quantity = 1) => {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const existingIndex = cartItems.findIndex((item) => item.id === product.id);
    const discountedPrice = product.discountPercentage > 0
      ? Math.round(product.price - (product.price * product.discountPercentage) / 100)
      : product.price;

    let updatedList;
    if (existingIndex > -1) {
      updatedList = [...cartItems];
      const newQty = updatedList[existingIndex].quantity + qty;
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        quantity: newQty,
      };
      showToast(`Updated "${product.name}" quantity to ${newQty}!`);
    } else {
      const newItem = {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price,
        discountedPrice,
        discountPercentage: product.discountPercentage || 0,
        image: product.image,
        stock: product.stock,
        quantity: qty,
      };
      showToast(`Added "${product.name}" to your cart! 🛍️`);
      updatedList = [...cartItems, newItem];
    }
    setCartItems(updatedList);

    // Call backend API if authenticated
    if (isLoggedIn) {
      try {
        const serverCart = await cartService.addItem(product.id, qty);
        if (serverCart && Array.isArray(serverCart.items)) {
          setCartItems(mapBackendCartItems(serverCart.items));
        }
      } catch (err) {
        console.warn('Backend cart item add failed:', err.message);
      }
    }
  };

  /**
   * Update quantity of a product
   */
  const updateQuantity = async (productId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cartItems.find((i) => i.id === productId);
    setCartItems((prevItems) =>
      prevItems.map((it) =>
        it.id === productId ? { ...it, quantity: qty } : it
      )
    );

    if (isLoggedIn && item?.cartItemId) {
      try {
        const serverCart = await cartService.updateItem(item.cartItemId, qty);
        if (serverCart && Array.isArray(serverCart.items)) {
          setCartItems(mapBackendCartItems(serverCart.items));
        }
      } catch (err) {
        console.warn('Backend cart quantity update failed:', err.message);
      }
    }
  };

  /**
   * Remove product from cart
   */
  const removeFromCart = async (productId) => {
    const itemToRemove = cartItems.find((item) => item.id === productId);
    if (itemToRemove) {
      showToast(`Removed "${itemToRemove.name}" from cart.`);
    }

    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));

    if (isLoggedIn && itemToRemove?.cartItemId) {
      try {
        await cartService.removeItem(itemToRemove.cartItemId);
      } catch (err) {
        console.warn('Backend cart item remove failed:', err.message);
      }
    }
  };

  /**
   * Clear all items
   */
  const clearCart = async () => {
    setCartItems([]);
    setPromoCode(null);

    if (isLoggedIn) {
      try {
        await cartService.clearCart();
      } catch (err) {
        console.warn('Backend clear cart failed:', err.message);
      }
    }
  };

  /**
   * Apply promotional coupon code
   */
  const applyPromoCode = (code) => {
    const cleanCode = code ? code.trim().toUpperCase() : '';
    if (VALID_PROMOS[cleanCode]) {
      setPromoCode({ code: cleanCode, ...VALID_PROMOS[cleanCode] });
      showToast(`Promo "${cleanCode}" applied successfully! 🎉`);
      return { success: true, message: 'Promo applied successfully!' };
    } else {
      return { success: false, message: 'Invalid promo code. Try TOYJOY10 or SUPERKID' };
    }
  };

  const removePromoCode = () => {
    setPromoCode(null);
    showToast('Promo code removed.');
  };

  // Calculations
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.discountedPrice * item.quantity,
    0
  );

  const originalTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const productSavings = originalTotal - subtotal;

  // Shipping: Free above ₹999, else ₹99
  const shipping = subtotal === 0 || subtotal >= 999 ? 0 : 99;

  // Coupon discount calculation
  let promoDiscount = 0;
  if (promoCode && subtotal > 0) {
    if (promoCode.type === 'percent') {
      promoDiscount = Math.round((subtotal * promoCode.value) / 100);
    } else if (promoCode.type === 'flat') {
      if (!promoCode.minOrder || subtotal >= promoCode.minOrder) {
        promoDiscount = promoCode.value;
      }
    }
  }

  const total = Math.max(0, subtotal - promoDiscount + shipping);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        originalTotal,
        productSavings,
        shipping,
        promoDiscount,
        promoCode,
        total,
        notification,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyPromoCode,
        removePromoCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
