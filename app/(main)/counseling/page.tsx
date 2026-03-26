'use client';
import { demoStudents } from '@/lib/demo-data';

const demoCounselings = [
  { id: 1, date: '2026-03-25', studentName: '장예준', type: 'phone', counselor: '김원장', content: '학습 태도 상담. 집중력이 많이 향상됨.', followUp: '다음 주 재상담 예정' },
  { id: 2, date: '2026-03-24', studentName: '배현서', type: 'visit', counselor: '이준호', content: '부모님 상담. 내신 대비 방향 논의.', followUp: null },
  { id: 3, date: '2026-03-22', studentName: '조은채', type: 'online', counselor: '최민지', content: '수능 영어 목표 등급 설정 및 전략 논의.', followUp: null },
  { id: 4, date: '2026-03-20', studentName: '김민준', type: 'phone', counselor: '박서연', content: '진도 상담. 현재 속도 유지하면 목표 달성 가능.', followUp: '다음 달 점검' },
  { id: 5, date: '2026-03-18', studentName: '전서현', type: 'visit', counselor: '최민지', content: '학교 시험 결과 공유 및 보완 계획 수립.', followUp: null },
];
const typeMap: Record<string,string> = { phone:'전화', visit:'방문', online:'온라인' };

export default function CounselingPage() {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h5 className="fw-bold mb-1">상담</h5><p className="text-muted small mb-0">학생/학부모 상담 내역을 관리합니다</p></div>
        <button className="btn btn-primary"><i className="bi bi-plus-lg me-1"></i>상담 기록</button>
      </div>

      <div className="card"><div className="card-body p-0"><div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead><tr><th>날짜</th><th>학생</th><th className="text-center">유형</th><th>상담자</th><th>내용</th><th>후속조치</th></tr></thead>
          <tbody>
            {demoCounselings.map(c => (
              <tr key={c.id}>
                <td style={{fontSize:'0.82rem'}}>{c.date}</td>
                <td className="fw-semibold">{c.studentName}</td>
                <td className="text-center"><span className={`badge ${c.type==='visit'?'bg-success':c.type==='phone'?'bg-primary':'bg-info'}`}>{typeMap[c.type]}</span></td>
                <td style={{fontSize:'0.82rem'}}>{c.counselor}</td>
                <td style={{fontSize:'0.82rem', maxWidth:250}}>{c.content}</td>
                <td className="text-muted" style={{fontSize:'0.82rem'}}>{c.followUp || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></div></div>
    </>
  );
}
