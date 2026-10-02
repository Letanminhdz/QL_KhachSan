import { useState, useEffect } from "react";
import { useUI } from "../contexts/UIContext";

export default function CauHinhWebsite() {
  const [activeTab, setActiveTab] = useState('lien-he');
  const [settings, setSettings] = useState({
    address: "", hotline: "", email: "", facebook: "", instagram: "", youtube: "", google_map: "", bank_name: "", bank_account: "", deposit_percentage: 30
  });
  const { showToast } = useUI();

  useEffect(() => {
    fetch("http://localhost:8000/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings({ ...settings, ...data }))
      .catch(() => showToast("Lỗi khi tải cấu hình", "error"));
  }, []);

  const handleUpdateSettings = (e) => {
    e.preventDefault();
    fetch("http://localhost:8000/api/settings", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json"
      },
      body: JSON.stringify(settings),
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        showToast("Đã lưu cấu hình thành công!", "success");
      })
      .catch((err) => showToast("Lỗi khi lưu cấu hình: " + err.message, "error"));
  };

  const handleSettingChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Cấu Hình Chung */}
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
            </svg>
            Cấu Hình Website
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Cập nhật thông tin hiển thị trên website như địa chỉ, liên hệ, mạng xã hội
          </p>
        </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 max-w-4xl">
          <div className="flex border-b border-slate-200 mb-6 gap-6">
            <button
              onClick={() => setActiveTab('lien-he')}
              className={`pb-3 font-bold text-sm transition-colors ${activeTab === 'lien-he' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Thông Tin Liên Hệ
            </button>
            <button
              onClick={() => setActiveTab('mang-xa-hoi')}
              className={`pb-3 font-bold text-sm transition-colors ${activeTab === 'mang-xa-hoi' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Mạng Xã Hội
            </button>
            <button
              onClick={() => setActiveTab('thanh-toan')}
              className={`pb-3 font-bold text-sm transition-colors ${activeTab === 'thanh-toan' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Thanh Toán & Đặt Cọc
            </button>
          </div>
          
          <form onSubmit={handleUpdateSettings} className="space-y-6">
            {activeTab === 'lien-he' && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Địa chỉ (Address)</label>
                    <input type="text" name="address" value={settings.address || ""} onChange={handleSettingChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Hotline</label>
                    <input type="text" name="hotline" value={settings.hotline || ""} onChange={handleSettingChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                    <input type="email" name="email" value={settings.email || ""} onChange={handleSettingChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Google Map URL (Embed)</label>
                  <input type="text" name="google_map" value={settings.google_map || ""} onChange={handleSettingChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="https://www.google.com/maps/embed?..." />
                </div>
              </div>
            )}

            {activeTab === 'mang-xa-hoi' && (
              <div className="grid grid-cols-1 gap-6 animate-fade-in">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Facebook URL</label>
                  <input type="text" name="facebook" value={settings.facebook || ""} onChange={handleSettingChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Instagram URL</label>
                  <input type="text" name="instagram" value={settings.instagram || ""} onChange={handleSettingChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">YouTube URL</label>
                  <input type="text" name="youtube" value={settings.youtube || ""} onChange={handleSettingChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
              </div>
            )}

            {activeTab === 'thanh-toan' && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Mã Ngân Hàng (VD: VCB, MB, TCB)</label>
                    <input type="text" name="bank_name" value={settings.bank_name || ""} onChange={handleSettingChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Nhập mã viết tắt..." />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Số tài khoản thụ hưởng</label>
                    <input type="text" name="bank_account" value={settings.bank_account || ""} onChange={handleSettingChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Nhập số tài khoản..." />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Cài đặt Đặt Cọc
                  </h3>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Phần trăm đặt cọc (%)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range" min="0" max="100" step="5"
                      name="deposit_percentage"
                      value={settings.deposit_percentage ?? 30}
                      onChange={e => setSettings({ ...settings, deposit_percentage: Number(e.target.value) })}
                      className="flex-1 accent-amber-500"
                    />
                    <div className="flex items-center border-2 border-amber-300 rounded-lg overflow-hidden">
                      <input
                        type="number" min="0" max="100"
                        name="deposit_percentage"
                        value={settings.deposit_percentage ?? 30}
                        onChange={e => setSettings({ ...settings, deposit_percentage: Number(e.target.value) })}
                        className="w-16 px-2 py-2 text-center font-bold text-amber-700 outline-none"
                      />
                      <span className="px-2 py-2 bg-amber-50 text-amber-600 font-bold text-sm border-l border-amber-200">%</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Khi nhân viên ấn "Đặt cọc" trong chi tiết đơn, hệ thống sẽ tự động tính {settings.deposit_percentage ?? 30}% tổng tiền đơn.</p>
                </div>
              </div>
            )}
            
            <div className="border-t border-slate-100 pt-6">
              <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-md transition-all flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                Lưu Cấu Hình
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
