import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

const STORAGE_KEY = 'chatMessages';

interface Message {
  id: string;
  visitorId: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  isAdmin: boolean;
  read: boolean;
}

// GET /api/chat - Lấy tất cả chat messages
export async function GET() {
  try {
    let messages = storage.get(STORAGE_KEY);
    
    // Nếu là Promise (từ KV adapter), await nó
    if (messages instanceof Promise) {
      messages = await messages;
    }
    
    // Nếu không có trong cache và có Vercel KV, load từ KV
    if ((!messages || !Array.isArray(messages) || messages.length === 0) && 
        process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = require('@vercel/kv');
        messages = await kv.get(STORAGE_KEY);
        if (messages && Array.isArray(messages) && messages.length > 0) {
          // Update cache
          storage.set(STORAGE_KEY, messages);
        }
      } catch (e) {
        console.error('Error loading chat messages from KV:', e);
      }
    }
    
    if (Array.isArray(messages) && messages.length > 0) {
      return NextResponse.json({ 
        success: true, 
        messages,
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      messages: [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GET /api/chat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read chat messages' },
      { status: 500 }
    );
  }
}

// POST /api/chat - Lưu chat messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'Invalid messages data' },
        { status: 400 }
      );
    }

    // Lưu vào storage
    storage.set(STORAGE_KEY, messages);
    
    // Lưu lên Vercel KV nếu có (để đảm bảo persistent)
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = require('@vercel/kv');
        await kv.set(STORAGE_KEY, messages);
        console.log('Chat messages saved to Vercel KV');
      } catch (e) {
        console.error('Error saving chat messages to KV:', e);
        // Không throw error, vì đã lưu vào storage rồi
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Chat messages saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in POST /api/chat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save chat messages' },
      { status: 500 }
    );
  }
}

