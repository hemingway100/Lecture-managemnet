export const dynamic = 'force-dynamic';
import { demoStudents } from '@/lib/demo-data';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(demoStudents.filter(s => s.status === 'active').map(s => ({
    id: s.id, name: s.name, school: s.school, grade: s.grade, phone: s.phone,
  })));
}
