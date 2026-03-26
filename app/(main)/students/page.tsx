'use client';
import { demoStudents } from '@/lib/demo-data';
import Link from 'next/link';
import { useState } from 'react';

const GRADES = ['중1','중2','중3','고1','고2','고3'];

export default function StudentsPage() {
  const [status, setStatus] = useState('active');
  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = demoStudents.filter(s => {
    if (status && s.status !== status) return false;
    if (grade && s.grade !== grade) return false;
    if (search && !s.name.includes(search) && !s.school.includes(search)) return false;
    return true;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const activeCount = demoStudents.filter(s => s.status === 'active').length;

  return (
    <>
      <div className="row g-3 mb-4">
        {[
          { label: '재원생', value: `${activeCount}명`, color: 'primary', icon: 'bi-people' },
          { label: '이번달 신규', value: '3명', color: 'success', icon: 'bi-person-plus' },
          { label: '이번달 퇴원', value: '1명', color: 'danger', icon: 'bi-person-dash' },
        ].map((c, i) => (
          <div className="col-md-4" key={i}>
            <div className="card stat-card">
              <div className="card-body d-flex align-items-center">
                <div className={`stat-icon bg-${c.color} bg-opacity-10 text-${c.color} me-3`}><i className={`bi ${c.icon}`}></i></div>
                <div><div className="text-muted small">{c.label}</div><div className="fw-bold fs-4">{c.value}</div></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-lg-2"><label className="form-label small mb-1">검색</label>
              <input type="text" className="form-control form-control-sm" placeholder="이름, 학교" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
            <div className="col-lg-2"><label className="form-label small mb-1">상태</label>
              <select className="form-select form-select-sm" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
                <option value="active">재원</option><option value="withdrawn">퇴원</option><option value="inactive">휴원</option><option value="">전체</option>
              </select></div>
            <div className="col-lg-2"><label className="form-label small mb-1">학년</label>
              <select className="form-select form-select-sm" value={grade} onChange={e => { setGrade(e.target.value); setPage(1); }}>
                <option value="">전체 학년</option>{GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select></div>
            <div className="col-lg-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => { setSearch(''); setStatus('active'); setGrade(''); setPage(1); }}>초기화</button>
            </div>
            <div className="col-lg-4 text-end">
              <Link href="/students/new" className="btn btn-sm btn-primary"><i className="bi bi-person-plus"></i> 학생 등록</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted" style={{ fontSize: '0.82rem' }}>총 {total}명</span>
            <span className="text-muted" style={{ fontSize: '0.78rem' }}>{page} / {totalPages} 페이지</span>
          </div>
        </div>
        <div className="card-body p-0"><div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead><tr><th style={{width:40}}>#</th><th>이름</th><th>학교</th><th className="text-center">학년</th><th>전화번호</th><th>부모님 전화</th><th>수강 강의</th><th className="text-center">등록일</th><th className="text-center">상태</th><th className="text-center" style={{width:50}}>관리</th></tr></thead>
            <tbody>
              {paged.length === 0
                ? <tr><td colSpan={10} className="text-center text-muted py-4">학생이 없습니다.</td></tr>
                : paged.map((s, i) => (
                  <tr key={s.id}>
                    <td className="text-muted">{(page-1)*perPage+i+1}</td>
                    <td><Link href={`/students/${s.id}`} className="fw-semibold text-decoration-none">{s.name}</Link></td>
                    <td className="text-muted" style={{fontSize:'0.82rem'}}>{s.school}</td>
                    <td className="text-center"><span className="badge bg-light text-dark border" style={{fontSize:'0.72rem'}}>{s.grade}</span></td>
                    <td style={{fontSize:'0.82rem'}}>{s.phone}</td>
                    <td style={{fontSize:'0.82rem'}}>{s.parentPhone}</td>
                    <td>{s.studentCourses.map(sc => <span key={sc.id} className="badge bg-light text-dark border me-1" style={{fontWeight:500,fontSize:'0.7rem'}}>{sc.course.name}</span>)}</td>
                    <td className="text-center text-muted" style={{fontSize:'0.8rem'}}>{s.enrolledAt}</td>
                    <td className="text-center">
                      <span className={`badge ${s.status==='active'?'bg-success':s.status==='withdrawn'?'bg-secondary':'bg-warning text-dark'}`}>
                        {s.status==='active'?'재원':s.status==='withdrawn'?'퇴원':'휴원'}
                      </span>
                    </td>
                    <td className="text-center"><Link href={`/students/${s.id}`} className="btn btn-sm btn-outline-primary py-0 px-2"><i className="bi bi-pencil"></i></Link></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div></div>

        {totalPages > 1 && (
          <div className="card-footer">
            <div className="d-flex justify-content-center gap-1">
              <button className="btn btn-sm btn-outline-secondary" disabled={page===1} onClick={() => setPage(1)}><i className="bi bi-chevron-double-left"></i></button>
              <button className="btn btn-sm btn-outline-secondary" disabled={page===1} onClick={() => setPage(p=>p-1)}><i className="bi bi-chevron-left"></i></button>
              {Array.from({length: totalPages}, (_,i) => i+1).map(p => (
                <button key={p} className={`btn btn-sm ${p===page?'btn-primary':'btn-outline-secondary'}`} style={{minWidth:32}} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="btn btn-sm btn-outline-secondary" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}><i className="bi bi-chevron-right"></i></button>
              <button className="btn btn-sm btn-outline-secondary" disabled={page===totalPages} onClick={() => setPage(totalPages)}><i className="bi bi-chevron-double-right"></i></button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
