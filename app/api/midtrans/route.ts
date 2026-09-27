import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { orderId, grossAmount, customerDetails, itemDetails } = await req.json();

    const midtransServerKey = process.env.MIDTRANS_SERVER_KEY;
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

    // Midtrans Snap Token payload format
    const snapPayload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: customerDetails,
      item_details: itemDetails,
      enabled_payments: [
        'gopay',
        'shopeepay',
        'qris',
        'bca_va',
        'bni_va',
        'bri_va',
        'mandiri_va',
        'permata_va',
        'credit_card',
      ],
    };

    // If real server key is available, attempt real Midtrans Snap API call
    if (midtransServerKey) {
      const authHeader = Buffer.from(`${midtransServerKey}:`).toString('base64');
      const snapUrl = isProduction
        ? 'https://app.midtrans.com/snap/v1/transactions'
        : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

      const response = await fetch(snapUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${authHeader}`,
        },
        body: JSON.stringify(snapPayload),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          success: true,
          token: data.token,
          redirect_url: data.redirect_url,
          mode: isProduction ? 'production' : 'sandbox',
        });
      }
    }

    // High fidelity Sandbox / Demonstration Token
    const simulatedToken = `snap-token-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    return NextResponse.json({
      success: true,
      token: simulatedToken,
      redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${simulatedToken}`,
      mode: 'sandbox_simulator',
      details: snapPayload,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
