import { NextRequest, NextResponse } from 'next/server';
import { d1 } from '@/lib/db/d1-client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const segment = searchParams.get('segment') || undefined;
    const query = searchParams.get('q') || undefined;

    const customers = await d1.getCustomers(segment, query);
    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

