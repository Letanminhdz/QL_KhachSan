import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useUI } from "../contexts/UIContext";
import { tinhTienPhong } from "../utils/tinhTienPhong";

export default function ThanhToan() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const nextStatus = searchParams.get("next_status"); // trạng thái sẽ set sau khi thanh toán xong
  const navigate = useNavigate();
  const { showToast, showConfirm } = useUI();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serviceStatuses, setServiceStatuses] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    if (id) {
      fetchBookingDetail();
      fetchServiceStatuses();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchServiceStatuses = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/admin/service-statuses", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        setServiceStatuses(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBookingDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/admin/dat-phong/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      if (res.ok) {
        setBooking(await res.json());
      } else {
        showToast("Không tìm thấy đơn", "error");
      }
    } catch (e) {
      showToast("Lỗi kết nối", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = (amountToPay) => {
    const currentDaThanhToan = parseFloat(booking?.so_tien_da_thanh_toan || 0);
    const remaining = grandTotal - currentDaThanhToan;
    
    if (amountToPay < 0 || amountToPay > remaining) {
      showToast("Số tiền không hợp lệ!", "error");
      return;
    }

    const newDaThanhToan = currentDaThanhToan + parseFloat(amountToPay);
    const isFullyPaid = newDaThanhToan >= grandTotal;

    showConfirm(`Xác nhận thu ${formatCurrency(amountToPay)} cho đơn này?`, async () => {
      try {
        const token = localStorage.getItem("token");
        const payload = { 
          so_tien_da_thanh_toan: newDaThanhToan,
          tong_tien: grandTotal,
        };
        if (isFullyPaid) {
          payload.trang_thai_thanh_toan = 'Đã thanh toán';
        }

        const res = await fetch(`http://localhost:8000/api/admin/dat-phong/${id}/status`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        });
        
        if (res.ok) {
          // Nếu có next_status (từ luồng checkout), set trạng thái out sau khi thanh toán thành công
          if (isFullyPaid && nextStatus) {
            try {
              await fetch(`http://localhost:8000/api/admin/dat-phong/${id}/status`, {
                method: "PUT",
                headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json",
                  "Accept": "application/json"
                },
                body: JSON.stringify({ trang_thai: nextStatus })
              });
            } catch (e) {
              console.error("Lỗi set trạng thái out:", e);
            }
          }
          showToast("Thanh toán thành công!", "success");
          fetchBookingDetail();
          if (isFullyPaid) {
             navigate("/admin/dat-phong");
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          const msg = errData.message || JSON.stringify(errData.errors || errData) || "Lỗi không xác định";
          showToast("Lỗi: " + msg, "error");
        }
      } catch (e) {
        showToast("Lỗi kết nối", "error");
      }
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (includeTime) {
      return date.toLocaleDateString('vi-VN') + " " + date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
    }
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <main className="flex-grow bg-slate-50 py-8 flex justify-center items-center">
        <div className="text-slate-500 font-bold">Đang tải dữ liệu...</div>
      </main>
    );
  }

  if (!id || !booking) {
    return (
      <main className="flex-grow bg-slate-50 py-8 flex flex-col justify-center items-center">
        <div className="text-slate-500 font-bold mb-4">Không tìm thấy dữ liệu hóa đơn. Vui lòng chọn một đơn từ Quản lý Đơn đặt phòng.</div>
        <Link to="/admin/dat-phong" className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold">Quay Lại</Link>
      </main>
    );
  }

  // Caculate totals
  const actualCheckoutDate = nextStatus ? new Date() : new Date(booking.ngay_tra_phong);
  const kqTinhTien = tinhTienPhong(booking.ngay_nhan_phong, actualCheckoutDate, booking.gia_phong_khi_dat);
  const tongTienPhong = kqTinhTien.tongTien * booking.so_luong_phong;
  
  const dichVuItems = booking.su_dung_dich_vus || [];
  
  // Lọc các dịch vụ có trạng thái charge_fee = true
  const chargedDichVuItems = dichVuItems.filter(dv => {
    const statusConfig = serviceStatuses.find(s => s.id === dv.trang_thai);
    return statusConfig?.charge_fee === true;
  });

  const tongTienDichVu = chargedDichVuItems.reduce((acc, curr) => acc + parseFloat(curr.tong_tien), 0);
  
  const grandTotal = tongTienPhong + tongTienDichVu;
  const daThanhToan = parseFloat(booking.so_tien_da_thanh_toan || 0);
  const tienConLai = grandTotal - daThanhToan;

  return (
    <>
      <div className="p-4 md:p-8 flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path>
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"></path>
            </svg>
            Thanh Toán Trả Phòng
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Hóa đơn tổng hợp dịch vụ và phòng lưu trú
          </p>
        </div>
        <Link
          to="/admin/dat-phong"
          className="text-primary-700 font-bold flex items-center justify-center gap-2 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors w-full md:w-auto h-[42px] whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Quay Về Quản Lý Đơn
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col relative z-10">
          <div className="p-8">
            <div className="border-b border-slate-200 pb-6 mb-6 flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h4 className="text-lg font-bold text-slate-800">
                  Khách hàng: {booking.ten_khach_hang}
                </h4>
                <p className="text-slate-500 text-sm">SĐT: {booking.sdt_khach_hang}</p>
                <p className="text-slate-500 text-sm mt-2">
                  Phòng được phân bổ:{" "}
                  <span className="font-bold text-primary-600">
                    {booking.phan_bo_phongs?.length > 0 
                      ? booking.phan_bo_phongs.map(p => p.phong?.so_phong || p.id_phong).join(', ') 
                      : 'Chưa xếp phòng'}
                  </span>
                </p>
              </div>
              <div className="text-left md:text-right">
                <div className="text-sm text-slate-500">
                  Mã Đơn:{" "}
                  <span className="font-bold text-slate-800">#{booking.id}</span>
                </div>
                <div className="text-sm text-slate-500">
                  Nhận phòng: {formatDate(booking.ngay_nhan_phong, true)}
                </div>
                <div className="text-sm text-slate-500">
                  Trả phòng: {formatDate(actualCheckoutDate.toISOString(), true)}
                </div>
                <div className="mt-2 text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block">
                  {kqTinhTien.loaiHinh === 'Theo giờ' ? `${kqTinhTien.soGioLe} giờ` : `${kqTinhTien.soNgay} đêm`}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h5 className="font-bold text-slate-800 mb-4 border-l-4 border-primary-500 pl-2">
                1. Tiền Phòng
              </h5>
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="py-2 px-4 text-left">Hạng Phòng</th>
                    <th className="py-2 px-4 text-center">Số lượng</th>
                    <th className="py-2 px-4 text-center">Số đêm</th>
                    <th className="py-2 px-4 text-right">Đơn giá/đêm</th>
                    <th className="py-2 px-4 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {booking.ten_loai_phong_khi_dat}
                      {kqTinhTien.loaiHinh === 'Theo giờ' && (
                        <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Thuê theo giờ</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">{booking.so_luong_phong}</td>
                    <td className="py-3 px-4 text-center">{kqTinhTien.loaiHinh === 'Theo giờ' ? kqTinhTien.soGioLe + ' giờ' : kqTinhTien.soNgay + ' đêm'}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(booking.gia_phong_khi_dat)}</td>
                    <td className="py-3 px-4 text-right font-bold">{formatCurrency(tongTienPhong)}</td>
                  </tr>
                  {kqTinhTien.phuThu > 0 && (
                    <tr>
                      <td colSpan="5" className="py-2 px-4 bg-red-50 text-red-700 text-sm">
                        <div className="font-bold mb-1">Phụ thu (x {booking.so_luong_phong} phòng): {formatCurrency(kqTinhTien.phuThu * booking.so_luong_phong)}</div>
                        <ul className="list-disc pl-5 text-xs">
                          {kqTinhTien.chiTietPhuThu.map((pt, idx) => (
                            <li key={idx}>{pt}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mb-8">
              <h5 className="font-bold text-slate-800 mb-4 border-l-4 border-primary-500 pl-2">
                2. Tiền Dịch Vụ / Gọi Món
              </h5>
              {chargedDichVuItems.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="py-2 px-4 text-left">Dịch vụ</th>
                      <th className="py-2 px-4 text-center">Số lượng</th>
                      <th className="py-2 px-4 text-right">Đơn giá</th>
                      <th className="py-2 px-4 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {chargedDichVuItems.map(dv => (
                      <tr key={dv.id}>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {dv.dich_vu?.ten_dich_vu || 'Dịch vụ'}
                        </td>
                        <td className="py-3 px-4 text-center">{dv.so_luong}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(dv.tong_tien / dv.so_luong)}</td>
                        <td className="py-3 px-4 text-right font-bold">{formatCurrency(dv.tong_tien)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded text-center">Khách chưa sử dụng dịch vụ nào.</div>
              )}
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600">Tổng tiền phòng:</span>
                <span className="font-bold text-slate-800">{formatCurrency(tongTienPhong)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600">Tổng dịch vụ:</span>
                <span className="font-bold text-slate-800">{formatCurrency(tongTienDichVu)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-600">Đã thanh toán trước:</span>
                <span className="font-bold text-emerald-600">- {formatCurrency(daThanhToan)}</span>
              </div>
              <div className="border-t border-slate-300 pt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-slate-800">
                  SỐ TIỀN CẦN THANH TOÁN:
                </span>
                <span className="text-2xl font-extrabold text-red-600">
                  {formatCurrency(tienConLai)}
                </span>
              </div>
            </div>

            {booking.trang_thai_thanh_toan !== 'Đã thanh toán' ? (
              <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
                <button className="bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl hover:bg-slate-300 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  In Hóa Đơn
                </button>
                <button onClick={() => {
                  handleConfirmPayment(tienConLai);
                }} className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-3 px-8 rounded-xl hover:from-emerald-600 hover:to-emerald-700 shadow-md transition-all flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  Thanh Toán Toàn Bộ Số Còn Lại
                </button>
              </div>
            ) : (
              <div className="mt-8 text-center border border-emerald-200 bg-emerald-50 text-emerald-700 p-4 rounded-xl font-bold flex justify-center items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                Đơn này đã được thanh toán hoàn tất
              </div>
            )}
          </div>
        </div>
      </div>

    </>
  );
}
