export default function ReportsPage() {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h5 className="fw-bold mb-1">통계 리포트</h5><p className="text-muted small mb-0">월별 운영 현황을 확인합니다</p></div>
      </div>
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card h-100"><div className="card-header"><h6 className="mb-0 fw-bold" style={{fontSize:'0.85rem'}}>인원 현황</h6></div>
            <div className="card-body"><div className="row text-center">
              <div className="col-4"><div className="fs-3 fw-bold text-primary">28</div><div className="text-muted small">재원생</div></div>
              <div className="col-4"><div className="fs-3 fw-bold text-success">3</div><div className="text-muted small">신규</div></div>
              <div className="col-4"><div className="fs-3 fw-bold text-danger">1</div><div className="text-muted small">퇴원</div></div>
            </div></div></div>
        </div>
        <div className="col-lg-6">
          <div className="card h-100"><div className="card-header"><h6 className="mb-0 fw-bold" style={{fontSize:'0.85rem'}}>출결 통계</h6></div>
            <div className="card-body"><div className="row text-center">
              <div className="col-3"><div className="fs-4 fw-bold text-success">92%</div><div className="text-muted small">출석률</div></div>
              <div className="col-3"><div className="fs-4 fw-bold">364</div><div className="text-muted small">총</div></div>
              <div className="col-3"><div className="fs-4 fw-bold text-warning">18</div><div className="text-muted small">지각</div></div>
              <div className="col-3"><div className="fs-4 fw-bold text-danger">12</div><div className="text-muted small">결석</div></div>
            </div></div></div>
        </div>
        <div className="col-lg-6">
          <div className="card h-100"><div className="card-header"><h6 className="mb-0 fw-bold" style={{fontSize:'0.85rem'}}>원비 현황</h6></div>
            <div className="card-body"><div className="row text-center">
              <div className="col-4"><div className="fw-bold fs-5">11,040,000</div><div className="text-muted small">총 청구</div></div>
              <div className="col-4"><div className="fw-bold fs-5 text-success">6,710,000</div><div className="text-muted small">납부</div></div>
              <div className="col-4"><div className="fw-bold fs-5 text-danger">4,330,000</div><div className="text-muted small">미납</div></div>
            </div></div></div>
        </div>
        <div className="col-lg-6">
          <div className="card h-100"><div className="card-header"><h6 className="mb-0 fw-bold" style={{fontSize:'0.85rem'}}>문자 발송</h6></div>
            <div className="card-body text-center"><div className="fs-3 fw-bold text-primary">30</div><div className="text-muted">총 발송 건수</div></div></div>
        </div>
      </div>
    </>
  );
}
