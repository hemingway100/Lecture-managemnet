'use client';
import { demoStudents } from '@/lib/demo-data';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function StudentViewPage() {
  const params = useParams();
  const student = demoStudents.find(s => s.id === parseInt(params.id as string));
  if (!student) return <div className="text-center py-5 text-muted">학생을 찾을 수 없습니다.</div>;

  const grades = ['초1','초2','초3','초4','초5','초6','중1','중2','중3','고1','고2','고3'];

  return (
    <>
    <div className="d-flex align-items-center mb-4">
      <Link href="/students" className="btn btn-sm btn-outline-secondary me-3"><i className="bi bi-arrow-left"></i></Link>
      <div>
        <h5 className="fw-bold mb-0">{student.name}</h5>
        <p className="text-muted small mb-0">{student.school} {student.grade}
          <span className={`badge ms-2 ${student.status==='active'?'bg-success':student.status==='withdrawn'?'bg-secondary':'bg-warning text-dark'}`}>
            {student.status==='active'?'재원':student.status==='withdrawn'?'퇴원':'휴원'}
          </span>
        </p>
      </div>
    </div>

    <div className="row g-4">
      <div className="col-lg-4">
        <div className="card mb-3">
          <div className="card-header"><h6 className="mb-0 fw-bold" style={{fontSize:'0.88rem'}}><i className="bi bi-person-gear me-1"></i>기본 정보</h6></div>
          <div className="card-body">
            <div className="mb-2"><label className="form-label">이름</label><input className="form-control form-control-sm" defaultValue={student.name} /></div>
            <div className="mb-2"><label className="form-label">학교</label><input className="form-control form-control-sm" defaultValue={student.school} /></div>
            <div className="mb-2"><label className="form-label">학년</label>
              <select className="form-select form-select-sm" defaultValue={student.grade}><option value="">선택</option>{grades.map(g=><option key={g}>{g}</option>)}</select></div>
            <div className="mb-2"><label className="form-label">전화번호</label><input className="form-control form-control-sm" defaultValue={student.phone} /></div>
            <div className="mb-2"><label className="form-label">부모님 전화</label><input className="form-control form-control-sm" defaultValue={student.parentPhone} /></div>
            <div className="mb-3"><label className="form-label">메모</label><textarea className="form-control form-control-sm" rows={2} defaultValue={student.memo || ''}></textarea></div>
            <button className="btn btn-sm btn-primary w-100">저장</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold" style={{fontSize:'0.88rem'}}><i className="bi bi-journal-bookmark me-1"></i>수강 강의</h6>
            <button className="btn btn-sm btn-primary py-0 px-2" style={{fontSize:'0.78rem'}}><i className="bi bi-plus-lg me-1"></i>추가</button>
          </div>
          <div className="card-body p-0">
            {student.studentCourses.length === 0
              ? <div className="text-center py-4 text-muted">수강 강의 없음</div>
              : student.studentCourses.map(sc => (
                <div key={sc.id} className="px-3 py-3" style={{borderBottom:'1px solid var(--border-light)'}}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-semibold" style={{fontSize:'0.88rem'}}>{sc.course.name}</div>
                      <div className="mt-1" style={{fontSize:'0.78rem'}}><span className="fw-semibold">{sc.tuitionAmount.toLocaleString()}원</span><span className="text-muted"> /월</span></div>
                    </div>
                    <span className="badge bg-success" style={{fontSize:'0.68rem'}}>수강중</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="col-lg-8">
        <div className="card mb-3">
          <div className="card-header"><h6 className="mb-0 fw-bold" style={{fontSize:'0.88rem'}}><i className="bi bi-clipboard-check me-1"></i>출결 현황</h6></div>
          <div className="card-body p-0"><table className="table table-hover mb-0">
            <thead><tr><th>날짜</th><th>강의</th><th className="text-center">상태</th><th>사유</th></tr></thead>
            <tbody>
              {[
                { date: '2026-03-26', course: student.studentCourses[0]?.course.name || '-', status: 'present', reason: null },
                { date: '2026-03-25', course: student.studentCourses[0]?.course.name || '-', status: 'present', reason: null },
                { date: '2026-03-24', course: student.studentCourses[0]?.course.name || '-', status: 'late', reason: '교통체증' },
                { date: '2026-03-21', course: student.studentCourses[0]?.course.name || '-', status: 'present', reason: null },
                { date: '2026-03-20', course: student.studentCourses[0]?.course.name || '-', status: 'present', reason: null },
              ].map((a, i) => (
                <tr key={i}>
                  <td style={{fontSize:'0.82rem'}}>{a.date}</td>
                  <td style={{fontSize:'0.82rem'}}>{a.course}</td>
                  <td className="text-center"><span className={`badge ${a.status==='present'?'bg-success':a.status==='late'?'bg-warning text-dark':'bg-danger'}`}>{a.status==='present'?'출석':a.status==='late'?'지각':'결석'}</span></td>
                  <td className="text-muted" style={{fontSize:'0.82rem'}}>{a.reason || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>

        <div className="card">
          <div className="card-header"><h6 className="mb-0 fw-bold" style={{fontSize:'0.88rem'}}><i className="bi bi-wallet2 me-1"></i>원비 내역</h6></div>
          <div className="card-body p-0"><table className="table table-hover mb-0">
            <thead><tr><th>월</th><th>강의</th><th className="text-center">금액</th><th className="text-center">상태</th></tr></thead>
            <tbody>
              {['2026-03','2026-02','2026-01'].map(m => (
                <tr key={m}>
                  <td style={{fontSize:'0.82rem'}}>{m}</td>
                  <td style={{fontSize:'0.82rem'}}>{student.studentCourses[0]?.course.name || '-'}</td>
                  <td className="text-center" style={{fontSize:'0.82rem'}}>{(student.studentCourses[0]?.tuitionAmount || 0).toLocaleString()}원</td>
                  <td className="text-center"><span className={`badge ${m==='2026-03'?'bg-danger':'bg-success'}`}>{m==='2026-03'?'미납':'납부'}</span></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      </div>
    </div>
    </>
  );
}
