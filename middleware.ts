import { NextResponse } from 'next/server';

// 데모 모드: 인증 없이 모든 페이지 접근 허용
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
