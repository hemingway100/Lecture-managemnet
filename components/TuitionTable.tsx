'use client';
import { useState } from 'react';

interface Payment {
  id: number;
  amount: number;
  month: string;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  student: { name: string; phone: string | null; grade: string | null };
  course: { name: string };
}

const PAY_MAP: Record<string, [string, string]> = {
  paid: ['납부', 'bg-success'], unpaid: ['미납', 'bg-danger'],
  partial: ['부분납부', 'bg-warning text-dark'], refunded: ['환불', 'bg-secondary'],
};
const METHOD_MAP: Record<string, string> = { cash: '현금', card: '카드', transfer: '이체' };

export default function TuitionTable({
  payments, month, markAsPaidAction, deleteAction,
}: {
  payments: Payment[];
  month: string;
  markAsPaidAction: (id: number, month: string) => Promise<void>;
  deleteAction: (id: number, month: string) => Promise<void>;
}) {
  const [gradeFilter, setGradeFilter] = useState('');

  // 학년 목록 추출
  const grades = [...new Set(payments.map(p => p.student.grade).filter(Boolean))].sort() as string[];

  const filtered = gradeFilter
    ? payments.filter(p => p.student.grade === gradeFilter)
    : payments;

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0" style={{ fontSize: '0.85rem' }}>납부 내역</h6>
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>{filtered.length}건</span>
            {grades.length > 0 && (
              <select className="form-select form-select-sm" style={{ width: 100, fontSize: '0.78rem' }}
                value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}>
                <option value="">전체 학년</option>
                {grades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            )}
          </div>
        </div>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>학생</th>
                <th className="text-center">학년</th>
                <th>강의</th>
                <th className="text-center">금액</th>
                <th className="text-center">납부일</th>
                <th className="text-center">방법</th>
                <th className="text-center">상태</th>
                <th className="text-center" style={{ width: 80 }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-muted py-4">{month} 데이터 없음</td></tr>
              ) : filtered.map(p => {
                const [pl, pc] = PAY_MAP[p.status] || ['?', 'bg-secondary'];
                return (
                  <tr key={p.id}>
                    <td className="fw-semibold">{p.student.name}</td>
                    <td className="text-center">
                      {p.student.grade
                        ? <span className="badge bg-light text-dark border" style={{ fontSize: '0.7rem' }}>{p.student.grade}</span>
                        : <span className="text-muted">-</span>}
                    </td>
                    <td className="text-muted">{p.course.name}</td>
                    <td className="text-center">{p.amount.toLocaleString()}원</td>
                    <td className="text-center text-muted" style={{ fontSize: '0.8rem' }}>
                      {typeof p.paymentDate === 'string' ? p.paymentDate.slice(0, 10) : new Date(p.paymentDate).toISOString().slice(0, 10)}
                    </td>
                    <td className="text-center text-muted" style={{ fontSize: '0.8rem' }}>{METHOD_MAP[p.paymentMethod] || '-'}</td>
                    <td className="text-center"><span className={`badge ${pc}`}>{pl}</span></td>
                    <td className="text-center">
                      <div className="d-flex gap-1 justify-content-center">
                        {p.status === 'unpaid' && (
                          <form action={() => markAsPaidAction(p.id, month)}>
                            <button className="btn btn-sm btn-outline-success py-0 px-1"><i className="bi bi-check"></i></button>
                          </form>
                        )}
                        <form action={() => deleteAction(p.id, month)}>
                          <button className="btn btn-sm btn-outline-danger py-0 px-1"><i className="bi bi-trash"></i></button>
                        </form>
                      </div>
                    </td>
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
