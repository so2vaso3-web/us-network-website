/**
 * Storage utility với fallback:
 * - Trên Vercel/serverless: Dùng in-memory storage (data tạm thời)
 * - Trên server có file system: Dùng file system (persistent)
 * - Fallback: localStorage cho client-side
 */

// In-memory storage cho serverless
const memoryStorage: Record<string, any> = {};

// Check if running on Vercel/serverless
const isVercel = process.env.VERCEL === '1';
const isServerless = !process.env.NODE_ENV || process.env.NODE_ENV === 'production';

export interface StorageAdapter {
  get(key: string): any | null;
  set(key: string, value: any): void;
  exists(key: string): boolean;
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

// Memory adapter (cho serverless)
class MemoryAdapter implements StorageAdapter {
  get(key: string): any | null {
    return memoryStorage[key] || null;
  }

  set(key: string, value: any): void {
    memoryStorage[key] = value;
    console.warn(`⚠️ Using in-memory storage for ${key}. Data will be lost on server restart!`);
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
    // Vercel/serverless: dùng memory storage
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
    return adapter.exists(key);
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

