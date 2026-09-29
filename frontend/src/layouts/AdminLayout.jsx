import { Outlet, Link, useLocation } from "react-router-dom";
import { useUI } from "../contexts/UIContext";
import { useState } from "react";

export default function AdminLayout() {
  const { user, logoutUser, showConfirm, showToast } = useUI();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const handleLogout = () => {
    showConfirm("Bạn có chắc chắn muốn đăng xuất?", async () => {
      logoutUser();
      showToast("Đã đăng xuất khỏi hệ thống", "success");
      window.location.href = "/dang-nhap";
    });
  };

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ to, icon, label }) => (
    <Link
      to={to}
      onClick={() => setIsMobileMenuOpen(false)}
      title={isSidebarCollapsed ? label : ""}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
        isActive(to) 
          ? "bg-primary-500 text-white shadow-md shadow-primary-500/30" 
          : "text-slate-600 hover:bg-slate-100 hover:text-primary-600"
      } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
    >
      <div className={isSidebarCollapsed ? "scale-110" : ""}>{icon}</div>
      {!isSidebarCollapsed && <span>{label}</span>}
    </Link>
  );

  return (
    <div className="h-screen overflow-hidden bg-slate-100 flex flex-col md:flex-row font-sans text-slate-800">
      {/* Mobile Topbar */}
      <div className="md:hidden bg-white border-b border-slate-200 flex items-center justify-between p-4 sticky top-0 z-50 shadow-sm">
        <Link to="/admin" className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-lg flex items-center justify-center">
            A
          </div>
          ADMIN PANEL
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop) / Mobile Menu */}
      <div className={`
        fixed inset-y-0 right-0 transform transition-transform duration-300 ease-in-out z-50 bg-white shadow-2xl flex flex-col
        ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}
        md:translate-x-0 md:static md:flex md:border-r md:border-slate-200 md:shadow-sm md:h-screen md:z-40 flex-shrink-0
        w-[280px] ${isSidebarCollapsed ? "md:w-20" : "md:w-64"}
      `}>
        {/* Mobile Close Button */}
        <div className="md:hidden p-4 border-b border-slate-100 flex justify-end bg-slate-50">
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-800 p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex absolute -right-3 top-8 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 hover:text-primary-600 shadow-sm z-50 cursor-pointer transition-transform duration-300"
          title="Thu gọn / Phóng to"
        >
          <svg className={`w-4 h-4 transform transition-transform ${isSidebarCollapsed ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        
        <div className={`p-6 hidden md:flex ${isSidebarCollapsed ? "justify-center px-0" : ""} items-center`}>
          <Link to="/admin" className="font-extrabold text-xl text-slate-900 flex items-center gap-2" title="ADMIN PANEL">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"></path></svg>
            </div>
            {!isSidebarCollapsed && <span>ADMIN</span>}
          </Link>
        </div>
        
        <div className="flex-1 px-4 py-4 md:py-0 space-y-2 overflow-y-auto">
          <NavItem 
            to="/admin/so-do-phong" 
            label="Sơ Đồ Phòng" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>} 
          />
          <NavItem 
            to="/admin" 
            label="Quản Lý Dữ Liệu" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>} 
          />

          <NavItem 
            to="/admin/dat-phong" 
            label="Đơn Đặt Phòng" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>} 
          />
          <NavItem 
            to="/admin/su-dung-dich-vu" 
            label="Đơn Dịch Vụ" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"></path></svg>} 
          />
          <NavItem 
            to="/admin/cau-hinh" 
            label="Cấu Hình Website" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>} 
          />
        </div>

        <div className="p-4 border-t border-slate-200 mt-auto">
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 flex-shrink-0">
                {user?.ho_ten ? user.ho_ten.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-800 truncate">{user?.ho_ten || 'Admin'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 cursor-help" title={user?.ho_ten || 'Admin'}>
                {user?.ho_ten ? user.ho_ten.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
          )}
          
          <button 
            onClick={handleLogout}
            title={isSidebarCollapsed ? "Đăng Xuất" : ""}
            className={`w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl font-bold transition-colors cursor-pointer ${isSidebarCollapsed ? "px-0" : "px-4"}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            {!isSidebarCollapsed && <span>Đăng Xuất</span>}
          </button>
          
          <Link 
            to="/" 
            title={isSidebarCollapsed ? "Về Trang Khách" : ""}
            className="w-full mt-2 flex items-center justify-center gap-2 px-2 py-2 text-sm text-slate-500 hover:text-primary-600 font-semibold transition-colors"
          >
            {isSidebarCollapsed ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            ) : (
              <span>Quay về Trang Khách</span>
            )}
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        <Outlet />
      </div>
    </div>
  );
}
