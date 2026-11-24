/**
 * Format number into Indian Rupee currency format (e.g., ₹1,299)
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date string or timestamp
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

/**
 * Calculate discounted price from original price and discount percentage
 */
export const calculateDiscountedPrice = (price, discountPercentage) => {
  if (!discountPercentage || discountPercentage <= 0) return price;
  const discountAmount = (price * discountPercentage) / 100;
  return Math.round(price - discountAmount);
};

/**
 * Format SKU code
 */
export const formatSKU = (id, category) => {
  const prefix = (category || 'TOY').slice(0, 3).toUpperCase();
  return `TW-${prefix}-${String(id).padStart(4, '0')}`;
};
