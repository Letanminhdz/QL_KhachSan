import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUI } from "../contexts/UIContext";

export default function Auth() {
  const [activeTab, setActiveTab] = useState("login"); // 'login' or 'register'
  const { showToast, loginUser } = useUI();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ email: "", mat_khau: "" });
  const [regForm, setRegForm] = useState({ ho_ten: "", email: "", so_dien_thoai: "", mat_khau: "", xac_nhan: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();

      if (res.ok) {
        showToast("Đăng nhập thành công!", "success");
        loginUser(data.user, data.access_token);
        navigate("/");
      } else {
        showToast(data.message || "Đăng nhập thất bại", "error");
      }
    } catch (err) {
      showToast("Không thể kết nối máy chủ", "error");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regForm.mat_khau !== regForm.xac_nhan) {
      return showToast("Mật khẩu xác nhận không khớp!", "warning");
    }
    
    try {
      const res = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(regForm)
      });
      const data = await res.json();

      if (res.ok) {
        showToast("Đăng ký thành công!", "success");
        loginUser(data.user, data.access_token);
        navigate("/");
      } else {
        showToast(data.message || "Vui lòng kiểm tra lại thông tin", "error");
      }
    } catch (err) {
      showToast("Không thể kết nối máy chủ", "error");
    }
  };

  return (
    <main className="flex-grow bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-center">
            <svg
              className="w-12 h-12 mx-auto text-primary-500 mb-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                clipRule="evenodd"
              ></path>
            </svg>
            <h2 className="text-2xl font-extrabold text-white">ROYAL HOTEL</h2>
            <p className="text-slate-400 text-sm mt-1">
              Hệ thống đặt phòng & quản trị
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "login" ? "text-primary-600 border-b-2 border-primary-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
              </svg>
              Đăng nhập
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "register" ? "text-primary-600 border-b-2 border-primary-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
              Đăng ký
            </button>
          </div>

          <div className="p-6">
            {/* Login Form */}
            {activeTab === "login" && (
              <div>
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <input
                        type="email"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="vidu@hotel.com"
                        required
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                        </svg>
                      </div>
                      <input
                        type="password"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="••••••••"
                        required
                        value={loginForm.mat_khau}
                        onChange={(e) => setLoginForm({...loginForm, mat_khau: e.target.value})}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all cursor-pointer"
                  >
                    Đăng nhập
                  </button>
                </form>
              </div>
            )}

            {/* Register Form */}
            {activeTab === "register" && (
              <div>
                <form className="space-y-4" onSubmit={handleRegister}>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Nguyễn Văn A"
                        required
                        value={regForm.ho_ten}
                        onChange={(e) => setRegForm({...regForm, ho_ten: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="email@..."
                        required
                        value={regForm.email}
                        onChange={(e) => setRegForm({...regForm, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="0912..."
                        required
                        value={regForm.so_dien_thoai}
                        onChange={(e) => setRegForm({...regForm, so_dien_thoai: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Mật khẩu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="••••••••"
                        required
                        value={regForm.mat_khau}
                        onChange={(e) => setRegForm({...regForm, mat_khau: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Xác nhận MK <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="••••••••"
                        required
                        value={regForm.xac_nhan}
                        onChange={(e) => setRegForm({...regForm, xac_nhan: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="agree"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                      required
                      defaultChecked
                    />
                    <label
                      htmlFor="agree"
                      className="ml-2 block text-xs text-slate-500"
                    >
                      Tôi đồng ý với điều khoản dịch vụ của Royal Hotel.
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all cursor-pointer"
                  >
                    Hoàn tất đăng ký
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
