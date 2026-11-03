import { NextResponse } from 'next/server';
import { d1 } from '@/lib/db/d1-client';

export async function GET() {
  try {
    const metrics = await d1.getCRMMetrics();
    return NextResponse.json({ success: true, data: metrics });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

