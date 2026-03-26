'use client';
import { useState, useEffect, useCallback } from 'react';

interface Student { id: number; name: string; grade: string | null }
interface ClinicItem {
  id: number; title: string; scheduledDate: string; scheduledTime: string;
  status: string; content: string | null; memo: string | null;
  student: { id: number; name: string; grade: string | null };
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  scheduled: { label: '예정', color: '#3b82f6', bg: '#eff6ff' },
  completed: { label: '완료', color: '#16a34a', bg: '#dcfce7' },
  late:      { label: '지각', color: '#d97706', bg: '#fef3c7' },
  absent:    { label: '결석', color: '#dc2626', bg: '#fee2e2' },
  cancelled: { label: '취소', color: '#71717a', bg: '#f4f4f5' },
};

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function ClinicPage() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [clinicsByDate, setClinicsByDate] = useState<Record<string, ClinicItem[]>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  // 새 클리닉 폼
  const [formTitle, setFormTitle] = useState('');
  const [formTime, setFormTime] = useState('14:00');
  const [formStudents, setFormStudents] = useState<number[]>([]);
  const [formContent, setFormContent] = useState('');

  const monthStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}`;

  const loadClinics = useCallback(() => {
    fetch(`/api/clinics?month=${monthStr}`).then(r => r.json()).then(data => {
      setClinicsByDate(data.grouped || {});
    });
  }, [monthStr]);

  useEffect(() => { loadClinics(); }, [loadClinics]);
  useEffect(() => {
    fetch('/api/students?status=active').then(r => r.json()).then(data => setStudents(data || []));
  }, []);

  // 캘린더 데이터 계산
  const firstDay = new Date(currentMonth.year, currentMonth.month, 1);
  const lastDay = new Date(currentMonth.year, currentMonth.month + 1, 0);
  const startDayOfWeek = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const today = new Date().toISOString().slice(0, 10);

  const calendarWeeks: (number | null)[][] = [];
  let week: (number | null)[] = new Array(startDayOfWeek).fill(null);
  for (let d = 1; d <= totalDays; d++) {
    week.push(d);
    if (week.length === 7) { calendarWeeks.push(week); week = []; }
  }
  if (week.length > 0) { while (week.length < 7) week.push(null); calendarWeeks.push(week); }

  function getDateStr(day: number) {
    return `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function prevMonth() {
    setCurrentMonth(prev => {
      const d = new Date(prev.year, prev.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
    setSelectedDate(null);
  }

  function nextMonth() {
    setCurrentMonth(prev => {
      const d = new Date(prev.year, prev.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
    setSelectedDate(null);
  }

  function openCreateModal(date?: string) {
    setFormTitle('');
    setFormTime('14:00');
    setFormStudents([]);
    setFormContent('');
    if (date) setSelectedDate(date);
    setShowModal(true);
  }

  async function handleCreate() {
    if (!formTitle.trim() || formStudents.length === 0) {
      alert('제목과 학생을 입력해주세요.');
      return;
    }
    await fetch('/api/clinics', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        title: formTitle.trim(),
        scheduledDate: selectedDate,
        scheduledTime: formTime,
        studentIds: formStudents,
        content: formContent.trim(),
      }),
    });
    setShowModal(false);
    loadClinics();
  }

  async function updateStatus(id: number, status: string) {
    await fetch('/api/clinics', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateStatus', id, status }),
    });
    loadClinics();
  }

  async function deleteClinic(id: number) {
    if (!confirm('삭제하시겠습니까?')) return;
    await fetch('/api/clinics', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    loadClinics();
  }

  function toggleStudent(sid: number) {
    setFormStudents(prev => prev.includes(sid) ? prev.filter(s => s !== sid) : [...prev, sid]);
  }

  const selectedClinics = selectedDate ? (clinicsByDate[selectedDate] || []) : [];

  // 이번달 통계
  const allClinics = Object.values(clinicsByDate).flat();
  const totalCount = allClinics.length;
  const completedCount = allClinics.filter(c => c.status === 'completed').length;
  const scheduledCount = allClinics.filter(c => c.status === 'scheduled').length;

  return (
    <div>
      {/* 헤더 */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>클리닉</h5>
          <p className="text-muted small mb-0">보충 수업 일정을 캘린더에서 관리합니다</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setSelectedDate(today); openCreateModal(today); }}>
          <i className="bi bi-plus-lg me-1"></i>클리닉 등록
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="row g-3 mb-4">
        {[
          { label: '이번달 전체', value: totalCount, icon: 'bi-calendar2', color: 'primary' },
          { label: '예정', value: scheduledCount, icon: 'bi-clock', color: 'info' },
          { label: '완료', value: completedCount, icon: 'bi-check-circle', color: 'success' },
        ].map((s, i) => (
          <div className="col-md-4" key={i}>
            <div className="card stat-card">
              <div className="card-body d-flex align-items-center py-3">
                <div className={`stat-icon bg-${s.color} bg-opacity-10 text-${s.color} me-3`}><i className={`bi ${s.icon}`}></i></div>
                <div><div className="text-muted small">{s.label}</div><div className="fw-bold fs-5">{s.value}건</div></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* 캘린더 */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <button className="btn btn-sm btn-outline-secondary" onClick={prevMonth}><i className="bi bi-chevron-left"></i></button>
                <h6 className="fw-bold mb-0">{currentMonth.year}년 {currentMonth.month + 1}월</h6>
                <button className="btn btn-sm btn-outline-secondary" onClick={nextMonth}><i className="bi bi-chevron-right"></i></button>
              </div>
            </div>
            <div className="card-body p-0">
              <table className="table table-bordered mb-0" style={{ tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    {DAYS.map((d, i) => (
                      <th key={d} className="text-center py-2" style={{
                        fontSize: '0.75rem', fontWeight: 600,
                        color: i === 0 ? '#dc2626' : i === 6 ? '#3b82f6' : 'var(--text-muted)',
                      }}>{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calendarWeeks.map((week, wi) => (
                    <tr key={wi}>
                      {week.map((day, di) => {
                        if (day === null) return <td key={di} style={{ background: '#fafafa', height: 90 }}></td>;
                        const dateStr = getDateStr(day);
                        const dayClinics = clinicsByDate[dateStr] || [];
                        const isToday = dateStr === today;
                        const isSelected = dateStr === selectedDate;

                        return (
                          <td key={di}
                            className="cursor-pointer"
                            style={{
                              height: 90, padding: '4px 6px', verticalAlign: 'top',
                              background: isSelected ? 'var(--brand-bg)' : isToday ? '#fefce8' : undefined,
                              border: isSelected ? '2px solid var(--brand)' : undefined,
                              transition: 'all 0.1s',
                            }}
                            onClick={() => setSelectedDate(dateStr)}
                          >
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span style={{
                                fontSize: '0.78rem', fontWeight: isToday ? 700 : 500,
                                color: di === 0 ? '#dc2626' : di === 6 ? '#3b82f6' : 'var(--text-primary)',
                                ...(isToday ? {
                                  background: 'var(--brand)', color: '#fff', borderRadius: '50%',
                                  width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '0.72rem',
                                } : {}),
                              }}>{day}</span>
                              {dayClinics.length > 0 && (
                                <span className="badge bg-primary" style={{ fontSize: '0.6rem', padding: '2px 5px' }}>{dayClinics.length}</span>
                              )}
                            </div>
                            {/* 클리닉 미리보기 (최대 2개) */}
                            {dayClinics.slice(0, 2).map(c => {
                              const st = STATUS_MAP[c.status] || STATUS_MAP.scheduled;
                              return (
                                <div key={c.id} className="text-truncate mb-1" style={{
                                  fontSize: '0.65rem', padding: '1px 4px', borderRadius: 3,
                                  background: st.bg, color: st.color, lineHeight: 1.4,
                                }}>
                                  {c.scheduledTime.slice(0, 5)} {c.title || c.student.name}
                                </div>
                              );
                            })}
                            {dayClinics.length > 2 && (
                              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>+{dayClinics.length - 2}개 더</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 오른쪽: 선택된 날짜 상세 */}
        <div className="col-lg-4">
          <div className="card" style={{ position: 'sticky', top: 80 }}>
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="fw-bold mb-0" style={{ fontSize: '0.88rem' }}>
                  {selectedDate || '날짜를 선택하세요'}
                </h6>
                {selectedDate && (
                  <button className="btn btn-sm btn-primary" onClick={() => openCreateModal(selectedDate!)}>
                    <i className="bi bi-plus-lg"></i>
                  </button>
                )}
              </div>
            </div>

            {!selectedDate ? (
              <div className="card-body text-center py-5">
                <i className="bi bi-calendar2-event text-muted" style={{ fontSize: '2rem', opacity: 0.4 }}></i>
                <p className="text-muted small mt-2">캘린더에서 날짜를 클릭하세요</p>
              </div>
            ) : selectedClinics.length === 0 ? (
              <div className="card-body text-center py-4">
                <p className="text-muted small mb-2">등록된 클리닉이 없습니다</p>
                <button className="btn btn-sm btn-outline-primary" onClick={() => openCreateModal(selectedDate!)}>
                  <i className="bi bi-plus-lg me-1"></i>클리닉 등록
                </button>
              </div>
            ) : (
              <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                {selectedClinics.map(c => {
                  const st = STATUS_MAP[c.status] || STATUS_MAP.scheduled;
                  return (
                    <div key={c.id} className="px-3 py-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>{c.title || '클리닉'}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-clock me-1"></i>{c.scheduledTime.slice(0, 5)}
                            <span className="mx-1">·</span>
                            <i className="bi bi-person me-1"></i>{c.student.name}
                            {c.student.grade && <span className="ms-1">({c.student.grade})</span>}
                          </div>
                        </div>
                        <span className="badge" style={{ background: st.bg, color: st.color, fontSize: '0.7rem' }}>{st.label}</span>
                      </div>
                      {c.content && <p className="text-muted small mb-2" style={{ fontSize: '0.78rem' }}>{c.content}</p>}
                      {c.status === 'scheduled' && (
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-outline-success py-0 px-2" style={{ fontSize: '0.72rem' }}
                            onClick={() => updateStatus(c.id, 'completed')}>완료</button>
                          <button className="btn btn-sm btn-outline-warning py-0 px-2" style={{ fontSize: '0.72rem' }}
                            onClick={() => updateStatus(c.id, 'late')}>지각</button>
                          <button className="btn btn-sm btn-outline-danger py-0 px-2" style={{ fontSize: '0.72rem' }}
                            onClick={() => updateStatus(c.id, 'absent')}>결석</button>
                          <button className="btn btn-sm btn-outline-secondary py-0 px-2 ms-auto" style={{ fontSize: '0.72rem' }}
                            onClick={() => deleteClinic(c.id)}>삭제</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 등록 모달 */}
      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.4)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h6 className="modal-title fw-bold"><i className="bi bi-calendar-plus me-2"></i>클리닉 등록</h6>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">클리닉 제목</label>
                    <input type="text" className="form-control" placeholder="예: 문법 보충, 단어 재시험"
                      value={formTitle} onChange={e => setFormTitle(e.target.value)} autoFocus />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label">날짜</label>
                      <input type="date" className="form-control" value={selectedDate || ''} onChange={e => setSelectedDate(e.target.value)} />
                    </div>
                    <div className="col-6">
                      <label className="form-label">시간</label>
                      <input type="time" className="form-control" value={formTime} onChange={e => setFormTime(e.target.value)} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">참가 학생 <span className="text-muted small">({formStudents.length}명 선택)</span></label>
                    <div className="border rounded p-2" style={{ maxHeight: 180, overflowY: 'auto' }}>
                      {students.map(s => (
                        <label key={s.id} className="d-flex align-items-center gap-2 px-2 py-1 rounded cursor-pointer"
                          style={{ background: formStudents.includes(s.id) ? 'var(--brand-bg)' : undefined, transition: 'all 0.1s' }}>
                          <input type="checkbox" className="form-check-input m-0"
                            checked={formStudents.includes(s.id)} onChange={() => toggleStudent(s.id)} />
                          <span style={{ fontSize: '0.84rem' }}>{s.name}</span>
                          {s.grade && <span className="text-muted" style={{ fontSize: '0.72rem' }}>({s.grade})</span>}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="mb-0">
                    <label className="form-label">클리닉 내용</label>
                    <textarea className="form-control" rows={3} placeholder="클리닉 내용을 입력하세요"
                      value={formContent} onChange={e => setFormContent(e.target.value)}></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>취소</button>
                  <button className="btn btn-primary" onClick={handleCreate}>
                    <i className="bi bi-check-lg me-1"></i>등록
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
