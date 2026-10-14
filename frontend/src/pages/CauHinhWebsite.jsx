import { useState, useEffect } from "react";
import { useUI } from "../contexts/UIContext";

export default function CauHinhWebsite() {
  const [activeTab, setActiveTab] = useState('lien-he');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [settings, setSettings] = useState({
    address: "",
    hotline: "",
    email: "",
    facebook: "",
    instagram: "",
    youtube: "",
    google_map: "",
    bank_name: "",
    bank_account: "",
    deposit_percentage: 25,
    // AI Chatbot Settings
    ai_enabled: true,
    ai_provider: "gemini",
    gemini_api_key: "",
    gemini_model: "gemini-2.5-flash",
    openai_api_key: "",
    openai_model: "gpt-4o-mini",
  });
  const { showToast } = useUI();

  useEffect(() => {
    fetch("http://localhost:8000/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings((prev) => ({
          ...prev,
          ...data,
          ai_enabled: data.ai_enabled !== undefined ? !!data.ai_enabled : true,
          ai_provider: data.ai_provider || "gemini",
          gemini_model: data.gemini_model || "gemini-2.5-flash",
          openai_model: data.openai_model || "gpt-4o-mini",
        }));
      })
      .catch(() => showToast("Lỗi khi tải cấu hình", "error"));
  }, []);

  const handleUpdateSettings = (e) => {
    if (e) e.preventDefault();
    fetch("http://localhost:8000/api/settings", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json"
      },
      body: JSON.stringify(settings),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(() => {
        showToast("Đã lưu cấu hình thành công!", "success");
      })
      .catch((err) => showToast("Lỗi khi lưu cấu hình: " + err.message, "error"));
  };

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTestAi = async () => {
    setIsTestingAi(true);
    try {
      // Lưu tạm cấu hình trước rồi gửi test message
      await fetch("http://localhost:8000/api/settings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Accept": "application/json"
        },
        body: JSON.stringify(settings),
      });

      const res = await fetch("http://localhost:8000/api/chat-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Xin chào, hãy giới thiệu ngắn về bạn" }),
      });

      const data = await res.json();
      if (data.reply) {
        showToast(`Kết nối AI thành công! Nguồn: ${data.source === "ai" ? "Trí tuệ nhân tạo (LLM)" : "Dự phòng (Fallback)"}`, "success");
      } else {
        throw new Error("Không nhận được phản hồi");
      }
    } catch (err) {
      showToast("Lỗi kiểm tra AI: " + err.message, "error");
    } finally {
      setIsTestingAi(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 overflow-y-auto h-full">
      {/* Tiêu đề trang */}
      <div>
        <div className="mb-6">
          <div className="flex-1 min-w-0 w-full md:w-auto">
            <h1 className="text-lg md:text-2xl font-extrabold text-slate-900 flex items-center gap-2 max-w-full min-w-0 w-full">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-primary-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
              </svg>
              <span className="truncate">Cấu Hình Website & Hệ Thống</span>
            </h1>
            <p className="hidden md:block text-slate-500 text-sm mt-1">
              Quản lý thông tin liên hệ, thanh toán đặt cọc và cấu hình mô hình AI tư vấn phòng
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 max-w-4xl">
          {/* Tabs Menu */}
          <div className="flex border-b border-slate-200 mb-6 gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('lien-he')}
              className={`pb-3 font-bold text-sm transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'lien-he' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Thông Tin Liên Hệ
            </button>
            <button
              onClick={() => setActiveTab('mang-xa-hoi')}
              className={`pb-3 font-bold text-sm transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'mang-xa-hoi' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Mạng Xã Hội
            </button>
            <button
              onClick={() => setActiveTab('thanh-toan')}
              className={`pb-3 font-bold text-sm transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'thanh-toan' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Thanh Toán & Đặt Cọc
            </button>
            <button
              onClick={() => setActiveTab('ai-chatbot')}
              className={`pb-3 font-bold text-sm transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${activeTab === 'ai-chatbot' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span>🤖</span> Cấu Hình Bot AI
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                Mới
              </span>
            </button>
          </div>
          
          <form onSubmit={handleUpdateSettings} className="space-y-6">
            {/* Tab 1: Liên hệ */}
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

            {/* Tab 2: Mạng xã hội */}
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

            {/* Tab 3: Thanh toán & đặt cọc */}
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
                      value={settings.deposit_percentage ?? 25}
                      onChange={e => setSettings({ ...settings, deposit_percentage: Number(e.target.value) })}
                      className="flex-1 accent-amber-500"
                    />
                    <div className="flex items-center border-2 border-amber-300 rounded-lg overflow-hidden">
                      <input
                        type="number" min="0" max="100"
                        name="deposit_percentage"
                        value={settings.deposit_percentage ?? 25}
                        onChange={e => setSettings({ ...settings, deposit_percentage: Number(e.target.value) })}
                        className="w-16 px-2 py-2 text-center font-bold text-amber-700 outline-none"
                      />
                      <span className="px-2 py-2 bg-amber-50 text-amber-600 font-bold text-sm border-l border-amber-200">%</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Khi khách hoặc lễ tân đặt cọc, hệ thống sẽ tự động tính {settings.deposit_percentage ?? 25}% tổng tiền hóa đơn.</p>
                </div>
              </div>
            )}

            {/* Tab 4: Cấu hình AI Chatbot */}
            {activeTab === 'ai-chatbot' && (
              <div className="space-y-6 animate-fade-in">
                {/* Trạng thái Bật / Tắt */}
                <div className="flex items-center justify-between p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <span>🤖</span> Trạng thái Lễ tân AI
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Bật để khách hàng có thể trò chuyện và nhận tư vấn phòng tự động trên website
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="ai_enabled"
                      checked={!!settings.ai_enabled}
                      onChange={handleSettingChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* Chọn Nền tảng AI */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nền tảng Trí tuệ Nhân tạo (AI Provider)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${settings.ai_provider === 'gemini' ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input
                        type="radio"
                        name="ai_provider"
                        value="gemini"
                        checked={settings.ai_provider === 'gemini'}
                        onChange={handleSettingChange}
                        className="text-indigo-600"
                      />
                      <div>
                        <div className="font-bold text-sm flex items-center gap-1.5">
                          <span>✨ Google Gemini</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">Khuyên dùng</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Tốc độ cao, có gói miễn phí rộng rãi</p>
                      </div>
                    </label>

                    <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${settings.ai_provider === 'openai' ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input
                        type="radio"
                        name="ai_provider"
                        value="openai"
                        checked={settings.ai_provider === 'openai'}
                        onChange={handleSettingChange}
                        className="text-indigo-600"
                      />
                      <div>
                        <div className="font-bold text-sm">OpenAI (ChatGPT)</div>
                        <p className="text-xs text-slate-500 mt-0.5">Yêu cầu tài khoản nạp quỹ OpenAI</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Cấu hình Gemini */}
                {settings.ai_provider === 'gemini' && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-bold text-slate-700">Google Gemini API Key</label>
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          Lấy key miễn phí tại Google AI Studio ↗
                        </a>
                      </div>
                      <div className="relative">
                        <input
                          type={showApiKey ? "text" : "password"}
                          name="gemini_api_key"
                          value={settings.gemini_api_key || ""}
                          onChange={handleSettingChange}
                          placeholder="Nhập API Key: AIzaSy..."
                          className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 text-xs font-semibold cursor-pointer"
                        >
                          {showApiKey ? "Ẩn" : "Hiện"}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Khóa API Key được bảo mật trên máy chủ và dùng để giao tiếp với AI khi tư vấn phòng.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Mô hình AI (Model)</label>
                      <select
                        name="gemini_model"
                        value={settings.gemini_model || "gemini-2.5-flash"}
                        onChange={handleSettingChange}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      >
                        <option value="gemini-2.5-flash">gemini-2.5-flash (Khuyên dùng - Nhanh, thông minh nhất)</option>
                        <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                        <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                        <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Cấu hình OpenAI */}
                {settings.ai_provider === 'openai' && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-bold text-slate-700">OpenAI API Key</label>
                        <a
                          href="https://platform.openai.com/api-keys"
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          Lấy key tại OpenAI Platform ↗
                        </a>
                      </div>
                      <div className="relative">
                        <input
                          type={showApiKey ? "text" : "password"}
                          name="openai_api_key"
                          value={settings.openai_api_key || ""}
                          onChange={handleSettingChange}
                          placeholder="Nhập API Key: sk-..."
                          className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 text-xs font-semibold cursor-pointer"
                        >
                          {showApiKey ? "Ẩn" : "Hiện"}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Mô hình OpenAI (Model)</label>
                      <select
                        name="openai_model"
                        value={settings.openai_model || "gpt-4o-mini"}
                        onChange={handleSettingChange}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      >
                        <option value="gpt-4o-mini">gpt-4o-mini (Tiết kiệm, phản hồi nhanh)</option>
                        <option value="gpt-4o">gpt-4o (Thông minh toàn diện)</option>
                        <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Kiểm tra kết nối AI */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleTestAi}
                    disabled={isTestingAi}
                    className="px-4 py-2.5 rounded-xl border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isTestingAi ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                        Đang kết nối thử nghiệm...
                      </>
                    ) : (
                      <>
                        <span>⚡</span> Kiểm tra kết nối API Key
                      </>
                    )}
                  </button>
                  <span className="text-xs text-slate-400">
                    Bấm để kiểm tra xem API Key và mô hình có phản hồi bình thường không
                  </span>
                </div>
              </div>
            )}
            
            {/* Nút lưu cấu hình */}
            <div className="border-t border-slate-100 pt-6">
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
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