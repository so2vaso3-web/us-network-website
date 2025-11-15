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
        // Normalize REDIS_URL format
        let redisUrl: string | null = process.env.REDIS_URL.trim();
        
        // Auto-fix: Add redis:// prefix if missing
        if (!redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
          // If it looks like a host:port format, add redis:// prefix
          if (redisUrl.includes(':') && !redisUrl.includes('://')) {
            console.warn('⚠️ REDIS_URL missing prefix, auto-adding redis://');
            redisUrl = `redis://${redisUrl}`;
          } else {
            console.error('Invalid Redis URL format:', redisUrl.substring(0, 30));
            // Fall through to safe fallback
            redisUrl = null;
          }
        }
        
        if (redisUrl) {
          const { createClient } = require('redis');
          client = createClient({ 
            url: redisUrl,
            socket: {
              connectTimeout: 10000,
              reconnectStrategy: false
            }
          });
          
          await client.connect();
          const redisSettings = await client.get(STORAGE_KEY);
          await client.quit();
          
          if (redisSettings) {
            const parsed = JSON.parse(redisSettings);
            return decrypt ? decryptSettings(parsed) : parsed;
          }
        }
      } catch (e) {
        console.error('Error loading from Redis:', e);
        // Try to cleanup
        if (client) {
          try {
            if (client.isOpen) {
              await client.quit();
            }
          } catch (quitError) {
            // Ignore
          }
        }
        // Fall through to safe fallback
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
        // Normalize REDIS_URL format
        let redisUrl = process.env.REDIS_URL.trim();
        
        // Auto-fix: Add redis:// prefix if missing
        if (!redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
          // If it looks like a host:port format, add redis:// prefix
          if (redisUrl.includes(':') && !redisUrl.includes('://')) {
            console.warn('⚠️ REDIS_URL missing prefix, auto-adding redis://');
            redisUrl = `redis://${redisUrl}`;
          } else {
            throw new Error(`Invalid Redis URL format. Must start with redis:// or rediss://. Got: ${redisUrl.substring(0, 30)}...`);
          }
        }
        
        const { createClient } = require('redis');
        client = createClient({ 
          url: redisUrl,
          socket: {
            connectTimeout: 10000,
            reconnectStrategy: false
          }
        });
        
        await client.connect();
        await client.set(STORAGE_KEY, JSON.stringify(encryptedSettings));
        console.log('✅ Settings saved to Redis (persistent, encrypted)');
        
        // Close connection (serverless best practice)
        await client.quit();
        return;
      } catch (e: any) {
        console.error('❌ Error saving settings to Redis:', e?.message || e);
        const redisUrlPreview = process.env.REDIS_URL 
          ? (process.env.REDIS_URL.length > 30 
              ? `${process.env.REDIS_URL.substring(0, 30)}...` 
              : process.env.REDIS_URL)
          : 'Not set';
        console.error('Redis URL:', redisUrlPreview);
        console.error('Redis URL length:', process.env.REDIS_URL?.length || 0);
        
        // Try to cleanup if client exists
        if (client) {
          try {
            if (client.isOpen) {
              await client.quit();
            }
          } catch (quitError) {
            // Ignore quit errors
          }
        }
        
        // Provide more helpful error message
        const errorMsg = e?.message || 'Unknown error';
        if (errorMsg.includes('Invalid URL') || errorMsg.includes('ENOTFOUND') || errorMsg.includes('ECONNREFUSED')) {
          throw new Error(`Redis connection failed: Invalid URL or connection refused. Please check REDIS_URL in environment variables.`);
        }
        throw new Error(`Redis connection failed: ${errorMsg}`);
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

