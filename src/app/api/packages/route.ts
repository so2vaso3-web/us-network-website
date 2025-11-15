import { NextRequest, NextResponse } from 'next/server';
import { Package } from '@/types';
import { defaultPackages } from '@/lib/data';
import { storage } from '@/lib/storage';

const STORAGE_KEY = 'packages';

// Đọc packages từ storage
async function readPackages(): Promise<Package[]> {
  try {
    let packages = storage.get(STORAGE_KEY);
    
    // Nếu không có trong cache và có Vercel KV, load từ KV
    if ((!packages || !Array.isArray(packages) || packages.length === 0) && 
        process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = require('@vercel/kv');
        packages = await kv.get(STORAGE_KEY);
        if (packages && Array.isArray(packages) && packages.length > 0) {
          // Update cache
          storage.set(STORAGE_KEY, packages);
          return packages;
        }
      } catch (e) {
        console.error('Error loading packages from KV:', e);
      }
    }
    
    if (Array.isArray(packages) && packages.length > 0) {
      return packages;
    }
  } catch (error) {
    console.error('Error reading packages:', error);
  }
  // Nếu không có data, trả về default và lưu
  storage.set(STORAGE_KEY, defaultPackages);
  return defaultPackages;
}

// Lưu packages vào storage
function savePackages(packages: Package[]): void {
  try {
    storage.set(STORAGE_KEY, packages);
  } catch (error) {
    console.error('Error saving packages:', error);
    throw error;
  }
}

// GET /api/packages - Lấy danh sách packages
export async function GET() {
  try {
    const packages = await readPackages();
    return NextResponse.json({ 
      success: true, 
      packages,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GET /api/packages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read packages' },
      { status: 500 }
    );
  }
}

// POST /api/packages - Lưu packages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { packages, password } = body;

    // Kiểm tra password (có thể cải thiện sau với JWT hoặc session)
    // Tạm thời dùng password đơn giản hoặc có thể bỏ qua nếu chỉ dùng trong nội bộ
    // const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    // if (password !== ADMIN_PASSWORD) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    if (!Array.isArray(packages)) {
      return NextResponse.json(
        { success: false, error: 'Invalid packages data' },
        { status: 400 }
      );
    }

    savePackages(packages);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Packages saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in POST /api/packages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save packages' },
      { status: 500 }
    );
  }
}

