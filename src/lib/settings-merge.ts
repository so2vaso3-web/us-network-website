/**
 * Settings merge utility with priority logic
 * Priority: localStorage (client) > incoming payload > server (DB)
 */

export interface SettingsMergeOptions {
  serverSettings: any;
  clientPayload: any;
  protectedFields?: string[];
}

/**
 * Merge settings with priority: client > payload > server
 * Protected fields are preserved if payload is empty/undefined/null
 */
export function mergeSettings(options: SettingsMergeOptions): any {
  const { serverSettings, clientPayload, protectedFields = [] } = options;
  
  // Default protected fields
  const defaultProtectedFields = [
    'paypalClientId',
    'paypalClientSecret',
    'telegramBotToken',
    'telegramChatId',
    'contactEmail',
    'contactPhone',
    'address',
    'businessHours',
    'currency',
    'cryptoEnabled',
  ];
  
  const allProtectedFields = Array.from(new Set([...defaultProtectedFields, ...protectedFields]));
  
  // Start with server settings (lowest priority)
  const merged: any = { ...serverSettings };
  
  // Apply client payload (higher priority)
  Object.keys(clientPayload).forEach(key => {
    const value = clientPayload[key];
    
    // Check if this is an explicit remove flag
    if (key.endsWith('_remove') && value === true) {
      const fieldName = key.replace('_remove', '');
      delete merged[fieldName];
      return;
    }
    
    // Skip remove flags
    if (key.endsWith('_remove')) {
      return;
    }
    
    // If field is protected and payload value is empty, preserve server value
    if (allProtectedFields.includes(key)) {
      if (value === undefined || value === null || value === '') {
        // Preserve server value if exists
        if (serverSettings[key]) {
          merged[key] = serverSettings[key];
        }
        return;
      }
    }
    
    // Apply payload value (overrides server)
    merged[key] = value;
  });
  
  // Ensure boolean fields have proper defaults
  merged.paypalEnabled = clientPayload.paypalEnabled !== undefined 
    ? clientPayload.paypalEnabled 
    : (serverSettings.paypalEnabled ?? false);
    
  merged.cryptoEnabled = clientPayload.cryptoEnabled !== undefined 
    ? clientPayload.cryptoEnabled 
    : (serverSettings.cryptoEnabled ?? false);
    
  merged.autoApproveOrders = clientPayload.autoApproveOrders !== undefined 
    ? clientPayload.autoApproveOrders 
    : (serverSettings.autoApproveOrders ?? false);
    
  merged.emailNotifications = clientPayload.emailNotifications !== undefined 
    ? clientPayload.emailNotifications 
    : (serverSettings.emailNotifications ?? false);
  
  return merged;
}

/**
 * Sanitize settings for client response (remove encrypted secrets)
 */
export function sanitizeSettingsForClient(settings: any): any {
  if (!settings || typeof settings !== 'object') {
    return settings;
  }
  
  const sanitized = { ...settings };
  
  // Remove encrypted secrets
  delete sanitized.paypal_secret_encrypted;
  delete sanitized.telegram_token_encrypted;
  
  // Add flags for secrets
  if (settings.paypal_secret_encrypted || settings.paypalClientSecret) {
    sanitized.has_paypal_secret = true;
    delete sanitized.paypalClientSecret; // Don't send plaintext
  }
  
  if (settings.telegram_token_encrypted || settings.telegramBotToken) {
    sanitized.has_telegram_token = true;
    delete sanitized.telegramBotToken; // Don't send plaintext
  }
  
  return sanitized;
}

