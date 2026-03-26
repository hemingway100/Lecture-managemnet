'use client';
import { useState, useEffect, useRef } from 'react';

interface StudentAtt {
  studentId: number; name: string; school: string | null; grade: string | null;
  phone: string | null; parentPhone: string | null;
  attendance: { id: number; status: string; reason: string | null; messageSent: boolean } | null;
}
interface Entry { status: string; reason: string; saved: boolean; changed: boolean }

const STATUS_LABEL: Record<string, { text: string; color: string; bg: string }> = {
  present: { text: '출석', color: '#16a34a', bg: '#dcfce7' },
  late: { text: '지각', color: '#d97706', bg: '#fef3c7' },
  absent: { text: '결석', color: '#dc2626', bg: '#fee2e2' },
};

export default function AttendancePage() {
  const [courses, setCourses] = useState<Array<{ id: number; name: string; _count: { studentCourses: number } }>>([]);
  const [courseId, setCourseId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<StudentAtt[]>([]);
  const [entries, setEntries] = useState<Record<number, Entry>>({});
  const [saving, setSaving] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendTargets, setSendTargets] = useState<number[]>([]);
  const [sendMode, setSendMode] = useState<'all' | 'select'>('all');
  const [sendingMsg, setSendingMsg] = useState(false);
  const originalEntries = useRef<Record<number, { status: string; reason: string }>>({});

  useEffect(() => { fetch('/api/courses').then(r => r.json()).then(setCourses); }, []);

  useEffect(() => {
    if (!courseId) return;
    fetch(`/api/attendance?courseId=${courseId}&date=${date}`).then(r => r.json()).then((data: StudentAtt[]) => {
      setStudents(data);
      const e: Record<number, Entry> = {};
      const orig: Record<number, { status: string; reason: string }> = {};
      data.forEach(s => {
        const st = s.attendance?.status || '';
        const re = s.attendance?.reason || '';
        e[s.studentId] = { status: st, reason: re, saved: !!s.attendance, changed: false };
        orig[s.studentId] = { status: st, reason: re };
      });
      setEntries(e);
      originalEntries.current = orig;
    });
  }, [courseId, date]);

  function updateEntry(sid: number, field: 'status' | 'reason', value: string) {
    setEntries(prev => {
      const entry = { ...prev[sid], [field]: value };
      const orig = originalEntries.current[sid];
      entry.changed = entry.status !== orig?.status || entry.reason !== orig?.reason;
      return { ...prev, [sid]: entry };
    });
  }

  const hasChanges = Object.values(entries).some(e => e.changed);
  const allMarked = Object.values(entries).every(e => e.status !== '');

  async function handleSave() {
    setSaving(true);
    const toSave = Object.entries(entries)
      .filter(([, e]) => e.status)
      .map(([sid, e]) => ({ studentId: parseInt(sid), status: e.status, reason: e.reason }));

    await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: parseInt(courseId), date, entries: toSave }),
    });

    // 저장 후 상태 갱신
    setEntries(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        const id = parseInt(k);
        next[id] = { ...next[id], saved: true, changed: false };
        originalEntries.current[id] = { status: next[id].status, reason: next[id].reason };
      });
      return next;
    });
    setSaving(false);
  }

  function setAllStatus(status: string) {
    setEntries(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        const id = parseInt(k);
        const orig = originalEntries.current[id];
        next[id] = { ...next[id], status, changed: status !== orig?.status || next[id].reason !== orig?.reason };
      });
      return next;
    });
  }

  function openSendModal() {
    // 기본: 지각/결석만 선택
    const targets = students
      .filter(s => {
        const e = entries[s.studentId];
        return e && (e.status === 'late' || e.status === 'absent');
      })
      .map(s => s.studentId);
    setSendTargets(targets);
    setSendMode('select');
    setShowSendModal(true);
  }

  function toggleSendTarget(sid: number) {
    setSendTargets(prev => prev.includes(sid) ? prev.filter(s => s !== sid) : [...prev, sid]);
  }

  function selectAllSendTargets() {
    setSendTargets(students.filter(s => entries[s.studentId]?.status).map(s => s.studentId));
    setSendMode('all');
  }

  function selectLateAbsentOnly() {
    setSendTargets(students.filter(s => {
      const e = entries[s.studentId];
      return e && (e.status === 'late' || e.status === 'absent');
    }).map(s => s.studentId));
    setSendMode('select');
  }

  async function handleSendMessages() {
    if (sendTargets.length === 0) return;
    setSendingMsg(true);
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sendMessages', courseId: parseInt(courseId), date, studentIds: sendTargets }),
    });
    const data = await res.json();
    setSendingMsg(false);
    setShowSendModal(false);
    alert(`${data.sentCount}명에게 발송되었습니다.`);
    // 발송 상태 새로고침
    setCourseId(c => { const v = c; setCourseId(''); setTimeout(() => setCourseId(v), 50); return c; });
  }

  const stats = {
    total: Object.values(entries).filter(e => e.status).length,
    present: Object.values(entries).filter(e => e.status === 'present').length,
    late: Object.values(entries).filter(e => e.status === 'late').length,
    absent: Object.values(entries).filter(e => e.status === 'absent').length,
    unmarked: Object.values(entries).filter(e => !e.status).length,
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>출결 관리</h5>
          <p className="text-muted small mb-0">강의별 학생 출결을 체크하고 알림을 발송합니다</p>
        </div>
      </div>

      {/* 강의/날짜 선택 */}
      <div className="card mb-4">
        <div className="card-body py-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">날짜</label>
              <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="col-md-5">
              <label className="form-label">강의</label>
              <select className="form-select" value={courseId} onChange={e => setCourseId(e.target.value)}>
                <option value="">강의를 선택하세요</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c._count.studentCourses}명)</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {courseId && students.length > 0 && (
        <>
          {/* 통계 바 */}
          <div className="d-flex gap-3 mb-3 align-items-center flex-wrap">
            <div className="d-flex gap-2" style={{ fontSize: '0.82rem' }}>
              <span className="d-flex align-items-center gap-1">
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}></span>
                출석 <strong>{stats.present}</strong>
              </span>
              <span className="d-flex align-items-center gap-1">
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#d97706', display: 'inline-block' }}></span>
                지각 <strong>{stats.late}</strong>
              </span>
              <span className="d-flex align-items-center gap-1">
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }}></span>
                결석 <strong>{stats.absent}</strong>
              </span>
              {stats.unmarked > 0 && <span className="text-muted">미체크 {stats.unmarked}</span>}
            </div>
            <div className="ms-auto d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setAllStatus('present')}>전체 출석</button>
            </div>
          </div>

          {/* 출결 테이블 */}
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table align-middle mb-0" style={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: 40 }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: 50 }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>학생</th>
                      <th>학교</th>
                      <th className="text-center">학년</th>
                      <th className="text-center">출결</th>
                      <th>사유</th>
                      <th className="text-center">알림</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => {
                      const e = entries[s.studentId];
                      if (!e) return null;
                      return (
                        <tr key={s.studentId} style={{ background: e.changed ? '#fffbeb' : undefined }}>
                          <td className="text-muted">{i + 1}</td>
                          <td>
                            <span className="fw-semibold">{s.name}</span>
                            {e.changed && <i className="bi bi-circle-fill text-warning ms-1" style={{ fontSize: '0.35rem', verticalAlign: 'middle' }}></i>}
                          </td>
                          <td className="text-muted" style={{ fontSize: '0.82rem' }}>{s.school || '-'}</td>
                          <td className="text-center">
                            <span className="badge bg-light text-dark border" style={{ fontSize: '0.72rem' }}>{s.grade || '-'}</span>
                          </td>
                          <td className="text-center">
                            <div className="btn-group btn-group-sm" role="group">
                              {(['present', 'late', 'absent'] as const).map(st => {
                                const info = STATUS_LABEL[st];
                                const isActive = e.status === st;
                                return (
                                  <button key={st} type="button"
                                    className="btn"
                                    style={{
                                      padding: '4px 12px', fontSize: '0.78rem', fontWeight: isActive ? 700 : 500,
                                      background: isActive ? info.bg : '#fff',
                                      color: isActive ? info.color : '#a1a1aa',
                                      border: `1.5px solid ${isActive ? info.color : '#e4e4e7'}`,
                                      transition: 'all 0.12s',
                                    }}
                                    onClick={() => updateEntry(s.studentId, 'status', isActive ? '' : st)}
                                  >
                                    {info.text}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td>
                            {(e.status === 'late' || e.status === 'absent') ? (
                              <input type="text" className="form-control form-control-sm"
                                style={{ maxWidth: 140 }}
                                placeholder="사유" value={e.reason}
                                onChange={ev => updateEntry(s.studentId, 'reason', ev.target.value)} />
                            ) : <span className="text-muted" style={{ fontSize: '0.78rem' }}>-</span>}
                          </td>
                          <td className="text-center">
                            {s.attendance?.messageSent
                              ? <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '0.85rem' }}></i>
                              : <span className="text-muted">-</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card-footer d-flex justify-content-between align-items-center">
              <div className="d-flex gap-2">
                {hasChanges && <span className="text-warning" style={{ fontSize: '0.78rem' }}><i className="bi bi-exclamation-circle me-1"></i>저장하지 않은 변경사항이 있습니다</span>}
              </div>
              <div className="d-flex gap-2">
                {allMarked && !hasChanges && (
                  <button className="btn btn-outline-success" onClick={openSendModal}>
                    <i className="bi bi-send me-1"></i>출결 알림 발송
                  </button>
                )}
                <button className="btn btn-primary" onClick={handleSave} disabled={saving || !hasChanges}>
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 발송 모달 */}
      {showSendModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title fw-bold"><i className="bi bi-send me-2"></i>출결 알림 발송</h6>
                <button className="btn-close" onClick={() => setShowSendModal(false)}></button>
              </div>
              <div className="modal-body">
                {/* 발송 대상 선택 */}
                <div className="d-flex gap-2 mb-3">
                  <button className={`btn btn-sm ${sendMode === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={selectAllSendTargets}>전체 발송</button>
                  <button className={`btn btn-sm ${sendMode === 'select' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={selectLateAbsentOnly}>지각/결석만</button>
                </div>

                {/* 메시지 미리보기 */}
                <div className="p-3 rounded mb-3" style={{ background: '#fffbeb', fontSize: '0.82rem', border: '1px solid #fde68a' }}>
                  <div className="fw-semibold mb-1"><i className="bi bi-chat-left-text me-1"></i>발송 메시지 예시</div>
                  <div>[수강생 관리] {'{{학생명}}'} 학생이 {'{{강의명}}'} 수업에 {'{{출석/지각/결석}}'}하였습니다.</div>
                </div>

                {/* 학생 목록 */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ fontSize: '0.82rem' }}>발송 대상 <strong>{sendTargets.length}</strong>명</span>
                </div>
                <div className="border rounded" style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {students.filter(s => entries[s.studentId]?.status).map(s => {
                    const e = entries[s.studentId];
                    const st = STATUS_LABEL[e.status];
                    const phone = s.parentPhone || s.phone;
                    const isSelected = sendTargets.includes(s.studentId);
                    const alreadySent = s.attendance?.messageSent;

                    return (
                      <label key={s.studentId}
                        className={`d-flex align-items-center gap-3 px-3 py-2 cursor-pointer ${alreadySent ? 'opacity-50' : ''}`}
                        style={{
                          borderBottom: '1px solid var(--border-light)',
                          background: isSelected && !alreadySent ? 'var(--brand-bg)' : undefined,
                        }}>
                        <input type="checkbox" className="form-check-input m-0"
                          checked={isSelected} disabled={!!alreadySent}
                          onChange={() => toggleSendTarget(s.studentId)} />
                        <div className="flex-grow-1">
                          <span className="fw-semibold" style={{ fontSize: '0.84rem' }}>{s.name}</span>
                          <span className="badge ms-2" style={{ background: st?.bg, color: st?.color, fontSize: '0.68rem' }}>
                            {st?.text}
                          </span>
                          {e.reason && <span className="text-muted ms-1" style={{ fontSize: '0.72rem' }}>({e.reason})</span>}
                        </div>
                        <div className="text-end" style={{ minWidth: 120 }}>
                          <div style={{ fontSize: '0.75rem' }}>{phone || '번호없음'}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {s.parentPhone ? '부모님' : '학생'}
                          </div>
                        </div>
                        <div style={{ width: 20 }}>
                          {alreadySent && <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '0.8rem' }}></i>}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowSendModal(false)}>취소</button>
                <button className="btn btn-primary" onClick={handleSendMessages}
                  disabled={sendingMsg || sendTargets.length === 0}>
                  <i className="bi bi-send me-1"></i>
                  {sendingMsg ? '발송 중...' : `${sendTargets.length}명에게 발송`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
