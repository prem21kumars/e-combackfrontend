/**
 * Safe LocalStorage helpers with JSON parsing and fallback
 */

export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error writing to localStorage key "${key}":`, error);
  }
};

export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Error removing localStorage key "${key}":`, error);
  }
};
