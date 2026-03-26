export const dynamic = 'force-dynamic';
import { demoStudents } from '@/lib/demo-data';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courseId = parseInt(searchParams.get('courseId') || '0');
  if (!courseId) return NextResponse.json([]);

  const students = demoStudents.filter(s => s.status === 'active' && s.studentCourses.some(sc => sc.courseId === courseId));
  return NextResponse.json(students.map(s => ({
    studentId: s.id, name: s.name, school: s.school, grade: s.grade,
    phone: s.phone, parentPhone: s.parentPhone, attendance: null,
  })));
}

export async function POST() {
  return NextResponse.json({ success: true });
}
