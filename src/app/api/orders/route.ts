import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

const STORAGE_KEY = 'orders';

// Đọc orders từ storage
async function readOrders(): Promise<any[]> {
  try {
    let orders = storage.get(STORAGE_KEY);
    
    // Nếu không có trong cache và có Vercel KV, load từ KV
    if ((!orders || !Array.isArray(orders)) && 
        process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = require('@vercel/kv');
        orders = await kv.get(STORAGE_KEY);
        if (orders && Array.isArray(orders)) {
          // Update cache
          storage.set(STORAGE_KEY, orders);
          return orders;
        }
      } catch (e) {
        console.error('Error loading orders from KV:', e);
      }
    }
    
    if (Array.isArray(orders)) {
      return orders;
    }
  } catch (error) {
    console.error('Error reading orders:', error);
  }
  // Nếu không có data, trả về mảng rỗng và lưu
  storage.set(STORAGE_KEY, []);
  return [];
}

// Lưu orders vào storage
function saveOrders(orders: any[]): void {
  try {
    storage.set(STORAGE_KEY, orders);
  } catch (error) {
    console.error('Error saving orders:', error);
    throw error;
  }
}

// GET /api/orders - Lấy danh sách orders
export async function GET() {
  try {
    const orders = await readOrders();
    return NextResponse.json({ 
      success: true, 
      orders,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Lưu orders hoặc thêm order mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orders, order } = body;

    // Nếu có orders array, thay thế toàn bộ
    if (Array.isArray(orders)) {
      saveOrders(orders);
      return NextResponse.json({ 
        success: true, 
        message: 'Orders saved successfully',
        timestamp: new Date().toISOString()
      });
    }

    // Nếu có order object, thêm vào danh sách
    if (order) {
      const currentOrders = await readOrders();
      const updatedOrders = [...currentOrders, order];
      saveOrders(updatedOrders);
      return NextResponse.json({ 
        success: true, 
        message: 'Order added successfully',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request data' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save orders' },
      { status: 500 }
    );
  }
}

// PUT /api/orders - Cập nhật một order
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, updates } = body;

    if (!orderId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing orderId or updates' },
        { status: 400 }
      );
    }

    const orders = await readOrders();
    const updatedOrders = orders.map((o: any) => 
      o.orderId === orderId ? { ...o, ...updates } : o
    );
    saveOrders(updatedOrders);

    return NextResponse.json({ 
      success: true, 
      message: 'Order updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in PUT /api/orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

