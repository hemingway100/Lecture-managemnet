'use client';
import { useState, useEffect, useCallback } from 'react';

interface Student { id: number; name: string; grade: string | null; phone: string | null; parentPhone: string | null }
interface ClinicItem {
  id: number; title: string; scheduledDate: string; scheduledTime: string;
  status: string; content: string | null; memo: string | null;
  reminderSent: boolean;
  student: { id: number; name: string; grade: string | null; phone: string | null; parentPhone: string | null };
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

  // 수정 모달
  const [showEditModal, setShowEditModal] = useState(false);
  const [editClinic, setEditClinic] = useState<ClinicItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editStatus, setEditStatus] = useState('');

  function openEditModal(c: ClinicItem) {
    setEditClinic(c);
    setEditTitle(c.title || '');
    setEditTime(c.scheduledTime);
    setEditContent(c.content || '');
    setEditStatus(c.status);
    setShowEditModal(true);
  }

  async function handleEdit() {
    if (!editClinic) return;
    await fetch('/api/clinics', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id: editClinic.id, title: editTitle, scheduledTime: editTime, content: editContent, status: editStatus }),
    });
    setShowEditModal(false);
    loadClinics();
  }

  // 문자 발송
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendClinicIds, setSendClinicIds] = useState<number[]>([]);
  const [sendingMsg, setSendingMsg] = useState(false);

  function openSendSingle(c: ClinicItem) {
    setSendClinicIds([c.id]);
    setShowSendModal(true);
  }

  function openSendAll() {
    setSendClinicIds(filteredSelectedClinics.filter(c => !c.reminderSent).map(c => c.id));
    setShowSendModal(true);
  }

  function toggleSendClinic(id: number) {
    setSendClinicIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  async function handleSendMessages() {
    setSendingMsg(true);
    await fetch('/api/clinics', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sendNotifications', clinicIds: sendClinicIds }),
    });
    setSendingMsg(false);
    setShowSendModal(false);
    alert(`${sendClinicIds.length}건 발송되었습니다.`);
    loadClinics();
  }

  function toggleStudent(sid: number) {
    setFormStudents(prev => prev.includes(sid) ? prev.filter(s => s !== sid) : [...prev, sid]);
  }

  // 학생 필터 + 상세 펼치기
  const [studentFilter, setStudentFilter] = useState('');
  const [expandedStudent, setExpandedStudent] = useState<number | null>(null);
  const [searchStudent, setSearchStudent] = useState('');

  const selectedClinics = selectedDate ? (clinicsByDate[selectedDate] || []) : [];

  // 이번달 통계
  const allClinics = Object.values(clinicsByDate).flat();
  const totalCount = allClinics.length;
  const completedCount = allClinics.filter(c => c.status === 'completed').length;
  const scheduledCount = allClinics.filter(c => c.status === 'scheduled').length;

  // 학생별 누적 클리닉 통계
  const studentClinicStats = (() => {
    const map = new Map<number, { name: string; grade: string | null; total: number; completed: number; late: number; absent: number; scheduled: number; clinics: ClinicItem[] }>();
    for (const c of allClinics) {
      const s = map.get(c.student.id) || { name: c.student.name, grade: c.student.grade, total: 0, completed: 0, late: 0, absent: 0, scheduled: 0, clinics: [] };
      s.total++;
      if (c.status === 'completed') s.completed++;
      else if (c.status === 'late') s.late++;
      else if (c.status === 'absent') s.absent++;
      else if (c.status === 'scheduled') s.scheduled++;
      s.clinics.push(c);
      map.set(c.student.id, s);
    }
    return Array.from(map.entries())
      .map(([id, stat]) => ({ studentId: id, ...stat }))
      .filter(s => !searchStudent || s.name.includes(searchStudent) || (s.grade && s.grade.includes(searchStudent)))
      .sort((a, b) => b.total - a.total);
  })();

  // 학생 필터 적용된 캘린더 데이터
  const filteredClinicsByDate = (() => {
    if (!studentFilter) return clinicsByDate;
    const filtered: Record<string, ClinicItem[]> = {};
    for (const [date, clinics] of Object.entries(clinicsByDate)) {
      const f = clinics.filter(c => c.student.id === parseInt(studentFilter));
      if (f.length > 0) filtered[date] = f;
    }
    return filtered;
  })();

  const filteredSelectedClinics = studentFilter
    ? selectedClinics.filter(c => c.student.id === parseInt(studentFilter))
    : selectedClinics;

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

      {/* 학생 필터 */}
      <div className="card mb-4">
        <div className="card-body py-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">학생 이름 / 학년 검색</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input type="text" className="form-control" placeholder="이름 또는 학년 입력"
                  value={searchStudent} onChange={e => {
                    setSearchStudent(e.target.value);
                    // 검색어에 정확히 매칭되는 학생이 1명이면 자동 필터
                    const match = students.filter(s => s.name.includes(e.target.value) || (s.grade && s.grade.includes(e.target.value)));
                    if (match.length === 1) setStudentFilter(String(match[0].id));
                    else if (!e.target.value) setStudentFilter('');
                  }} />
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label">학생 선택</label>
              <select className="form-select form-select-sm" value={studentFilter} onChange={e => setStudentFilter(e.target.value)}>
                <option value="">전체 학생</option>
                {students
                  .filter(s => !searchStudent || s.name.includes(searchStudent) || (s.grade && s.grade.includes(searchStudent)))
                  .map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade || '-'})</option>)}
              </select>
            </div>
            {(studentFilter || searchStudent) && (
              <div className="col-md-2">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => { setStudentFilter(''); setSearchStudent(''); }}>초기화</button>
              </div>
            )}
          </div>
        </div>
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
                        const dayClinics = filteredClinicsByDate[dateStr] || [];
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
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="fw-bold mb-0" style={{ fontSize: '0.88rem' }}>
                  {selectedDate || '날짜를 선택하세요'}
                </h6>
                {selectedDate && (
                  <div className="d-flex gap-1">
                    {filteredSelectedClinics.length > 0 && (
                      <button className="btn btn-sm btn-outline-success" onClick={openSendAll}>
                        <i className="bi bi-send me-1"></i>알림발송
                      </button>
                    )}
                    <button className="btn btn-sm btn-primary" onClick={() => openCreateModal(selectedDate!)}>
                      <i className="bi bi-plus-lg"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {!selectedDate ? (
              <div className="card-body text-center py-5">
                <i className="bi bi-calendar2-event text-muted" style={{ fontSize: '2rem', opacity: 0.4 }}></i>
                <p className="text-muted small mt-2">캘린더에서 날짜를 클릭하세요</p>
              </div>
            ) : filteredSelectedClinics.length === 0 ? (
              <div className="card-body text-center py-4">
                <p className="text-muted small mb-2">등록된 클리닉이 없습니다</p>
                <button className="btn btn-sm btn-outline-primary" onClick={() => openCreateModal(selectedDate!)}>
                  <i className="bi bi-plus-lg me-1"></i>클리닉 등록
                </button>
              </div>
            ) : (
              <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                {filteredSelectedClinics.map(c => {
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
                      {/* 상태 변경 버튼 (예정일 때만) */}
                      {c.status === 'scheduled' && (
                        <div className="d-flex gap-1 mb-2">
                          <button className="btn btn-sm btn-outline-success py-0 px-2" style={{ fontSize: '0.72rem' }}
                            onClick={() => updateStatus(c.id, 'completed')}>완료</button>
                          <button className="btn btn-sm btn-outline-warning py-0 px-2" style={{ fontSize: '0.72rem' }}
                            onClick={() => updateStatus(c.id, 'late')}>지각</button>
                          <button className="btn btn-sm btn-outline-danger py-0 px-2" style={{ fontSize: '0.72rem' }}
                            onClick={() => updateStatus(c.id, 'absent')}>결석</button>
                        </div>
                      )}
                      {/* 알림 + 수정 + 삭제 */}
                      <div className="d-flex gap-1 align-items-center">
                        {c.reminderSent ? (
                          <span className="btn btn-sm py-0 px-2" style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', cursor: 'default' }}>
                            <i className="bi bi-check-circle-fill me-1"></i>알림완료
                          </span>
                        ) : (
                          <button className="btn btn-sm py-0 px-2" style={{ fontSize: '0.72rem', background: '#fce7f3', color: '#db2777', border: '1px solid #fbcfe8' }}
                            onClick={() => openSendSingle(c)}>
                            <i className="bi bi-send me-1"></i>알림예정
                          </button>
                        )}
                        <div className="ms-auto d-flex gap-1" style={{ opacity: c.status === 'completed' ? 0.25 : 1, pointerEvents: c.status === 'completed' ? 'none' : 'auto' }}>
                          <button className="btn btn-sm py-0 px-2" style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe' }}
                            onClick={() => openEditModal(c)}>
                            <i className="bi bi-pencil me-1"></i>수정
                          </button>
                          <button className="btn btn-sm py-0 px-2" style={{ fontSize: '0.72rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                            onClick={() => deleteClinic(c.id)}>
                            <i className="bi bi-trash me-1"></i>삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 학생 필터 시 최근 클리닉 이력 */}
          {studentFilter && (() => {
            const sid = parseInt(studentFilter);
            const studentStat = studentClinicStats.find(s => s.studentId === sid);
            if (!studentStat) return null;
            const recentClinics = [...studentStat.clinics]
              .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate) || b.scheduledTime.localeCompare(a.scheduledTime))
              .slice(0, 4);
            const attendRate = (studentStat.completed + studentStat.late + studentStat.absent) > 0
              ? Math.round((studentStat.completed / (studentStat.completed + studentStat.late + studentStat.absent)) * 100) : 0;

            return (
              <div className="card mt-3">
                <div className="card-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold" style={{ fontSize: '0.85rem' }}>
                      <i className="bi bi-person me-1"></i>{studentStat.name} 최근 클리닉
                    </h6>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-success" style={{ fontSize: '0.62rem' }}>{studentStat.completed}</span>
                      <span className="badge bg-warning text-dark" style={{ fontSize: '0.62rem' }}>{studentStat.late}</span>
                      <span className="badge bg-danger" style={{ fontSize: '0.62rem' }}>{studentStat.absent}</span>
                      <span className="fw-bold" style={{ fontSize: '0.78rem', color: attendRate >= 80 ? '#16a34a' : attendRate >= 50 ? '#d97706' : '#dc2626' }}>{attendRate}%</span>
                    </div>
                  </div>
                </div>
                <div>
                  {recentClinics.map(c => {
                    const cst = STATUS_MAP[c.status] || STATUS_MAP.scheduled;
                    return (
                      <div key={c.id} className="px-3 py-2" style={{ borderBottom: '1px solid var(--border-light)', fontSize: '0.8rem' }}>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span className="fw-semibold">{c.title || '클리닉'}</span>
                            <span className="text-muted ms-2" style={{ fontSize: '0.72rem' }}>
                              {c.scheduledDate.slice(5)} {c.scheduledTime.slice(0, 5)}
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge" style={{ background: cst.bg, color: cst.color, fontSize: '0.65rem' }}>{cst.label}</span>
                            {c.reminderSent
                              ? <span className="badge" style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.6rem' }}>알림완료</span>
                              : <span className="badge" style={{ background: '#fce7f3', color: '#db2777', fontSize: '0.6rem' }}>알림예정</span>}
                          </div>
                        </div>
                        {c.content && <div className="text-muted" style={{ fontSize: '0.72rem' }}>{c.content}</div>}
                      </div>
                    );
                  })}
                  {studentStat.total > 4 && (
                    <div className="text-center py-2">
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>외 {studentStat.total - 4}건 · 하단에서 전체 확인</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
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

      {/* 학생별 누적 클리닉 현황 */}
      <div className="card mt-4">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold" style={{ fontSize: '0.88rem' }}><i className="bi bi-person-lines-fill me-1"></i>학생별 클리닉 현황</h6>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted" style={{ fontSize: '0.78rem' }}>{studentClinicStats.length}명</span>
              <div className="input-group input-group-sm" style={{ width: 200 }}>
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input type="text" className="form-control" placeholder="이름 또는 학년 검색"
                  value={searchStudent}
                  onChange={e => {
                    setSearchStudent(e.target.value);
                    // 검색 결과가 1명이면 자동 펼침
                    if (e.target.value) {
                      const matches = studentClinicStats.filter(s =>
                        s.name.includes(e.target.value) || (s.grade && s.grade.includes(e.target.value))
                      );
                      if (matches.length === 1) setExpandedStudent(matches[0].studentId);
                    } else {
                      setExpandedStudent(null);
                    }
                  }} />
                {searchStudent && (
                  <button className="btn btn-outline-secondary" type="button" onClick={() => { setSearchStudent(''); setExpandedStudent(null); }}>
                    <i className="bi bi-x-lg" style={{ fontSize: '0.7rem' }}></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          {studentClinicStats.length === 0 ? (
            <div className="text-center text-muted py-4">클리닉 이력이 없습니다</div>
          ) : studentClinicStats.map((s, i) => {
            const attendRate = (s.completed + s.late + s.absent) > 0 ? Math.round((s.completed / (s.completed + s.late + s.absent)) * 100) : 0;
            const isFiltered = studentFilter === String(s.studentId);
            const isExpanded = expandedStudent === s.studentId;
            const sortedClinics = [...s.clinics].sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate) || b.scheduledTime.localeCompare(a.scheduledTime));

            return (
              <div key={s.studentId}>
                {/* 학생 요약 행 */}
                <div className="d-flex align-items-center gap-3 px-3 py-3 cursor-pointer"
                  style={{
                    borderBottom: isExpanded ? 'none' : '1px solid var(--border-light)',
                    background: isFiltered ? 'var(--brand-bg)' : isExpanded ? '#fafafa' : undefined,
                  }}
                  onClick={() => setExpandedStudent(isExpanded ? null : s.studentId)}
                  onMouseEnter={e => { if (!isExpanded && !isFiltered) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={e => { if (!isExpanded && !isFiltered) e.currentTarget.style.background = ''; }}
                >
                  <div style={{ width: 28 }} className="text-center text-muted" >{i + 1}</div>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>{s.name}</span>
                      <span className="badge bg-light text-dark border" style={{ fontSize: '0.68rem' }}>{s.grade || '-'}</span>
                    </div>
                  </div>
                  <div className="d-flex gap-1 align-items-center">
                    <span className="badge bg-success" style={{ fontSize: '0.62rem' }}>완료 {s.completed}</span>
                    <span className="badge bg-warning text-dark" style={{ fontSize: '0.62rem' }}>지각 {s.late}</span>
                    <span className="badge bg-danger" style={{ fontSize: '0.62rem' }}>결석 {s.absent}</span>
                    {s.scheduled > 0 && <span className="badge bg-info" style={{ fontSize: '0.62rem' }}>예정 {s.scheduled}</span>}
                  </div>
                  <div style={{ width: 55, textAlign: 'right' }}>
                    <span className="fw-bold" style={{ fontSize: '0.82rem', color: attendRate >= 80 ? '#16a34a' : attendRate >= 50 ? '#d97706' : '#dc2626' }}>{attendRate}%</span>
                  </div>
                  <div className="d-flex gap-1">
                    <button className={`btn btn-sm py-0 px-1 ${isFiltered ? 'btn-primary' : 'btn-outline-secondary'}`}
                      style={{ fontSize: '0.68rem' }}
                      onClick={e => { e.stopPropagation(); setStudentFilter(isFiltered ? '' : String(s.studentId)); }}>
                      <i className={`bi ${isFiltered ? 'bi-funnel-fill' : 'bi-funnel'}`}></i>
                    </button>
                    <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'} text-muted`} style={{ fontSize: '0.75rem' }}></i>
                  </div>
                </div>

                {/* 상세 이력 (펼침) */}
                {isExpanded && (
                  <div style={{ background: '#fafafa', borderBottom: '1px solid var(--border-light)' }}>
                    <div className="px-3 py-2">
                      <div className="table-responsive">
                        <table className="table align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                          <thead><tr style={{ background: '#f5f5f5' }}>
                            <th style={{ width: 35 }}>#</th>
                            <th style={{ minWidth: 100 }}>클리닉명</th>
                            <th className="text-center" style={{ width: 105 }}>날짜</th>
                            <th className="text-center" style={{ width: 65 }}>시간</th>
                            <th className="text-center" style={{ width: 70 }}>상태</th>
                            <th style={{ minWidth: 100 }}>내용</th>
                            <th className="text-center" style={{ width: 85 }}>알림</th>
                            <th className="text-center" style={{ width: 45 }}>수정</th>
                          </tr></thead>
                          <tbody>
                            {sortedClinics.map((c, ci) => {
                              const cst = STATUS_MAP[c.status] || STATUS_MAP.scheduled;
                              return (
                                <tr key={c.id}>
                                  <td className="text-muted">{ci + 1}</td>
                                  <td className="fw-semibold">{c.title || '클리닉'}</td>
                                  <td className="text-center text-muted">{c.scheduledDate}</td>
                                  <td className="text-center text-muted">{c.scheduledTime.slice(0, 5)}</td>
                                  <td className="text-center">
                                    <span className="badge" style={{ background: cst.bg, color: cst.color, fontSize: '0.72rem' }}>{cst.label}</span>
                                  </td>
                                  <td className="text-muted">{c.content || '-'}</td>
                                  <td className="text-center text-nowrap">
                                    {c.reminderSent
                                      ? <span className="badge" style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.72rem' }}><i className="bi bi-check-circle-fill me-1"></i>알림완료</span>
                                      : <button className="btn btn-sm py-0 px-2 text-nowrap" style={{ fontSize: '0.72rem', background: '#fce7f3', color: '#db2777', border: '1px solid #fbcfe8' }}
                                          onClick={() => openSendSingle(c)}><i className="bi bi-send me-1"></i>알림예정</button>
                                    }
                                  </td>
                                  <td className="text-center">
                                    <button className="btn btn-sm btn-outline-secondary py-0 px-1" style={{ fontSize: '0.72rem' }}
                                      onClick={() => openEditModal(c)}><i className="bi bi-pencil"></i></button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 알림 발송 모달 */}
      {showSendModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title fw-bold"><i className="bi bi-send me-2"></i>클리닉 알림 발송</h6>
                <button className="btn-close" onClick={() => setShowSendModal(false)}></button>
              </div>
              <div className="modal-body">
                {/* 메시지 템플릿 */}
                <div className="p-3 rounded mb-3" style={{ background: '#fffbeb', fontSize: '0.82rem', border: '1px solid #fde68a' }}>
                  <div className="fw-semibold mb-1"><i className="bi bi-chat-left-text me-1"></i>발송 메시지 예시</div>
                  <div>[수강생 관리] {'{{학생명}}'} 학생 클리닉 안내</div>
                  <div>일정: {'{{날짜}}'} {'{{시간}}'}</div>
                  <div>내용: {'{{클리닉 제목}}'}</div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ fontSize: '0.82rem' }}>발송 대상 <strong>{sendClinicIds.length}</strong>건</span>
                  <button className="btn btn-sm btn-outline-secondary py-0 px-2" style={{ fontSize: '0.72rem' }}
                    onClick={() => setSendClinicIds(filteredSelectedClinics.filter(c => !c.reminderSent).map(c => c.id))}>전체 선택</button>
                </div>

                <div className="border rounded" style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {filteredSelectedClinics.map(c => {
                    const isSelected = sendClinicIds.includes(c.id);
                    const phone = c.student.parentPhone || c.student.phone;
                    const st = STATUS_MAP[c.status] || STATUS_MAP.scheduled;
                    return (
                      <label key={c.id} className={`d-flex align-items-center gap-3 px-3 py-2 ${c.reminderSent ? '' : 'cursor-pointer'}`}
                        style={{ borderBottom: '1px solid var(--border-light)', background: isSelected && !c.reminderSent ? 'var(--brand-bg)' : undefined, opacity: c.reminderSent ? 0.5 : 1 }}>
                        <input type="checkbox" className="form-check-input m-0"
                          checked={isSelected && !c.reminderSent} disabled={c.reminderSent}
                          onChange={() => toggleSendClinic(c.id)} />
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-semibold" style={{ fontSize: '0.84rem' }}>{c.student.name}</span>
                            <span className="badge" style={{ background: st.bg, color: st.color, fontSize: '0.65rem' }}>{st.label}</span>
                            {c.reminderSent && <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '0.7rem' }}></i>}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                            {c.scheduledTime.slice(0, 5)} · {c.title || '클리닉'}
                          </div>
                        </div>
                        <div className="text-end" style={{ minWidth: 100 }}>
                          <div style={{ fontSize: '0.75rem' }}>{phone || '번호없음'}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{c.student.parentPhone ? '부모님' : '학생'}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowSendModal(false)}>취소</button>
                <button className="btn btn-primary" onClick={handleSendMessages} disabled={sendingMsg || sendClinicIds.length === 0}>
                  <i className="bi bi-send me-1"></i>{sendingMsg ? '발송 중...' : `${sendClinicIds.length}건 발송`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {showEditModal && editClinic && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title fw-bold"><i className="bi bi-pencil-square me-2"></i>클리닉 수정</h6>
                <button className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3 p-2 rounded" style={{ background: 'var(--bg-body)', fontSize: '0.82rem' }}>
                  <span className="fw-semibold">{editClinic.student.name}</span>
                  <span className="text-muted ms-1">({editClinic.student.grade || '-'})</span>
                  <span className="text-muted ms-2">{editClinic.scheduledDate}</span>
                </div>
                <div className="mb-3">
                  <label className="form-label">클리닉명</label>
                  <input type="text" className="form-control" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label">시간</label>
                    <input type="time" className="form-control" value={editTime} onChange={e => setEditTime(e.target.value)} />
                  </div>
                  <div className="col-6">
                    <label className="form-label">상태</label>
                    <select className="form-select" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                      <option value="scheduled">예정</option>
                      <option value="completed">완료</option>
                      <option value="late">지각</option>
                      <option value="absent">결석</option>
                      <option value="cancelled">취소</option>
                    </select>
                  </div>
                </div>
                <div className="mb-0">
                  <label className="form-label">내용</label>
                  <textarea className="form-control" rows={2} value={editContent} onChange={e => setEditContent(e.target.value)}></textarea>
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <button className="btn btn-outline-danger" onClick={() => { setShowEditModal(false); deleteClinic(editClinic.id); }}>
                  <i className="bi bi-trash me-1"></i>삭제
                </button>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-secondary" onClick={() => setShowEditModal(false)}>취소</button>
                  <button className="btn btn-primary" onClick={handleEdit}>저장</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
