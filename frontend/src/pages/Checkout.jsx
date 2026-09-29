import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUI } from "../contexts/UIContext";
import { tinhTienPhong } from "../utils/tinhTienPhong";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, showToast } = useUI();
  
  const queryParams = new URLSearchParams(location.search);
  const roomId = queryParams.get("room") || queryParams.get("loai_phong") || 1;
  const count = queryParams.get("count") || 1;
  const getDefaultDate = (isCheckOut = false) => {
    const d = new Date();
    if (isCheckOut) {
      d.setDate(d.getDate() + 1);
      d.setHours(12, 0, 0);
    } else {
      d.setHours(14, 0, 0);
    }
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const checkIn = queryParams.get("in") || getDefaultDate(false);
  const checkOut = queryParams.get("out") || getDefaultDate(true);

  const [formData, setFormData] = useState({
    ho_ten: "",
    so_dien_thoai: "",
    email: "",
    ghi_chu: ""
  });

  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Lấy thông tin phòng từ API
    const fetchRoom = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/loai-phong/${roomId}`);
        if (res.ok) {
          const data = await res.json();
          setRoomData(data);
        }
      } catch (e) {
        console.error("Failed to fetch room data", e);
      }
    };
    fetchRoom();
  }, [roomId]);

  // Tự động điền thông tin nếu người dùng đã đăng nhập
  useEffect(() => {
    if (user) {
      setFormData({
        ho_ten: user.ho_ten || "",
        so_dien_thoai: user.so_dien_thoai || user.dien_thoai || "",
        email: user.email || "",
        ghi_chu: ""
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ngay_nhan_phong: checkIn,
      ngay_tra_phong: checkOut,
      id_loai_phong: roomId,
      so_luong_phong: count,
      ten_khach_hang: formData.ho_ten,
      sdt_khach_hang: formData.so_dien_thoai
    };

    try {
      let url = "http://localhost:8000/api/dat-phong/khach-vang-lai";
      let headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
      };

      if (user) {
        url = "http://localhost:8000/api/dat-phong";
        headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
      }

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Đặt phòng thành công!", "success");
        navigate(`/dat-phong-thanh-cong?id=${data.data.id}&roomName=${encodeURIComponent(roomData?.ten_loai || '')}&count=${count}`);
      } else {
        showToast(data.message || "Lỗi khi đặt phòng", "error");
      }
    } catch (e) {
      showToast("Không thể kết nối đến máy chủ", "error");
    } finally {
      setLoading(false);
    }
  };

  const pricePerNight = roomData ? parseFloat(roomData.gia_co_ban) : 800000;
  
  const ketQuaTinh = tinhTienPhong(checkIn, checkOut, pricePerNight);
  const totalDays = ketQuaTinh.soNgay;
  const totalHours = ketQuaTinh.soGioLe;
  const totalPrice = ketQuaTinh.tongTien * count; // Tổng tiền tính luôn theo số lượng phòng

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString('vi-VN', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'});
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <main className="flex-grow bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form thông tin khách (cột trái) */}
          <div className="lg:w-2/3 order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-white p-4 border-b border-slate-200">
                <h5 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-primary-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  Thông tin đặt phòng
                </h5>
              </div>

              <div className="p-6">
                <form onSubmit={handleCheckout} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      </div>
                      <input
                        type="text"
                        name="ho_ten"
                        value={formData.ho_ten}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        </div>
                        <input
                          type="tel"
                          name="so_dien_thoai"
                          value={formData.so_dien_thoai}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          placeholder="0901234567"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          placeholder="email@domain.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Ghi chú <span className="text-slate-400 font-normal">(tùy chọn)</span>
                    </label>
                    <textarea
                      name="ghi_chu"
                      value={formData.ghi_chu}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      rows="3"
                      placeholder="Yêu cầu tầng cao, giường đôi, nhận phòng muộn..."
                    ></textarea>
                  </div>

                  <div className="bg-sky-50 border border-sky-100 rounded-lg p-3 flex gap-3 text-sm text-sky-800">
                    <svg className="w-5 h-5 flex-shrink-0 text-sky-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                    <p>
                      Đơn sẽ được gửi đến lễ tân với trạng thái <span className="font-bold">Mới Đặt</span>. Giá phòng được
                      bảo toàn theo thời điểm đặt.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Link
                      to="/tim-phong"
                      className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-center sm:w-auto w-full"
                    >
                      Quay lại
                    </Link>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold py-2.5 px-6 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? "Đang xử lý..." : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          Xác nhận đặt phòng
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Tóm tắt đơn (cột phải) */}
          <div className="lg:w-1/3 order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
              <div className="bg-slate-900 p-4">
                <h6 className="font-bold text-white m-0 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  Tóm tắt đơn
                </h6>
              </div>
              <div className="p-5">
                <div className="text-lg font-bold text-slate-900 mb-4 text-center">
                  {roomData ? roomData.ten_loai : "Phòng Standard"}
                </div>

                <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-slate-500 flex items-center gap-1">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                      Nhận phòng
                    </span>
                    <b className="text-slate-800">{formatDate(checkIn)}</b>
                  </div>
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-slate-500 flex items-center gap-1">
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                      Trả phòng
                    </span>
                    <b className="text-slate-800">{formatDate(checkOut)}</b>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                      Lưu trú
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
                      {totalDays > 0 ? `${totalDays} ngày ` : ''} {totalHours > 0 ? `${totalHours} giờ` : ''}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between text-slate-500">
                    <span>Số lượng</span>
                    <b className="text-slate-800">{count} phòng</b>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Đơn giá (Ngày)</span>
                    <b className="text-slate-800">{formatCurrency(ketQuaTinh.giaCoBanApDung)} đ/ngày</b>
                  </div>
                  {totalHours > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>Thuê theo giờ</span>
                      <b className="text-slate-800">{formatCurrency(ketQuaTinh.giaMotGioApDung)} đ/giờ</b>
                    </div>
                  )}
                  {ketQuaTinh.phuThu > 0 && (
                    <div className="flex justify-between text-rose-500 border-t border-slate-100 pt-2 mt-2">
                      <div className="flex flex-col">
                        <span>Phụ thu</span>
                        {ketQuaTinh.chiTietPhuThu.map((lyDo, idx) => (
                          <span key={idx} className="text-xs text-rose-400">- {lyDo}</span>
                        ))}
                      </div>
                      <b className="text-rose-600">{formatCurrency(ketQuaTinh.phuThu)} đ</b>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-4 mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800">Tổng cộng</span>
                    <span className="font-extrabold text-xl text-red-600">
                      {formatCurrency(totalPrice)} VNĐ
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-600 text-xs font-medium flex items-center justify-end gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2.935l-7 4.192v5.746a8 8 0 0014 0V7.127l-7-4.192zm-1 8a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd"></path></svg>
                      Giá cố định, không thay đổi
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
