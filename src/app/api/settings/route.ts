import { NextRequest, NextResponse } from 'next/server';
import { readSettingsFromKV, saveSettingsToKV } from '@/lib/settings-storage';
import { encryptSettings } from '@/lib/encryption';

// GET - Load settings from Redis/KV
export async function GET() {
  try {
    const settings = await readSettingsFromKV(true); // decrypt = true
    if (settings && typeof settings === 'object') {
      return NextResponse.json({ success: true, settings });
    }
    // No settings found, return empty
    return NextResponse.json({ success: true, settings: null });
  } catch (error: any) {
    console.error('Error loading settings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Save settings to Redis/KV
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

    // Save to Redis/KV (encrypted)
    await saveSettingsToKV(settings, encryptSettings);
    console.log('✅ Settings saved to Redis/KV successfully');

    return NextResponse.json({ success: true, message: 'Settings saved to Redis/KV' });
  } catch (error: any) {
    console.error('Error saving settings to Redis/KV:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save settings' },
      { status: 500 }
    );
  }
}




