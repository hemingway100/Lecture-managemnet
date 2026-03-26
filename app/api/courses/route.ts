export const dynamic = 'force-dynamic';
import { demoCourses } from '@/lib/demo-data';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(demoCourses);
}
