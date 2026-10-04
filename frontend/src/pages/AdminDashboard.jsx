import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState(null);
  const [roomStatuses, setRoomStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusModal, setStatusModal] = useState(null); // { room } for quick status change
  const [changingStatus, setChangingStatus] = useState(false);
  const [pendingAllocations, setPendingAllocations] = useState([]);
  const [loadingAllocations, setLoadingAllocations] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/dang-nhap');
        return;
      }
      
      const [resDiagram, resStatus] = await Promise.all([
        fetch('http://localhost:8000/api/admin/room-diagram', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:8000/api/admin/room-statuses', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (!resDiagram.ok) throw new Error("Lỗi mạng");
      
      setData(await resDiagram.json());
      if (resStatus.ok) {
        setRoomStatuses(await resStatus.json());
      }
      setError("");
    } catch (err) {
      console.error(err);
      setError("Lỗi khi tải dữ liệu sơ đồ phòng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchPendingAllocations = async () => {
    try {
      setLoadingAllocations(true);
      const token = localStorage.getItem("token");
      const res = await fetch('http://localhost:8000/api/admin/pending-allocations', {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (res.ok) {
        setPendingAllocations(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAllocations(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm(`Bạn có chắc muốn chuyển trạng thái đơn này thành ${status}?`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/admin/dat-phong/${id}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ trang_thai: status })
      });
      if (res.ok) {
        alert("Cập nhật thành công!");
        fetchPendingAllocations();
        fetchData();
      } else {
        alert("Lỗi khi cập nhật");
      }
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };

  useEffect(() => {
    if (showModal) {
      fetchPendingAllocations();
    }
  }, [showModal]);

  const handleRoomClick = (room) => {
    if (room.trang_thai === 'Dang_Thue' && room.id_dat_phong) {
      navigate(`/admin/chi-tiet-dat-phong?id=${room.id_dat_phong}`);
    } else if (room.trang_thai !== 'Dang_Thue') {
      setStatusModal({ room, selectedStatus: room.trang_thai });
    }
  };

  const handleQuickStatusChange = async () => {
    if (!statusModal) return;
    setChangingStatus(true);
    try {
      const token = localStorage.getItem('token');
      const room = statusModal.room;
      // Fetch room data first to get required fields
      const resRoom = await fetch(`http://localhost:8000/api/admin/phong`, { headers: { 'Authorization': `Bearer ${token}` } });
      const rooms = await resRoom.json();
      const fullRoom = rooms.data?.find(r => r.id === room.id) || room;
      
      const res = await fetch(`http://localhost:8000/api/admin/phong/${room.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          so_phong: room.so_phong,
          id_loai_phong: fullRoom.id_loai_phong,
          id_tang: fullRoom.id_tang,
          trang_thai: statusModal.selectedStatus
        })
      });
      if (res.ok) {
        setStatusModal(null);
        fetchData();
      } else {
        const d = await res.json();
        alert(d.message || 'Lỗi khi cập nhật');
      }
    } catch (e) {
      alert('Lỗi kết nối');
    } finally {
      setChangingStatus(false);
    }
  };
  const getRoomStyle = (status) => {
    // Find custom label from API data
    const customStatus = roomStatuses.find(s => s.id === status);
    const customLabel = customStatus ? customStatus.label : "KHÔNG RÕ";
    const defaultLabel = customStatus ? customStatus.label.toUpperCase() : "KHÔNG RÕ";

    switch (status) {
      case 'Trong':
        return {
          bg: "bg-emerald-50 border-emerald-200",
          text: "text-emerald-700",
          badgeBg: "bg-emerald-100",
          badgeText: "text-emerald-600",
          label: customStatus ? customStatus.label.toUpperCase() : "TRỐNG",
          kpiBorder: "border-emerald-500",
          kpiText: "text-emerald-500"
        };
      case 'Dang_Thue':
        return {
          bg: "bg-red-50 border-red-200",
          text: "text-red-700",
          badgeBg: "bg-red-100",
          badgeText: "text-red-600",
          label: customStatus ? customStatus.label.toUpperCase() : "ĐANG THUÊ",
          kpiBorder: "border-red-500",
          kpiText: "text-red-500"
        };
      case 'Dang_Don':
        return {
          bg: "bg-primary-50 border-primary-200",
          text: "text-primary-700",
          badgeBg: "bg-primary-100",
          badgeText: "text-primary-600",
          label: customStatus ? customStatus.label.toUpperCase() : "ĐANG DỌN",
          kpiBorder: "border-primary-500",
          kpiText: "text-primary-500"
        };
      case 'Bao_Tri':
        return {
          bg: "bg-slate-100 border-slate-300",
          text: "text-slate-700",
          badgeBg: "bg-slate-200",
          badgeText: "text-slate-600",
          label: customStatus ? customStatus.label.toUpperCase() : "BẢO TRÌ",
          kpiBorder: "border-slate-400",
          kpiText: "text-slate-500"
        };
      default:
        return {
          bg: customStatus?.color ? "" : "bg-amber-50 border-amber-200",
          text: customStatus?.color ? "" : "text-amber-700",
          badgeBg: customStatus?.color ? "" : "bg-amber-100",
          badgeText: customStatus?.color ? "" : "text-amber-600",
          label: defaultLabel,
          color: customStatus?.color,
          kpiBorder: customStatus?.color ? "" : "border-amber-500",
          kpiText: customStatus?.color ? "" : "text-amber-500"
        };
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-slate-500 font-medium animate-pulse">Đang tải dữ liệu sơ đồ phòng...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-red-500 font-medium">{error}</div>
      </div>
    );
  }

  return (
    <>
    <div className="p-4 md:p-8 flex-1 flex flex-col overflow-y-auto">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex-1 min-w-0 w-full md:w-auto">
          <h2 className="text-lg md:text-2xl font-extrabold text-slate-900 flex items-center gap-2 max-w-full min-w-0 w-full">
            <svg
              className="w-5 h-5 md:w-6 md:h-6 text-primary-600 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
            </svg>
            <span className="truncate">SƠ ĐỒ PHÒNG & GIÁM SÁT VẬN HÀNH</span>
          </h2>
          <p className="hidden md:block text-slate-500 text-sm mt-1">
            Hệ thống quản lý trạng thái buồng phòng theo thời gian thực
          </p>
        </div>
        <div className="flex w-full md:w-auto gap-2 md:gap-3 flex-row items-center overflow-x-auto scrollbar-hide py-1">
          <button
            onClick={() => setShowModal(true)}
            className="relative bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-3 md:px-4 rounded-lg shadow-sm flex items-center gap-2 transition-colors h-[42px] shrink-0"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
            </svg>
            <span className="hidden md:inline">Đơn Chờ Phân Bổ</span>
            {data?.kpis?.pending > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white">
                {data.kpis.pending}
              </span>
            )}
          </button>
          <button
            onClick={fetchData}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-3 md:px-4 rounded-lg shadow-sm flex items-center gap-2 transition-colors h-[42px] shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            <span className="hidden md:inline">Làm Mới</span>
          </button>
          <Link
            to="/admin/order-dich-vu"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3 md:px-4 rounded-lg shadow-sm flex items-center gap-2 transition-colors h-[42px] shrink-0"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              ></path>
            </svg>
            <span className="hidden md:inline">Gọi Dịch Vụ</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-slate-900">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Tổng Phòng
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{data?.kpis?.total || 0}</div>
        </div>
        
        {roomStatuses.map((status) => {
          const style = getRoomStyle(status.id);
          const count = data?.kpis?.statuses ? (data.kpis.statuses[status.id] || 0) : 0;
          return (
            <div key={status.id} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${style.kpiBorder}`} style={style.color ? { borderLeftColor: style.color } : {}}>
              <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${style.color ? '' : style.kpiText}`} style={style.color ? { color: style.color } : {}}>
                {status.label}
              </div>
              <div className={`text-3xl font-extrabold ${style.color ? '' : style.kpiText}`} style={style.color ? { color: style.color } : {}}>
                {count}
              </div>
            </div>
          );
        })}
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Đơn Chờ Gán
          </div>
          <div className="text-3xl font-extrabold text-blue-500">{data?.kpis?.pending || 0}</div>
        </div>
      </div>

      {/* Floors */}
      <div className="space-y-8">
        {data?.floors?.map((floor) => (
          <div key={floor.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-3 mb-4">
              {floor.ten_tang}
            </h3>
            {floor.phongs.length === 0 ? (
              <div className="text-slate-400 text-sm italic">Chưa có phòng nào ở tầng này.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {floor.phongs.map((room) => {
                  const style = getRoomStyle(room.trang_thai);
                  const textColor = style.color ? '#1e293b' : '';
                  const customStatusObj = roomStatuses.find(s => s.id === room.trang_thai);
                  const badgeTextColor = customStatusObj?.textColor || '';
                  return (
                    <div 
                      key={room.id} 
                      onClick={() => handleRoomClick(room)}
                      className={`${style.bg} border p-4 rounded-xl text-center cursor-pointer hover:shadow-lg transform hover:-translate-y-1 transition-all flex flex-col items-center justify-center min-h-[100px]`} 
                      style={style.color ? { backgroundColor: `${style.color}15`, borderColor: style.color } : {}}
                    >
                      <div className={`font-extrabold ${style.text} text-xl mb-1`} style={style.color ? { color: textColor } : {}}>
                        {room.so_phong}
                      </div>
                      <div className={`text-[10px] sm:text-xs font-semibold ${style.badgeText} ${style.badgeBg} py-1 px-2 rounded-full inline-block ${room.khach_hang ? 'mb-1' : ''}`} style={style.color ? { backgroundColor: style.color, color: badgeTextColor } : {}}>
                        {style.label}
                      </div>
                      {room.khach_hang && (
                        <div className={`text-[10px] font-medium truncate w-full ${style.text} opacity-80 mt-1`} title={room.khach_hang} style={style.color ? { color: '#475569' } : {}}>
                          {room.khach_hang}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        {data?.floors?.length === 0 && (
          <div className="text-center text-slate-500 p-8 bg-white rounded-2xl border border-slate-100">
            Khách sạn chưa có tầng nào được thiết lập.
          </div>
        )}
      </div>

      {/* Modal Phân Bổ */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="bg-primary-500 p-4 flex justify-between items-center text-white">
              <h5 className="font-bold flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  ></path>
                </svg>
                DANH SÁCH ĐƠN ĐẶT PHÒNG CHỜ PHÂN BỔ
              </h5>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-primary-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-slate-50">
              {loadingAllocations ? (
                <div className="text-center text-slate-500 py-8">Đang tải dữ liệu...</div>
              ) : pendingAllocations.length === 0 ? (
                <div className="text-center text-slate-500 py-8">Không có đơn đặt phòng nào đang chờ.</div>
              ) : (
                <div className="space-y-4">
                  {pendingAllocations.map(order => (
                    <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <h6 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                          {order.ten_khach_hang}
                          <span className="text-sm font-normal text-slate-500 border bg-slate-100 px-2 py-0.5 rounded-md">ID: #{order.id}</span>
                        </h6>
                        <div className="text-sm text-slate-600 mt-2 space-y-1">
                          <p><span className="font-medium">SĐT:</span> {order.sdt_khach_hang}</p>
                          <p><span className="font-medium">Ngày đặt:</span> {new Date(order.ngay_dat).toLocaleString()}</p>
                          <p><span className="font-medium">Trạng thái:</span> <span className="text-primary-600 font-bold">{order.trang_thai}</span></p>
                          <p><span className="font-medium">Phòng đã xếp tạm:</span> <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">{order.phong_da_gan || 'Chưa gán phòng'}</span></p>
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4">
                        <button onClick={() => handleUpdateStatus(order.id, 'Da_Nhan_Phong')} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors text-sm text-center">
                          Gán phòng (Check-in)
                        </button>
                        <button onClick={() => handleUpdateStatus(order.id, 'Da_Huy')} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 px-4 rounded-lg transition-colors text-sm text-center">
                          Hủy phòng
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-slate-50 text-right">
              <button
                onClick={() => setShowModal(false)}
                className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-lg hover:bg-slate-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

      {/* Quick status change modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Phòng {statusModal.room.so_phong}</h3>
                <p className="text-slate-400 text-sm">Thay đổi trạng thái phòng</p>
              </div>
              <button onClick={() => setStatusModal(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-5 space-y-2">
              {roomStatuses.filter(s => s.id !== 'Dang_Thue').map(s => (
                <button
                  key={s.id}
                  onClick={() => setStatusModal(prev => ({ ...prev, selectedStatus: s.id }))}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all font-semibold text-sm ${
                    statusModal.selectedStatus === s.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-100 hover:border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: s.color || '#94a3b8' }}></span>
                    {s.label}
                  </span>
                  {statusModal.selectedStatus === s.id && (
                    <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  )}
                </button>
              ))}
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3 justify-end">
              <button onClick={() => setStatusModal(null)} className="px-5 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50">
                Hủy
              </button>
              <button
                onClick={handleQuickStatusChange}
                disabled={changingStatus || statusModal.selectedStatus === statusModal.room.trang_thai}
                className="px-5 py-2 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changingStatus ? 'Đang lưu...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
