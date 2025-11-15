import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

const STORAGE_KEY = 'adminSettings';

function readSettings(): any {
  try {
    const settings = storage.get(STORAGE_KEY);
    if (settings && typeof settings === 'object') {
      return settings;
    }
  } catch (error) {
    console.error('Error reading settings:', error);
  }
  return {};
}

function saveSettings(settings: any): void {
  try {
    storage.set(STORAGE_KEY, settings);
  } catch (error) {
    console.error('Error saving settings:', error);
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

