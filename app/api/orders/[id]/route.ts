import { NextRequest, NextResponse } from 'next/server';
import { d1 } from '@/lib/db/d1-client';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await d1.getOrderById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status, trackingNumber } = await req.json();
    const updated = await d1.updateOrderStatus(id, status, trackingNumber);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Pesanan gagal diperbarui' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
