export const dynamic = 'force-dynamic';
import { demoStudents } from '@/lib/demo-data';
import { NextRequest, NextResponse } from 'next/server';

// 데모 클리닉 데이터
const demoClinics = (() => {
  const clinics: Array<{
    id: number; title: string; scheduledDate: string; scheduledTime: string;
    status: string; content: string | null; memo: string | null; reminderSent: boolean;
    student: { id: number; name: string; grade: string | null; phone: string | null; parentPhone: string | null };
  }> = [];

  const titles = ['단어 보충', '문법 재시험', '독해 보충 수업', '듣기 특강', '작문 첨삭', '내신 대비 보충', '수능 특강'];
  const contents = ['테스트 미통과 학생 보충', '기초 문법 재정리', '독해 속도 향상 훈련', '듣기 집중 훈련', '영작문 개별 첨삭', null];
  const times = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
  const statuses = ['completed', 'completed', 'completed', 'late', 'absent', 'scheduled', 'scheduled'];
  const activeStudents = demoStudents.filter(s => s.status === 'active');

  let id = 1;
  const today = new Date();

  // 과거 2주 + 미래 1주 데이터
  for (let dayOffset = -14; dayOffset <= 7; dayOffset++) {
    const d = new Date(today);
    d.setDate(d.getDate() + dayOffset);
    if (d.getDay() === 0) continue; // 일요일 스킵

    // 하루에 2~4명
    const count = 2 + Math.floor(Math.random() * 3);
    const shuffled = [...activeStudents].sort(() => Math.random() - 0.5).slice(0, count);

    for (const student of shuffled) {
      const isFuture = dayOffset > 0;
      const status = isFuture ? 'scheduled' : statuses[Math.floor(Math.random() * (statuses.length - 2))];
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      clinics.push({
        id: id++,
        title: titles[Math.floor(Math.random() * titles.length)],
        scheduledDate: dateStr,
        scheduledTime: times[Math.floor(Math.random() * times.length)],
        status,
        content: contents[Math.floor(Math.random() * contents.length)],
        memo: null,
        reminderSent: !isFuture && Math.random() > 0.4,
        student: {
          id: student.id, name: student.name, grade: student.grade,
          phone: student.phone, parentPhone: student.parentPhone,
        },
      });
    }
  }
  return clinics;
})();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month') || '';
  if (!month) return NextResponse.json({ clinics: [], grouped: {} });

  const filtered = demoClinics.filter(c => c.scheduledDate.startsWith(month));

  const grouped: Record<string, typeof filtered> = {};
  for (const c of filtered) {
    if (!grouped[c.scheduledDate]) grouped[c.scheduledDate] = [];
    grouped[c.scheduledDate].push(c);
  }

  return NextResponse.json({ clinics: filtered, grouped });
}

export async function POST() {
  return NextResponse.json({ success: true });
}
