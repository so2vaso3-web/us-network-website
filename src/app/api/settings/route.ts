import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

const STORAGE_KEY = 'adminSettings';

async function readSettings(): Promise<any> {
  try {
    let settings = storage.get(STORAGE_KEY);
    // Nếu là Promise (từ KV adapter), await nó
    if (settings instanceof Promise) {
      settings = await settings;
    }
    // Nếu là VercelKVAdapter, load từ KV vào cache trước
    if (settings === null && process.env.KV_REST_API_URL) {
      // Thử load từ KV
      try {
        const { kv } = require('@vercel/kv');
        settings = await kv.get(STORAGE_KEY);
        if (settings) {
          // Update cache
          storage.set(STORAGE_KEY, settings);
        }
      } catch (e) {
        // Ignore
      }
    }
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
    const settings = await readSettings();
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

    // Merge with existing settings và đảm bảo các boolean fields luôn có giá trị rõ ràng
    const existingSettings = await readSettings();
    const updatedSettings = { 
      ...existingSettings, 
      ...settings,
      // Đảm bảo các boolean fields không bị undefined hoặc null
      paypalEnabled: settings.paypalEnabled !== undefined ? settings.paypalEnabled : (existingSettings.paypalEnabled ?? false),
      cryptoEnabled: settings.cryptoEnabled !== undefined ? settings.cryptoEnabled : (existingSettings.cryptoEnabled ?? false),
      autoApproveOrders: settings.autoApproveOrders !== undefined ? settings.autoApproveOrders : (existingSettings.autoApproveOrders ?? false),
      emailNotifications: settings.emailNotifications !== undefined ? settings.emailNotifications : (existingSettings.emailNotifications ?? false),
    };

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

