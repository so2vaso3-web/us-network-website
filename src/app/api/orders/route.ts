import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_FILE = join(process.cwd(), 'data', 'orders.json');

// Đảm bảo thư mục data tồn tại
function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
}

// Đọc orders từ file
function readOrders(): any[] {
  try {
    ensureDataDir();
    if (existsSync(DATA_FILE)) {
      const fileContent = readFileSync(DATA_FILE, 'utf-8');
      const orders = JSON.parse(fileContent);
      if (Array.isArray(orders)) {
        return orders;
      }
    }
  } catch (error) {
    console.error('Error reading orders file:', error);
  }
  // Nếu không có file hoặc lỗi, trả về mảng rỗng và tạo file
  ensureDataDir();
  writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  return [];
}

// Lưu orders vào file
function saveOrders(orders: any[]): void {
  try {
    ensureDataDir();
    writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving orders file:', error);
    throw error;
  }
}

// GET /api/orders - Lấy danh sách orders
export async function GET() {
  try {
    const orders = readOrders();
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
      const currentOrders = readOrders();
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

    const orders = readOrders();
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

