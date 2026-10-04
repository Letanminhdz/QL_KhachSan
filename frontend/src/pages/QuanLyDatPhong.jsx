import { useState, useEffect } from "react";
import { useUI } from "../contexts/UIContext";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import BookingStatusSettingsModal from "../components/BookingStatusSettingsModal";

export default function QuanLyDatPhong() {
  const [activeStatus, setActiveStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [datPhongs, setDatPhongs] = useState([]);
  const [statusConfigs, setStatusConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [depositPercentage, setDepositPercentage] = useState(30);
  const { showToast, showConfirm } = useUI();
  const navigate = useNavigate();

  useEffect(() => {
    fetchConfigsAndData();
  }, []);

  const fetchConfigsAndData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      };

      const [resConfig, resData, resSettings] = await Promise.all([
        fetch("http://localhost:8000/api/admin/booking-statuses", { headers }),
        fetch("http://localhost:8000/api/admin/dat-phong", { headers }),
        fetch("http://localhost:8000/api/settings")
      ]);

      if (resConfig.ok) {
        const configs = await resConfig.json();
        setStatusConfigs(configs);
        if (configs.length > 0) {
          setActiveStatus(configs[0].id);
        }
      }
      
      if (resData.ok) {
        setDatPhongs(await resData.json());
      } else {
        showToast("Lỗi khi lấy danh sách đơn đặt phòng", "error");
      }

      if (resSettings.ok) {
        const sData = await resSettings.json();
        if (sData.deposit_percentage !== undefined) {
          setDepositPercentage(Number(sData.deposit_percentage));
        }
      }
    } catch (e) {
      showToast("Không thể kết nối đến máy chủ", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchDatPhongs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/admin/dat-phong", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDatPhongs(data);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleStatusChange = async (id, newStatus, message) => {
    showConfirm(message, async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8000/api/admin/dat-phong/${id}/status`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ trang_thai: newStatus })
        });
        if (res.ok) {
          showToast("Cập nhật trạng thái thành công!", "success");
          fetchDatPhongs();
        } else {
          showToast("Có lỗi xảy ra khi cập nhật", "error");
        }
      } catch (e) {
        showToast("Lỗi kết nối đến máy chủ", "error");
      }
    });
  };

  const handleDeposit = async (booking) => {
    const depositAmount = (booking.tong_tien * depositPercentage) / 100;
    const currentPaid = parseFloat(booking.so_tien_da_thanh_toan || 0);
    const newPaid = currentPaid + depositAmount;

    showConfirm(`Xác nhận đặt cọc ${depositPercentage}% (${formatCurrency(depositAmount)}) cho đơn #${booking.id}?`, async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8000/api/admin/dat-phong/${booking.id}/status`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ 
            so_tien_da_thanh_toan: newPaid,
            trang_thai_thanh_toan: newPaid >= booking.tong_tien ? 'Đã thanh toán' : 'Thanh toán 1 phần'
          })
        });
        
        if (res.ok) {
          showToast("Đặt cọc thành công!", "success");
          fetchDatPhongs();
          setSelectedBooking(null);
        } else {
          showToast("Lỗi cập nhật", "error");
        }
      } catch (e) {
        showToast("Lỗi kết nối", "error");
      }
    });
  };

  const getFilteredData = () => {
    let result = datPhongs;
    
    if (activeStatus !== "all") {
       result = result.filter(dp => dp.trang_thai === activeStatus);
    }
    
    if (searchTerm) {
       const lowercasedTerm = searchTerm.toLowerCase();
       result = result.filter(item => JSON.stringify(item).toLowerCase().includes(lowercasedTerm));
    }
    
    return result;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString, time = false) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (time) return date.toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}) + " " + date.toLocaleDateString('vi-VN');
    return date.toLocaleDateString('vi-VN');
  };

  const filteredData = getFilteredData();

  const getStatusConfig = (id) => {
    return statusConfigs.find(s => s.id === id) || { label: id, color: '#94a3b8', textColor: '#ffffff' };
  };

  return (
    <div className="p-4 md:p-8 flex-1 flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex-1 min-w-0 w-full md:w-auto">
          <h1 className="text-lg md:text-2xl font-extrabold text-slate-900 flex items-center gap-2 max-w-full min-w-0 w-full">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-primary-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            <span className="truncate">Đơn Đặt Phòng</span>
          </h1>
          <p className="hidden md:block text-slate-500 text-sm mt-1">
            Quản lý các yêu cầu đặt phòng và tình trạng xử lý
          </p>
        </div>
        <div className="flex w-full md:w-auto gap-2 md:gap-3 flex-row items-center">
          <div className="flex-1 md:w-72 min-w-0">
             <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Tìm đơn, SĐT, mã phòng..." />
          </div>
          <button 
            onClick={fetchDatPhongs} 
            className="text-primary-700 hover:text-primary-800 font-bold flex items-center justify-center gap-2 bg-primary-50 border border-primary-200 hover:bg-primary-100 px-3 md:px-4 py-2 rounded-lg transition-colors w-auto h-[42px] whitespace-nowrap shrink-0"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            <span className="hidden md:inline">Làm mới</span>
          </button>
          <button onClick={() => setShowSettingsModal(true)} className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-bold flex items-center justify-center gap-2 bg-white border border-slate-200 px-0 md:px-4 w-[42px] md:w-auto h-[42px] rounded-lg transition-colors shrink-0" title="Cài đặt Luồng Trạng Thái">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative z-10 flex-1 flex flex-col">
        {/* Status Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 scrollbar-hide">
          <button
            onClick={() => setActiveStatus("all")}
            className={`whitespace-nowrap px-6 py-4 text-sm font-bold transition-colors border-b-2 ${activeStatus === "all" ? "border-primary-600 text-primary-600 bg-white" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`}
          >
            Tất cả
          </button>
          {statusConfigs.map(config => (
            <button
              key={config.id}
              onClick={() => setActiveStatus(config.id)}
              className={`whitespace-nowrap px-6 py-4 text-sm font-bold transition-colors border-b-2 ${activeStatus === config.id ? "border-primary-600 text-primary-600 bg-white" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`}
            >
              {config.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto">
          <div className="overflow-x-auto min-h-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-slate-200 rounded-tl-lg">Mã Đơn</th>
                  <th className="p-4 font-bold border-b border-slate-200">Khách Hàng</th>
                  <th className="p-4 font-bold border-b border-slate-200">Phòng</th>
                  <th className="p-4 font-bold border-b border-slate-200">Thời Gian</th>
                  <th className="p-4 font-bold border-b border-slate-200">Thanh Toán</th>
                  <th className="p-4 font-bold border-b border-slate-200">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">Đang tải dữ liệu...</td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">Không tìm thấy đơn đặt phòng nào.</td>
                  </tr>
                ) : (
                  filteredData.map((dp) => {
                    const c = getStatusConfig(dp.trang_thai);
                    return (
                    <tr 
                      key={dp.id} 
                      onClick={() => setSelectedBooking(dp)}
                      className="hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <td className="p-4 text-slate-600 font-medium font-mono">#{dp.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{dp.ten_khach_hang}</div>
                        <div className="text-xs text-slate-500">{dp.sdt_khach_hang}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-700">{dp.ten_loai_phong_khi_dat}</div>
                        <div className="text-xs text-slate-500">{dp.so_luong_phong} phòng</div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-medium text-slate-700 mb-1">
                          <span className="inline-block w-8 text-emerald-600 font-bold">IN:</span> {formatDate(dp.ngay_nhan_phong, true)}
                        </div>
                        <div className="text-xs font-medium text-slate-700">
                          <span className="inline-block w-8 text-red-600 font-bold">OUT:</span> {formatDate(dp.ngay_tra_phong, true)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-bold text-slate-800 mb-1.5">{formatCurrency(dp.tong_tien)}</div>
                        {dp.trang_thai_thanh_toan === 'Đã thanh toán' ? (
                          <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap">Đã thu tiền</span>
                        ) : parseFloat(dp.so_tien_da_thanh_toan || 0) > 0 ? (
                          <div>
                            <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap">Cọc: {formatCurrency(dp.so_tien_da_thanh_toan)}</span>
                          </div>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap">Chưa thu</span>
                        )}
                      </td>
                      <td className="p-4">
                         <span style={{ backgroundColor: c.color, color: c.textColor }} className="px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">{c.label}</span>
                      </td>
                    </tr>
                  )})
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Chi Tiết */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Chi tiết đơn #{selectedBooking.id}</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Thông tin khách hàng</h4>
                  <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                    <p className="text-sm"><span className="text-slate-500 inline-block w-24">Họ tên:</span> <span className="font-bold text-slate-800">{selectedBooking.ten_khach_hang}</span></p>
                    <p className="text-sm"><span className="text-slate-500 inline-block w-24">Điện thoại:</span> <span className="font-bold text-slate-800">{selectedBooking.sdt_khach_hang}</span></p>
                    <p className="text-sm"><span className="text-slate-500 inline-block w-24">Tài khoản:</span> <span className="font-bold text-slate-800">{selectedBooking.tai_khoan?.email || 'Khách vãng lai'}</span></p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Thông tin đặt phòng</h4>
                  <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                    <p className="text-sm"><span className="text-slate-500 inline-block w-24">Loại phòng:</span> <span className="font-bold text-slate-800">{selectedBooking.ten_loai_phong_khi_dat}</span></p>
                    <p className="text-sm"><span className="text-slate-500 inline-block w-24">Số lượng:</span> <span className="font-bold text-slate-800">{selectedBooking.so_luong_phong} phòng</span></p>
                    <p className="text-sm"><span className="text-slate-500 inline-block w-24">Nhận phòng:</span> <span className="font-bold text-emerald-600">{formatDate(selectedBooking.ngay_nhan_phong)}</span></p>
                    <p className="text-sm"><span className="text-slate-500 inline-block w-24">Trả phòng:</span> <span className="font-bold text-red-600">{formatDate(selectedBooking.ngay_tra_phong)}</span></p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Phòng đã phân bổ</h4>
                {selectedBooking.phan_bo_phongs?.length > 0 ? (
                  <div className="flex gap-2 flex-wrap mb-6">
                    {selectedBooking.phan_bo_phongs.map((pb) => (
                      <div key={pb.id} className="bg-primary-50 text-primary-700 border border-primary-100 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"></path></svg>
                        Phòng {pb.phong?.so_phong || pb.id_phong}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 mb-6 italic">Chưa có phòng cụ thể được phân bổ (hoặc lấy dữ liệu lỗi).</p>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Đã thanh toán / Đặt cọc:</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(selectedBooking.so_tien_da_thanh_toan || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-lg">Còn lại cần thanh toán:</span>
                  <span className="text-2xl font-extrabold text-red-600">{formatCurrency(selectedBooking.tong_tien - (selectedBooking.so_tien_da_thanh_toan || 0))}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              {(() => {
                const currentIdx = statusConfigs.findIndex(s => s.id === selectedBooking.trang_thai);
                const isCanceled = selectedBooking.trang_thai === 'Da_Huy';
                const nextStatus = (!isCanceled && currentIdx !== -1 && currentIdx < statusConfigs.length - 1) ? statusConfigs[currentIdx + 1] : null;

                return (
                  <>
                    {!isCanceled && selectedBooking.trang_thai_thanh_toan !== 'Đã thanh toán' && !(selectedBooking.so_tien_da_thanh_toan > 0) && (
                       <button onClick={() => handleDeposit(selectedBooking)} className="bg-amber-500 text-white hover:bg-amber-600 font-bold px-4 py-2 rounded-lg transition-colors text-sm shadow-sm">Đặt cọc ({depositPercentage}%)</button>
                    )}
                    {nextStatus && nextStatus.id !== 'Da_Huy' && (
                      <button onClick={async () => {
                        // Nếu là trạng thái Checkout (set_room_status: out) → mở trang thanh toán trước
                        // Chỉ sau khi thanh toán thành công mới set trạng thái out
                        if (nextStatus.set_room_status === 'out') {
                          setSelectedBooking(null);
                          navigate(`/admin/thanh-toan?id=${selectedBooking.id}&next_status=${nextStatus.id}`);
                        } else {
                          await handleStatusChange(selectedBooking.id, nextStatus.id, `Xác nhận chuyển sang: ${nextStatus.label}?`);
                          setSelectedBooking(null);
                        }
                      }} className="font-bold px-4 py-2 rounded-lg transition-colors text-sm shadow-sm" style={{ backgroundColor: nextStatus.color, color: nextStatus.textColor }}>
                        Chuyển: {nextStatus.label}
                      </button>
                    )}
                    {/* Hủy đơn chỉ hiển thị ở trạng thái đầu tiên */}
                    {currentIdx === 0 && !isCanceled && (
                       <button onClick={() => { handleStatusChange(selectedBooking.id, 'Da_Huy', 'Xác nhận hủy đơn?'); setSelectedBooking(null); }} className="bg-red-50 text-red-600 hover:bg-red-100 font-bold px-4 py-2 rounded-lg transition-colors text-sm border border-red-200">Hủy đơn</button>
                    )}
                  </>
                );
              })()}
              <button onClick={() => setSelectedBooking(null)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-bold text-sm transition-colors">Đóng</button>
            </div>
          </div>
        </div>
      )}
      {showSettingsModal && (
        <BookingStatusSettingsModal 
          onClose={() => setShowSettingsModal(false)} 
          onSaveSuccess={() => {
            fetchConfigsAndData(); // Reload config
          }}
        />
      )}
    </div>
  );
}
