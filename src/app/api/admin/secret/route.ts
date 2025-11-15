import { NextRequest, NextResponse } from 'next/server';
import { decryptSettings } from '@/lib/encryption';
import { readSettingsFromKV } from '@/lib/settings-storage';

// Force dynamic rendering (uses request headers)
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/secret - Admin only endpoint to retrieve decrypted secrets
 * Requires authentication
 */
function isAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const apiKey = request.headers.get('x-api-key');
  const sessionCookie = request.cookies.get('admin_session');
  
  if (process.env.NODE_ENV === 'development') {
    return true; // Allow in dev
  }
  
  if (sessionCookie?.value === 'authenticated') {
    return true;
  }
  
  if (apiKey === process.env.ADMIN_API_KEY) {
    return true;
  }
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // TODO: Verify JWT token
    return token === process.env.ADMIN_JWT_SECRET;
  }
  
  return false;
}

export async function GET(request: NextRequest) {
  try {
    // Auth check
    if (!isAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Read encrypted settings from KV (without decrypting - we need raw encrypted data)
    const encryptedSettings = await readSettingsFromKV(false);
    
    // Decrypt sensitive fields
    const decrypted = decryptSettings(encryptedSettings);
    
    // Return only secrets (not all settings)
    const secrets: any = {};
    
    if (decrypted.paypalClientSecret) {
      secrets.paypalClientSecret = decrypted.paypalClientSecret;
    }
    
    if (decrypted.telegramBotToken) {
      secrets.telegramBotToken = decrypted.telegramBotToken;
    }
    
    if (decrypted.apiKey) {
      secrets.apiKey = decrypted.apiKey;
    }
    
    return NextResponse.json({
      success: true,
      secrets,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GET /api/admin/secret:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve secrets' },
      { status: 500 }
    );
  }
}

