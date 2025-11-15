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
    if (!botToken || !chatId) {
      console.error('Missing Telegram credentials:', { hasToken: !!botToken, hasChatId: !!chatId });
      return false;
    }
    
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
    
    if (!response.ok || !data.ok) {
      console.error('Telegram API error:', {
        status: response.status,
        statusText: response.statusText,
        error: data.description || data.error_code || 'Unknown error',
        data,
      });
      return false;
    }
    
    console.log('Telegram message sent successfully to chat:', chatId);
    return true;
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message: messageText, visitorId, isReply } = body;

    if (!messageText) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
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

    // Format message for Telegram - khác nhau cho reply và message mới
    let telegramMessage: string;
    
    if (isReply) {
      // Admin reply notification
      telegramMessage = `
✅ <b>Admin Reply Sent</b>

👤 <b>To:</b> ${name || 'Unknown'}
📧 <b>Email:</b> ${email || 'Not provided'}
🆔 <b>Visitor ID:</b> ${visitorId || 'Unknown'}

💬 <b>Reply:</b>
${messageText}

⏰ <b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}
      `.trim();
    } else {
      // New customer message
      telegramMessage = `
🔔 <b>New Chat Message</b>

👤 <b>Name:</b> ${name || 'Anonymous'}
📧 <b>Email:</b> ${email || 'Not provided'}
🆔 <b>Visitor ID:</b> ${visitorId || 'Unknown'}

💬 <b>Message:</b>
${messageText}

⏰ <b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}
      `.trim();
    }

    // Send to Telegram
    console.log('Sending to Telegram:', {
      botToken: telegramSettings.botToken ? `${telegramSettings.botToken.substring(0, 10)}...` : 'missing',
      chatId: telegramSettings.chatId,
      isReply,
      messageLength: telegramMessage.length,
    });
    
    const success = await sendToTelegram(
      telegramSettings.botToken,
      telegramSettings.chatId,
      telegramMessage
    );

    if (success) {
      console.log('Telegram message sent successfully');
      return NextResponse.json({
        success: true,
        message: 'Message sent to Telegram successfully',
      });
    } else {
      console.error('Failed to send message to Telegram');
      return NextResponse.json(
        { success: false, error: 'Failed to send message to Telegram. Check bot token and chat ID.' },
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

