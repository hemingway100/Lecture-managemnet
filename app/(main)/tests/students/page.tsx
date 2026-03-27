'use client';
import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function TestStudentsPageWrapper() {
  return <Suspense fallback={<div className="text-center py-5 text-muted">로딩 중...</div>}><TestStudentsPageInner /></Suspense>;
}

interface Course { id: number; name: string; _count: { studentCourses: number } }
interface StudentStat {
  studentId: number; name: string; school: string | null; grade: string | null;
  totalTests: number; pass: number; fail: number; retest: number; rate: number;
}
interface TestRecord {
  id: number; testName: string; date: string; score: number; totalScore: number; result: string | null;
}

const RESULT_STYLE: Record<string, { label: string; bg: string; text: string }> = {
  pass: { label: 'PASS', bg: '#dcfce7', text: '#16a34a' },
  fail: { label: 'FAIL', bg: '#fee2e2', text: '#dc2626' },
  retest: { label: '재시험', bg: '#fef3c7', text: '#d97706' },
  late_absent: { label: '미응시', bg: '#f4f4f5', text: '#71717a' },
};

const CATEGORIES = [
  { key: 'all', label: '전체', color: '#5046e5' },
  { key: '단어', label: '단어', color: '#3b82f6' },
  { key: '문법', label: '문법', color: '#8b5cf6' },
  { key: '독해', label: '독해', color: '#06b6d4' },
  { key: '듣기', label: '듣기', color: '#f59e0b' },
  { key: '작문', label: '작문', color: '#ec4899' },
];

