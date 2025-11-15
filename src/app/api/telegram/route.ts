import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Telegram Bot API endpoint
const TELEGRAM_API_URL = 'https://api.telegram.org/bot';

function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
}

// Helper function to get Telegram settings from adminSettings
function getTelegramSettings(): { botToken: string; chatId: string } | null {
  try {
    ensureDataDir();
    // Try to read from file first (server-side)
    const settingsFile = join(process.cwd(), 'data', 'adminSettings.json');
    if (existsSync(settingsFile)) {
      const content = readFileSync(settingsFile, 'utf-8');
      const settings = JSON.parse(content);
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
    const telegramSettings = getTelegramSettings();

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

