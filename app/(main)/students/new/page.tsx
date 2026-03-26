'use client';
import { demoCourses } from '@/lib/demo-data';
import CourseSelectTable from '@/components/CourseSelectTable';
import Link from 'next/link';

export default function NewStudentPage() {
  const grades = ['초1','초2','초3','초4','초5','초6','중1','중2','중3','고1','고2','고3'];
  const today = new Date().toISOString().slice(0, 10);
  const courses = demoCourses.map(c => ({ id: c.id, name: c.name, schedule: c.schedule, tuition: c.tuition }));

  return (
    <div className="row justify-content-center"><div className="col-lg-9">
      <div className="d-flex align-items-center mb-4">
        <Link href="/students" className="btn btn-sm btn-outline-secondary me-3"><i className="bi bi-arrow-left"></i></Link>
        <div><h4 className="mb-0 fw-bold">신규 학생 등록</h4><p className="text-muted small mb-0">새로운 학생 정보를 입력하세요</p></div>
      </div>
      <form onSubmit={e => { e.preventDefault(); alert('데모 모드입니다.'); }}>
        <div className="card mb-4"><div className="card-header border-bottom-0 pt-3 pb-0"><h6 className="fw-bold mb-0"><span className="badge bg-primary bg-opacity-10 text-primary me-2"><i className="bi bi-person"></i></span>기본 정보</h6></div>
          <div className="card-body pt-3"><div className="row g-3">
            <div className="col-md-4"><label className="form-label fw-semibold small">이름 *</label><input type="text" className="form-control" placeholder="학생 이름" /></div>
            <div className="col-md-4"><label className="form-label fw-semibold small">학교</label><input type="text" className="form-control" placeholder="학교명" /></div>
            <div className="col-md-4"><label className="form-label fw-semibold small">학년</label>
              <select className="form-select"><option value="">학년 선택</option>
                <optgroup label="초등학교">{grades.slice(0,6).map(g=><option key={g}>{g}</option>)}</optgroup>
                <optgroup label="중학교">{grades.slice(6,9).map(g=><option key={g}>{g}</option>)}</optgroup>
                <optgroup label="고등학교">{grades.slice(9).map(g=><option key={g}>{g}</option>)}</optgroup>
              </select></div>
          </div></div></div>
        <div className="card mb-4"><div className="card-header border-bottom-0 pt-3 pb-0"><h6 className="fw-bold mb-0"><span className="badge bg-success bg-opacity-10 text-success me-2"><i className="bi bi-telephone"></i></span>연락처</h6></div>
          <div className="card-body pt-3"><div className="row g-3">
            <div className="col-md-4"><label className="form-label fw-semibold small">학생 전화번호</label><input type="text" className="form-control" placeholder="010-0000-0000" /></div>
            <div className="col-md-4"><label className="form-label fw-semibold small">부모님 전화번호</label><input type="text" className="form-control" placeholder="010-0000-0000" /></div>
            <div className="col-md-4"><label className="form-label fw-semibold small">등록일</label><input type="date" className="form-control" defaultValue={today} /></div>
          </div></div></div>
        <div className="card mb-4"><div className="card-header border-bottom-0 pt-3 pb-0"><h6 className="fw-bold mb-0"><span className="badge bg-info bg-opacity-10 text-info me-2"><i className="bi bi-journal-text"></i></span>수강 강의</h6>
          <p className="text-muted small mt-1 mb-0">수강할 강의를 선택하고 원비를 설정하세요</p></div>
          <div className="card-body pt-3"><CourseSelectTable courses={courses} /></div></div>
        <div className="card mb-4"><div className="card-header border-bottom-0 pt-3 pb-0"><h6 className="fw-bold mb-0"><span className="badge bg-warning bg-opacity-10 text-warning me-2"><i className="bi bi-sticky"></i></span>메모</h6></div>
          <div className="card-body pt-3"><textarea className="form-control" rows={3} placeholder="특이사항이나 참고할 내용"></textarea></div></div>
        <div className="d-flex gap-2 justify-content-end mb-4">
          <Link href="/students" className="btn btn-outline-secondary px-4">취소</Link>
          <button type="submit" className="btn btn-primary px-4">학생 등록</button>
        </div>
      </form>
    </div></div>
  );
}
