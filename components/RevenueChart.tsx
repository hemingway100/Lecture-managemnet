'use client';
import { useState, useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

interface ChartDataItem { month: string; paid: number; unpaid: number }
type DataFilter = 'all' | 'paid' | 'unpaid';
type ChartType = 'line' | 'bar';

export default function RevenueChart({ data }: { data: ChartDataItem[] }) {
  const [dataFilter, setDataFilter] = useState<DataFilter>('all');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null); // 1~12, null=전체

  const labels = data.map(d => `${parseInt(d.month.split('-')[1])}월`);

  // 선택된 월 하이라이트용
  const highlightIndex = selectedMonth !== null ? selectedMonth - 1 : null;

  const datasets = useMemo(() => {
    const sets = [];
    const alpha = (i: number) => {
      if (selectedMonth === null) return 1;
      return i === highlightIndex ? 1 : 0.2;
    };

    if (dataFilter === 'all' || dataFilter === 'paid') {
      if (chartType === 'line') {
        sets.push({
          label: '납부',
          data: data.map(d => d.paid),
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.08)',
          borderWidth: 2.5,
          pointRadius: data.map((_, i) => highlightIndex === i ? 8 : 4),
          pointBackgroundColor: data.map((_, i) => alpha(i) === 1 ? '#22c55e' : 'rgba(34,197,94,0.25)'),
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 8,
          tension: 0.35,
          fill: true,
          segment: {
            borderColor: (ctx: { p0DataIndex: number; p1DataIndex: number }) => {
              if (selectedMonth === null) return '#22c55e';
              const near = ctx.p0DataIndex === highlightIndex || ctx.p1DataIndex === highlightIndex;
              return near ? '#22c55e' : 'rgba(34,197,94,0.2)';
            },
          },
        });
      } else {
        sets.push({
          label: '납부',
          data: data.map(d => d.paid),
          backgroundColor: data.map((_, i) => alpha(i) === 1 ? '#22c55e' : 'rgba(34,197,94,0.15)'),
          borderColor: data.map((_, i) => alpha(i) === 1 ? '#16a34a' : 'rgba(34,197,94,0.15)'),
          borderWidth: 1, borderRadius: 4,
        });
      }
    }

    if (dataFilter === 'all' || dataFilter === 'unpaid') {
      if (chartType === 'line') {
        sets.push({
          label: '미납',
          data: data.map(d => d.unpaid),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.06)',
          borderWidth: 2.5,
          pointRadius: data.map((_, i) => highlightIndex === i ? 8 : 4),
          pointBackgroundColor: data.map((_, i) => alpha(i) === 1 ? '#ef4444' : 'rgba(239,68,68,0.25)'),
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 8,
          tension: 0.35,
          fill: true,
          segment: {
            borderColor: (ctx: { p0DataIndex: number; p1DataIndex: number }) => {
              if (selectedMonth === null) return '#ef4444';
              const near = ctx.p0DataIndex === highlightIndex || ctx.p1DataIndex === highlightIndex;
              return near ? '#ef4444' : 'rgba(239,68,68,0.2)';
            },
          },
        });
      } else {
        sets.push({
          label: '미납',
          data: data.map(d => d.unpaid),
          backgroundColor: data.map((_, i) => alpha(i) === 1 ? '#ef4444' : 'rgba(239,68,68,0.15)'),
          borderColor: data.map((_, i) => alpha(i) === 1 ? '#dc2626' : 'rgba(239,68,68,0.15)'),
          borderWidth: 1, borderRadius: 4,
        });
      }
    }

    return sets;
  }, [data, dataFilter, chartType, selectedMonth, highlightIndex]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' as const },
    onClick: (_: unknown, elements: Array<{ index: number }>) => {
      if (elements.length > 0) {
        const idx = elements[0].index;
        setSelectedMonth(prev => prev === idx + 1 ? null : idx + 1);
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#18181b', titleFont: { size: 12 }, bodyFont: { size: 12 },
        padding: 10, cornerRadius: 8,
        callbacks: {
          label: (ctx: { dataset: { label?: string }; parsed: { y: number } }) =>
            `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}원`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#a1a1aa' }, border: { display: false } },
      y: {
        grid: { color: '#f4f4f5' }, border: { display: false },
        ticks: {
          font: { size: 11 }, color: '#a1a1aa',
          callback: (value: number | string) => {
            const n = typeof value === 'string' ? parseInt(value) : value;
            return n >= 10000 ? `${(n / 10000).toFixed(0)}만` : n.toLocaleString();
          },
        },
      },
    },
  };

  const dataFilters: { key: DataFilter; label: string; color: string }[] = [
    { key: 'all', label: '전체', color: 'var(--brand)' },
    { key: 'paid', label: '납부', color: '#22c55e' },
    { key: 'unpaid', label: '미납', color: '#ef4444' },
  ];

  // 선택 월 요약
  const selectedData = selectedMonth !== null ? data[selectedMonth - 1] : null;

  const ChartComponent = chartType === 'line' ? Line : Bar;

  return (
    <div>
      {/* 컨트롤 바 */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-1">
          {dataFilters.map(f => (
            <button key={f.key} className="btn btn-sm" onClick={() => setDataFilter(f.key)}
              style={{
                padding: '3px 12px', fontSize: '0.73rem', borderRadius: 50,
                background: dataFilter === f.key ? f.color : 'transparent',
                color: dataFilter === f.key ? '#fff' : 'var(--text-muted)',
                border: dataFilter === f.key ? 'none' : '1px solid var(--border)',
                fontWeight: dataFilter === f.key ? 600 : 400,
              }}>{f.label}</button>
          ))}
        </div>
        <div className="d-flex align-items-center gap-2">
          {/* 월 선택 */}
          <select className="form-select form-select-sm" style={{ width: 80, fontSize: '0.75rem' }}
            value={selectedMonth ?? ''} onChange={e => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}>
            <option value="">전체</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}월</option>
            ))}
          </select>
          {/* 차트 유형 토글 */}
          <div className="btn-group btn-group-sm">
            <button className={`btn ${chartType === 'line' ? 'btn-primary' : 'btn-outline-secondary'}`}
              style={{ padding: '3px 8px', fontSize: '0.72rem' }} onClick={() => setChartType('line')}>
              <i className="bi bi-graph-up"></i>
            </button>
            <button className={`btn ${chartType === 'bar' ? 'btn-primary' : 'btn-outline-secondary'}`}
              style={{ padding: '3px 8px', fontSize: '0.72rem' }} onClick={() => setChartType('bar')}>
              <i className="bi bi-bar-chart"></i>
            </button>
          </div>
        </div>
      </div>

      {/* 선택 월 요약 */}
      {selectedData && (
        <div className="d-flex gap-3 mb-2 p-2 rounded" style={{ background: 'var(--bg-body)', fontSize: '0.78rem' }}>
          <span className="fw-semibold">{selectedMonth}월</span>
          <span>납부: <span className="fw-bold" style={{ color: '#22c55e' }}>{selectedData.paid.toLocaleString()}원</span></span>
          <span>미납: <span className="fw-bold" style={{ color: '#ef4444' }}>{selectedData.unpaid.toLocaleString()}원</span></span>
          <button className="btn btn-sm p-0 border-0 text-muted ms-auto" style={{ fontSize: '0.72rem' }}
            onClick={() => setSelectedMonth(null)}>초기화</button>
        </div>
      )}

      {/* 범례 */}
      <div className="d-flex gap-3 mb-2" style={{ fontSize: '0.73rem' }}>
        {(dataFilter === 'all' || dataFilter === 'paid') && (
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>납부
          </span>
        )}
        {(dataFilter === 'all' || dataFilter === 'unpaid') && (
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>미납
          </span>
        )}
      </div>

      {/* 차트 */}
      <div style={{ height: 240 }}>
        <ChartComponent data={{ labels, datasets: datasets as never }} options={options as never} />
      </div>
    </div>
  );
}
