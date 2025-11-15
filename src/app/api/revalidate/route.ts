import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * On-demand revalidation endpoint
 * Call this after updating settings to revalidate SSG/ISR pages
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const path = searchParams.get('path') || '/payment';
    
    // Verify secret
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Invalid secret' },
        { status: 401 }
      );
    }
    
    // Revalidate path
    revalidatePath(path);
    
    return NextResponse.json({
      success: true,
      message: `Path ${path} revalidated`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error revalidating:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to revalidate' },
      { status: 500 }
    );
  }
}

