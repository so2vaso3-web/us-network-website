/**
 * Settings storage utility - Vercel KV only (no filesystem)
 * Shared between API routes
 */

import { decryptSettings } from './encryption';

const STORAGE_KEY = 'adminSettings';

/**
 * Read settings from Vercel KV only (no filesystem)
 * Returns safe fallback if DB fails
 * @param decrypt - Whether to decrypt sensitive fields (default: true)
 */
export async function readSettingsFromKV(decrypt: boolean = true): Promise<any> {
  try {
    // CHỈ dùng Vercel KV, không dùng filesystem
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = require('@vercel/kv');
        const kvSettings = await kv.get(STORAGE_KEY);
        if (kvSettings && typeof kvSettings === 'object') {
          // Decrypt sensitive fields before returning (unless decrypt=false for admin/secret route)
          return decrypt ? decryptSettings(kvSettings) : kvSettings;
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

/**
 * Save settings to Vercel KV only (no filesystem)
 * Encrypts sensitive fields before saving
 */
export async function saveSettingsToKV(settings: any, encrypt: (settings: any) => any): Promise<void> {
  // Encrypt sensitive fields before saving
  const encryptedSettings = encrypt(settings);
  
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

