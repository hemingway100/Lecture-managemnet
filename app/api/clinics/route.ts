export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ clinics: [], grouped: {} });
}

export async function POST() {
  return NextResponse.json({ success: true });
}
