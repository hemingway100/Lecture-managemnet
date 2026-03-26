'use client';
import { demoStudents, demoTuitionChart } from '@/lib/demo-data';
import RevenueChart from '@/components/RevenueChart';

const demoPayments = demoStudents.filter(s => s.status === 'active').map((s, i) => ({
  id: i + 1, studentName: s.name, grade: s.grade, courseName: s.studentCourses[0]?.course.name || '-',
  amount: s.studentCourses[0]?.tuitionAmount || 0,
  paymentDate: '2026-03-05', paymentMethod: ['transfer','card','cash'][i % 3],
  status: i % 5 === 0 ? 'unpaid' : 'paid', memo: null,
}));

export default function TuitionPage() {
  const paid = demoPayments.filter(p => p.status === 'paid').reduce((s,p) => s + p.amount, 0);
  const unpaid = demoPayments.filter(p => p.status === 'unpaid').reduce((s,p) => s + p.amount, 0);
  const total = paid + unpaid;
  const rate = total > 0 ? Math.round((paid/total)*1000)/10 : 0;
  const methodMap: Record<string,string> = { cash:'현금', card:'카드', transfer:'이체' };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h5 className="fw-bold mb-1">원비 정산</h5><p className="text-muted small mb-0">월별 원비 납부 현황을 관리합니다</p></div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-5">
          <div className="card h-100"><div className="card-header"><h6 className="fw-bold mb-0" style={{fontSize:'0.85rem'}}>2026-03 현황</h6></div>
            <div className="card-body"><div className="row g-3">
              <div className="col-12"><div className="d-flex justify-content-between p-3 rounded" style={{background:'var(--bg-body)'}}>
                <div><div className="text-muted" style={{fontSize:'0.75rem'}}>총 청구</div><div className="fw-bold fs-5">{total.toLocaleString()}원</div></div>
              </div></div>
              <div className="col-6"><div className="p-3 rounded" style={{background:'#dcfce7'}}>
                <div style={{fontSize:'0.72rem',color:'#16a34a'}}>납부</div><div className="fw-bold" style={{fontSize:'1.1rem',color:'#16a34a'}}>{paid.toLocaleString()}원</div>
                <div style={{fontSize:'0.72rem',color:'#16a34a',opacity:0.7}}>{rate}%</div>
              </div></div>
              <div className="col-6"><div className="p-3 rounded" style={{background:'#fee2e2'}}>
                <div style={{fontSize:'0.72rem',color:'#dc2626'}}>미납</div><div className="fw-bold" style={{fontSize:'1.1rem',color:'#dc2626'}}>{unpaid.toLocaleString()}원</div>
                <div style={{fontSize:'0.72rem',color:'#dc2626',opacity:0.7}}>{demoPayments.filter(p=>p.status==='unpaid').length}명</div>
              </div></div>
            </div></div></div>
        </div>
        <div className="col-lg-7">
          <div className="card h-100"><div className="card-header"><h6 className="fw-bold mb-0" style={{fontSize:'0.85rem'}}>월별 납부/미납 추이</h6></div>
            <div className="card-body"><RevenueChart data={demoTuitionChart} /></div></div>
        </div>
      </div>

      <div className="card"><div className="card-body p-0"><div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead><tr><th>학생</th><th className="text-center">학년</th><th>강의</th><th className="text-center">금액</th><th className="text-center">방법</th><th className="text-center">상태</th></tr></thead>
          <tbody>
            {demoPayments.map(p => (
              <tr key={p.id}>
                <td className="fw-semibold">{p.studentName}</td>
                <td className="text-center"><span className="badge bg-light text-dark border" style={{fontSize:'0.7rem'}}>{p.grade}</span></td>
                <td className="text-muted">{p.courseName}</td>
                <td className="text-center">{p.amount.toLocaleString()}원</td>
                <td className="text-center text-muted" style={{fontSize:'0.8rem'}}>{methodMap[p.paymentMethod]}</td>
                <td className="text-center"><span className={`badge ${p.status==='paid'?'bg-success':'bg-danger'}`}>{p.status==='paid'?'납부':'미납'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></div></div>
    </>
  );
}
