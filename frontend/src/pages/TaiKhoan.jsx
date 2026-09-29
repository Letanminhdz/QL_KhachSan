import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUI } from "../contexts/UIContext";

export default function TaiKhoan() {
  const { user, logoutUser, showConfirm, showToast } = useUI();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("thong-tin");

  // States
  const [lichSu, setLichSu] = useState([]);
  const [lichSuDichVu, setLichSuDichVu] = useState([]);
  const [statusConfigs, setStatusConfigs] = useState([]);
  const [serviceStatusConfigs, setServiceStatusConfigs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Protect route
  useEffect(() => {
    if (!user) {
      navigate("/dang-nhap");
    }
  }, [user, navigate]);

  // Initial fetch for statuses
  useEffect(() => {
    fetchStatuses();
  }, []);

  useEffect(() => {
    if (activeTab === "lich-su") {
      fetchLichSuDatPhong();
    } else if (activeTab === "lich-su-dich-vu") {
      fetchLichSuDichVu();
    }
  }, [activeTab]);

  const fetchStatuses = async () => {
    try {
      const [resBooking, resService] = await Promise.all([
        fetch("http://localhost:8000/api/booking-statuses"),
        fetch("http://localhost:8000/api/service-statuses")
      ]);
      if (resBooking.ok) setStatusConfigs(await resBooking.json());
      if (resService.ok) setServiceStatusConfigs(await resService.json());
    } catch (e) {
      console.error(e);
    }
  }

  const fetchLichSuDatPhong = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/lich-su-dat-phong", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      if (res.ok) {
        setLichSu(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLichSuDichVu = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/user/lich-su-dich-vu", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      if (res.ok) {
        setLichSuDichVu(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (id) => {
    return statusConfigs.find(s => s.id === id) || { label: id, color: '#e2e8f0', textColor: '#475569' };
  };

  const getServiceStatusDisplay = (id) => {
    return serviceStatusConfigs.find(s => s.id === id) || { label: id, color: '#e2e8f0', textColor: '#475569' };
  };

  if (!user) return null;

  const handleLogout = () => {
    showConfirm("Bạn có chắc chắn muốn đăng xuất?", async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await fetch("http://localhost:8000/api/logout", {
            method: "POST",
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });
        }
      } catch (e) { }
      logoutUser();
      showToast("Đã đăng xuất", "success");
      navigate("/");
    });
  };

  const tabs = [
    { id: "thong-tin", label: "Thông tin cá nhân" },
    { id: "lich-su", label: "Lịch sử đặt phòng" },
    { id: "lich-su-dich-vu", label: "Lịch sử gọi dịch vụ" },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString, time = false) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (time) return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + " " + date.toLocaleDateString('vi-VN');
    return date.toLocaleDateString('vi-VN');
  };

  const viewBookingDetail = (booking) => {
    navigate(`/chi-tiet-dat-phong?id=${booking.id}`);
  };

  return (
    <>
      <main className="flex-grow bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Profile & Nav */}
            <div className="w-full md:w-80 flex-shrink-0">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-8 text-center bg-gradient-to-br from-primary-600 to-primary-800 text-white relative">
                  <button
                    onClick={handleLogout}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-red-500/80 hover:text-white rounded-full transition-all text-white/80"
                    title="Đăng xuất"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  </button>
                  <div className="w-24 h-24 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold shadow-xl border-4 border-white/30 mb-4">
                    {user.ho_ten.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-xl font-bold">{user.ho_ten}</h2>
                  <p className="text-primary-100 font-medium mt-1 text-sm">
                    {user.vai_tro === 'Admin' ? 'Quản trị viên' : 'Thành viên'}
                  </p>
                </div>

                <div className="p-4">
                  <nav className="flex flex-col space-y-2">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full text-left px-5 py-4 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === tab.id
                            ? "bg-primary-50 text-primary-700 shadow-sm border border-primary-100"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                          }`}
                      >
                        {tab.id === 'thong-tin' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>}
                        {tab.id === 'lich-su' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>}
                        {tab.id === 'lich-su-dich-vu' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-grow">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col h-full max-h-[85vh] overflow-hidden">
                {activeTab === "thong-tin" && (
                  <div className="space-y-8 animate-fadeIn overflow-y-auto">
                    <div>
                      <h3 className="text-2xl font-extrabold text-slate-800">Thông tin liên hệ</h3>
                      <p className="text-slate-500 mt-1">Các thông tin cá nhân cơ bản của bạn</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">Email liên hệ</label>
                        <div className="text-slate-900 font-medium bg-slate-50 px-5 py-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                          {user.email}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">Số điện thoại</label>
                        <div className="text-slate-900 font-medium bg-slate-50 px-5 py-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                          {user.so_dien_thoai}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "lich-su" && (
                  <div className="animate-fadeIn flex flex-col h-full overflow-hidden">
                    <div className="mb-6 flex justify-between items-center shrink-0">
                      <div>
                        <h3 className="text-2xl font-extrabold text-slate-800">Lịch sử đặt phòng</h3>
                        <p className="text-slate-500 mt-1">Danh sách các đơn bạn đã đặt</p>
                      </div>
                    </div>

                    <div className="overflow-auto rounded-2xl border border-slate-200 shadow-sm flex-grow relative">
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10 shadow-sm">
                          <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                            <th className="p-4 font-bold border-b border-slate-200 rounded-tl-2xl">Mã Đơn</th>
                            <th className="p-4 font-bold border-b border-slate-200">Phòng</th>
                            <th className="p-4 font-bold border-b border-slate-200">Thời gian lưu trú</th>
                            <th className="p-4 font-bold border-b border-slate-200">Thanh Toán</th>
                            <th className="p-4 font-bold border-b border-slate-200 rounded-tr-2xl">Trạng Thái</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-slate-100 bg-white">
                          {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-500">Đang tải dữ liệu...</td></tr>
                          ) : lichSu.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-500">Bạn chưa có đơn đặt phòng nào.</td></tr>
                          ) : (
                            lichSu.map((item) => {
                              const statusInfo = getStatusDisplay(item.trang_thai);
                              return (
                                <tr 
                                  key={item.id} 
                                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                                  onClick={() => viewBookingDetail(item)}
                                >
                                  <td className="p-4 text-slate-600 font-medium font-mono">#{item.id}</td>
                                  <td className="p-4">
                                    <div className="font-bold text-slate-700">{item.ten_loai_phong_khi_dat}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{item.so_luong_phong} phòng</div>
                                  </td>
                                  <td className="p-4">
                                    <div className="text-xs font-medium text-slate-700 mb-1">
                                      <span className="inline-block w-8 text-emerald-600 font-bold">IN:</span> {formatDate(item.ngay_nhan_phong, true)}
                                    </div>
                                    <div className="text-xs font-medium text-slate-700">
                                      <span className="inline-block w-8 text-red-600 font-bold">OUT:</span> {formatDate(item.ngay_tra_phong, true)}
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="text-sm font-bold text-slate-800 mb-1.5">{formatCurrency(item.tong_tien)}</div>
                                    {item.trang_thai_thanh_toan === 'Đã thanh toán' ? (
                                      <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap">Đã thu tiền</span>
                                    ) : parseFloat(item.so_tien_da_thanh_toan || 0) > 0 ? (
                                      <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap">Cọc: {formatCurrency(item.so_tien_da_thanh_toan)}</span>
                                    ) : (
                                      <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap">Chưa thu</span>
                                    )}
                                  </td>
                                  <td className="p-4">
                                    <span
                                      className="px-2 py-1 rounded-md text-xs font-bold shadow-sm inline-block whitespace-nowrap"
                                      style={{ backgroundColor: statusInfo.color, color: statusInfo.textColor }}
                                    >
                                      {statusInfo.label}
                                    </span>
                                  </td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === "lich-su-dich-vu" && (
                  <div className="animate-fadeIn flex flex-col h-full overflow-hidden">
                    <div className="mb-6 flex justify-between items-center shrink-0">
                      <div>
                        <h3 className="text-2xl font-extrabold text-slate-800">Lịch sử gọi dịch vụ</h3>
                        <p className="text-slate-500 mt-1">Các dịch vụ bạn đã yêu cầu</p>
                      </div>
                    </div>

                    <div className="overflow-auto rounded-2xl border border-slate-200 shadow-sm flex-grow relative">
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10 shadow-sm">
                          <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                            <th className="p-4 font-bold border-b border-slate-200 rounded-tl-2xl">Thời gian gọi</th>
                            <th className="p-4 font-bold border-b border-slate-200">Dịch vụ</th>
                            <th className="p-4 font-bold border-b border-slate-200 text-center">SL</th>
                            <th className="p-4 font-bold border-b border-slate-200">Tổng tiền</th>
                            <th className="p-4 font-bold border-b border-slate-200">Phòng</th>
                            <th className="p-4 font-bold border-b border-slate-200 rounded-tr-2xl">Trạng Thái</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-slate-100 bg-white">
                          {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center text-slate-500">Đang tải dữ liệu...</td></tr>
                          ) : lichSuDichVu.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-slate-500">Bạn chưa gọi dịch vụ nào.</td></tr>
                          ) : (
                            lichSuDichVu.map((item) => {
                              const statusInfo = getServiceStatusDisplay(item.trang_thai);
                              return (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-4 text-slate-600 font-medium whitespace-nowrap">
                                    {formatDate(item.thoi_gian_su_dung, true)}
                                  </td>
                                  <td className="p-4">
                                    <div className="font-bold text-slate-700">{item.dich_vu?.ten_dich_vu || 'Không rõ'}</div>
                                  </td>
                                  <td className="p-4 text-slate-600 text-center font-bold">
                                    {item.so_luong}
                                  </td>
                                  <td className="p-4 font-bold text-slate-800">{formatCurrency(item.tong_tien)}</td>
                                  <td className="p-4">
                                    <div className="font-bold text-slate-700">Phòng {item.phong?.so_phong || '?'}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">Mã đơn: #{item.id_dat_phong}</div>
                                  </td>
                                  <td className="p-4">
                                    <span
                                      className="px-2 py-1 rounded-md text-xs font-bold shadow-sm inline-block whitespace-nowrap"
                                      style={{ backgroundColor: statusInfo.color, color: statusInfo.textColor }}
                                    >
                                      {statusInfo.label}
                                    </span>
                                  </td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Detail Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-800">Chi Tiết Đơn Đặt Phòng #{selectedBooking.id}</h3>
              <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3 md:border-r border-slate-100 md:pr-4">
                  <h4 className="font-bold text-slate-400 uppercase text-xs tracking-wider">Thông Tin Phòng</h4>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-500 text-sm">Loại phòng:</span>
                    <span className="font-bold text-slate-800 text-right">{selectedBooking.ten_loai_phong_khi_dat}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-500 text-sm">Số lượng:</span>
                    <span className="font-bold text-slate-800 text-right">{selectedBooking.so_luong_phong} phòng</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-500 text-sm">Giá đặt:</span>
                    <span className="font-bold text-slate-800 text-right">{formatCurrency(selectedBooking.gia_phong_khi_dat)} / đêm</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-400 uppercase text-xs tracking-wider">Thời Gian Lưu Trú</h4>
                  <div className="flex flex-col bg-slate-50 p-4 rounded-xl border border-slate-100 gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Nhận phòng:
                      </span>
                      <span className="font-bold text-slate-800">{formatDate(selectedBooking.ngay_nhan_phong)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Trả phòng:
                      </span>
                      <span className="font-bold text-slate-800">{formatDate(selectedBooking.ngay_tra_phong)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h4 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-3">Tình Trạng Hóa Đơn</h4>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Tổng tiền phòng:</span>
                    <span className="font-bold text-slate-800 text-lg">{formatCurrency(selectedBooking.tong_tien)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Đã thanh toán trước:</span>
                    <span className="font-bold text-emerald-600 text-lg">{formatCurrency(selectedBooking.so_tien_da_thanh_toan || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200 pt-4">
                    <span className="font-bold text-slate-700">Trạng thái thanh toán:</span>
                    <span className={`font-bold px-3 py-1 rounded-lg ${
                      selectedBooking.trang_thai_thanh_toan === 'Đã thanh toán'
                        ? 'bg-emerald-100 text-emerald-700'
                        : parseFloat(selectedBooking.so_tien_da_thanh_toan || 0) > 0
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedBooking.trang_thai_thanh_toan === 'Đã thanh toán'
                        ? 'Đã thu tiền'
                        : parseFloat(selectedBooking.so_tien_da_thanh_toan || 0) > 0
                          ? `Đã cọc ${formatCurrency(selectedBooking.so_tien_da_thanh_toan)}`
                          : 'Chưa thu'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6 flex justify-between items-center">
                <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Trạng Thái Đơn</h4>
                <span
                  className="px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
                  style={{
                    backgroundColor: getStatusDisplay(selectedBooking.trang_thai).color,
                    color: getStatusDisplay(selectedBooking.trang_thai).textColor
                  }}
                >
                  {getStatusDisplay(selectedBooking.trang_thai).label}
                </span>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
              <button onClick={() => setShowBookingModal(false)} className="px-5 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-md transition-colors">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
