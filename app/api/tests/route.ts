export const dynamic = 'force-dynamic';
import { demoStudents } from '@/lib/demo-data';
import { NextRequest, NextResponse } from 'next/server';

// 데모 테스트 데이터 생성
const demoTestRecords = (() => {
  const records: Array<{
    id: number; studentId: number; courseId: number; testName: string;
    date: string; score: number; totalScore: number; result: string | null;
  }> = [];
  let id = 1;
  const testTemplates = [
    { name: '단어 테스트', dates: ['2026-03-26', '2026-03-25', '2026-03-24', '2026-03-21', '2026-03-20'] },
    { name: '문법 확인', dates: ['2026-03-25', '2026-03-22', '2026-03-19'] },
    { name: '독해 미니', dates: ['2026-03-24', '2026-03-21'] },
    { name: '듣기 테스트', dates: ['2026-03-23'] },
    { name: '작문 테스트', dates: ['2026-03-22'] },
  ];

  for (const s of demoStudents.filter(st => st.status === 'active')) {
    for (const sc of s.studentCourses) {
      for (const tmpl of testTemplates) {
        for (const date of tmpl.dates) {
          const score = Math.floor(Math.random() * 45) + 55;
          const results = score >= 85 ? 'pass' : score >= 70 ? (['pass', 'fail', 'retest'][Math.floor(Math.random() * 3)]) : (['fail', 'retest'][Math.floor(Math.random() * 2)]);
          records.push({
            id: id++, studentId: s.id, courseId: sc.courseId,
            testName: tmpl.name, date, score, totalScore: 100, result: results,
          });
        }
      }
    }
  }
  return records;
})();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'list';
  const courseId = parseInt(searchParams.get('courseId') || '0');

  // 강의별 테스트 목록
  if (action === 'list') {
    const courseTests = demoTestRecords.filter(t => !courseId || t.courseId === courseId);
    const groupMap = new Map<string, { testName: string; date: string; total: number; pass: number; fail: number; retest: number; pending: number }>();
    for (const t of courseTests) {
      const key = `${t.testName}__${t.date}`;
      const g = groupMap.get(key) || { testName: t.testName, date: t.date, total: 0, pass: 0, fail: 0, retest: 0, pending: 0 };
      g.total++;
      if (t.result === 'pass') g.pass++; else if (t.result === 'fail') g.fail++; else if (t.result === 'retest') g.retest++; else g.pending++;
      groupMap.set(key, g);
    }
    return NextResponse.json(Array.from(groupMap.values()).sort((a, b) => b.date.localeCompare(a.date)));
  }

  // 특정 테스트 결과
  if (action === 'results') {
    const testName = searchParams.get('testName') || '';
    const date = searchParams.get('date') || '';
    const filtered = demoTestRecords.filter(t => t.courseId === courseId && t.testName === testName && t.date === date);
    return NextResponse.json(filtered.map(t => {
      const s = demoStudents.find(st => st.id === t.studentId);
      return { ...t, student: { id: t.studentId, name: s?.name || '', school: s?.school || null, grade: s?.grade || null } };
    }));
  }

  // 학생별 수행률 통계
  if (action === 'studentStats') {
    const courseTests = demoTestRecords.filter(t => t.courseId === courseId);
    const studentMap = new Map<number, { pass: number; fail: number; retest: number; total: number }>();
    for (const t of courseTests) {
      const s = studentMap.get(t.studentId) || { pass: 0, fail: 0, retest: 0, total: 0 };
      s.total++;
      if (t.result === 'pass') s.pass++; else if (t.result === 'fail') s.fail++; else if (t.result === 'retest') s.retest++;
      studentMap.set(t.studentId, s);
    }

    const result = Array.from(studentMap.entries()).map(([sid, stat]) => {
      const s = demoStudents.find(st => st.id === sid);
      return {
        studentId: sid, name: s?.name || '', school: s?.school || null, grade: s?.grade || null,
        totalTests: stat.total, pass: stat.pass, fail: stat.fail, retest: stat.retest,
        rate: stat.total > 0 ? Math.round((stat.pass / stat.total) * 100) : 0,
      };
    }).sort((a, b) => b.rate - a.rate);

    return NextResponse.json(result);
  }

  // 학생 개별 상세
  if (action === 'studentDetail') {
    const studentId = parseInt(searchParams.get('studentId') || '0');
    const s = demoStudents.find(st => st.id === studentId);
    const tests = demoTestRecords
      .filter(t => t.studentId === studentId && t.courseId === courseId)
      .sort((a, b) => b.date.localeCompare(a.date) || a.testName.localeCompare(b.testName));

    return NextResponse.json({
      student: s ? { name: s.name, school: s.school, grade: s.grade } : null,
      tests,
    });
  }

  return NextResponse.json([]);
}

export async function POST() {
  return NextResponse.json({ success: true });
}
