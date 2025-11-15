'use client';

/**
 * Load orders từ server
 */
export async function loadOrdersFromServer(): Promise<any[]> {
  try {
    const response = await fetch('/api/orders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.orders)) {
        // Lưu vào localStorage làm cache
        if (typeof window !== 'undefined') {
          localStorage.setItem('orders', JSON.stringify(data.orders));
        }
        return data.orders;
      }
    }
  } catch (error) {
    console.error('Error loading orders from server:', error);
  }
  
  // Fallback: load từ localStorage
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('orders');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error('Error loading from cache:', e);
      }
    }
  }
  
  return [];
}

/**
 * Lưu orders lên server
 */
export async function saveOrdersToServer(orders: any[]): Promise<boolean> {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orders }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // Lưu vào localStorage làm cache
        if (typeof window !== 'undefined') {
          localStorage.setItem('orders', JSON.stringify(orders));
        }
        // Dispatch event để tất cả component cập nhật
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ordersUpdated'));
        }
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error saving orders to server:', error);
    return false;
  }
}

/**
 * Thêm order mới lên server
 */
export async function addOrderToServer(order: any): Promise<boolean> {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // Reload orders từ server
        await loadOrdersFromServer();
        // Dispatch event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ordersUpdated'));
        }
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error adding order to server:', error);
    return false;
  }
}

/**
 * Cập nhật order trên server
 */
export async function updateOrderOnServer(orderId: string, updates: any): Promise<boolean> {
  try {
    const response = await fetch('/api/orders', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId, updates }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // Reload orders từ server
        await loadOrdersFromServer();
        // Dispatch event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ordersUpdated'));
        }
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error updating order on server:', error);
    return false;
  }
}

