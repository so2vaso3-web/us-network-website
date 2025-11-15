import { NextRequest, NextResponse } from 'next/server';
import { readSettingsFromKV } from '@/lib/settings-storage';

// Telegram Bot API endpoint
const TELEGRAM_API_URL = 'https://api.telegram.org/bot';

// Send message to Telegram
async function sendToTelegram(
  botToken: string,
  chatId: string,
  message: string
): Promise<boolean> {
  try {
    if (!botToken || !chatId) {
      return false;
    }

    const trimmedToken = botToken.trim();
    const trimmedChatId = chatId.trim();
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
    return response.ok && data.ok;
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get callback parameters
    const request_id = searchParams.get('request_id');
    const merchant_id = searchParams.get('merchant_id');
    const api_key = searchParams.get('api_key');
    const received = searchParams.get('received');
    const status = searchParams.get('status');
    const from_address = searchParams.get('from_address');
    const transaction_id = searchParams.get('transaction_id');
    const amount = searchParams.get('amount');

    // Validate required parameters
    if (!request_id || !merchant_id || !api_key || !received || !status) {
      return NextResponse.json(
        { status: 'error', message: 'Missing required callback parameters' },
        { status: 400 }
      );
    }

    // Verify merchant_id and api_key from settings
    const settings = await readSettingsFromKV(true); // decrypt = true to get telegramBotToken
    if (!settings) {
      return NextResponse.json(
        { status: 'error', message: 'Settings not found' },
        { status: 500 }
      );
    }

    const expectedMerchantId = settings.fpaymentMerchantId;
    const expectedApiKey = settings.fpaymentApiKey;

    if (!expectedMerchantId || !expectedApiKey) {
      return NextResponse.json(
        { status: 'error', message: 'FPayment not configured' },
        { status: 500 }
      );
    }

    // Verify merchant_id and api_key
    if (merchant_id !== expectedMerchantId || api_key !== expectedApiKey) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid merchant_id or api_key' },
        { status: 403 }
      );
    }

    // Process transaction status
    let orderStatus = 'pending';
    if (status === 'completed') {
      orderStatus = 'completed';
    } else if (status === 'expired') {
      orderStatus = 'cancelled';
    }

    // Log callback for debugging
    console.log('FPayment Callback:', {
      request_id,
      status,
      received,
      from_address,
      transaction_id,
      amount,
    });

    // Send Telegram notification for FPayment callback (non-blocking)
    if (status === 'completed' && settings.telegramBotToken && settings.telegramChatId) {
      try {
        const telegramMessage = `✅ <b>Crypto Order Completed</b>

📦 <b>Order ID:</b> ${request_id}
💳 <b>Transaction ID:</b> ${transaction_id || 'N/A'}
💰 <b>Amount:</b> ${amount} USDT
💵 <b>Received:</b> ${received} USDT
📍 <b>From Address:</b> ${from_address || 'N/A'}

⏰ <b>Completed:</b> ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}

✅ <b>Status:</b> Payment verified and completed`;

        // Send Telegram notification (non-blocking)
        sendToTelegram(settings.telegramBotToken, settings.telegramChatId, telegramMessage).catch(err => 
          console.error('Failed to send Telegram notification:', err)
        );
      } catch (error) {
        console.error('Error sending Telegram notification:', error);
      }
    }

    // TODO: Update order in database using request_id
    // Example: await updateOrderStatus(request_id, orderStatus, {
    //   received,
    //   from_address,
    //   transaction_id,
    // });

    // Return success response
    return NextResponse.json({
      status: 'success',
      message: 'Callback processed successfully',
    });
  } catch (error: any) {
    console.error('Error processing FPayment callback:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also support POST method for callback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get callback parameters from body
    const request_id = body.request_id;
    const merchant_id = body.merchant_id;
    const api_key = body.api_key;
    const received = body.received;
    const status = body.status;
    const from_address = body.from_address;
    const transaction_id = body.transaction_id;
    const amount = body.amount;

    // Validate required parameters
    if (!request_id || !merchant_id || !api_key || !received || !status) {
      return NextResponse.json(
        { status: 'error', message: 'Missing required callback parameters' },
        { status: 400 }
      );
    }

    // Verify merchant_id and api_key from settings
    const settings = await readSettingsFromKV(true); // decrypt = true to get telegramBotToken
    if (!settings) {
      return NextResponse.json(
        { status: 'error', message: 'Settings not found' },
        { status: 500 }
      );
    }

    const expectedMerchantId = settings.fpaymentMerchantId;
    const expectedApiKey = settings.fpaymentApiKey;

    if (!expectedMerchantId || !expectedApiKey) {
      return NextResponse.json(
        { status: 'error', message: 'FPayment not configured' },
        { status: 500 }
      );
    }

    // Verify merchant_id and api_key
    if (merchant_id !== expectedMerchantId || api_key !== expectedApiKey) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid merchant_id or api_key' },
        { status: 403 }
      );
    }

    // Process transaction status
    let orderStatus = 'pending';
    if (status === 'completed') {
      orderStatus = 'completed';
    } else if (status === 'expired') {
      orderStatus = 'cancelled';
    }

    // Log callback for debugging
    console.log('FPayment Callback:', {
      request_id,
      status,
      received,
      from_address,
      transaction_id,
      amount,
    });

    // Send Telegram notification for FPayment callback (non-blocking)
    if (status === 'completed' && settings.telegramBotToken && settings.telegramChatId) {
      try {
        const telegramMessage = `✅ <b>Crypto Order Completed</b>

📦 <b>Order ID:</b> ${request_id}
💳 <b>Transaction ID:</b> ${transaction_id || 'N/A'}
💰 <b>Amount:</b> ${amount} USDT
💵 <b>Received:</b> ${received} USDT
📍 <b>From Address:</b> ${from_address || 'N/A'}

⏰ <b>Completed:</b> ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}

✅ <b>Status:</b> Payment verified and completed`;

        // Send Telegram notification (non-blocking)
        sendToTelegram(settings.telegramBotToken, settings.telegramChatId, telegramMessage).catch(err => 
          console.error('Failed to send Telegram notification:', err)
        );
      } catch (error) {
        console.error('Error sending Telegram notification:', error);
      }
    }

    // TODO: Update order in database using request_id
    // Example: await updateOrderStatus(request_id, orderStatus, {
    //   received,
    //   from_address,
    //   transaction_id,
    // });

    // Return success response
    return NextResponse.json({
      status: 'success',
      message: 'Callback processed successfully',
    });
  } catch (error: any) {
    console.error('Error processing FPayment callback:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

