import { NextRequest, NextResponse } from 'next/server';
import { encryptSettings, decryptSettings } from '@/lib/encryption';

const STORAGE_KEY = 'adminSettings';

/**
 * Read settings from Vercel KV only (no filesystem)
 * Returns safe fallback if DB fails
 */
async function readSettingsFromKV(): Promise<any> {
  try {
    // CHỈ dùng Vercel KV, không dùng filesystem
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = require('@vercel/kv');
        const kvSettings = await kv.get(STORAGE_KEY);
        if (kvSettings && typeof kvSettings === 'object') {
          // Decrypt sensitive fields before returning
          return decryptSettings(kvSettings);
        }
      } catch (e) {
        console.error('Error loading from Vercel KV:', e);
        // Fall through to safe fallback
      }
    }
  } catch (error) {
    console.error('Error reading settings:', error);
  }
  
  // Safe fallback - return minimal safe defaults
  return {
    paypalEnabled: false,
    cryptoEnabled: false,
    websiteName: 'US Mobile Networks',
    paypalMode: 'sandbox',
    cryptoGateway: 'manual',
  };
}

async function readSettings(): Promise<any> {
  return await readSettingsFromKV();
}

/**
 * Save settings to Vercel KV only (no filesystem)
 * Encrypts sensitive fields before saving
 */
async function saveSettings(settings: any): Promise<void> {
  // Encrypt sensitive fields before saving
  const encryptedSettings = encryptSettings(settings);
  
  try {
    // CHỈ lưu lên Vercel KV, không dùng filesystem
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = require('@vercel/kv');
        await kv.set(STORAGE_KEY, encryptedSettings);
        console.log('✅ Settings saved to Vercel KV (persistent, encrypted)');
        return;
      } catch (e) {
        console.error('❌ Error saving settings to KV:', e);
        throw e; // Throw để caller biết có lỗi
      }
    } else {
      throw new Error('Vercel KV not configured. Please set KV_REST_API_URL and KV_REST_API_TOKEN');
    }
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
    // Return safe fallback instead of error
    return NextResponse.json({ 
      success: true, 
      settings: {
        paypalEnabled: false,
        cryptoEnabled: false,
        websiteName: 'US Mobile Networks',
        paypalMode: 'sandbox',
        cryptoGateway: 'manual',
      },
      timestamp: new Date().toISOString(),
      warning: 'Using fallback settings due to database error'
    });
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

    // Merge with existing settings - ĐẢM BẢO KHÔNG MẤT BẤT KỲ FIELD NÀO
    const existingSettings = await readSettings();
    
    // MERGE LOGIC: localStorage (client) > server (DB)
    // Client settings override server, but preserve server values if client field is empty/undefined
    const updatedSettings: any = { 
      ...existingSettings, // Giữ lại TẤT CẢ fields từ server (DB)
      ...settings, // Client settings OVERRIDE (priority cao hơn)
    };
    
    // BẢO VỆ các fields quan trọng: giữ nguyên nếu client gửi trống
    const protectedFields = [
      'paypalClientId',
      'paypalClientSecret',
      'telegramBotToken',
      'telegramChatId',
      'contactEmail',
      'contactPhone',
      'address',
      'businessHours',
    ];
    
    protectedFields.forEach(field => {
      // Nếu client gửi field trống (undefined, null, empty string) và server có giá trị
      if (existingSettings[field] && 
          (settings[field] === undefined || settings[field] === null || settings[field] === '')) {
        updatedSettings[field] = existingSettings[field]; // Giữ lại giá trị từ server
      }
    });
    
    // Đảm bảo các boolean fields không bị undefined hoặc null
    updatedSettings.paypalEnabled = settings.paypalEnabled !== undefined ? settings.paypalEnabled : (existingSettings.paypalEnabled ?? false);
    updatedSettings.cryptoEnabled = settings.cryptoEnabled !== undefined ? settings.cryptoEnabled : (existingSettings.cryptoEnabled ?? false);
    updatedSettings.autoApproveOrders = settings.autoApproveOrders !== undefined ? settings.autoApproveOrders : (existingSettings.autoApproveOrders ?? false);
    updatedSettings.emailNotifications = settings.emailNotifications !== undefined ? settings.emailNotifications : (existingSettings.emailNotifications ?? false);

    await saveSettings(updatedSettings);
    
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


