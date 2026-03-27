'use client';
import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function StudentTestDetailWrapper() {
  return <Suspense fallback={<div className="text-center py-5 text-muted">로딩 중...</div>}><StudentTestDetailInner /></Suspense>;
}

interface TestRecord { id: number; testName: string; date: string; score: number; totalScore: number; result: string | null }
interface StudentInfo { name: string; school: string | null; grade: string | null }

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

function StudentTestDetailInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = parseInt(params?.id as string || '0');
  const courseId = parseInt(searchParams?.get('courseId') || '0');
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [tests, setTests] = useState<TestRecord[]>([]);
  const [category, setCategory] = useState('all');
  const [chartMode, setChartMode] = useState<'single' | 'compare'>('single');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    if (!studentId || !courseId) return;
    fetch(`/api/tests?action=studentDetail&studentId=${studentId}&courseId=${courseId}`)
      .then(r => r.json()).then(data => { setStudent(data.student); setTests(data.tests); });
  }, [studentId, courseId]);

  // 사용 가능한 카테고리
  const availableCategories = useMemo(() => {
    return CATEGORIES.filter(c => c.key === 'all' || tests.some(t => t.testName.includes(c.key)));
  }, [tests]);

  // 카테고리 필터된 테스트
  const filteredByCategory = useMemo(() => {
    if (category === 'all') return tests;
    return tests.filter(t => t.testName.includes(category));
  }, [tests, category]);

  // 날짜 + 카테고리 필터된 테스트
  const filtered = useMemo(() => {
    if (!dateFilter) return filteredByCategory;
    return filteredByCategory.filter(t => t.date === dateFilter);
  }, [filteredByCategory, dateFilter]);

  const dates = [...new Set(tests.map(t => t.date))].sort().reverse();

  // 통계
  const totalTests = filteredByCategory.length;
  const passCount = filteredByCategory.filter(t => t.result === 'pass').length;
  const failCount = filteredByCategory.filter(t => t.result === 'fail').length;
  const retestCount = filteredByCategory.filter(t => t.result === 'retest').length;
  const overallRate = totalTests > 0 ? Math.round((passCount / totalTests) * 100) : 0;
  const avgScore = totalTests > 0 ? Math.round(filteredByCategory.reduce((s, t) => s + (t.score / t.totalScore) * 100, 0) / totalTests) : 0;

  // 단일 카테고리 꺾은선 차트
  const singleLineData = useMemo(() => {
    if (!filteredByCategory.length) return null;
    const sortedDates = [...new Set(filteredByCategory.map(t => t.date))].sort();
    const dateAvgs = sortedDates.map(d => {
      const dayTests = filteredByCategory.filter(t => t.date === d);
      return Math.round(dayTests.reduce((s, t) => s + (t.score / t.totalScore) * 100, 0) / dayTests.length);
    });
    const catColor = CATEGORIES.find(c => c.key === category)?.color || '#5046e5';
    return {
      labels: sortedDates.map(d => d.slice(5)),
      datasets: [{
        label: category === 'all' ? '전체 평균' : `${category}`,
        data: dateAvgs, borderColor: catColor, backgroundColor: catColor + '12',
        borderWidth: 2.5, pointRadius: 5,
        pointBackgroundColor: dateAvgs.map(v => v >= 80 ? '#16a34a' : v >= 50 ? '#d97706' : '#dc2626'),
        pointBorderColor: '#fff', pointBorderWidth: 2, tension: 0.35, fill: true,
      }],
    };
  }, [filteredByCategory, category]);

  // 카테고리 비교 꺾은선 차트
  const compareLineData = useMemo(() => {
    if (!tests.length) return null;
    const sortedDates = [...new Set(tests.map(t => t.date))].sort();
    const datasets = availableCategories.filter(c => c.key !== 'all').map(cat => {
      const catTests = tests.filter(t => t.testName.includes(cat.key));
      const avgs = sortedDates.map(d => {
        const dt = catTests.filter(t => t.date === d);
        return dt.length > 0 ? Math.round(dt.reduce((s, t) => s + (t.score / t.totalScore) * 100, 0) / dt.length) : null;
      });
      return {
        label: cat.label, data: avgs, borderColor: cat.color, backgroundColor: cat.color + '10',
        borderWidth: 2, pointRadius: 4, pointBackgroundColor: cat.color,
        pointBorderColor: '#fff', pointBorderWidth: 2, tension: 0.35, fill: false, spanGaps: true,
      };
    });
    return { labels: sortedDates.map(d => d.slice(5)), datasets };
  }, [tests, availableCategories]);

  // 결과 분포 도넛 차트
  const doughnutData = useMemo(() => {
    return {
      labels: ['PASS', 'FAIL', '재시험', '미응시'],
      datasets: [{
        data: [passCount, failCount, retestCount, Math.max(0, totalTests - passCount - failCount - retestCount)],
        backgroundColor: ['#22c55e', '#ef4444', '#f59e0b', '#d4d4d8'],
        borderWidth: 0, hoverOffset: 6,
      }],
    };
  }, [passCount, failCount, retestCount, totalTests]);

  // 카테고리별 수행률 도넛
  const categoryDoughnut = useMemo(() => {
    const cats = availableCategories.filter(c => c.key !== 'all');
    const data = cats.map(c => {
      const ct = tests.filter(t => t.testName.includes(c.key));
      return ct.length > 0 ? Math.round((ct.filter(t => t.result === 'pass').length / ct.length) * 100) : 0;
    });
    return {
      labels: cats.map(c => c.label),
      datasets: [{ data, backgroundColor: cats.map(c => c.color), borderWidth: 0, hoverOffset: 6 }],
    };
  }, [tests, availableCategories]);

  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' as const },
    plugins: {
      legend: { display: chartMode === 'compare', position: 'top' as const, labels: { usePointStyle: true, pointStyle: 'circle', padding: 12, font: { size: 11 } } },
      tooltip: { backgroundColor: '#18181b', cornerRadius: 8, padding: 10, titleFont: { size: 12 }, bodyFont: { size: 12 },
        callbacks: { label: (ctx: { dataset: { label?: string }; parsed: { y: number } }) => `${ctx.dataset.label}: ${ctx.parsed.y}점` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#a1a1aa' }, border: { display: false } },
      y: { grid: { color: '#f4f4f5' }, border: { display: false }, min: 0, max: 100, ticks: { font: { size: 10 }, color: '#a1a1aa', callback: (v: number | string) => `${v}` } },
    },
  };

  const doughnutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const, labels: { usePointStyle: true, pointStyle: 'circle', padding: 10, font: { size: 11 } } } }, cutout: '60%' };

  if (!student) return <div className="text-center py-5 text-muted">로딩 중...</div>;

  const activeLineData = chartMode === 'compare' ? compareLineData : singleLineData;

  return (
    <div>
      {/* 헤더 */}
      <div className="d-flex align-items-center mb-4">
        <Link href={`/tests/students?courseId=${courseId}`} className="btn btn-sm btn-outline-secondary me-3"><i className="bi bi-arrow-left"></i></Link>
        <div>
          <h5 className="fw-bold mb-0">{student.name}</h5>
          <p className="text-muted small mb-0">{student.school} {student.grade} · 테스트 상세</p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="row g-3 mb-4">
        {[
          { label: '총 시험', value: totalTests, unit: '회', color: 'primary', icon: 'bi-pencil-square' },
          { label: '수행률', value: overallRate, unit: '%', color: overallRate >= 80 ? 'success' : overallRate >= 50 ? 'warning' : 'danger', icon: 'bi-graph-up' },
          { label: '평균 점수', value: avgScore, unit: '점', color: 'info', icon: 'bi-bullseye' },
          { label: 'PASS', value: passCount, unit: '회', color: 'success', icon: 'bi-check-circle' },
        ].map((s, i) => (
          <div className="col-6 col-lg-3" key={i}>
            <div className="card stat-card">
              <div className="card-body d-flex align-items-center py-3">
                <div className={`stat-icon bg-${s.color} bg-opacity-10 text-${s.color} me-3`}><i className={`bi ${s.icon}`}></i></div>
                <div><div className="text-muted small">{s.label}</div><div className="fw-bold fs-4">{s.value}<small className="text-muted fs-6 ms-1">{s.unit}</small></div></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        {/* 점수 추이 꺾은선 차트 */}
        <div className="col-lg-8">
          <div className="card h-100">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h6 className="mb-0 fw-bold" style={{ fontSize: '0.85rem' }}><i className="bi bi-graph-up me-1"></i>점수 추이</h6>
                <div className="d-flex align-items-center gap-2">
                  <div className="btn-group btn-group-sm">
                    <button className={`btn ${chartMode === 'single' ? 'btn-primary' : 'btn-outline-secondary'}`}
                      style={{ padding: '2px 10px', fontSize: '0.72rem' }} onClick={() => setChartMode('single')}>카테고리별</button>
                    <button className={`btn ${chartMode === 'compare' ? 'btn-primary' : 'btn-outline-secondary'}`}
                      style={{ padding: '2px 10px', fontSize: '0.72rem' }} onClick={() => setChartMode('compare')}>전체 비교</button>
                  </div>
                </div>
              </div>
              {chartMode === 'single' && (
                <div className="d-flex gap-1 mt-2 flex-wrap">
                  {availableCategories.map(c => (
                    <button key={c.key} className="btn btn-sm" onClick={() => setCategory(c.key)}
                      style={{
                        padding: '2px 10px', fontSize: '0.72rem', borderRadius: 50,
                        background: category === c.key ? c.color : 'transparent',
                        color: category === c.key ? '#fff' : 'var(--text-muted)',
                        border: category === c.key ? 'none' : '1px solid var(--border)',
                        fontWeight: category === c.key ? 600 : 400,
                      }}>{c.label}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="card-body" style={{ height: 260 }}>
              {activeLineData
                ? <Line data={activeLineData} options={lineOptions as never} />
                : <div className="text-center text-muted py-5">데이터가 없습니다</div>}
            </div>
          </div>
        </div>

        {/* 도넛 차트 */}
        <div className="col-lg-4">
          <div className="card mb-3">
            <div className="card-header"><h6 className="mb-0 fw-bold" style={{ fontSize: '0.85rem' }}><i className="bi bi-pie-chart me-1"></i>결과 분포</h6></div>
            <div className="card-body" style={{ height: 160 }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h6 className="mb-0 fw-bold" style={{ fontSize: '0.85rem' }}><i className="bi bi-diagram-3 me-1"></i>카테고리별 수행률</h6></div>
            <div className="card-body" style={{ height: 160 }}>
              <Doughnut data={categoryDoughnut} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* 테스트 이력 테이블 */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h6 className="mb-0 fw-bold" style={{ fontSize: '0.85rem' }}>테스트 이력</h6>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted" style={{ fontSize: '0.78rem' }}>{filtered.length}건</span>
              <select className="form-select form-select-sm" style={{ width: 130, fontSize: '0.78rem' }}
                value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
                <option value="">전체 날짜</option>
                {dates.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <div className="d-flex gap-1">
                {availableCategories.map(c => (
                  <button key={c.key} className="btn btn-sm" onClick={() => setCategory(c.key)}
                    style={{
                      padding: '1px 8px', fontSize: '0.68rem', borderRadius: 50,
                      background: category === c.key ? c.color : 'transparent',
                      color: category === c.key ? '#fff' : 'var(--text-muted)',
                      border: category === c.key ? 'none' : '1px solid var(--border)',
                    }}>{c.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="card-body p-0"><div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead><tr>
              <th style={{ width: 40 }}>#</th>
              <th>테스트명</th>
              <th className="text-center">카테고리</th>
              <th className="text-center">날짜</th>
              <th className="text-center">점수</th>
              <th className="text-center">백분율</th>
              <th className="text-center">결과</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={7} className="text-center text-muted py-4">테스트 기록 없음</td></tr>
                : filtered.map((t, i) => {
                  const rs = RESULT_STYLE[t.result || ''];
                  const pct = t.totalScore > 0 ? Math.round((t.score / t.totalScore) * 100) : 0;
                  const cat = CATEGORIES.find(c => c.key !== 'all' && t.testName.includes(c.key));
                  return (
                    <tr key={t.id}>
                      <td className="text-muted">{i + 1}</td>
                      <td className="fw-semibold" style={{ fontSize: '0.82rem' }}>{t.testName}</td>
                      <td className="text-center">
                        {cat ? <span className="badge" style={{ background: cat.color + '18', color: cat.color, fontSize: '0.68rem' }}>{cat.label}</span>
                          : <span className="text-muted" style={{ fontSize: '0.72rem' }}>기타</span>}
                      </td>
                      <td className="text-center text-muted" style={{ fontSize: '0.8rem' }}>{t.date}</td>
                      <td className="text-center" style={{ fontSize: '0.82rem' }}>{t.score}<span className="text-muted">/{t.totalScore}</span></td>
                      <td className="text-center">
                        <div className="d-inline-flex align-items-center gap-1">
                          <div className="progress" style={{ height: 5, width: 40 }}><div className="progress-bar bg-success" style={{ width: `${pct}%` }}></div></div>
                          <span className="fw-bold" style={{ fontSize: '0.78rem', color: pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626' }}>{pct}%</span>
                        </div>
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
    </div>
  );
}
