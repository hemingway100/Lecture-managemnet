'use client';
import { useState, useEffect, useCallback } from 'react';

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
  const [testGroups, setTestGroups] = useState<TestGroup[]>([]);
  const [selectedTest, setSelectedTest] = useState<{ testName: string; date: string } | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [newTestDate, setNewTestDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch('/api/courses').then(r => r.json()).then(setCourses); }, []);

  const loadTests = useCallback((cid: number) => {
    if (!cid) { setTestGroups([]); return; }
    fetch(`/api/tests?courseId=${cid}&action=list`).then(r => r.json()).then(setTestGroups);
  }, []);

  useEffect(() => { loadTests(courseId); setSelectedTest(null); setResults([]); }, [courseId, loadTests]);

  function selectTest(testName: string, date: string) {
    setSelectedTest({ testName, date });
    fetch(`/api/tests?courseId=${courseId}&action=results&testName=${encodeURIComponent(testName)}&date=${date}`)
      .then(r => r.json()).then(setResults);
  }

  async function createTest() {
    if (!newTestName.trim()) return;
    const res = await fetch('/api/tests', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', courseId, testName: newTestName.trim(), date: newTestDate }),
    });
    const data = await res.json();
    if (data.error) { alert(data.error); return; }
    setNewTestName('');
    setShowCreate(false);
    loadTests(courseId);
  }

  async function deleteTest(testName: string, date: string) {
    if (!confirm(`"${testName}" 테스트를 삭제하시겠습니까?`)) return;
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
      body: JSON.stringify({
        action: 'saveResults',
        results: results.map(r => ({ id: r.id, result: r.result || '', score: r.score, totalScore: r.totalScore })),
      }),
    });
    setSaving(false);
    loadTests(courseId);
    if (selectedTest) selectTest(selectedTest.testName, selectedTest.date);
  }

  const selectedCourse = courses.find(c => c.id === courseId);

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>테스트 / 성적</h5>
          <p className="text-muted small mb-0">강의별 테스트를 생성하고 학생별 결과를 기록합니다</p>
        </div>
      </div>

      {/* 강의 선택 */}
      <div className="card mb-4">
        <div className="card-body py-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">강의</label>
              <select className="form-select" value={courseId} onChange={e => setCourseId(parseInt(e.target.value))}>
                <option value={0}>강의를 선택하세요</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c._count.studentCourses}명)</option>
                ))}
              </select>
            </div>
            {courseId > 0 && (
              <div className="col-md-8 text-end">
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                  <i className="bi bi-plus-lg me-1"></i>새 테스트
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 새 테스트 생성 폼 */}
      {showCreate && (
        <div className="card mb-4" style={{ borderLeft: '3px solid var(--brand)' }}>
          <div className="card-body py-3">
            <div className="row g-3 align-items-end">
              <div className="col-md-5">
                <label className="form-label">테스트명</label>
                <input type="text" className="form-control" placeholder="예: Unit 3 단어시험" autoFocus
                  value={newTestName} onChange={e => setNewTestName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createTest()} />
              </div>
              <div className="col-md-3">
                <label className="form-label">날짜</label>
                <input type="date" className="form-control" value={newTestDate} onChange={e => setNewTestDate(e.target.value)} />
              </div>
              <div className="col-md-4 d-flex gap-2">
                <button className="btn btn-primary" onClick={createTest}>생성</button>
                <button className="btn btn-outline-secondary" onClick={() => setShowCreate(false)}>취소</button>
              </div>
            </div>
            <div className="text-muted small mt-2"><i className="bi bi-info-circle me-1"></i>수강 중인 모든 학생에게 자동 배정됩니다</div>
          </div>
        </div>
      )}

      {courseId > 0 && testGroups.length > 0 && (
        <div className="row g-4">
          {/* 왼쪽: 테스트 목록 */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold" style={{ fontSize: '0.85rem' }}>테스트 목록</h6>
                  <span className="badge bg-light text-dark border" style={{ fontSize: '0.72rem' }}>{testGroups.length}개</span>
                </div>
              </div>
              <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                {testGroups.map(t => {
                  const rate = t.total > 0 ? Math.round((t.pass / t.total) * 100) : 0;
                  const isSelected = selectedTest?.testName === t.testName && selectedTest?.date === t.date;
                  return (
                    <div key={`${t.testName}_${t.date}`}
                      className="d-flex align-items-center justify-content-between px-3 py-3 cursor-pointer"
                      style={{
                        borderBottom: '1px solid var(--border-light)',
                        borderLeft: isSelected ? '3px solid var(--brand)' : '3px solid transparent',
                        background: isSelected ? 'var(--brand-bg)' : undefined,
                        transition: 'all 0.1s',
                      }}
                      onClick={() => selectTest(t.testName, t.date)}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = ''; }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="fw-semibold text-truncate" style={{ fontSize: '0.84rem' }}>{t.testName}</div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>{t.date} · {t.total}명</div>
                      </div>
                      <div className="d-flex align-items-center gap-2 ms-2">
                        {/* 미니 통계 */}
                        <div className="d-flex gap-1">
                          {t.pass > 0 && <span className="badge bg-success" style={{ fontSize: '0.65rem' }}>{t.pass}</span>}
                          {t.fail > 0 && <span className="badge bg-danger" style={{ fontSize: '0.65rem' }}>{t.fail}</span>}
                          {t.retest > 0 && <span className="badge bg-warning text-dark" style={{ fontSize: '0.65rem' }}>{t.retest}</span>}
                        </div>
                        <div style={{ width: 36, textAlign: 'right' }}>
                          <span className="fw-bold" style={{ fontSize: '0.78rem', color: rate >= 80 ? '#16a34a' : rate >= 50 ? '#d97706' : '#dc2626' }}>{rate}%</span>
                        </div>
                        <button className="btn p-0 border-0 bg-transparent text-muted"
                          style={{ fontSize: '0.72rem', lineHeight: 1 }}
                          onClick={e => { e.stopPropagation(); deleteTest(t.testName, t.date); }}
                          title="삭제">
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 오른쪽: 결과 기록 */}
          <div className="col-lg-8">
            {!selectedTest ? (
              <div className="card">
                <div className="card-body text-center" style={{ padding: '60px 20px' }}>
                  <i className="bi bi-clipboard2-data text-muted" style={{ fontSize: '2.5rem', opacity: 0.4 }}></i>
                  <p className="text-muted mt-3 mb-0" style={{ fontSize: '0.88rem' }}>왼쪽에서 테스트를 선택하세요</p>
                </div>
              </div>
            ) : (
              <div className="card">
                {/* 헤더 */}
                <div className="card-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold mb-0" style={{ fontSize: '0.9rem' }}>{selectedTest.testName}</h6>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{selectedTest.date}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      {/* 요약 통계 */}
                      {results.length > 0 && (() => {
                        const p = results.filter(r => r.result === 'pass').length;
                        const f = results.filter(r => r.result === 'fail').length;
                        const re = results.filter(r => r.result === 'retest').length;
                        const none = results.filter(r => !r.result).length;
                        return (
                          <div className="d-flex gap-3" style={{ fontSize: '0.75rem' }}>
                            <span><span className="badge bg-success me-1">{p}</span>PASS</span>
                            <span><span className="badge bg-danger me-1">{f}</span>FAIL</span>
                            <span><span className="badge bg-warning text-dark me-1">{re}</span>재시험</span>
                            {none > 0 && <span className="text-muted">{none} 미처리</span>}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* 테이블 */}
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th className="text-center" style={{ width: 45 }}>#</th>
                        <th>학생</th>
                        <th className="text-center">학교</th>
                        <th className="text-center">학년</th>
                        <th className="text-center">점수</th>
                        <th className="text-center">응시현황</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => {
                        const rs = RESULT_STYLE[r.result || ''];
                        return (
                          <tr key={r.id}>
                            <td className="text-center text-muted">{i + 1}</td>
                            <td>
                              <span className="fw-semibold">{r.student.name}</span>
                            </td>
                            <td className="text-center text-muted" style={{ fontSize: '0.8rem' }}>{r.student.school || '-'}</td>
                            <td className="text-center text-muted" style={{ fontSize: '0.8rem' }}>{r.student.grade || '-'}</td>
                            <td className="text-center">
                              <div className="d-inline-flex align-items-center gap-1">
                                <input
                                  type="number"
                                  className="form-control form-control-sm text-center"
                                  style={{ width: 56, padding: '4px 2px' }}
                                  value={r.score}
                                  onChange={e => updateLocal(r.id, 'score', parseFloat(e.target.value) || 0)}
                                />
                                <span className="text-muted" style={{ fontSize: '0.78rem' }}>/ {r.totalScore}</span>
                              </div>
                            </td>
                            <td className="text-center">
                              <select
                                className="form-select form-select-sm mx-auto"
                                style={{
                                  width: 100,
                                  fontSize: '0.78rem',
                                  fontWeight: r.result ? 600 : 400,
                                  background: rs ? rs.bg : undefined,
                                  color: rs ? rs.text : undefined,
                                  borderColor: rs ? rs.bg : undefined,
                                }}
                                value={r.result || ''}
                                onChange={e => updateLocal(r.id, 'result', e.target.value)}
                              >
                                {RESULT_OPTIONS.map(o => (
                                  <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 푸터 */}
                <div className="card-footer text-end">
                  <button className="btn btn-primary" onClick={saveAll} disabled={saving}>
                    {saving ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {courseId > 0 && testGroups.length === 0 && !showCreate && (
        <div className="card">
          <div className="card-body text-center" style={{ padding: '60px 20px' }}>
            <i className="bi bi-clipboard-plus text-muted" style={{ fontSize: '2.5rem', opacity: 0.4 }}></i>
            <p className="text-muted mt-3 mb-2">등록된 테스트가 없습니다</p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
              <i className="bi bi-plus-lg me-1"></i>첫 테스트 만들기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
