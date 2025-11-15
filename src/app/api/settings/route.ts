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

async function saveSettings(settings: any): Promise<void> {
  try {
    // Lưu vào storage (local hoặc file system)
    storage.set(STORAGE_KEY, settings);
    
    // Lưu lên Vercel KV nếu có (để đảm bảo persistent)
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = require('@vercel/kv');
        await kv.set(STORAGE_KEY, settings);
        console.log('Settings saved to Vercel KV');
      } catch (e) {
        console.error('Error saving settings to KV:', e);
        // Không throw error, vì đã lưu vào storage rồi
      }
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

    // Merge with existing settings - ĐẢM BẢO KHÔNG MẤT BẤT KỲ FIELD NÀO
    const existingSettings = await readSettings();
    
    // Merge: Giữ lại TẤT CẢ fields từ existing, chỉ update những fields có trong settings mới
    // Điều này đảm bảo không mất PayPal Client ID, Secret, hay bất kỳ field nào
    const updatedSettings: any = { 
      ...existingSettings, // Giữ lại TẤT CẢ fields cũ
      ...settings, // Update với fields mới
    };
    
    // Đảm bảo các boolean fields không bị undefined hoặc null
    updatedSettings.paypalEnabled = settings.paypalEnabled !== undefined ? settings.paypalEnabled : (existingSettings.paypalEnabled ?? false);
    updatedSettings.cryptoEnabled = settings.cryptoEnabled !== undefined ? settings.cryptoEnabled : (existingSettings.cryptoEnabled ?? false);
    updatedSettings.autoApproveOrders = settings.autoApproveOrders !== undefined ? settings.autoApproveOrders : (existingSettings.autoApproveOrders ?? false);
    updatedSettings.emailNotifications = settings.emailNotifications !== undefined ? settings.emailNotifications : (existingSettings.emailNotifications ?? false);
    
    // Đảm bảo các string fields không bị mất nếu đã có giá trị
    if (existingSettings.paypalClientId && !settings.paypalClientId) {
      updatedSettings.paypalClientId = existingSettings.paypalClientId; // Giữ lại nếu không có trong settings mới
    }
    if (existingSettings.paypalClientSecret && !settings.paypalClientSecret) {
      updatedSettings.paypalClientSecret = existingSettings.paypalClientSecret; // Giữ lại nếu không có trong settings mới
    }
    if (existingSettings.telegramBotToken && !settings.telegramBotToken) {
      updatedSettings.telegramBotToken = existingSettings.telegramBotToken; // Giữ lại nếu không có trong settings mới
    }
    if (existingSettings.telegramChatId && !settings.telegramChatId) {
      updatedSettings.telegramChatId = existingSettings.telegramChatId; // Giữ lại nếu không có trong settings mới
    }

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

