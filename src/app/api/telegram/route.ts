import { NextRequest, NextResponse } from 'next/server';
import { readSettingsFromKV } from '@/lib/settings-storage';

// Telegram Bot API endpoint
const TELEGRAM_API_URL = 'https://api.telegram.org/bot';

// Helper function to get Telegram settings from adminSettings
async function getTelegramSettings(): Promise<{ botToken: string; chatId: string } | null> {
  try {
    // Đọc từ Vercel KV/Redis (đã decrypt)
    let settings = await readSettingsFromKV(true); // decrypt = true
    
    // Fallback: Nếu không có KV/Redis, thử đọc từ file system (local development)
    if (!settings || typeof settings !== 'object' || !settings.telegramBotToken || !settings.telegramChatId) {
      console.log('KV/Redis settings not found or incomplete, trying file system fallback...');
      try {
        const fs = require('fs').promises;
        const path = require('path');
        // Try both possible file locations
        const possiblePaths = [
          path.join(process.cwd(), 'data', 'settings.json'),
          path.join(process.cwd(), 'data', 'adminSettings.json'),
        ];
        
        for (const settingsPath of possiblePaths) {
          try {
            const fileContent = await fs.readFile(settingsPath, 'utf-8');
            const fileSettings = JSON.parse(fileContent);
            if (fileSettings && typeof fileSettings === 'object') {
              settings = fileSettings;
              console.log(`Loaded settings from file system: ${settingsPath}`);
              break;
            }
          } catch (fileError) {
            // Try next path
            continue;
          }
        }
      } catch (fileError) {
        console.log('File system fallback failed:', fileError);
      }
    }
    
    if (settings && typeof settings === 'object') {
      const hasToken = !!settings.telegramBotToken;
      const hasChatId = !!settings.telegramChatId;
      console.log('Telegram settings check:', {
        hasToken,
        hasChatId,
        tokenLength: settings.telegramBotToken?.length || 0,
        chatIdValue: settings.telegramChatId || 'missing',
        tokenPreview: settings.telegramBotToken ? `${settings.telegramBotToken.substring(0, 10)}...` : 'missing',
      });
      if (hasToken && hasChatId) {
        const botToken = String(settings.telegramBotToken).trim();
        const chatId = String(settings.telegramChatId).trim();
        
        // Validate token format (should be like "123456789:ABC...")
        if (!botToken.includes(':')) {
          console.error('Invalid bot token format (should contain colon)');
          return null;
        }
        
        // Validate chat ID (should be numeric or start with - for groups)
        if (!chatId.match(/^-?\d+$/)) {
          console.error('Invalid chat ID format (should be numeric)');
          return null;
        }
        
        return {
          botToken,
          chatId,
        };
      } else {
        console.warn('Telegram settings missing:', { hasToken, hasChatId });
      }
    } else {
      console.warn('Settings file exists but is not a valid object');
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

    // Trim and normalize botToken and chatId
    const trimmedToken = botToken.trim();
    const trimmedChatId = chatId.trim();
    
    // Convert chatId to number if it's a numeric string, otherwise keep as string
    const chatIdNum = isNaN(Number(trimmedChatId)) ? trimmedChatId : Number(trimmedChatId);
    
    const url = `${TELEGRAM_API_URL}${trimmedToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatIdNum,
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
        errorCode: data.error_code,
        fullResponse: data,
        url: url.replace(trimmedToken, '***'),
        chatId: chatIdNum,
      });
      return false;
    }
    
    console.log('Telegram message sent successfully to chat:', chatIdNum);
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
      // Return more detailed error for debugging
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send message to Telegram. Please check: 1) Bot token is correct, 2) Chat ID is correct, 3) Bot has been started (send /start to bot), 4) Bot has permission to send messages to this chat.',
          debug: {
            hasToken: !!telegramSettings.botToken,
            hasChatId: !!telegramSettings.chatId,
            tokenLength: telegramSettings.botToken?.length || 0,
            chatId: telegramSettings.chatId,
          }
        },
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

