export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'list';

  if (action === 'list') {
    return NextResponse.json([
      { testName: '단어 테스트 #1', date: '2026-03-25', total: 5, pass: 3, fail: 1, retest: 1, pending: 0 },
      { testName: '문법 확인 테스트', date: '2026-03-23', total: 5, pass: 4, fail: 0, retest: 0, pending: 1 },
      { testName: '독해 미니 테스트', date: '2026-03-20', total: 5, pass: 2, fail: 2, retest: 1, pending: 0 },
    ]);
  }

  if (action === 'results') {
    return NextResponse.json([
      { id: 1, testName: '단어 테스트 #1', score: 85, totalScore: 100, result: 'pass', student: { id: 1, name: '김민준', school: '서울중학교', grade: '중1' } },
      { id: 2, testName: '단어 테스트 #1', score: 72, totalScore: 100, result: 'fail', student: { id: 2, name: '이서윤', school: '서울중학교', grade: '중1' } },
      { id: 3, testName: '단어 테스트 #1', score: 90, totalScore: 100, result: 'pass', student: { id: 3, name: '박지호', school: '한강중학교', grade: '중1' } },
    ]);
  }

  return NextResponse.json([]);
}

export async function POST() {
  return NextResponse.json({ success: true });
}
