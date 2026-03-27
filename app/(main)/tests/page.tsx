'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Course { id: number; name: string; _count: { studentCourses: number } }
interface TestGroup { testName: string; date: string; total: number; pass: number; fail: number; retest: number; pending: number }
interface TestResult {
  id: number; testName: string; score: number; totalScore: number; result: string | null;
  student: { id: number; name: string; school: string | null; grade: string | null };
}

const RESULT_OPTIONS = [
  { value: '', label: '선택' },
  { value: 'pass', label: 'PASS' },
  { value: 'fail', label: 'FAIL' },
  { value: 'retest', label: '재시험' },
  { value: 'late_absent', label: '미응시' },
];
const RESULT_STYLE: Record<string, { bg: string; text: string }> = {
  pass: { bg: '#dcfce7', text: '#16a34a' },
  fail: { bg: '#fee2e2', text: '#dc2626' },
  retest: { bg: '#fef3c7', text: '#d97706' },
  late_absent: { bg: '#f4f4f5', text: '#71717a' },
};

export default function TestsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [testGroups, setTestGroups] = useState<TestGroup[]>([]);
  const [selectedTest, setSelectedTest] = useState<{ testName: string; date: string } | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendTargets, setSendTargets] = useState<number[]>([]);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [tab, setTab] = useState<'daily' | 'students'>('daily');

  useEffect(() => { fetch('/api/courses').then(r => r.json()).then(setCourses); }, []);

  const loadTests = useCallback((cid: number) => {
    if (!cid) { setTestGroups([]); return; }
    fetch(`/api/tests?courseId=${cid}&action=list`).then(r => r.json()).then(setTestGroups);
  }, []);

  useEffect(() => { loadTests(courseId); setSelectedTest(null); setResults([]); }, [courseId, loadTests]);

  // 선택된 날짜의 테스트만 필터
  const dailyTests = testGroups.filter(t => t.date === selectedDate);
  // 날짜 목록 (중복 제거)
  const availableDates = [...new Set(testGroups.map(t => t.date))].sort().reverse();

  function selectTest(testName: string, date: string) {
    setSelectedTest({ testName, date });
    fetch(`/api/tests?courseId=${courseId}&action=results&testName=${encodeURIComponent(testName)}&date=${date}`)
      .then(r => r.json()).then(setResults);
  }

  async function createTest() {
    if (!newTestName.trim()) return;
    await fetch('/api/tests', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', courseId, testName: newTestName.trim(), date: selectedDate }),
    });
    setNewTestName(''); setShowCreate(false);
    loadTests(courseId);
  }

  async function deleteTest(testName: string, date: string) {
    if (!confirm(`"${testName}" 삭제?`)) return;
    await fetch('/api/tests', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', courseId, testName, date }),
    });
    if (selectedTest?.testName === testName) { setSelectedTest(null); setResults([]); }
    loadTests(courseId);
  }

  function updateLocal(id: number, field: string, value: string | number) {
    setResults(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }

  async function saveAll() {
    setSaving(true);
    await fetch('/api/tests', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'saveResults', results: results.map(r => ({ id: r.id, result: r.result || '', score: r.score, totalScore: r.totalScore })) }),
    });
    setSaving(false);
    loadTests(courseId);
    if (selectedTest) selectTest(selectedTest.testName, selectedTest.date);
  }

  // 문자 발송
  function openSendModal() {
    setSendTargets(results.filter(r => r.result).map(r => r.id));
    setShowSendModal(true);
  }

  function toggleSendTarget(id: number) {
    setSendTargets(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  async function sendMessages() {
    setSendingMsg(true);
    await fetch('/api/tests', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sendResults',
        testName: selectedTest?.testName,
        date: selectedTest?.date,
        courseId,
        resultIds: sendTargets,
      }),
    });
    setSendingMsg(false);
    setShowSendModal(false);
    alert(`${sendTargets.length}명에게 발송되었습니다.`);
  }

  // 학생별 수행률 데이터
  const studentStats = (() => {
    const map = new Map<number, { name: string; school: string | null; grade: string | null; total: number; pass: number; tests: { testName: string; date: string; score: number; totalScore: number; result: string | null }[] }>();
    for (const t of testGroups) {
      // testGroups에는 개별 학생 데이터가 없으므로 results에서 가져와야 하지만,
      // 전체 데이터를 한번에 보여주기 위해 별도 API 호출이 필요
    }
    return map;
  })();

  const selectedCourse = courses.find(c => c.id === courseId);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>테스트 / 성적</h5>
          <p className="text-muted small mb-0">날짜별 테스트를 기록하고 결과를 발송합니다</p>
        </div>
      </div>

      {/* 강의 + 날짜 선택 */}
      <div className="card mb-4">
        <div className="card-body py-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">강의</label>
              <select className="form-select" value={courseId} onChange={e => setCourseId(parseInt(e.target.value))}>
                <option value={0}>강의를 선택하세요</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c._count.studentCourses}명)</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">날짜</label>
              <input type="date" className="form-control" value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setSelectedTest(null); setResults([]); }} />
            </div>
            {courseId > 0 && (
              <div className="col-md-5 text-end d-flex gap-2 justify-content-end">
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                  <i className="bi bi-plus-lg me-1"></i>테스트 추가
                </button>
                <Link href={`/tests/students?courseId=${courseId}`} className="btn btn-outline-primary">
                  <i className="bi bi-people me-1"></i>학생별 수행률
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 탭: 날짜별 / 전체 이력 */}
      {courseId > 0 && (
        <div className="d-flex gap-1 mb-3">
          <button className={`btn btn-sm ${tab === 'daily' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setTab('daily')}>
            <i className="bi bi-calendar-day me-1"></i>{selectedDate} 테스트
          </button>
          <button className={`btn btn-sm ${tab === 'students' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setTab('students')}>
            <i className="bi bi-clock-history me-1"></i>전체 이력
          </button>
        </div>
      )}

      {/* 새 테스트 생성 */}
      {showCreate && (
        <div className="card mb-4" style={{ borderLeft: '3px solid var(--brand)' }}>
          <div className="card-body py-3">
            <div className="row g-3 align-items-end">
              <div className="col-md-6">
                <label className="form-label">테스트명</label>
                <input type="text" className="form-control" placeholder="예: Unit 3 단어시험, Daily 어휘 테스트" autoFocus
                  value={newTestName} onChange={e => setNewTestName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createTest()} />
              </div>
              <div className="col-md-3">
                <label className="form-label">날짜</label>
                <input type="date" className="form-control" value={selectedDate} disabled />
              </div>
              <div className="col-md-3 d-flex gap-2">
                <button className="btn btn-primary" onClick={createTest}>생성</button>
                <button className="btn btn-outline-secondary" onClick={() => setShowCreate(false)}>취소</button>
              </div>
            </div>
            <div className="text-muted small mt-2"><i className="bi bi-info-circle me-1"></i>수강생 전원에게 자동 배정됩니다</div>
          </div>
        </div>
      )}

      {/* 날짜별 테스트 뷰 */}
      {courseId > 0 && tab === 'daily' && (
        <div className="row g-4">
          {/* 왼쪽: 당일 테스트 목록 */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0 fw-bold" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-calendar-day me-1"></i>{selectedDate} 테스트
                </h6>
              </div>
              {dailyTests.length === 0 ? (
                <div className="card-body text-center py-4">
                  <i className="bi bi-clipboard-plus text-muted" style={{ fontSize: '2rem', opacity: 0.4 }}></i>
                  <p className="text-muted small mt-2 mb-2">이 날짜에 테스트가 없습니다</p>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => setShowCreate(true)}>
                    <i className="bi bi-plus-lg me-1"></i>테스트 추가
                  </button>
                </div>
              ) : (
                <div>
                  {dailyTests.map(t => {
                    const rate = t.total > 0 ? Math.round((t.pass / t.total) * 100) : 0;
                    const isSelected = selectedTest?.testName === t.testName && selectedTest?.date === t.date;
                    return (
                      <div key={`${t.testName}_${t.date}`}
                        className="px-3 py-3 cursor-pointer"
                        style={{
                          borderBottom: '1px solid var(--border-light)',
                          borderLeft: isSelected ? '3px solid var(--brand)' : '3px solid transparent',
                          background: isSelected ? 'var(--brand-bg)' : undefined,
                        }}
                        onClick={() => selectTest(t.testName, t.date)}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = ''; }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-semibold" style={{ fontSize: '0.84rem' }}>{t.testName}</div>
                            <div className="d-flex gap-1 mt-1">
                              {t.pass > 0 && <span className="badge bg-success" style={{ fontSize: '0.62rem' }}>P {t.pass}</span>}
                              {t.fail > 0 && <span className="badge bg-danger" style={{ fontSize: '0.62rem' }}>F {t.fail}</span>}
                              {t.retest > 0 && <span className="badge bg-warning text-dark" style={{ fontSize: '0.62rem' }}>재 {t.retest}</span>}
                              {t.pending > 0 && <span className="badge bg-light text-muted border" style={{ fontSize: '0.62rem' }}>미 {t.pending}</span>}
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold" style={{ fontSize: '0.85rem', color: rate >= 80 ? '#16a34a' : rate >= 50 ? '#d97706' : '#dc2626' }}>{rate}%</span>
                            <button className="btn p-0 border-0 bg-transparent text-muted" style={{ fontSize: '0.7rem' }}
                              onClick={e => { e.stopPropagation(); deleteTest(t.testName, t.date); }}>
                              <i className="bi bi-x-lg"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 결과 입력 */}
          <div className="col-lg-8">
            {!selectedTest ? (
              <div className="card">
                <div className="card-body text-center" style={{ padding: '60px 20px' }}>
                  <i className="bi bi-clipboard2-data text-muted" style={{ fontSize: '2.5rem', opacity: 0.4 }}></i>
                  <p className="text-muted mt-3 mb-0">왼쪽에서 테스트를 선택하세요</p>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold mb-0" style={{ fontSize: '0.9rem' }}>{selectedTest.testName}</h6>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{selectedTest.date} · {selectedCourse?.name}</span>
                    </div>
                    <div className="d-flex gap-3 align-items-center" style={{ fontSize: '0.75rem' }}>
                      {results.length > 0 && <>
                        <span><span className="badge bg-success me-1">{results.filter(r => r.result === 'pass').length}</span>PASS</span>
                        <span><span className="badge bg-danger me-1">{results.filter(r => r.result === 'fail').length}</span>FAIL</span>
                        <span><span className="badge bg-warning text-dark me-1">{results.filter(r => r.result === 'retest').length}</span>재시험</span>
                      </>}
                    </div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead><tr>
                      <th className="text-center" style={{ width: 40 }}>#</th>
                      <th>학생</th>
                      <th className="text-center">학교</th>
                      <th className="text-center">학년</th>
                      <th className="text-center">점수</th>
                      <th className="text-center">응시현황</th>
                    </tr></thead>
                    <tbody>
                      {results.map((r, i) => {
                        const rs = RESULT_STYLE[r.result || ''];
                        return (
                          <tr key={r.id}>
                            <td className="text-center text-muted">{i + 1}</td>
                            <td>
                              <Link href={`/tests/students/${r.student.id}?courseId=${courseId}`} className="fw-semibold text-decoration-none">
                                {r.student.name}
                              </Link>
                            </td>
                            <td className="text-center text-muted" style={{ fontSize: '0.8rem' }}>{r.student.school || '-'}</td>
                            <td className="text-center text-muted" style={{ fontSize: '0.8rem' }}>{r.student.grade || '-'}</td>
                            <td className="text-center">
                              <div className="d-inline-flex align-items-center gap-1">
                                <input type="number" className="form-control form-control-sm text-center"
                                  style={{ width: 56, padding: '4px 2px' }} value={r.score}
                                  onChange={e => updateLocal(r.id, 'score', parseFloat(e.target.value) || 0)} />
                                <span className="text-muted" style={{ fontSize: '0.78rem' }}>/ {r.totalScore}</span>
                              </div>
                            </td>
                            <td className="text-center">
                              <select className="form-select form-select-sm mx-auto"
                                style={{ width: 100, fontSize: '0.78rem', fontWeight: r.result ? 600 : 400, background: rs?.bg, color: rs?.text, borderColor: rs?.bg }}
                                value={r.result || ''} onChange={e => updateLocal(r.id, 'result', e.target.value)}>
                                {RESULT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="card-footer d-flex justify-content-between">
                  <button className="btn btn-outline-success" onClick={openSendModal} disabled={results.filter(r => r.result).length === 0}>
                    <i className="bi bi-send me-1"></i>결과 문자 발송
                  </button>
                  <button className="btn btn-primary" onClick={saveAll} disabled={saving}>
                    {saving ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 전체 이력 뷰 */}
      {courseId > 0 && tab === 'students' && (
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0 fw-bold" style={{ fontSize: '0.85rem' }}>전체 테스트 이력 ({selectedCourse?.name})</h6>
          </div>
          <div className="card-body p-0"><div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead><tr><th>테스트명</th><th className="text-center">날짜</th><th className="text-center">인원</th><th className="text-center">PASS</th><th className="text-center">FAIL</th><th className="text-center">재시험</th><th className="text-center">통과율</th><th style={{ width: 40 }}></th></tr></thead>
              <tbody>
                {testGroups.length === 0
                  ? <tr><td colSpan={8} className="text-center text-muted py-4">테스트 이력 없음</td></tr>
                  : testGroups.map(t => {
                    const rate = t.total > 0 ? Math.round((t.pass / t.total) * 100) : 0;
                    return (
                      <tr key={`${t.testName}_${t.date}`} className="cursor-pointer"
                        onClick={() => { setTab('daily'); setSelectedDate(t.date); selectTest(t.testName, t.date); }}>
                        <td className="fw-semibold">{t.testName}</td>
                        <td className="text-center text-muted" style={{ fontSize: '0.82rem' }}>{t.date}</td>
                        <td className="text-center">{t.total}</td>
                        <td className="text-center"><span className="badge bg-success">{t.pass}</span></td>
                        <td className="text-center"><span className="badge bg-danger">{t.fail}</span></td>
                        <td className="text-center"><span className="badge bg-warning text-dark">{t.retest}</span></td>
                        <td className="text-center">
                          <div className="d-flex align-items-center gap-2 justify-content-center">
                            <div className="progress" style={{ height: 5, width: 50 }}><div className="progress-bar bg-success" style={{ width: `${rate}%` }}></div></div>
                            <span className="fw-bold" style={{ fontSize: '0.78rem', color: rate >= 80 ? '#16a34a' : rate >= 50 ? '#d97706' : '#dc2626' }}>{rate}%</span>
                          </div>
                        </td>
                        <td><button className="btn p-0 border-0 bg-transparent text-muted" style={{ fontSize: '0.7rem' }} onClick={e => { e.stopPropagation(); deleteTest(t.testName, t.date); }}><i className="bi bi-x-lg"></i></button></td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div></div>
        </div>
      )}

      {/* 빈 상태 */}
      {courseId > 0 && testGroups.length === 0 && !showCreate && tab === 'daily' && dailyTests.length === 0 && (
        <div className="card">
          <div className="card-body text-center" style={{ padding: '60px 20px' }}>
            <i className="bi bi-clipboard-plus text-muted" style={{ fontSize: '2.5rem', opacity: 0.4 }}></i>
            <p className="text-muted mt-3 mb-2">등록된 테스트가 없습니다</p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}><i className="bi bi-plus-lg me-1"></i>첫 테스트 만들기</button>
          </div>
        </div>
      )}

      {/* 문자 발송 모달 */}
      {showSendModal && selectedTest && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title fw-bold"><i className="bi bi-send me-2"></i>테스트 결과 문자 발송</h6>
                <button className="btn-close" onClick={() => setShowSendModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="p-3 rounded mb-3" style={{ background: '#fffbeb', fontSize: '0.82rem', border: '1px solid #fde68a' }}>
                  <div className="fw-semibold mb-1"><i className="bi bi-chat-left-text me-1"></i>발송 메시지 예시</div>
                  <div>[수강생 관리] {'{{학생명}}'} 학생 {selectedTest.testName} 결과</div>
                  <div>점수: {'{{점수}}'}/100 | 결과: {'{{PASS/FAIL/재시험}}'}</div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ fontSize: '0.82rem' }}>발송 대상 <strong>{sendTargets.length}</strong>명</span>
                  <button className="btn btn-sm btn-outline-secondary py-0 px-2" style={{ fontSize: '0.72rem' }}
                    onClick={() => setSendTargets(results.filter(r => r.result).map(r => r.id))}>전체 선택</button>
                </div>
                <div className="border rounded" style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {results.filter(r => r.result).map(r => {
                    const rs = RESULT_STYLE[r.result || ''];
                    return (
                      <label key={r.id} className="d-flex align-items-center gap-3 px-3 py-2 cursor-pointer"
                        style={{ borderBottom: '1px solid var(--border-light)', background: sendTargets.includes(r.id) ? 'var(--brand-bg)' : undefined }}>
                        <input type="checkbox" className="form-check-input m-0" checked={sendTargets.includes(r.id)} onChange={() => toggleSendTarget(r.id)} />
                        <span className="fw-semibold" style={{ fontSize: '0.84rem' }}>{r.student.name}</span>
                        <span style={{ fontSize: '0.78rem' }}>{r.score}/{r.totalScore}</span>
                        <span className="badge" style={{ background: rs?.bg, color: rs?.text, fontSize: '0.68rem' }}>
                          {RESULT_OPTIONS.find(o => o.value === r.result)?.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowSendModal(false)}>취소</button>
                <button className="btn btn-primary" onClick={sendMessages} disabled={sendingMsg || sendTargets.length === 0}>
                  <i className="bi bi-send me-1"></i>{sendingMsg ? '발송 중...' : `${sendTargets.length}명에게 발송`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
