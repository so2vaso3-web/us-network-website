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
    // Try Vercel KV first (KV_REST_API_URL + KV_REST_API_TOKEN)
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
        // Fall through to try Redis
      }
    }
    
    // Try Redis from Marketplace (REDIS_URL)
    if (process.env.REDIS_URL) {
      let client: any = null;
      try {
        const { createClient } = require('redis');
        client = createClient({ 
          url: process.env.REDIS_URL,
          socket: {
            connectTimeout: 10000,
            reconnectStrategy: false
          }
        });
        
        if (!client.isOpen) {
          await client.connect();
        }
        
        const redisSettings = await client.get(STORAGE_KEY);
        
        if (redisSettings) {
          const parsed = JSON.parse(redisSettings);
          return decrypt ? decryptSettings(parsed) : parsed;
        }
      } catch (e) {
        console.error('Error loading from Redis:', e);
        // Fall through to safe fallback
      } finally {
        // Don't quit - connection will be reused or closed by serverless function cleanup
      }
    }
    
    // Fallback for local development: use in-memory storage
    if (process.env.NODE_ENV === 'development' && typeof global !== 'undefined') {
      // @ts-ignore
      const devStorage = global.__devSettingsStorage;
      if (devStorage && devStorage[STORAGE_KEY]) {
        const devSettings = devStorage[STORAGE_KEY];
        return decrypt ? decryptSettings(devSettings) : devSettings;
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
    // Try Vercel KV first (KV_REST_API_URL + KV_REST_API_TOKEN)
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = require('@vercel/kv');
        await kv.set(STORAGE_KEY, encryptedSettings);
        console.log('✅ Settings saved to Vercel KV (persistent, encrypted)');
        return;
      } catch (e) {
        console.error('❌ Error saving settings to KV:', e);
        // Fall through to try Redis
      }
    }
    
    // Try Redis from Marketplace (REDIS_URL)
    if (process.env.REDIS_URL) {
      let client: any = null;
      try {
        const { createClient } = require('redis');
        client = createClient({ 
          url: process.env.REDIS_URL,
          socket: {
            connectTimeout: 10000,
            reconnectStrategy: false
          }
        });
        
        // Connect only if not already connected
        if (!client.isOpen) {
          await client.connect();
        }
        
        await client.set(STORAGE_KEY, JSON.stringify(encryptedSettings));
        console.log('✅ Settings saved to Redis (persistent, encrypted)');
        
        // Don't quit - keep connection alive for next request
        // Only quit if we're sure we won't need it again soon
        return;
      } catch (e: any) {
        console.error('❌ Error saving settings to Redis:', e?.message || e);
        console.error('Redis URL:', process.env.REDIS_URL ? 'Set (format: redis://...)' : 'Not set');
        
        // Try to cleanup if client exists
        if (client && client.isOpen) {
          try {
            await client.quit();
          } catch (quitError) {
            // Ignore quit errors
          }
        }
        
        throw new Error(`Redis connection failed: ${e?.message || 'Unknown error'}`);
      }
    }
    
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
        console.warn('⚠️ No Redis/KV configured. Using in-memory storage (data will be lost on restart).');
        console.warn('   To enable persistent storage, connect Redis database in Vercel.');
        return;
      }
    }
    
    throw new Error('No Redis/KV configured. Please connect Redis database in Vercel or set KV_REST_API_URL and KV_REST_API_TOKEN');
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

