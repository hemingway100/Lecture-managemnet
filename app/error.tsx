'use client';

export default function RootError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="ko">
      <body style={{ fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', opacity: 0.4 }}>⚠️</div>
          <h4 style={{ fontWeight: 700, marginTop: 12 }}>오류가 발생했습니다</h4>
          <p style={{ color: '#71717a', fontSize: '0.9rem' }}>잠시 후 다시 시도해주세요</p>
          <button onClick={reset} style={{
            padding: '8px 24px', background: '#5046e5', color: '#fff',
            border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem',
          }}>다시 시도</button>
        </div>
      </body>
    </html>
  );
}
