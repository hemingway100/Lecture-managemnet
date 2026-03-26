export const dynamic = 'force-dynamic';
import { demoMaterials } from '@/lib/demo-data';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(demoMaterials);
}

export async function POST() {
  return NextResponse.json({ success: true });
}
