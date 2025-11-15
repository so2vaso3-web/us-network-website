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
    } else {
      // Fallback for local development: use in-memory storage
      if (process.env.NODE_ENV === 'development' && typeof global !== 'undefined') {
        // @ts-ignore
        const devStorage = global.__devSettingsStorage;
        if (devStorage && devStorage[STORAGE_KEY]) {
          const devSettings = devStorage[STORAGE_KEY];
          return decrypt ? decryptSettings(devSettings) : devSettings;
        }
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
 * Falls back to in-memory storage in development if KV not configured
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
      // Fallback for local development: use in-memory storage
      if (process.env.NODE_ENV === 'development') {
        // Store in global memory (will be lost on restart, but works for dev)
        if (typeof global !== 'undefined') {
          // @ts-ignore
          if (!global.__devSettingsStorage) {
            // @ts-ignore
            global.__devSettingsStorage = {};
          }
          // @ts-ignore
          global.__devSettingsStorage[STORAGE_KEY] = encryptedSettings;
          console.warn('⚠️ Vercel KV not configured. Using in-memory storage (data will be lost on restart).');
          console.warn('   To enable persistent storage, set KV_REST_API_URL and KV_REST_API_TOKEN in Vercel.');
          return;
        }
      }
      throw new Error('Vercel KV not configured. Please set KV_REST_API_URL and KV_REST_API_TOKEN');
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

