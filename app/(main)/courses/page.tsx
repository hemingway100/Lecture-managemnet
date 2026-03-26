'use client';
import { demoCourses } from '@/lib/demo-data';
import { useState } from 'react';

export default function CoursesPage() {
  const [status, setStatus] = useState('active');
  const filtered = status ? demoCourses.filter(c => c.status === status) : demoCourses;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-1">
          {['active','inactive',''].map(s => (
            <button key={s} className={`btn btn-sm ${status===s?'btn-primary':'btn-outline-secondary'}`}
              onClick={() => setStatus(s)}>{s==='active'?'활성':s==='inactive'?'비활성':'전체'}</button>
          ))}
        </div>
        <button className="btn btn-sm btn-primary"><i className="bi bi-plus-lg me-1"></i>강의 등록</button>
      </div>
      <div className="row g-3">
        {filtered.map(c => (
          <div className="col-md-6 col-lg-4" key={c.id}>
            <div className="card stat-card h-100"><div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="fw-bold mb-0">{c.name}</h6>
                <span className="badge bg-success">활성</span>
              </div>
              <div className="text-muted small mb-3">
                <div><i className="bi bi-person me-1"></i>강사: {c.teacher.name}</div>
                <div><i className="bi bi-clock me-1"></i>{c.schedule}</div>
                <div><i className="bi bi-cash me-1"></i>{c.tuition.toLocaleString()}원/월</div>
                <div><i className="bi bi-people me-1"></i>수강생: {c._count.studentCourses}명</div>
              </div>
            </div></div>
          </div>
        ))}
      </div>
    </>
  );
}
