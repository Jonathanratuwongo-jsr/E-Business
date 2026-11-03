import { NextRequest, NextResponse } from 'next/server';
import { d1 } from '@/lib/db/d1-client';

export async function POST(req: NextRequest) {
  try {
    const { code, customerEmail, subtotal } = await req.json();

    if (!code || !subtotal) {
      return NextResponse.json(
        { success: false, error: 'Kode promo dan nominal subtotal diperlukan.' },
        { status: 400 }
      );
    }

    const result = await d1.validatePromo(code, customerEmail || '', Number(subtotal));
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

