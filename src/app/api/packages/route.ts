import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { Package } from '@/types';
import { defaultPackages } from '@/lib/data';

const DATA_FILE = join(process.cwd(), 'data', 'packages.json');

// Đảm bảo thư mục data tồn tại
function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
}

// Đọc packages từ file
function readPackages(): Package[] {
  try {
    ensureDataDir();
    if (existsSync(DATA_FILE)) {
      const fileContent = readFileSync(DATA_FILE, 'utf-8');
      const packages = JSON.parse(fileContent);
      if (Array.isArray(packages) && packages.length > 0) {
        return packages;
      }
    }
  } catch (error) {
    console.error('Error reading packages file:', error);
  }
  // Nếu không có file hoặc lỗi, trả về default và tạo file
  ensureDataDir();
  writeFileSync(DATA_FILE, JSON.stringify(defaultPackages, null, 2), 'utf-8');
  return defaultPackages;
}

// Lưu packages vào file
function savePackages(packages: Package[]): void {
  try {
    ensureDataDir();
    writeFileSync(DATA_FILE, JSON.stringify(packages, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving packages file:', error);
    throw error;
  }
}

// GET /api/packages - Lấy danh sách packages
export async function GET() {
  try {
    const packages = readPackages();
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

