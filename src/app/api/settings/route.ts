import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const SETTINGS_FILE = join(process.cwd(), 'data', 'adminSettings.json');

function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
}

function readSettings(): any {
  try {
    ensureDataDir();
    if (existsSync(SETTINGS_FILE)) {
      const content = readFileSync(SETTINGS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error reading settings file:', error);
  }
  return {};
}

function saveSettings(settings: any): void {
  try {
    ensureDataDir();
    writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving settings file:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const settings = readSettings();
    return NextResponse.json({ 
      success: true, 
      settings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GET /api/settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid settings data' },
        { status: 400 }
      );
    }

    // Merge with existing settings
    const existingSettings = readSettings();
    const updatedSettings = { ...existingSettings, ...settings };

    saveSettings(updatedSettings);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Settings saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in POST /api/settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

