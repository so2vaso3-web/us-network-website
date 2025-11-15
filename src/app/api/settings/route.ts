import { NextRequest, NextResponse } from 'next/server';
import { encryptSettings, decryptSettings } from '@/lib/encryption';
import { mergeSettings, sanitizeSettingsForClient } from '@/lib/settings-merge';
import { readSettingsFromKV, saveSettingsToKV } from '@/lib/settings-storage';

const STORAGE_KEY = 'adminSettings';

// Force dynamic rendering (uses request headers, rate limiting)
export const dynamic = 'force-dynamic';

/**
 * Basic auth check for admin endpoints
 * In production, use proper session/auth middleware
 */
function isAdmin(request: NextRequest): boolean {
  // For now, check for admin session or API key
  // TODO: Implement proper auth middleware
  const authHeader = request.headers.get('authorization');
  const apiKey = request.headers.get('x-api-key');
  
  // In development, allow all (for testing)
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // Check for admin session cookie or API key
  const sessionCookie = request.cookies.get('admin_session');
  if (sessionCookie?.value === 'authenticated') {
    return true;
  }
  
  if (apiKey === process.env.ADMIN_API_KEY) {
    return true;
  }
  
  return false;
}

/**
 * Simple rate limiting (in-memory, for production use Redis)
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

async function readSettings(): Promise<any> {
  return await readSettingsFromKV();
}

async function saveSettings(settings: any): Promise<void> {
  return await saveSettingsToKV(settings, encryptSettings);
}

export async function GET(request: NextRequest) {
  try {
    const settings = await readSettings();
    
    // Sanitize: remove encrypted secrets, add flags
    const sanitized = sanitizeSettingsForClient(settings);
    
    return NextResponse.json({ 
      success: true, 
      settings: sanitized,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GET /api/settings:', error);
    // Return safe fallback instead of error
    return NextResponse.json({ 
      success: true, 
      settings: {
        paypalEnabled: false,
        cryptoEnabled: false,
        websiteName: 'US Mobile Networks',
        paypalMode: 'sandbox',
        cryptoGateway: 'manual',
      },
      timestamp: new Date().toISOString(),
      warning: 'Using fallback settings due to database error'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }
    
    // Auth check (admin only)
    if (!isAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { settings, localStorageData } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid settings data' },
        { status: 400 }
      );
    }

    // Read existing settings from DB
    const serverSettings = await readSettings();
    
    // MERGE LOGIC: localStorage (client) > incoming payload > server (DB)
    // Step 1: Start with server settings (lowest priority)
    // Step 2: Apply incoming payload
    // Step 3: Apply localStorage data (highest priority - user's unsaved changes)
    let mergedSettings = mergeSettings({
      serverSettings,
      clientPayload: settings,
    });
    
    // If localStorage data provided, merge it with highest priority
    if (localStorageData && typeof localStorageData === 'object') {
      mergedSettings = mergeSettings({
        serverSettings: mergedSettings,
        clientPayload: localStorageData,
      });
    }
    
    // Add metadata
    mergedSettings.updated_at = new Date().toISOString();
    mergedSettings.updated_by = 'admin'; // TODO: Get from auth session
    
    // Encrypt and save
    await saveSettings(mergedSettings);
    
    // Trigger revalidation for SSG/ISR pages
    try {
      // Note: This requires Next.js 13+ with on-demand revalidation
      // For now, we'll just log - implement revalidate in your deployment
      if (process.env.VERCEL) {
        // Vercel on-demand revalidation
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/revalidate?path=/payment&secret=${process.env.REVALIDATE_SECRET || 'secret'}`, {
          method: 'POST',
        }).catch(() => {
          // Ignore revalidation errors
        });
      }
    } catch (revalidateError) {
      console.warn('Revalidation failed (non-critical):', revalidateError);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Settings saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in POST /api/settings:', error);
    const errorMessage = error?.message || 'Failed to save settings';
    
    // Return detailed error for debugging
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          hasRedisUrl: !!process.env.REDIS_URL,
          hasKvUrl: !!process.env.KV_REST_API_URL,
          hasKvToken: !!process.env.KV_REST_API_TOKEN,
        } : undefined
      },
      { status: 500 }
    );
  }
}


