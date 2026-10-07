import { useState, useEffect } from "react";
import { useUI } from "../contexts/UIContext";
import dayjs from "dayjs";
import SearchBar from "../components/SearchBar";
import ServiceStatusSettingsModal from "../components/ServiceStatusSettingsModal";

export default function QuanLyDonDichVu() {
  const [danhSach, setDanhSach] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [serviceStatuses, setServiceStatuses] = useState([]);
  const [activeStatusTab, setActiveStatusTab] = useState("Tất cả");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { showToast, showConfirm } = useUI();

  useEffect(() => {
    fetchStatuses();
    fetchDanhSach();
  }, []);

  const fetchStatuses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/admin/service-statuses", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      if (res.ok) {
        const data = await res.json();
        const statuses = Array.isArray(data) ? data : [];
        setServiceStatuses(statuses);
        if (statuses.length > 0) {
          setActiveStatusTab(statuses[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDanhSach = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/admin/su-dung-dich-vu", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      if (res.ok) {
        setDanhSach(await res.json());
      } else {
        showToast("Lỗi khi lấy danh sách gọi dịch vụ", "error");
      }
    } catch (e) {
      showToast("Không thể kết nối đến máy chủ", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = danhSach.filter((item) => {
    const searchMatch = (
      (item.ten_khach_hang && item.ten_khach_hang.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.ten_dich_vu && item.ten_dich_vu.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.so_phong && item.so_phong.toString().includes(searchTerm.toLowerCase())) ||
      (item.id_dat_phong && item.id_dat_phong.toString().includes(searchTerm.toLowerCase()))
    );
    const statusMatch = activeStatusTab === "Tất cả" || item.trang_thai === activeStatusTab;
    return searchMatch && statusMatch;
  });

  const handleUpdateStatus = (id, newStatus) => {
    showConfirm(`Bạn có chắc chắn chuyển sang trạng thái: ${newStatus}?`, async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8000/api/admin/su-dung-dich-vu/${id}/status`, {
          method: 'PUT',
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ trang_thai: newStatus })
        });
        
        if (res.ok) {
          showToast("Cập nhật trạng thái thành công!", "success");
          if (selectedItem && selectedItem.id === id) {
            setSelectedItem(prev => ({ ...prev, trang_thai: newStatus }));
          }
          fetchDanhSach();
        } else {
          showToast("Lỗi khi cập nhật trạng thái", "error");
        }
      } catch (e) {
        showToast("Không thể kết nối đến máy chủ", "error");
      }
    });
  };

  const getStatusConfig = (statusId) => {
    return serviceStatuses.find(s => s.id === statusId) || {
      id: statusId,
      label: statusId,
      color: "#94a3b8",
      textColor: "#ffffff"
    };
  };

  return (
    <div className="p-4 md:p-8 flex-1 flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex-1 min-w-0 w-full md:w-auto">
          <h2 className="text-lg md:text-2xl font-extrabold text-slate-900 flex items-center gap-2 max-w-full min-w-0 w-full">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-primary-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"></path>
            </svg>
            <span className="truncate">Quản Lý Dịch Vụ Khách Gọi</span>
          </h2>
          <p className="hidden md:block text-slate-500 text-sm mt-1">Danh sách các dịch vụ khách hàng đang sử dụng</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-2 md:gap-3 flex-row items-center">
          <div className="flex-1 min-w-0">
            <SearchBar 
            placeholder="Tìm khách, phòng, dịch vụ..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          </div>
          <button 
            onClick={fetchDanhSach}
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



      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col relative z-10">
        {/* Status Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 scrollbar-hide">
          <button
            onClick={() => setActiveStatusTab('Tất cả')}
            className={`whitespace-nowrap px-6 py-4 text-sm font-bold transition-colors border-b-2 ${activeStatusTab === 'Tất cả' ? 'border-primary-600 text-primary-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
          >
            Tất cả
          </button>
          {serviceStatuses.map(status => (
            <button
              key={status.id}
              onClick={() => setActiveStatusTab(status.id)}
              className={`whitespace-nowrap px-6 py-4 text-sm font-bold transition-colors border-b-2 ${activeStatusTab === status.id ? 'border-primary-600 text-primary-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
            >
              {status.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto">
          <div className="overflow-x-auto min-h-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th scope="col" className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mã giao dịch</th>
                    <th scope="col" className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Khách hàng (Đơn)</th>
                    <th scope="col" className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Dịch vụ</th>
                    <th scope="col" className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Số lượng</th>
                    <th scope="col" className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng tiền</th>
                    <th scope="col" className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</th>
                    <th scope="col" className="p-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-500 font-bold">Đang tải dữ liệu...</td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-12 text-center">
                        <div className="flex justify-center mb-4">
                          <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        </div>
                        <p className="font-semibold text-slate-600 mb-1">Không tìm thấy đơn dịch vụ nào</p>
                        <p className="text-xs text-slate-400">Chưa có khách hàng gọi dịch vụ hoặc không khớp với tìm kiếm</p>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => {
                      const st = getStatusConfig(item.trang_thai);
                      return (
                      <tr 
                        key={item.id} 
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedItem(item)}
                      >
                        <td className="p-4 text-slate-500 font-mono text-xs">#{item.id}</td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{item.ten_khach_hang || 'Khách vãng lai'}</div>
                          <div className="text-xs text-slate-500 mt-0.5">Phòng {item.so_phong || 'N/A'} (Đơn #{item.id_dat_phong})</div>
                        </td>
                        <td className="p-4 font-bold text-slate-700">{item.ten_dich_vu}</td>
                        <td className="p-4 font-bold text-slate-600">{item.so_luong}</td>
                        <td className="p-4 font-bold text-emerald-600">{Number(item.tong_tien).toLocaleString()}₫</td>
                        <td className="p-4 text-slate-500 text-xs font-medium">
                          {dayjs(item.thoi_gian_su_dung).format('DD/MM/YYYY HH:mm')}
                        </td>
                        <td className="p-4 text-center">
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                            style={{ backgroundColor: st.color + '20', color: st.color }}
                          >
                            {st.label}
                          </span>
                        </td>
                      </tr>
                      );
                    })
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Chi Tiết */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedItem(null)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Chi tiết dịch vụ #{selectedItem.id}</h3>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500 font-medium">Khách hàng:</span>
                  <span className="font-bold text-slate-800">{selectedItem.ten_khach_hang || 'Khách vãng lai'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500 font-medium">Phòng:</span>
                  <span className="font-bold text-slate-800">{selectedItem.so_phong || 'N/A'} (Đơn #{selectedItem.id_dat_phong})</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500 font-medium">Dịch vụ:</span>
                  <span className="font-bold text-slate-800">{selectedItem.ten_dich_vu}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500 font-medium">Số lượng:</span>
                  <span className="font-bold text-slate-800">{selectedItem.so_luong}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500 font-medium">Tổng tiền:</span>
                  <span className="font-bold text-emerald-600">{Number(selectedItem.tong_tien).toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500 font-medium">Thời gian gọi:</span>
                  <span className="font-medium text-slate-800">{dayjs(selectedItem.thoi_gian_su_dung).format('DD/MM/YYYY HH:mm')}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500 font-medium">Trạng thái hiện tại:</span>
                  <span className="font-bold px-2.5 py-1 rounded-md shadow-sm text-xs" style={{
                      backgroundColor: getStatusConfig(selectedItem.trang_thai).color,
                      color: getStatusConfig(selectedItem.trang_thai).textColor || '#ffffff'
                    }}>
                    {getStatusConfig(selectedItem.trang_thai).label}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              {(() => {
                const currentIdx = serviceStatuses.findIndex(s => s.id === selectedItem.trang_thai);
                const isCanceled = selectedItem.trang_thai === 'Da_Huy';
                const nextStatus = (!isCanceled && currentIdx !== -1 && currentIdx < serviceStatuses.length - 1) ? serviceStatuses[currentIdx + 1] : null;

                return (
                  <>
                    {nextStatus && nextStatus.id !== 'Da_Huy' && (
                      <button onClick={async () => {
                        await handleUpdateStatus(selectedItem.id, nextStatus.id);
                        setSelectedItem(null);
                      }} className="font-bold px-4 py-2 rounded-lg transition-colors text-sm shadow-sm" style={{ backgroundColor: nextStatus.color, color: nextStatus.textColor || '#ffffff' }}>
                        Chuyển: {nextStatus.label}
                      </button>
                    )}
                    {/* Hủy đơn chỉ hiển thị ở trạng thái đầu tiên */}
                    {currentIdx === 0 && serviceStatuses.find(s => s.id === 'Da_Huy') && (
                      <button onClick={async () => {
                        await handleUpdateStatus(selectedItem.id, 'Da_Huy');
                        setSelectedItem(null);
                      }} className="bg-red-50 text-red-600 hover:bg-red-100 font-bold px-4 py-2 rounded-lg transition-colors text-sm border border-red-200">
                        Hủy đơn
                      </button>
                    )}
                  </>
                );
              })()}
              <button onClick={() => setSelectedItem(null)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-bold text-sm transition-colors">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <ServiceStatusSettingsModal 
          onClose={() => setShowSettingsModal(false)} 
        />
      )}
    </div>
  );
}
