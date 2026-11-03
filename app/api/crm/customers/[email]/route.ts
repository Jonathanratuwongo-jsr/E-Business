import { NextRequest, NextResponse } from 'next/server';
import { d1 } from '@/lib/db/d1-client';

export async function GET(req: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);
    const data = await d1.getCustomerByEmail(decodedEmail);

    if (!data) {
      return NextResponse.json({ success: false, error: 'Pelanggan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);
    const body = await req.json();

    const updatedCustomer = await d1.updateCustomerCRM(decodedEmail, body);
    if (!updatedCustomer) {
      return NextResponse.json({ success: false, error: 'Gagal memperbarui profil CRM pelanggan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedCustomer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

