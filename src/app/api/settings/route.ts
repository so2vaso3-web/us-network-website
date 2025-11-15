import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';

const SETTINGS_FILE = join(process.cwd(), 'data', 'settings.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data');
  try {
    await mkdir(dataDir, { recursive: true });
  } catch (e) {
    // Directory might already exist
  }
}

// GET - Load settings
export async function GET() {
  try {
    await ensureDataDir();
    try {
      const data = await readFile(SETTINGS_FILE, 'utf-8');
      const settings = JSON.parse(data);
      return NextResponse.json({ success: true, settings });
    } catch (e) {
      // File doesn't exist yet, return empty
      return NextResponse.json({ success: true, settings: null });
    }
  } catch (error: any) {
    console.error('Error loading settings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Save settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json(
        { success: false, error: 'Settings are required' },
        { status: 400 }
      );
    }

    await ensureDataDir();
    await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');

    return NextResponse.json({ success: true, message: 'Settings saved' });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}




