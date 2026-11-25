import apiClient from './apiClient';
import { INITIAL_ORDERS } from '../data/demoOrders';
import { getStorageItem, setStorageItem } from '../utils/storage';

const ORDERS_STORAGE_KEY = 'OO Toys_orders';

const initOrdersStorage = () => {
  const existing = getStorageItem(ORDERS_STORAGE_KEY);
  if (!existing || !Array.isArray(existing) || existing.length === 0) {
    setStorageItem(ORDERS_STORAGE_KEY, INITIAL_ORDERS);
    return INITIAL_ORDERS;
  }
  return existing;
};

const parseAddressSnapshot = (raw) => {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

const mapBackendOrder = (o) => {
  const dateStr = o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString();
  const orderNumber = o.orderNumber || `ORD-${o.id}`;
  const addressObj = parseAddressSnapshot(o.shippingAddressJson || o.shippingAddressSnapshot);

  const customerName = o.customerName || addressObj?.recipientName || (o.userEmail || o.customerEmail ? (o.userEmail || o.customerEmail).split('@')[0] : 'Customer');
  const customerEmail = o.customerEmail || o.userEmail || 'customer@example.com';
  const customerPhone = o.customerPhone || addressObj?.phoneNumber || '';

  const street = addressObj?.addressLine1
    ? `${addressObj.addressLine1}${addressObj.addressLine2 ? ', ' + addressObj.addressLine2 : ''}`
    : (addressObj?.street || '');

  return {
    id: orderNumber,
    backendId: o.id,
    orderNumber: orderNumber,
    date: dateStr,
    createdAt: dateStr,
    customer: {
      email: customerEmail,
      name: customerName,
      phone: customerPhone,
      address: {
        street,
        city: addressObj?.city || '',
        state: addressObj?.state || '',
        pincode: addressObj?.postalCode || addressObj?.pincode || '',
      },
    },
    items: Array.isArray(o.items) && o.items.length > 0
      ? o.items.map((it) => ({
          id: it.productId || it.id,
          name: it.productName || it.name,
          sku: it.productSku || it.sku,
          image: it.imageUrl || it.image || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1',
          price: Number(it.unitPrice ?? it.price ?? 0),
          discountedPrice: Number(it.unitPrice ?? it.price ?? 0),
          quantity: it.quantity || 1,
          total: Number(it.totalPrice ?? ((it.unitPrice ?? it.price ?? 0) * (it.quantity || 1))),
        }))
      : (o.itemCount || o.itemsCount
          ? [
              {
                id: 1,
                name: `${o.itemCount || o.itemsCount} Items in Order`,
                quantity: o.itemCount || o.itemsCount,
                price: Number(o.totalAmount || 0),
                discountedPrice: Number(o.totalAmount || 0),
                image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1',
              },
            ]
          : []),
    subtotal: Number(o.subtotal ?? o.totalAmount ?? 0),
    shipping: Number(o.shippingFee ?? 0),
    discount: Number(o.discountAmount ?? 0),
    total: Number(o.totalAmount ?? 0),
    paymentMethod: (() => {
      let pm = o.paymentMethod;
      if (!pm) {
        const existingOrders = getStorageItem(ORDERS_STORAGE_KEY) || [];
        const matched = existingOrders.find(
          (m) => String(m.id) === String(orderNumber) || String(m.orderNumber) === String(orderNumber) || String(m.backendId) === String(o.id)
        );
        if (matched && matched.paymentMethod) return matched.paymentMethod;
        if (o.razorpayOrderId && !o.razorpayOrderId.startsWith('COD-')) return 'Razorpay / UPI';
        return 'Cash on Delivery (COD)';
      }
      if (pm === 'CASH_ON_DELIVERY' || pm.toLowerCase().includes('cash') || pm.toLowerCase().includes('cod')) {
        return 'Cash on Delivery (COD)';
      }
      if (pm === 'RAZORPAY') return 'Razorpay / UPI';
      return pm;
    })(),
    paymentStatus: (() => {
      const pm = (o.paymentMethod || '').toLowerCase();
      if (pm.includes('cash') || pm.includes('cod') || !o.razorpayOrderId) {
        return o.status === 'DELIVERED' ? 'Collected on Handover' : 'Pending (Cash on Delivery)';
      }
      return o.status === 'CONFIRMED' || o.status === 'DELIVERED' ? 'Paid' : 'Pending';
    })(),
    orderStatus: o.status || 'Ordered',
    trackingNumber: `TRK-IND-${String(o.id || 1000).padStart(6, '0')}`,
    statusTimeline: [
      {
        status: o.status || 'Ordered',
        timestamp: dateStr,
        notes: `Order created via Spring Boot engine with status ${o.status || 'Ordered'}.`,
      },
    ],
  };
};

export const orderService = {
  /**
   * Get all orders: GET /api/v1/orders
   */
  async getOrders(customerEmail = null) {
    try {
      const response = await apiClient.get('/orders');
      const paged = response.data?.data;
      const content = Array.isArray(paged?.content) ? paged.content : [];

      if (content.length > 0) {
        const mapped = content.map(mapBackendOrder);
        if (customerEmail) {
          return mapped.filter(
            (o) => o.customer?.email?.toLowerCase() === customerEmail.toLowerCase()
          );
        }
        return mapped;
      }
    } catch (err) {
      console.warn('Backend /orders failed, falling back to local orders dataset:', err.message);
    }

    const localOrders = initOrdersStorage();
    if (customerEmail) {
      return localOrders.filter(
        (o) => o.customer?.email?.toLowerCase() === customerEmail.toLowerCase()
      );
    }
    return localOrders;
  },

  /**
   * Get order by ID: GET /api/v1/orders/{id}
   */
  async getOrderById(orderId) {
    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      if (response.data?.data) {
        return mapBackendOrder(response.data.data);
      }
    } catch (err) {
      console.warn(`Backend /orders/${orderId} lookup failed:`, err.message);
    }

    const orders = initOrdersStorage();
    const found = orders.find((o) => String(o.id) === String(orderId) || o.orderNumber === String(orderId));
    if (!found) {
      throw new Error(`Order ${orderId} not found`);
    }
    return found;
  },

  /**
   * Create an order: POST /api/v1/orders
   */
  async createOrder(orderPayload) {
    const orders = initOrdersStorage();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrderId = `TW-ORD-${randomNum}`;
    const nowIso = new Date().toISOString();

    const localOrder = {
      id: newOrderId,
      orderNumber: newOrderId,
      date: nowIso,
      createdAt: nowIso,
      customer: orderPayload.customer,
      items: orderPayload.items,
      subtotal: orderPayload.subtotal,
      shipping: orderPayload.shipping || 0,
      discount: orderPayload.discount || 0,
      total: orderPayload.total,
      paymentMethod: orderPayload.paymentMethod || 'Razorpay UPI',
      paymentStatus: 'Paid (Demo Verified)',
      orderStatus: 'Ordered',
      trackingNumber: `TRK-IND-${Math.floor(100000 + Math.random() * 900000)}`,
      statusTimeline: [
        {
          status: 'Ordered',
          timestamp: nowIso,
          notes: 'Order confirmed and registered in production catalog.',
        },
      ],
    };

    // When placing an order through the authenticated backend
    if (orderPayload.shippingAddressId) {
      try {
        const isCodOrder = orderPayload.paymentMethod?.toLowerCase().includes('cash') || orderPayload.paymentMethod?.toLowerCase().includes('cod');
        const response = await apiClient.post('/orders', {
          shippingAddressId: orderPayload.shippingAddressId,
          couponCode: orderPayload.couponCode || undefined,
          paymentMethod: isCodOrder ? 'CASH_ON_DELIVERY' : 'RAZORPAY',
        });
        if (response.data?.data) {
          const backendCreated = mapBackendOrder(response.data.data);
          backendCreated.paymentMethod = orderPayload.paymentMethod || backendCreated.paymentMethod;
          setStorageItem(ORDERS_STORAGE_KEY, [backendCreated, ...orders]);
          return backendCreated;
        }
      } catch (err) {
        const backendMessage = err.response?.data?.message || err.message || 'Failed to place order on server';
        console.error('Backend order creation error:', backendMessage);
        throw new Error(backendMessage);
      }
    }

    const updated = [localOrder, ...orders];
    setStorageItem(ORDERS_STORAGE_KEY, updated);
    return localOrder;
  },

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, newStatus, notes = '') {
    const orders = initOrdersStorage();
    const index = orders.findIndex((o) => String(o.id) === String(orderId) || o.orderNumber === String(orderId));
    if (index === -1) {
      throw new Error(`Order ${orderId} not found`);
    }

    const order = orders[index];
    const updatedTimeline = [
      ...order.statusTimeline,
      {
        status: newStatus,
        timestamp: new Date().toISOString(),
        notes: notes || `Order status updated to ${newStatus}.`,
      },
    ];

    const updatedOrder = {
      ...order,
      orderStatus: newStatus,
      statusTimeline: updatedTimeline,
    };

    orders[index] = updatedOrder;
    setStorageItem(ORDERS_STORAGE_KEY, orders);
    return updatedOrder;
  },

  /**
   * Customer cancellation request
   */
  async requestCancellation(orderId, reason = 'Customer request') {
    try {
      await apiClient.post(`/orders/${orderId}/cancel`, { reason });
    } catch (e) {
      console.warn('Backend cancel call warning:', e.message);
    }
    return this.updateOrderStatus(orderId, 'Cancelled', `Cancellation requested: ${reason}`);
  },

  /**
   * Admin: List all orders across all customers: GET /api/v1/admin/orders
   */
  async getAdminOrders(params = {}) {
    try {
      const response = await apiClient.get('/admin/orders', { params });
      const paged = response.data?.data;
      const content = Array.isArray(paged?.content) ? paged.content : (Array.isArray(paged) ? paged : []);
      if (content.length > 0) {
        return content.map(mapBackendOrder);
      }
    } catch (err) {
      console.warn('Backend /admin/orders call failed:', err.message);
    }
    return this.getOrders();
  },

  /**
   * Admin: Update order fulfillment status: PUT /api/v1/admin/orders/{id}/status
   */
  async updateAdminOrderStatus(orderId, status, notes = '') {
    const numericId = typeof orderId === 'number'
      ? orderId
      : (orderId.includes('-') ? parseInt(orderId.split('-').pop(), 10) : parseInt(orderId, 10));

    try {
      if (!isNaN(numericId)) {
        const response = await apiClient.put(`/admin/orders/${numericId}/status`, {
          status: status.toUpperCase(),
          notes: notes || `Admin updated status to ${status}`,
        });
        if (response.data?.data) {
          const o = response.data.data;
          const dateStr = o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString();
          const orderNumber = o.orderNumber || `ORD-${o.id}`;
          return {
            id: orderNumber,
            backendId: o.id,
            orderNumber: orderNumber,
            date: dateStr,
            createdAt: dateStr,
            customer: {
              email: o.userEmail || 'customer@example.com',
              name: o.customerName || 'Customer',
            },
            items: [],
            total: Number(o.totalAmount || 0),
            orderStatus: o.status || status,
            statusTimeline: [
              {
                status: o.status || status,
                timestamp: dateStr,
                notes: notes || `Admin updated status to ${status}`,
              },
            ],
          };
        }
      }
    } catch (err) {
      console.warn('Backend /admin/orders status update failed:', err.message);
    }
    return this.updateOrderStatus(orderId, status, notes);
  },
};
