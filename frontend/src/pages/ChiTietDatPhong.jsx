import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useUI } from "../contexts/UIContext";

export default function ChiTietDatPhong() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const { user } = useUI();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusConfigs, setStatusConfigs] = useState([]);

  useEffect(() => {
    if (!id || !user) {
      setLoading(false);
      return;
    }

    const fetchBookingAndStatuses = async () => {
      try {
        const token = localStorage.getItem("token");

        let resBookings;
        let resStatuses;

        if (user.vai_tro === 'Admin') {
          [resBookings, resStatuses] = await Promise.all([
            fetch(`http://localhost:8000/api/admin/dat-phong/${id}`, { headers: { "Authorization": `Bearer ${token}` } }),
            fetch("http://localhost:8000/api/booking-statuses")
          ]);
        } else {
          [resBookings, resStatuses] = await Promise.all([
            fetch(`http://localhost:8000/api/lich-su-dat-phong`, { headers: { "Authorization": `Bearer ${token}` } }),
            fetch("http://localhost:8000/api/booking-statuses")
          ]);
        }

        if (resStatuses.ok) setStatusConfigs(await resStatuses.json());

        if (resBookings.ok) {
          if (user.vai_tro === 'Admin') {
            setBooking(await resBookings.json());
          } else {
            const bookings = await resBookings.json();
            const found = bookings.find(b => b.id.toString() === id);
            setBooking(found);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingAndStatuses();
  }, [id, user]);

  const getStatusDisplay = (statusId) => {
    return statusConfigs.find(s => s.id === statusId) || { label: statusId, color: '#ffffff', textColor: '#000000' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + " " + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <main className="flex-grow bg-slate-50 py-16 text-center"><p className="text-slate-500 font-bold">Đang tải dữ liệu...</p></main>;
  }

  if (!booking) {
    return (
      <main className="flex-grow bg-slate-50 py-16 text-center">
        <p className="text-slate-500 font-bold mb-4">Không tìm thấy đơn đặt phòng hoặc bạn không có quyền xem.</p>
        <Link to="/tai-khoan" className="text-primary-600 font-bold hover:underline">Về trang Tài Khoản</Link>
      </main>
    );
  }

  return (
    <div className={`flex-1 flex flex-col h-full overflow-y-auto ${user?.vai_tro === 'Admin' ? 'p-4 md:p-8 bg-transparent' : 'bg-slate-50 py-12'}`}>
      <div className={`${user?.vai_tro === 'Admin' ? 'w-full max-w-5xl mx-auto' : 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'}`}>

        {/* Header Section */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1 min-w-0 w-full md:w-auto flex items-center gap-3">
            <button onClick={() => window.history.back()} className="text-slate-400 hover:text-primary-600 transition-colors shrink-0 bg-white border border-slate-200 p-2 rounded-xl shadow-sm" title="Quay lại">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-extrabold text-slate-900 truncate">
                Chi Tiết Đơn Đặt Phòng <span className="text-primary-600">#{booking.id}</span>
              </h1>
              <p className="hidden md:block text-slate-500 text-sm mt-1">
                Xem toàn bộ thông tin về khách hàng, phòng, lưu trú và thanh toán
              </p>
            </div>
          </div>

          <div
            className="px-4 py-2 rounded-xl font-bold text-sm border shadow-sm shrink-0 whitespace-nowrap"
            style={{
              backgroundColor: getStatusDisplay(booking.trang_thai).color !== '#ffffff' ? getStatusDisplay(booking.trang_thai).color + '15' : '#f8fafc',
              color: getStatusDisplay(booking.trang_thai).color !== '#ffffff' ? getStatusDisplay(booking.trang_thai).color : '#334155',
              borderColor: getStatusDisplay(booking.trang_thai).color !== '#ffffff' ? getStatusDisplay(booking.trang_thai).color + '40' : '#cbd5e1'
            }}
          >
            {getStatusDisplay(booking.trang_thai).label}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative z-10">

          <div className="p-8">
            <div className="mb-8">
              <h4 className="font-bold text-slate-400 uppercase text-sm tracking-wider mb-4">Thông Tin Khách Hàng</h4>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-6">
                <div className="flex-1 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0">
                  <p className="text-slate-500 text-sm mb-1 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    Họ và tên
                  </p>
                  <p className="font-bold text-slate-800 text-lg">{booking.ten_khach_hang}</p>
                </div>
                <div className="flex-1 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0">
                  <p className="text-slate-500 text-sm mb-1 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    Số điện thoại
                  </p>
                  <p className="font-bold text-slate-800 text-lg">{booking.sdt_khach_hang || 'Chưa cung cấp'}</p>
                </div>
                <div className="flex-1">
                  <p className="text-slate-500 text-sm mb-1 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Ghi chú
                  </p>
                  <p className="font-medium text-slate-700">{booking.ghi_chu || 'Không có'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h4 className="font-bold text-slate-400 uppercase text-sm tracking-wider">Thông Tin Phòng</h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Loại phòng:</span>
                    <span className="font-bold text-slate-800">{booking.ten_loai_phong_khi_dat}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Số lượng:</span>
                    <span className="font-bold text-slate-800">{booking.so_luong_phong} phòng</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Giá đặt:</span>
                    <span className="font-bold text-slate-800">{formatCurrency(booking.gia_phong_khi_dat)} / đêm</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-slate-400 uppercase text-sm tracking-wider">Thời Gian Lưu Trú</h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Nhận phòng:
                    </span>
                    <span className="font-bold text-slate-800">{formatDate(booking.ngay_nhan_phong)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span> Trả phòng:
                    </span>
                    <span className="font-bold text-slate-800">{formatDate(booking.ngay_tra_phong)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-8">
              <h4 className="font-bold text-slate-400 uppercase text-sm tracking-wider mb-4">Tình Trạng Hóa Đơn</h4>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Tổng tiền phòng:</span>
                  <span className="font-bold text-slate-800 text-xl">{formatCurrency(booking.tong_tien)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Đã thanh toán trước:</span>
                  <span className="font-bold text-emerald-600 text-xl">{formatCurrency(booking.so_tien_da_thanh_toan || 0)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-4 mt-2">
                  <span className="font-bold text-slate-700 text-lg">Trạng thái thanh toán:</span>
                  <span className={`font-bold px-4 py-2 rounded-xl text-sm ${booking.trang_thai_thanh_toan === 'Đã thanh toán'
                      ? 'bg-emerald-100 text-emerald-700'
                      : parseFloat(booking.so_tien_da_thanh_toan || 0) > 0
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                    {booking.trang_thai_thanh_toan === 'Đã thanh toán' ? 'Đã thu tiền' : parseFloat(booking.so_tien_da_thanh_toan || 0) > 0 ? `Đã cọc ${formatCurrency(booking.so_tien_da_thanh_toan)}` : 'Chưa thu'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
