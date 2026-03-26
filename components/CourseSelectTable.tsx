'use client';
import { useState } from 'react';

interface Course {
  id: number;
  name: string;
  schedule: string | null;
  tuition: number;
}

export default function CourseSelectTable({ courses }: { courses: Course[] }) {
  const [discounts, setDiscounts] = useState<Record<number, number>>({});
  const [tuitions, setTuitions] = useState<Record<number, number>>(
    Object.fromEntries(courses.map(c => [c.id, c.tuition]))
  );

  function handleDiscount(courseId: number, baseTuition: number, discountPercent: number) {
    const clamped = Math.max(0, Math.min(100, discountPercent));
    setDiscounts(prev => ({ ...prev, [courseId]: clamped }));
    const calculated = Math.round(baseTuition * (1 - clamped / 100));
    setTuitions(prev => ({ ...prev, [courseId]: calculated }));
  }

  function handleTuitionDirect(courseId: number, value: number) {
    setTuitions(prev => ({ ...prev, [courseId]: value }));
    // 직접 입력 시 할인률 역계산
    const base = courses.find(c => c.id === courseId)?.tuition || 0;
    if (base > 0) {
      const disc = Math.round((1 - value / base) * 100);
      setDiscounts(prev => ({ ...prev, [courseId]: Math.max(0, Math.min(100, disc)) }));
    }
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr style={{ backgroundColor: '#f8f9fb' }}>
            <th style={{ width: 55 }} className="text-center border-0 py-3">선택</th>
            <th className="text-center border-0 py-3">강의명</th>
            <th className="text-center border-0 py-3">수업시간</th>
            <th className="text-center border-0 py-3">기본 원비</th>
            <th className="text-center border-0 py-3" style={{ width: 100 }}>할인률</th>
            <th className="text-center border-0 py-3">등록 원비</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(c => {
            const discount = discounts[c.id] || 0;
            const tuition = tuitions[c.id] ?? c.tuition;

            return (
              <tr key={c.id}>
                <td className="text-center">
                  <input type="checkbox" name="courses" value={c.id}
                    className="form-check-input" style={{ width: 20, height: 20 }} />
                </td>
                <td className="text-center">
                  <span style={{ fontSize: '0.85rem' }}>{c.name}</span>
                </td>
                <td className="text-center text-muted" style={{ fontSize: '0.82rem' }}>
                  {c.schedule || '-'}
                </td>
                <td className="text-center">
                  <span className="badge bg-light text-dark border" style={{ fontSize: '0.82rem' }}>
                    {c.tuition.toLocaleString()}원
                  </span>
                </td>
                <td className="text-center">
                  <div className="input-group input-group-sm mx-auto" style={{ width: 90 }}>
                    <input type="number" className="form-control text-center px-1"
                      value={discount} min={0} max={100}
                      onChange={e => handleDiscount(c.id, c.tuition, parseInt(e.target.value) || 0)} />
                    <span className="input-group-text px-2">%</span>
                  </div>
                </td>
                <td className="text-center">
                  <input type="number" name={`tuition_${c.id}`}
                    className="form-control form-control-sm mx-auto fw-semibold"
                    style={{ width: 130, textAlign: 'center' }}
                    value={tuition} min={0} step={10000}
                    onChange={e => handleTuitionDirect(c.id, parseInt(e.target.value) || 0)} />
                  {discount > 0 && (
                    <small className="text-danger" style={{ fontSize: '0.72rem' }}>
                      -{(c.tuition - tuition).toLocaleString()}원
                    </small>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
