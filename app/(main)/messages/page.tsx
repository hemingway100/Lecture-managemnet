'use client';
import { demoMessages } from '@/lib/demo-data';

const typeMap: Record<string, [string,string]> = {
  attendance: ['출결','bg-primary'], test: ['테스트','bg-info'],
  clinic: ['클리닉','bg-warning text-dark'], material: ['자료','bg-success'],
};

export default function MessagesPage() {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h5 className="fw-bold mb-1">문자 이력</h5><p className="text-muted small mb-0">발송된 알림 내역을 확인합니다</p></div>
      </div>
      <div className="row g-3 mb-4">
        {[['총 발송',7,'primary','bi-envelope'],['성공',6,'success','bi-check-circle'],['실패',1,'danger','bi-x-circle']].map(([l,v,c,ic],i) => (
          <div className="col-md-4" key={i}><div className="card stat-card"><div className="card-body d-flex align-items-center">
            <div className={`stat-icon bg-${c} bg-opacity-10 text-${c} me-3`}><i className={`bi ${ic}`}></i></div>
            <div><div className="text-muted small">오늘 {l as string}</div><div className="fw-bold fs-4">{v as number}건</div></div>
          </div></div></div>
        ))}
      </div>
      <div className="card"><div className="card-body p-0"><div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead><tr><th>시간</th><th>학생</th><th>번호</th><th>유형</th><th>내용</th><th>상태</th></tr></thead>
          <tbody>
            {demoMessages.map(m => {
              const [tl,tc] = typeMap[m.type] || ['기타','bg-secondary'];
              return (
                <tr key={m.id}>
                  <td className="text-nowrap" style={{fontSize:'0.82rem'}}>{m.sentAt}</td>
                  <td className="fw-semibold">{m.student.name}</td>
                  <td style={{fontSize:'0.82rem'}}>{m.phone}</td>
                  <td><span className={`badge ${tc}`}>{tl}</span></td>
                  <td style={{maxWidth:350,fontSize:'0.82rem'}}>{m.content.slice(0,100)}</td>
                  <td><span className={`badge ${m.status==='sent'?'bg-success':'bg-danger'}`}>{m.status==='sent'?'발송':'실패'}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div></div></div>
    </>
  );
}
