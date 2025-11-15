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
        }
      } catch (e) {
        console.error('Error loading packages from KV:', e);
      }
    }
    
    // Kiểm tra nếu packages trong storage khác với defaultPackages (để tự động sync khi code thay đổi)
    let shouldUpdate = false;
    if (!packages || !Array.isArray(packages) || packages.length === 0) {
      shouldUpdate = true;
    } else if (packages.length !== defaultPackages.length) {
      // So sánh số lượng packages, nếu khác thì cần update
      shouldUpdate = true;
    } else {
      // So sánh chi tiết: kiểm tra xem có package nào thay đổi không (dựa vào id và price)
      const defaultMap = new Map(defaultPackages.map(p => [p.id, p.price]));
      const storedMap = new Map(packages.map((p: Package) => [p.id, p.price]));
      
      // Use Array.from to iterate over Map entries
      Array.from(defaultMap.entries()).forEach(([id, price]) => {
        if (storedMap.get(id) !== price) {
          shouldUpdate = true;
        }
      });
    }
    
    if (shouldUpdate) {
      console.log('Packages changed in code, updating storage and server...');
      // Lưu vào storage
      storage.set(STORAGE_KEY, defaultPackages);
      
      // Lưu lên Vercel KV nếu có
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        try {
          const { kv } = require('@vercel/kv');
          await kv.set(STORAGE_KEY, defaultPackages);
          console.log('Packages saved to Vercel KV');
        } catch (e) {
          console.error('Error saving packages to KV:', e);
        }
      }
      
      return defaultPackages;
    }
    
    return packages || defaultPackages;
  } catch (error) {
    console.error('Error reading packages:', error);
  }
  // Nếu không có data, trả về default và lưu
  storage.set(STORAGE_KEY, defaultPackages);
  
  // Lưu lên Vercel KV nếu có
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const { kv } = require('@vercel/kv');
      await kv.set(STORAGE_KEY, defaultPackages);
    } catch (e) {
      console.error('Error saving packages to KV:', e);
    }
  }
  
  return defaultPackages;
}

// Lưu packages vào storage và server
async function savePackages(packages: Package[]): Promise<void> {
  try {
    // Lưu vào storage (local hoặc file system)
    storage.set(STORAGE_KEY, packages);
    
    // Lưu lên Vercel KV nếu có
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = require('@vercel/kv');
        await kv.set(STORAGE_KEY, packages);
        console.log('Packages saved to Vercel KV');
      } catch (e) {
        console.error('Error saving packages to KV:', e);
        // Không throw error, vì đã lưu vào storage rồi
      }
    }
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

    await savePackages(packages);
    
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