function TestStudentsPageInner() {
  const searchParams = useSearchParams();
  const initialCourseId = parseInt(searchParams?.get('courseId') || '0');
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState(initialCourseId);
  const [students, setStudents] = useState<StudentStat[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentStat | null>(null);
  const [testRecords, setTestRecords] = useState<TestRecord[]>([]);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [category, setCategory] = useState('all');
  const [chartMode, setChartMode] = useState<'single' | 'compare'>('single'); // single=선택카테고리, compare=전체카테고리비교

  useEffect(() => { fetch('/api/courses').then(r => r.json()).then(setCourses); }, []);

  useEffect(() => {
    if (!courseId) { setStudents([]); return; }
    fetch(`/api/tests?courseId=${courseId}&action=studentStats`).then(r => r.json()).then(setStudents);
    setSelectedStudent(null); setTestRecords([]);
  }, [courseId]);

  function selectStudent(s: StudentStat) {
    setSelectedStudent(s);
    fetch(`/api/tests?action=studentDetail&studentId=${s.studentId}&courseId=${courseId}`)
      .then(r => r.json()).then((data: { tests: TestRecord[] }) => setTestRecords(data.tests || []));
  }

  const filtered = useMemo(() => {
    if (!search) return students;
    return students.filter(s => s.name.includes(search));
  }, [students, search]);

  // 카테고리별 필터된 테스트
  const filteredRecords = useMemo(() => {
    if (category === 'all') return testRecords;
    return testRecords.filter(t => t.testName.includes(category));
  }, [testRecords, category]);

  // 현재 학생이 가진 카테고리 목록 추출
  const availableCategories = useMemo(() => {
    return CATEGORIES.filter(c => {
      if (c.key === 'all') return true;
      return testRecords.some(t => t.testName.includes(c.key));
    });
  }, [testRecords]);

  // 단일 카테고리 차트 데이터
  const singleChartData = useMemo(() => {
    if (!filteredRecords.length) return null;
    const dates = [...new Set(filteredRecords.map(t => t.date))].sort();
    const dateAvgs = dates.map(d => {
      const dayTests = filteredRecords.filter(t => t.date === d);
      return { date: d, avg: Math.round(dayTests.reduce((s, t) => s + (t.score / t.totalScore) * 100, 0) / dayTests.length) };
    });
    const catColor = CATEGORIES.find(c => c.key === category)?.color || '#5046e5';

    return {
      labels: dateAvgs.map(d => d.date.slice(5)),
      datasets: [{
        label: category === 'all' ? '전체 평균' : `${category} 평균`,
        data: dateAvgs.map(d => d.avg),
        borderColor: catColor,
        backgroundColor: catColor + '12',
        borderWidth: 2.5,
        pointRadius: 5,
        pointBackgroundColor: dateAvgs.map(d => d.avg >= 80 ? '#16a34a' : d.avg >= 50 ? '#d97706' : '#dc2626'),
        pointBorderColor: '#fff', pointBorderWidth: 2,
        tension: 0.35, fill: true,
      }],
    };
  }, [filteredRecords, category]);

  // 카테고리 비교 차트 데이터 (모든 카테고리를 한 차트에)
  const compareChartData = useMemo(() => {
    if (!testRecords.length) return null;
    const dates = [...new Set(testRecords.map(t => t.date))].sort();

    const datasets = availableCategories.filter(c => c.key !== 'all').map(cat => {
      const catTests = testRecords.filter(t => t.testName.includes(cat.key));
      const dateAvgs = dates.map(d => {
        const dayTests = catTests.filter(t => t.date === d);
        return dayTests.length > 0 ? Math.round(dayTests.reduce((s, t) => s + (t.score / t.totalScore) * 100, 0) / dayTests.length) : null;
      });
      return {
        label: cat.label,
        data: dateAvgs,
        borderColor: cat.color,
        backgroundColor: cat.color + '12',
        borderWidth: 2, pointRadius: 4,
        pointBackgroundColor: cat.color,
        pointBorderColor: '#fff', pointBorderWidth: 2,
        tension: 0.35, fill: false,
        spanGaps: true,
      };
    });

    return { labels: dates.map(d => d.slice(5)), datasets };
  }, [testRecords, availableCategories]);

  // 도넛 차트
  const doughnutData = useMemo(() => {
    if (!selectedStudent) return null;
    return {
      labels: ['PASS', 'FAIL', '재시험'],
      datasets: [{ data: [selectedStudent.pass, selectedStudent.fail, selectedStudent.retest], backgroundColor: ['#22c55e', '#ef4444', '#f59e0b'], borderWidth: 0, hoverOffset: 4 }],
    };
  }, [selectedStudent]);

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' as const },
    plugins: {
      legend: { display: chartMode === 'compare', position: 'top' as const, labels: { usePointStyle: true, pointStyle: 'circle', padding: 12, font: { size: 11 } } },
      tooltip: { backgroundColor: '#18181b', cornerRadius: 8, padding: 10, titleFont: { size: 12 }, bodyFont: { size: 12 },
        callbacks: { label: (ctx: { dataset: { label?: string }; parsed: { y: number } }) => `${ctx.dataset.label}: ${ctx.parsed.y}점` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#a1a1aa' }, border: { display: false } },
      y: { grid: { color: '#f4f4f5' }, border: { display: false }, min: 0, max: 100, ticks: { font: { size: 10 }, color: '#a1a1aa', callback: (v: number | string) => `${v}점` } },
    },
  };

  const ChartComponent = chartType === 'line' ? Line : Bar;
  const activeChartData = chartMode === 'compare' ? compareChartData : singleChartData;

  return (
    <div>
      <div className="d-flex align-items-center mb-4">
        <Link href="/tests" className="btn btn-sm btn-outline-secondary me-3"><i className="bi bi-arrow-left"></i></Link>
        <div><h5 className="fw-bold mb-1">학생별 수행률</h5><p className="text-muted small mb-0">학생을 선택하면 카테고리별 테스트 이력과 추이를 확인할 수 있습니다</p></div>
      </div>

      {/* 강의 + 검색 */}
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
              <label className="form-label">학생 검색</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input type="text" className="form-control" placeholder="이름 검색" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="col-md-5 text-end"><span className="text-muted" style={{ fontSize: '0.82rem' }}>{filtered.length}명</span></div>
          </div>
        </div>
      </div>

      {courseId > 0 && (
        <div className="row g-4">
          {/* 왼쪽: 학생 목록 */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header"><h6 className="mb-0 fw-bold" style={{ fontSize: '0.85rem' }}>학생 수행률 순위</h6></div>
              <div style={{ maxHeight: 640, overflowY: 'auto' }}>
                {filtered.length === 0 ? (
                  <div className="text-center py-4 text-muted">검색 결과가 없습니다</div>
                ) : filtered.map((s, i) => {
                  const isSelected = selectedStudent?.studentId === s.studentId;
                  return (
                    <div key={s.studentId} className="d-flex align-items-center gap-3 px-3 py-3 cursor-pointer"
                      style={{ borderBottom: '1px solid var(--border-light)', borderLeft: isSelected ? '3px solid var(--brand)' : '3px solid transparent', background: isSelected ? 'var(--brand-bg)' : undefined }}
                      onClick={() => selectStudent(s)}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = ''; }}>
                      <div className="text-center" style={{ width: 28 }}>
                        <span className={`fw-bold ${i < 3 ? 'text-warning' : 'text-muted'}`} style={{ fontSize: '0.85rem' }}>{i + 1}</span>
                      </div>
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>{s.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>{s.school} · {s.grade}</div>
                      </div>
                      <div className="d-flex gap-1">
                        <span className="badge bg-success" style={{ fontSize: '0.6rem' }}>{s.pass}</span>
                        <span className="badge bg-danger" style={{ fontSize: '0.6rem' }}>{s.fail}</span>
                        <span className="badge bg-warning text-dark" style={{ fontSize: '0.6rem' }}>{s.retest}</span>
                      </div>
                      <div style={{ width: 55, textAlign: 'right' }}>
                        <span className="fw-bold" style={{ fontSize: '0.85rem', color: s.rate >= 80 ? '#16a34a' : s.rate >= 50 ? '#d97706' : '#dc2626' }}>{s.rate}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 오른쪽: 선택 학생 상세 */}
          <div className="col-lg-8">
            {!selectedStudent ? (
              <div className="card"><div className="card-body text-center" style={{ padding: '80px 20px' }}>
                <i className="bi bi-person-lines-fill text-muted" style={{ fontSize: '2.5rem', opacity: 0.3 }}></i>
                <p className="text-muted mt-3">왼쪽에서 학생을 선택하세요</p>
              </div></div>
            ) : (
              <>
                {/* 학생 정보 + 통계 */}
                <div className="card mb-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6 className="fw-bold mb-0">{selectedStudent.name}</h6>
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>{selectedStudent.school} · {selectedStudent.grade}</span>
                      </div>
                      <Link href={`/tests/students/${selectedStudent.studentId}?courseId=${courseId}`} className="btn btn-sm btn-outline-primary">
                        <i className="bi bi-box-arrow-up-right me-1"></i>전체 상세
                      </Link>
                    </div>
                    <div className="row g-3">
                      <div className="col-8">
                        <div className="row g-2">
                          {[
                            { label: '총 시험', value: selectedStudent.totalTests, unit: '회', color: 'var(--brand)' },
                            { label: '수행률', value: selectedStudent.rate, unit: '%', color: selectedStudent.rate >= 80 ? '#16a34a' : selectedStudent.rate >= 50 ? '#d97706' : '#dc2626' },
                            { label: 'PASS', value: selectedStudent.pass, unit: '회', color: '#16a34a' },
                            { label: 'FAIL', value: selectedStudent.fail, unit: '회', color: '#dc2626' },
                          ].map((s, i) => (
                            <div className="col-6" key={i}>
                              <div className="p-2 rounded text-center" style={{ background: 'var(--bg-body)' }}>
                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>{s.label}</div>
                                <div className="fw-bold" style={{ fontSize: '1.1rem', color: s.color }}>{s.value}<small className="text-muted ms-1" style={{ fontSize: '0.7rem' }}>{s.unit}</small></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="col-4">
                        {doughnutData && <div style={{ height: 100 }}>
                          <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '65%' }} />
                        </div>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 점수 추이 차트 */}
                <div className="card mb-3">
                  <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <h6 className="mb-0 fw-bold" style={{ fontSize: '0.85rem' }}><i className="bi bi-graph-up me-1"></i>점수 추이</h6>
                      <div className="d-flex align-items-center gap-2">
                        {/* 카테고리 비교 / 단일 토글 */}
                        <div className="btn-group btn-group-sm">
                          <button className={`btn ${chartMode === 'single' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            style={{ padding: '2px 10px', fontSize: '0.72rem' }} onClick={() => setChartMode('single')}>카테고리별</button>
                          <button className={`btn ${chartMode === 'compare' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            style={{ padding: '2px 10px', fontSize: '0.72rem' }} onClick={() => setChartMode('compare')}>비교</button>
                        </div>
                        {/* 차트 유형 */}
                        <div className="btn-group btn-group-sm">
                          <button className={`btn ${chartType === 'line' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            style={{ padding: '2px 8px', fontSize: '0.72rem' }} onClick={() => setChartType('line')}><i className="bi bi-graph-up"></i></button>
                          <button className={`btn ${chartType === 'bar' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            style={{ padding: '2px 8px', fontSize: '0.72rem' }} onClick={() => setChartType('bar')}><i className="bi bi-bar-chart"></i></button>
                        </div>
                      </div>
                    </div>
                    {/* 카테고리 필터 (단일 모드) */}
                    {chartMode === 'single' && (
                      <div className="d-flex gap-1 mt-2 flex-wrap">
                        {availableCategories.map(c => (
                          <button key={c.key} className="btn btn-sm"
                            style={{
                              padding: '2px 10px', fontSize: '0.72rem', borderRadius: 50,
                              background: category === c.key ? c.color : 'transparent',
                              color: category === c.key ? '#fff' : 'var(--text-muted)',
                              border: category === c.key ? 'none' : '1px solid var(--border)',
                              fontWeight: category === c.key ? 600 : 400,
                            }}
                            onClick={() => setCategory(c.key)}>{c.label}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="card-body" style={{ height: 240 }}>
                    {activeChartData ? (
                      <ChartComponent
                        data={chartType === 'bar' && chartMode === 'single' ? {
                          ...activeChartData,
                          datasets: activeChartData.datasets.map(ds => ({ ...ds, borderRadius: 4, borderWidth: 0, backgroundColor: (ds as { pointBackgroundColor?: string[] }).pointBackgroundColor || ds.borderColor })),
                        } : activeChartData}
                        options={chartOptions as never}
                      />
                    ) : <div className="text-center text-muted py-5">데이터가 없습니다</div>}
                  </div>
                </div>

                {/* 테스트 이력 */}
                <div className="card">
                  <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <h6 className="mb-0 fw-bold" style={{ fontSize: '0.85rem' }}>테스트 이력</h6>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted" style={{ fontSize: '0.78rem' }}>{filteredRecords.length}건</span>
                        {/* 카테고리 필터 */}
                        <div className="d-flex gap-1">
                          {availableCategories.map(c => (
                            <button key={c.key} className="btn btn-sm"
                              style={{
                                padding: '1px 8px', fontSize: '0.68rem', borderRadius: 50,
                                background: category === c.key ? c.color : 'transparent',
                                color: category === c.key ? '#fff' : 'var(--text-muted)',
                                border: category === c.key ? 'none' : '1px solid var(--border)',
                              }}
                              onClick={() => setCategory(c.key)}>{c.label}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body p-0"><div className="table-responsive" style={{ maxHeight: 320, overflowY: 'auto' }}>
                    <table className="table table-hover align-middle mb-0">
                      <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}><tr>
                        <th>테스트명</th><th className="text-center">카테고리</th><th className="text-center">날짜</th><th className="text-center">점수</th><th className="text-center">백분율</th><th className="text-center">결과</th>
                      </tr></thead>
                      <tbody>
                        {filteredRecords.length === 0
                          ? <tr><td colSpan={6} className="text-center text-muted py-4">테스트 이력 없음</td></tr>
                          : filteredRecords.map(t => {
                            const rs = RESULT_STYLE[t.result || ''];
                            const pct = t.totalScore > 0 ? Math.round((t.score / t.totalScore) * 100) : 0;
                            const cat = CATEGORIES.find(c => c.key !== 'all' && t.testName.includes(c.key));
                            return (
                              <tr key={t.id}>
                                <td className="fw-semibold" style={{ fontSize: '0.82rem' }}>{t.testName}</td>
                                <td className="text-center">
                                  {cat ? <span className="badge" style={{ background: cat.color + '18', color: cat.color, fontSize: '0.68rem' }}>{cat.label}</span>
                                    : <span className="text-muted" style={{ fontSize: '0.72rem' }}>기타</span>}
                                </td>
                                <td className="text-center text-muted" style={{ fontSize: '0.8rem' }}>{t.date}</td>
                                <td className="text-center" style={{ fontSize: '0.82rem' }}>{t.score}<span className="text-muted">/{t.totalScore}</span></td>
                                <td className="text-center">
                                  <span className="fw-bold" style={{ fontSize: '0.8rem', color: pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626' }}>{pct}%</span>
                                </td>
                                <td className="text-center">
                                  {rs ? <span className="badge" style={{ background: rs.bg, color: rs.text }}>{rs.label}</span> : <span className="text-muted">-</span>}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div></div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
