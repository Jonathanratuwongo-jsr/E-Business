import { NextRequest, NextResponse } from 'next/server';
import { d1 } from '@/lib/db/d1-client';

export async function GET() {
  try {
    const vouchers = await d1.getRetentionVouchers();
    return NextResponse.json({ success: true, data: { vouchers } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, customerEmail, templateType, title, message, segment } = body;

    if (action === 'send_email') {
      if (segment && segment !== 'Semua') {
        // Broadcast ke semua pelanggan di segmen tertentu
        const customers = await d1.getCustomers(segment);
        const results = [];
        for (const cust of customers) {
          const act = await d1.sendRetentionEmail(cust.email, templateType || 'custom', title, message);
          results.push(act);
        }
        return NextResponse.json({
          success: true,
          message: `Berhasil mengirim aksi retensi ke ${customers.length} pelanggan segmen ${segment}.`,
          count: customers.length,
        });
      }

      if (!customerEmail) {
        return NextResponse.json({ success: false, error: 'Email pelanggan diperlukan.' }, { status: 400 });
      }

      const activity = await d1.sendRetentionEmail(customerEmail, templateType || 'custom', title, message);
      return NextResponse.json({
        success: true,
        message: 'Email aksi retensi berhasil dikirim dan tercatat di profil pelanggan.',
        data: activity,
      });
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak dikenali.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

