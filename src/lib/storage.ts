/**
 * Storage utility với fallback:
 * - Trên Vercel/serverless: Dùng Vercel KV (Redis) nếu có, nếu không thì in-memory storage
 * - Trên server có file system: Dùng file system (persistent)
 * - Fallback: localStorage cho client-side
 */

// In-memory storage cho serverless (fallback)
const memoryStorage: Record<string, any> = {};

// Check if running on Vercel/serverless
const isVercel = process.env.VERCEL === '1';
const isServerless = !process.env.NODE_ENV || process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Flag để chỉ log warning một lần
let kvWarningLogged = false;

export interface StorageAdapter {
  get(key: string): any | null | Promise<any | null>;
  set(key: string, value: any): void | Promise<void>;
  exists(key: string): boolean | Promise<boolean>;
}

// File system adapter (cho server thông thường)
class FileSystemAdapter implements StorageAdapter {
  private fs: typeof import('fs');
  private path: typeof import('path');
  private dataDir: string;
  private filePath: (key: string) => string;

  constructor() {
    try {
      this.fs = require('fs');
      this.path = require('path');
      this.dataDir = this.path.join(process.cwd(), 'data');
      this.filePath = (key: string) => this.path.join(this.dataDir, `${key}.json`);
      this.ensureDataDir();
    } catch (error) {
      console.error('FileSystemAdapter init error:', error);
      throw error;
    }
  }

  private ensureDataDir() {
    if (!this.fs.existsSync(this.dataDir)) {
      this.fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  get(key: string): any | null {
    try {
      const filePath = this.filePath(key);
      if (this.fs.existsSync(filePath)) {
        const content = this.fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
    }
    return null;
  }

  set(key: string, value: any): void {
    try {
      this.ensureDataDir();
      const filePath = this.filePath(key);
      this.fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Error writing ${key}:`, error);
      throw error;
    }
  }

  exists(key: string): boolean {
    try {
      return this.fs.existsSync(this.filePath(key));
    } catch {
      return false;
    }
  }
}

// Vercel KV adapter (cho serverless với persistent storage)
class VercelKVAdapter implements StorageAdapter {
  private kv: any;
  private cache: Record<string, any> = {};
  private loadingKeys: Set<string> = new Set();

  constructor() {
    try {
      // @ts-ignore - Vercel KV có thể không có types
      const kvModule = require('@vercel/kv');
      // Kiểm tra xem có KV_REST_API_URL không (Vercel tự động set)
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        this.kv = kvModule;
        if (isDevelopment) {
          console.log('✅ Vercel KV initialized');
        }
      } else {
        this.kv = null;
        // Chỉ log warning một lần và chỉ trong development hoặc khi thực sự cần
        if (!kvWarningLogged && (isDevelopment || isVercel)) {
          console.warn('⚠️ Vercel KV not configured (missing KV_REST_API_URL or KV_REST_API_TOKEN)');
          console.warn('   → Using in-memory storage. Data will be lost on server restart.');
          console.warn('   → To enable persistent storage, setup Vercel KV: https://vercel.com/docs/storage/vercel-kv');
          kvWarningLogged = true;
        }
      }
    } catch (error) {
      // Chỉ log warning một lần
      if (!kvWarningLogged && (isDevelopment || isVercel)) {
        console.warn('⚠️ Vercel KV not available, falling back to memory storage');
        kvWarningLogged = true;
      }
      this.kv = null;
    }
  }

  get(key: string): any | null {
    // Return từ cache nếu có (cho sync access)
    if (key in this.cache) {
      return this.cache[key];
    }
    
    // Nếu không có trong cache và có KV, thử load từ KV sync (blocking)
    // Note: Trong thực tế, trên Vercel KV sẽ async, nhưng để đơn giản ta return null
    // và để API route tự load từ KV
    return null;
  }

  set(key: string, value: any): void {
    // Update cache ngay lập tức
    this.cache[key] = value;
    
    // Save to KV async (không block)
    if (this.kv) {
      this.kv.set(key, value).catch((error: any) => {
        console.error(`Error writing ${key} to KV:`, error);
      });
    }
  }

  exists(key: string): boolean {
    return key in this.cache;
  }

  // Method để load từ KV vào cache (gọi khi cần)
  async loadFromKV(key: string): Promise<void> {
    if (!this.kv || this.loadingKeys.has(key)) return;
    
    this.loadingKeys.add(key);
    try {
      const value = await this.kv.get(key);
      if (value !== null) {
        this.cache[key] = value;
      }
    } catch (error) {
      console.error(`Error loading ${key} from KV:`, error);
    } finally {
      this.loadingKeys.delete(key);
    }
  }
  
  // Getter để check xem KV có available không
  get kvAvailable(): boolean {
    return this.kv !== null;
  }
}

// Memory adapter (cho serverless fallback)
class MemoryAdapter implements StorageAdapter {
  get(key: string): any | null {
    return memoryStorage[key] || null;
  }

  set(key: string, value: any): void {
    memoryStorage[key] = value;
    // Chỉ log warning một lần cho mỗi key
    if (isDevelopment && !memoryStorage._warnedKeys?.includes(key)) {
      console.warn(`⚠️ Using in-memory storage for ${key}. Data will be lost on server restart!`);
      if (!memoryStorage._warnedKeys) {
        memoryStorage._warnedKeys = [];
      }
      memoryStorage._warnedKeys.push(key);
    }
  }

  exists(key: string): boolean {
    return key in memoryStorage;
  }
}

// Get appropriate adapter
function getAdapter(): StorageAdapter {
  // Trên client-side
  if (typeof window !== 'undefined') {
    // Client-side: dùng localStorage
    return {
      get: (key: string) => {
        try {
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : null;
        } catch {
          return null;
        }
      },
      set: (key: string, value: any) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          console.error('localStorage set error:', error);
        }
      },
      exists: (key: string) => {
        return localStorage.getItem(key) !== null;
      },
    };
  }

  // Trên server-side
  if (isVercel || isServerless) {
    // Vercel/serverless: thử dùng Vercel KV trước, nếu không có thì dùng memory storage
    try {
      const kvAdapter = new VercelKVAdapter();
      // Nếu có KV configured, dùng nó
      if (kvAdapter.kvAvailable) {
        return kvAdapter;
      }
    } catch (error) {
      // Chỉ log warning một lần
      if (!kvWarningLogged && (isDevelopment || isVercel)) {
        console.warn('⚠️ Vercel KV not configured, falling back to memory storage');
        kvWarningLogged = true;
      }
    }
    // Fallback: dùng memory storage
    return new MemoryAdapter();
  }

  // Server thông thường: thử dùng file system
  try {
    return new FileSystemAdapter();
  } catch (error) {
    console.warn('FileSystemAdapter not available, falling back to memory storage');
    return new MemoryAdapter();
  }
}

const adapter = getAdapter();

export const storage = {
  /**
   * Get data from storage
   */
  get: (key: string): any | null => {
    return adapter.get(key);
  },

  /**
   * Set data to storage
   */
  set: (key: string, value: any): void => {
    adapter.set(key, value);
  },

  /**
   * Check if key exists
   */
  exists: (key: string): boolean => {
    const result = adapter.exists(key);
    // Nếu là Promise, return false (sẽ check async ở API route)
    if (result instanceof Promise) {
      return false;
    }
    return result as boolean;
  },

  /**
   * Get all data (for memory adapter)
   */
  getAll: (): Record<string, any> => {
    if (adapter instanceof MemoryAdapter) {
      return { ...memoryStorage };
    }
    return {};
  },
};

