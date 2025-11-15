import { NextRequest, NextResponse } from 'next/server';
import { readSettingsFromKV } from '@/lib/settings-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      merchant_id,
      api_key,
      name,
      description,
      amount,
      request_id,
      callback_url,
      success_url,
      cancel_url,
    } = body;

    if (!merchant_id || !api_key || !name || !amount || !request_id) {
      return NextResponse.json(
        { status: 'error', msg: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create form data for FPayment API
    const formData = new URLSearchParams();
    formData.append('merchant_id', merchant_id);
    formData.append('api_key', api_key);
    formData.append('name', name);
    formData.append('description', description || '');
    formData.append('amount', amount);
    formData.append('request_id', request_id);
    formData.append('callback_url', callback_url);
    formData.append('success_url', success_url);
    formData.append('cancel_url', cancel_url);

    // Call FPayment API
    const response = await fetch('https://app.fpayment.net/api/AddInvoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const result = await response.json();

    // Log for debugging (without sensitive data)
    console.log('FPayment API Response:', {
      status: result.status,
      hasData: !!result.data,
      msg: result.msg,
      merchantIdLength: merchant_id?.length || 0,
      apiKeyLength: api_key?.length || 0,
    });

    if (result.status === 'success' && result.data) {
      return NextResponse.json({
        status: 'success',
        msg: result.msg || 'Invoice creation successful!',
        data: {
          trans_id: result.data.trans_id,
          amount: result.data.amount,
          status: result.data.status,
          url_payment: result.data.url_payment,
        },
        url: result.data.url_payment,
      });
    } else {
      // Return more detailed error message
      const errorMsg = result.msg || result.message || 'Failed to create invoice';
      console.error('FPayment API Error:', errorMsg, result);
      return NextResponse.json(
        { status: 'error', msg: errorMsg },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error creating FPayment invoice:', error);
    return NextResponse.json(
      { status: 'error', msg: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

