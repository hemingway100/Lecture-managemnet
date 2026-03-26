import Link from 'next/link';

export default function DashboardPage() {
  return (
    <>
      <div className="row g-3 mb-4">
        {[
          { label: '재원생', value: '28명', icon: 'bi-people', color: 'primary' },
          { label: '오늘 출석률', value: '92.3%', icon: 'bi-clipboard-check', color: 'success' },
          { label: '활성 강의', value: '6개', icon: 'bi-journal-text', color: 'info' },
          { label: '이번달 신규', value: '3명', icon: 'bi-person-plus', color: 'warning' },
        ].map((card, i) => (
          <div className="col-6 col-lg-3" key={i}>
            <div className="card stat-card">
              <div className="card-body d-flex align-items-center">
                <div className={`stat-icon bg-${card.color} bg-opacity-10 text-${card.color} me-3`}>
                  <i className={`bi ${card.icon}`}></i>
                </div>
                <div>
                  <div className="text-muted small">{card.label}</div>
                  <div className="fw-bold fs-4">{card.value}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold" style={{fontSize:'0.88rem'}}><i className="bi bi-clipboard-check me-1"></i>오늘 출결</h6>
              <Link href="/attendance" className="btn btn-sm btn-outline-primary">출결 관리</Link>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-4"><div className="fs-3 fw-bold text-success">24</div><div className="text-muted small">출석</div></div>
                <div className="col-4"><div className="fs-3 fw-bold text-warning">2</div><div className="text-muted small">지각</div></div>
                <div className="col-4"><div className="fs-3 fw-bold text-danger">2</div><div className="text-muted small">결석</div></div>
              </div>
              <div className="progress mt-3" style={{ height: 8 }}>
                <div className="progress-bar bg-success" style={{ width: '85.7%' }}></div>
                <div className="progress-bar bg-warning" style={{ width: '7.15%' }}></div>
                <div className="progress-bar bg-danger" style={{ width: '7.15%' }}></div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold" style={{fontSize:'0.88rem'}}><i className="bi bi-person-plus me-1"></i>최근 등록 학생</h6>
              <Link href="/students" className="btn btn-sm btn-outline-primary">전체 목록</Link>
            </div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead><tr><th>이름</th><th>학교</th><th>학년</th><th>등록일</th></tr></thead>
                <tbody>
                  {[
                    { name: '윤시우', school: '서초중학교', grade: '중2', date: '2025-11-01' },
                    { name: '박지호', school: '한강중학교', grade: '중1', date: '2025-10-01' },
                    { name: '강도윤', school: '강남중학교', grade: '중2', date: '2025-09-10' },
                    { name: '김민준', school: '서울중학교', grade: '중1', date: '2025-09-01' },
                    { name: '홍지원', school: '창동고등학교', grade: '고1', date: '2025-09-01' },
                  ].map((s, i) => (
                    <tr key={i}><td className="fw-semibold">{s.name}</td><td>{s.school}</td><td>{s.grade}</td><td>{s.date}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header"><h6 className="mb-0 fw-bold" style={{fontSize:'0.88rem'}}><i className="bi bi-calendar-check me-1"></i>오늘 클리닉</h6></div>
            <ul className="list-group list-group-flush">
              {[
                { name: '장예준', time: '14:00', status: '예정' },
                { name: '송이준', time: '15:30', status: '완료' },
                { name: '배현서', time: '17:00', status: '예정' },
              ].map((c, i) => (
                <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                  <div><strong>{c.name}</strong><br/><small className="text-muted">{c.time}</small></div>
                  <span className={`badge ${c.status === '완료' ? 'bg-success' : 'bg-info'}`}>{c.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
