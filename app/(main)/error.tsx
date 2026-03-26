'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
      <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
      <h5 className="fw-bold mt-3">페이지를 불러올 수 없습니다</h5>
      <p className="text-muted small">데이터베이스 연결을 확인해주세요</p>
      <button className="btn btn-primary btn-sm" onClick={reset}>다시 시도</button>
    </div>
  );
}
