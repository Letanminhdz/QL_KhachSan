import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUI } from "../contexts/UIContext";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user } = useUI();

  const isActive = (path) => currentPath === path;

  return (
    <>
      <nav className="sticky top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <span className="truncate">
                ROYAL <span className="text-primary-600">HOTEL</span>
              </span>
            </Link>
          </div>

          {/* Center Menu (Desktop) */}
          <div className="hidden lg:flex space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md transition-colors font-bold ${isActive("/") ? "text-primary-600" : "text-slate-600 hover:text-primary-500"}`}
            >
              Trang Chủ
            </Link>
            <Link
              to="/tim-phong"
              className={`px-3 py-2 rounded-md transition-colors font-bold ${isActive("/tim-phong") ? "text-primary-600" : "text-slate-600 hover:text-primary-500"}`}
            >
              Tìm Phòng
            </Link>
            <Link
              to="/dat-dich-vu"
              className={`px-3 py-2 rounded-md transition-colors font-bold ${isActive("/dat-dich-vu") ? "text-primary-600" : "text-slate-600 hover:text-primary-500"}`}
            >
              Dịch Vụ
            </Link>
            <Link
              to="/khuyen-mai"
              className={`px-3 py-2 rounded-md transition-colors font-bold ${isActive("/khuyen-mai") ? "text-primary-600" : "text-slate-600 hover:text-primary-500"}`}
            >
              Khuyến Mãi
            </Link>
            <Link
              to="/lien-he"
              className={`px-3 py-2 rounded-md transition-colors font-bold ${isActive("/lien-he") ? "text-primary-600" : "text-slate-600 hover:text-primary-500"}`}
            >
              Liên Hệ
            </Link>
          </div>

          {/* Right Menu (Desktop) */}
          <div className="hidden lg:flex items-center space-x-3">
            {user?.vai_tro === 'Admin' && (
              <Link
                to="/admin/so-do-phong"
                className="text-sm font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-700 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-full border border-amber-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Trang Quản Trị
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/tai-khoan"
                  title="Xem thông tin tài khoản"
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all ring-2 ring-white cursor-pointer"
                >
                  {user.ho_ten.charAt(0).toUpperCase()}
                </Link>
              </div>
            ) : (
              <Link
                to="/dang-nhap"
                className="text-sm font-bold text-slate-700 hover:text-primary-600 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-primary-50"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
                Đăng Nhập
              </Link>
            )}

          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-500 hover:text-slate-900 focus:outline-none p-2"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>

      {/* Mobile Menu Overlay & Panel */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 lg:hidden transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-[280px] bg-white z-[60] shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <span className="font-extrabold text-slate-900 flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-600 text-white rounded flex items-center justify-center text-xs">R</div>
            MENU
          </span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-800 p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-4 py-3.5 text-base rounded-xl font-bold ${isActive("/") ? "text-primary-600 bg-primary-50" : "text-slate-700 hover:text-primary-600 hover:bg-slate-50"}`}
          >
            Trang Chủ
          </Link>
          <Link
            to="/tim-phong"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-4 py-3.5 text-base rounded-xl font-bold ${isActive("/tim-phong") ? "text-primary-600 bg-primary-50" : "text-slate-700 hover:text-primary-600 hover:bg-slate-50"}`}
          >
            Tìm Phòng
          </Link>
          <Link
            to="/dat-dich-vu"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-4 py-3.5 text-base rounded-xl font-bold ${isActive("/dat-dich-vu") ? "text-primary-600 bg-primary-50" : "text-slate-700 hover:text-primary-600 hover:bg-slate-50"}`}
          >
            Dịch Vụ
          </Link>
          <Link
            to="/khuyen-mai"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-4 py-3.5 text-base rounded-xl font-bold ${isActive("/khuyen-mai") ? "text-primary-600 bg-primary-50" : "text-slate-700 hover:text-primary-600 hover:bg-slate-50"}`}
          >
            Khuyến Mãi
          </Link>
          <Link
            to="/lien-he"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-4 py-3.5 text-base rounded-xl font-bold ${isActive("/lien-he") ? "text-primary-600 bg-primary-50" : "text-slate-700 hover:text-primary-600 hover:bg-slate-50"}`}
          >
            Liên Hệ
          </Link>

          <div className="border-t border-slate-100 my-4 pt-4 flex flex-col gap-3">
            {user?.vai_tro === 'Admin' && (
              <Link
                to="/admin/so-do-phong"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-3 py-3.5 text-base font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors border border-amber-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Trang Quản Trị
              </Link>
            )}

            {user ? (
              <Link
                to="/tai-khoan"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3.5 text-base font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors border border-slate-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold shadow-sm">
                  {user.ho_ten.charAt(0).toUpperCase()}
                </div>
                Chi Tiết Tài Khoản
              </Link>
            ) : (
              <Link
                to="/dang-nhap"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-3 py-3.5 text-base font-bold text-slate-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors border border-slate-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                Đăng Nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
