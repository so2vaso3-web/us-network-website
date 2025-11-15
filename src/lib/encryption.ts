/**
 * Encryption utility for sensitive settings
 * Uses AES-256-GCM encryption with MASTER_KEY from environment
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Get encryption key from MASTER_KEY env variable
 * Falls back to a default key if not set (for development only)
 */
function getEncryptionKey(): Buffer {
  const masterKey = process.env.MASTER_KEY;
  
  if (!masterKey) {
    console.warn('⚠️ MASTER_KEY not set. Using default key (NOT SECURE for production!)');
    // Default key for development - MUST be changed in production
    return Buffer.from('default-master-key-32-chars-long!!', 'utf-8');
  }
  
  // If MASTER_KEY is hex (64 chars = 32 bytes), decode it
  if (masterKey.length === 64 && /^[0-9a-fA-F]+$/.test(masterKey)) {
    return Buffer.from(masterKey, 'hex');
  }
  
  // Use first 32 bytes of MASTER_KEY (or hash if longer)
  if (masterKey.length >= KEY_LENGTH) {
    return Buffer.from(masterKey.substring(0, KEY_LENGTH), 'utf-8');
  }
  
  // If shorter, use crypto to derive key
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(masterKey).digest().subarray(0, KEY_LENGTH);
}

/**
 * Encrypt a string value
 */
export function encrypt(value: string): string {
  if (!value || value.trim() === '') {
    return value; // Don't encrypt empty strings
  }
  
  try {
    const crypto = require('crypto');
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();
    
    // Combine: iv (hex) + tag (hex) + encrypted (hex)
    const result = iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
    return `encrypted:${result}`;
  } catch (error) {
    console.error('Encryption error:', error);
    // Return original value if encryption fails
    return value;
  }
}

/**
 * Decrypt an encrypted string
 */
export function decrypt(encryptedValue: string): string {
  if (!encryptedValue || !encryptedValue.startsWith('encrypted:')) {
    return encryptedValue; // Not encrypted, return as-is
  }
  
  try {
    const crypto = require('crypto');
    const key = getEncryptionKey();
    
    // Remove 'encrypted:' prefix
    const parts = encryptedValue.substring(10).split(':');
    if (parts.length !== 3) {
      console.error('Invalid encrypted format');
      return encryptedValue;
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    // Return original value if decryption fails
    return encryptedValue;
  }
}

/**
 * Encrypt sensitive fields in settings object
 */
export function encryptSettings(settings: any): any {
  if (!settings || typeof settings !== 'object') {
    return settings;
  }
  
  const encrypted = { ...settings };
  
  // Encrypt sensitive fields
  const sensitiveFields = [
    'paypalClientSecret',
    'telegramBotToken',
    'apiKey', // If using API keys
  ];
  
  sensitiveFields.forEach(field => {
    if (encrypted[field] && typeof encrypted[field] === 'string' && !encrypted[field].startsWith('encrypted:')) {
      encrypted[field] = encrypt(encrypted[field]);
    }
  });
  
  return encrypted;
}

/**
 * Decrypt sensitive fields in settings object
 */
export function decryptSettings(settings: any): any {
  if (!settings || typeof settings !== 'object') {
    return settings;
  }
  
  const decrypted = { ...settings };
  
  // Decrypt sensitive fields
  const sensitiveFields = [
    'paypalClientSecret',
    'telegramBotToken',
    'apiKey',
  ];
  
  sensitiveFields.forEach(field => {
    if (decrypted[field] && typeof decrypted[field] === 'string' && decrypted[field].startsWith('encrypted:')) {
      decrypted[field] = decrypt(decrypted[field]);
    }
  });
  
  return decrypted;
}

