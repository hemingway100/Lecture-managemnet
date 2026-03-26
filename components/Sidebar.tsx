'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const menu = [
  { category: null, items: [
    { href: '/', icon: 'bi-grid-1x2', label: '대시보드' },
  ]},
  { category: '학생', items: [
    { href: '/students', icon: 'bi-people', label: '학생 목록' },
    { href: '/students/new', icon: 'bi-person-plus', label: '학생 등록' },
  ]},
  { category: '수업', items: [
    { href: '/courses', icon: 'bi-bookmark', label: '강의 관리' },
    { href: '/attendance', icon: 'bi-clipboard-check', label: '출결 관리' },
    { href: '/tests', icon: 'bi-pencil-square', label: '테스트/성적' },
    { href: '/materials', icon: 'bi-file-earmark-text', label: '자료/영상' },
  ]},
  { category: '보충/상담', items: [
    { href: '/clinic', icon: 'bi-calendar2-check', label: '클리닉' },
    { href: '/counseling', icon: 'bi-chat-left-text', label: '상담' },
  ]},
  { category: '정산', items: [
    { href: '/tuition', icon: 'bi-wallet2', label: '원비 정산' },
  ]},
  { category: '분석', items: [
    { href: '/reports', icon: 'bi-bar-chart-line', label: '리포트' },
    { href: '/messages', icon: 'bi-send', label: '문자 이력' },
  ]},
];

export default function Sidebar() {
  const pathname = usePathname() || '/';

  function isItemActive(href: string) {
    if (href === '/') return pathname === '/';
    const allHrefs = menu.flatMap(s => s.items.map(i => i.href)).filter(h => h !== '/');
    const matching = allHrefs.filter(h => pathname === h || pathname.startsWith(h + '/'));
    if (matching.length === 0) return false;
    const best = matching.sort((a, b) => b.length - a.length)[0];
    return href === best;
  }

  function isSectionActive(items: typeof menu[0]['items']) {
    return items.some(item => isItemActive(item.href));
  }

  function getOpenSections() {
    const open = new Set<number>();
    menu.forEach((s, i) => {
      if (!s.category) return;
      if (isSectionActive(s.items)) open.add(i);
    });
    return open;
  }

  const [openSections, setOpenSections] = useState<Set<number>>(getOpenSections);
  useEffect(() => { setOpenSections(getOpenSections()); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggle(i: number) {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  return (
    <div className="sidebar">
      {/* 로고 */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <i className="bi bi-mortarboard-fill"></i>
        </div>
        <span className="sidebar-logo-text">수강생 관리</span>
      </div>

      {/* 메뉴 */}
      <nav style={{ flex: 1, paddingBottom: 16 }}>
        {menu.map((section, si) => {
          // 대시보드 (카테고리 없음)
          if (!section.category) {
            return section.items.map(item => (
              <div key={item.href} style={{ padding: '12px 0 0' }}>
                <Link href={item.href} className={`sidebar-item ${isItemActive(item.href) ? 'active' : ''}`}>
                  <i className={`bi ${item.icon}`}></i>
                  <span>{item.label}</span>
                </Link>
              </div>
            ));
          }

          const isOpen = openSections.has(si);

          return (
            <div key={si}>
              <div className="sidebar-category" onClick={() => toggle(si)}>
                <span>{section.category}</span>
                <i className={`bi bi-chevron-down chevron ${isOpen ? 'open' : ''}`}></i>
              </div>
              {isOpen && (
                <div className="sidebar-submenu">
                  {section.items.map(item => (
                    <Link key={item.href} href={item.href}
                      className={`sidebar-item ${isItemActive(item.href) ? 'active' : ''}`}>
                      <i className={`bi ${item.icon}`}></i>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
