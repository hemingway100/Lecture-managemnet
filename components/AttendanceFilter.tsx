'use client';
import { useState, useMemo } from 'react';

interface AttendanceItem {
  id: number;
  date: string; // ISO string
  status: string;
  reason: string | null;
  course: { name: string };
}

const STATUS_MAP: Record<string, [string, string]> = {
  present: ['출석', 'bg-success'],
  late: ['지각', 'bg-warning text-dark'],
  absent: ['결석', 'bg-danger'],
};

export default function AttendanceFilter({ data }: { data: AttendanceItem[] }) {
  const [period, setPeriod] = useState<'10days' | 'month'>('10days');
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [statusFilter, setStatusFilter] = useState('');

  // 사용 가능한 월 목록
  const months = useMemo(() => {
    const set = new Set(data.map(a => a.date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [data]);

  const filtered = useMemo(() => {
    let list = data;

    // 기간 필터
    if (period === '10days') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 10);
      list = list.filter(a => new Date(a.date) >= cutoff);
    } else {
      list = list.filter(a => a.date.slice(0, 7) === selectedMonth);
    }

    // 출결 상태 필터
    if (statusFilter) {
      list = list.filter(a => a.status === statusFilter);
    }

    return list;
  }, [data, period, selectedMonth, statusFilter]);

  // 통계
  const stats = useMemo(() => {
    const total = filtered.length;
    const present = filtered.filter(a => a.status === 'present').length;
    const late = filtered.filter(a => a.status === 'late').length;
    const absent = filtered.filter(a => a.status === 'absent').length;
    return { total, present, late, absent, rate: total > 0 ? Math.round((present / total) * 100) : 0 };
  }, [filtered]);

  return (
    <div className="card mb-3">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h6 className="mb-0 fw-bold" style={{ fontSize: '0.88rem' }}>
            <i className="bi bi-clipboard-check me-1"></i>출결 현황
          </h6>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* 기간 선택 */}
            <div className="btn-group btn-group-sm">
              <button className={`btn ${period === '10days' ? 'btn-primary' : 'btn-outline-secondary'}`}
                style={{ fontSize: '0.75rem' }} onClick={() => setPeriod('10days')}>최근 10일</button>
              <button className={`btn ${period === 'month' ? 'btn-primary' : 'btn-outline-secondary'}`}
                style={{ fontSize: '0.75rem' }} onClick={() => setPeriod('month')}>월별</button>
            </div>

            {/* 월 선택 */}
            {period === 'month' && (
              <select className="form-select form-select-sm" style={{ width: 120, fontSize: '0.78rem' }}
                value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            )}

            {/* 출결 상태 필터 */}
            <select className="form-select form-select-sm" style={{ width: 90, fontSize: '0.78rem' }}
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">전체</option>
              <option value="present">출석</option>
              <option value="late">지각</option>
              <option value="absent">결석</option>
            </select>
          </div>
        </div>

        {/* 미니 통계 */}
        <div className="d-flex gap-3 mt-2" style={{ fontSize: '0.78rem' }}>
          <span>출석률 <strong style={{ color: stats.rate >= 90 ? '#16a34a' : stats.rate >= 70 ? '#d97706' : '#dc2626' }}>{stats.rate}%</strong></span>
          <span className="text-muted">|</span>
          <span>출석 <strong className="text-success">{stats.present}</strong></span>
          <span>지각 <strong className="text-warning">{stats.late}</strong></span>
          <span>결석 <strong className="text-danger">{stats.absent}</strong></span>
          <span className="text-muted">총 {stats.total}건</span>
        </div>
      </div>

      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr><th>날짜</th><th>강의</th><th className="text-center">상태</th><th>사유</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-muted py-4">출결 기록이 없습니다</td></tr>
              ) : filtered.map(a => {
                const [label, cls] = STATUS_MAP[a.status] || ['?', 'bg-secondary'];
                return (
                  <tr key={a.id}>
                    <td style={{ fontSize: '0.82rem' }}>{a.date.slice(0, 10)}</td>
                    <td style={{ fontSize: '0.82rem' }}>{a.course.name}</td>
                    <td className="text-center"><span className={`badge ${cls}`}>{label}</span></td>
                    <td className="text-muted" style={{ fontSize: '0.82rem' }}>{a.reason || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
