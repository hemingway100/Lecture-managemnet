import Sidebar from '@/components/Sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="d-flex" id="wrapper">
      <Sidebar />
      <div id="page-content-wrapper" className="w-100">
        <header className="top-header">
          <div className="header-search">
            <i className="bi bi-search"></i>
            <input type="text" placeholder="검색..." />
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="user-menu-btn">
              <div className="user-avatar">김</div>
              <div className="d-none d-md-block text-start">
                <div className="user-name">김원장</div>
                <div className="user-role">관리자</div>
              </div>
            </div>
          </div>
        </header>
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
