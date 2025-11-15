import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

// Telegram Bot API endpoint
const TELEGRAM_API_URL = 'https://api.telegram.org/bot';
const STORAGE_KEY = 'adminSettings';

// Helper function to get Telegram settings from adminSettings
async function getTelegramSettings(): Promise<{ botToken: string; chatId: string } | null> {
  try {
    // Đọc từ storage utility (Vercel KV hoặc file system)
    let settings = storage.get(STORAGE_KEY);
    
    // Nếu là Promise (từ KV adapter), await nó
    if (settings instanceof Promise) {
      settings = await settings;
    }
    
    // Nếu là VercelKVAdapter, load từ KV vào cache trước
    if (settings === null && process.env.KV_REST_API_URL) {
      try {
        const { kv } = require('@vercel/kv');
        settings = await kv.get(STORAGE_KEY);
        if (settings) {
          // Update cache
          storage.set(STORAGE_KEY, settings);
        }
      } catch (e) {
        // Ignore
      }
    }
    
    if (settings && typeof settings === 'object') {
      if (settings.telegramBotToken && settings.telegramChatId) {
        return {
          botToken: settings.telegramBotToken,
          chatId: settings.telegramChatId,
        };
      }
    }
  } catch (error) {
    console.error('Error reading Telegram settings:', error);
  }
  return null;
}

// Send message to Telegram
async function sendToTelegram(
  botToken: string,
  chatId: string,
  message: string
): Promise<boolean> {
  try {
    const url = `${TELEGRAM_API_URL}${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    return response.ok && data.ok;
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message: messageText, visitorId } = body;

    if (!name || !messageText) {
      return NextResponse.json(
        { success: false, error: 'Name and message are required' },
        { status: 400 }
      );
    }

    // Get Telegram settings
    const telegramSettings = await getTelegramSettings();

    if (!telegramSettings) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Telegram not configured. Please configure Telegram Bot Token and Chat ID in Admin Settings.' 
        },
        { status: 400 }
      );
    }

    // Format message for Telegram
    const telegramMessage = `
🔔 <b>New Chat Message</b>

👤 <b>Name:</b> ${name}
📧 <b>Email:</b> ${email || 'Not provided'}
🆔 <b>Visitor ID:</b> ${visitorId || 'Unknown'}

💬 <b>Message:</b>
${messageText}

⏰ <b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}
    `.trim();

    // Send to Telegram
    const success = await sendToTelegram(
      telegramSettings.botToken,
      telegramSettings.chatId,
      telegramMessage
    );

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Message sent to Telegram successfully',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to send message to Telegram' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/telegram:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

