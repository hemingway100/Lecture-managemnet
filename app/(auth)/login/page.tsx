'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [error, setError] = useState('');
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // 데모 모드: 바로 대시보드로 이동
    router.push('/');
  }

  return (
    <div className="login-wrapper">
      <div className="card login-card">
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #7c3aed, #5046e5)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <i className="bi bi-mortarboard-fill text-white" style={{ fontSize: '1.6rem' }}></i>
            </div>
            <h4 className="fw-bold mt-1">수강생 관리</h4>
            <p className="text-muted small">관리자 계정으로 로그인하세요</p>
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3"><label className="form-label">아이디</label><input type="text" className="form-control py-2" placeholder="admin" defaultValue="admin" /></div>
            <div className="mb-4"><label className="form-label">비밀번호</label><input type="password" className="form-control py-2" placeholder="••••••" defaultValue="admin123" /></div>
            <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold">로그인</button>
          </form>
          <p className="text-center text-muted small mt-3 mb-0">데모 버전 - 바로 입장 가능</p>
        </div>
      </div>
    </div>
  );
}
