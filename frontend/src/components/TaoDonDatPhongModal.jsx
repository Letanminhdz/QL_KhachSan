import { useState, useEffect } from "react";
import { useUI } from "../contexts/UIContext";
import { tinhTienPhong } from "../utils/tinhTienPhong";
import { toDateTimeLocal, getNowDateTimeLocal } from "../utils/dateHelper";

export default function TaoDonDatPhongModal({ isOpen, onClose, onSuccess }) {
  const { showToast } = useUI();
  const [loading, setLoading] = useState(false);
  const [loaiPhongs, setLoaiPhongs] = useState([]);

  // Hàm lấy thời gian định dạng YYYY-MM-DDTHH:mm
  const formatDateTimeLocal = (date) => {
    const pad = (n) => n.toString().padStart(2, "0");
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const h = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${y}-${m}-${d}T${h}:${min}`;
  };

  const getInitialDates = () => {
    const now = new Date();
    // Giờ nhận phòng mặc định: 14:00 hôm nay
    const checkIn = new Date(now);
    checkIn.setHours(14, 0, 0, 0);

    // Giờ trả phòng mặc định: 12:00 ngày mai
    const checkOut = new Date(now);
    checkOut.setDate(checkOut.getDate() + 1);
    checkOut.setHours(12, 0, 0, 0);

    return {
      checkIn: formatDateTimeLocal(now), // Thời điểm hiện tại nếu ở luôn
      checkInStandard: formatDateTimeLocal(checkIn), // 14:00 hôm nay nếu đặt trước
      checkOut: formatDateTimeLocal(checkOut), // 12:00 ngày mai
    };
  };

  const initialDates = getInitialDates();

  const [formData, setFormData] = useState({
    loai_dat: "dat_truoc", // 'dat_truoc' hoặc 'o_luon'
    ten_khach_hang: "",
    sdt_khach_hang: "",
    id_loai_phong: "",
    so_luong_phong: 1,
    ngay_nhan_phong: initialDates.checkInStandard,
    ngay_tra_phong: initialDates.checkOut,
  });

  useEffect(() => {
    if (isOpen) {
      fetchLoaiPhongs();
      const dates = getInitialDates();
      setFormData((prev) => ({
        ...prev,
        ngay_nhan_phong: prev.loai_dat === "o_luon" ? formatDateTimeLocal(new Date()) : dates.checkInStandard,
        ngay_tra_phong: dates.checkOut,
      }));
    }
  }, [isOpen]);

  // Khi chuyển qua lại giữa Đặt trước và Ở luôn
  const handleModeChange = (mode) => {
    if (mode === "o_luon") {
      setFormData((prev) => ({
        ...prev,
        loai_dat: "o_luon",
        ngay_nhan_phong: formatDateTimeLocal(new Date()),
      }));
    } else {
      const dates = getInitialDates();
      setFormData((prev) => ({
        ...prev,
        loai_dat: "dat_truoc",
        ngay_nhan_phong: dates.checkInStandard,
      }));
    }
  };

  const fetchLoaiPhongs = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/loai-phong");
      if (res.ok) {
        const data = await res.json();
        setLoaiPhongs(data);
        if (data.length > 0 && !formData.id_loai_phong) {
          setFormData((prev) => ({ ...prev, id_loai_phong: data[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const handleCheckInChange = (newVal) => {
    if (!newVal) return;
    const inDate = new Date(newVal);
    const outDate = new Date(formData.ngay_tra_phong);
    let nextOut = formData.ngay_tra_phong;
    if (isNaN(outDate.getTime()) || outDate <= inDate) {
      const d = new Date(inDate);
      d.setDate(d.getDate() + 1);
      nextOut = toDateTimeLocal(d);
    }
    setFormData((prev) => ({
      ...prev,
      ngay_nhan_phong: newVal,
      ngay_tra_phong: nextOut,
    }));
  };

  const handleCheckOutChange = (newVal) => {
    if (!newVal) return;
    const inDate = new Date(formData.ngay_nhan_phong);
    const outDate = new Date(newVal);
    if (outDate <= inDate) {
      showToast("Thời gian trả phòng phải sau thời gian nhận phòng!", "error");
      const d = new Date(inDate);
      d.setDate(d.getDate() + 1);
      setFormData((prev) => ({ ...prev, ngay_tra_phong: toDateTimeLocal(d) }));
      return;
    }
    setFormData((prev) => ({ ...prev, ngay_tra_phong: newVal }));
  };

  const selectedLoaiPhong = loaiPhongs.find((lp) => lp.id === Number(formData.id_loai_phong));
  const giaCoBan = selectedLoaiPhong ? Number(selectedLoaiPhong.gia_co_ban) : 0;
  const count = Number(formData.so_luong_phong) || 1;

  // Tính tiền chính xác dùng utility tinhTienPhong
  const ketQuaTinh = tinhTienPhong(formData.ngay_nhan_phong, formData.ngay_tra_phong, giaCoBan);
  const tongTienDuKien = (ketQuaTinh.tongTien || 0) * count;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ten_khach_hang.trim() || !formData.sdt_khach_hang.trim()) {
      showToast("Vui lòng điền họ tên và số điện thoại!", "error");
      return;
    }

    if (formData.loai_dat === "dat_truoc" && new Date(formData.ngay_nhan_phong) < new Date(Date.now() - 5 * 60 * 1000)) {
      showToast("Thời gian nhận phòng không được ở quá khứ!", "error");
      return;
    }

    if (new Date(formData.ngay_tra_phong) <= new Date(formData.ngay_nhan_phong)) {
      showToast("Thời gian trả phòng phải sau thời gian nhận phòng!", "error");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/chat-bot/book-direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          id_loai_phong: formData.id_loai_phong,
          ngay_nhan_phong: formData.ngay_nhan_phong,
          ngay_tra_phong: formData.ngay_tra_phong,
          so_luong_phong: count,
          ten_khach_hang: formData.ten_khach_hang.trim(),
          sdt_khach_hang: formData.sdt_khach_hang.trim(),
          loai_dat: formData.loai_dat,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          formData.loai_dat === "o_luon" 
            ? "Tạo đơn và nhận phòng (Check-in) thành công!" 
            : "Tạo đơn đặt trước thành công!", 
          "success"
        );
        if (onSuccess) onSuccess(data.booking);
        onClose();
      } else {
        showToast(data.message || "Không thể tạo đơn đặt phòng!", "error");
      }
    } catch (err) {
      showToast("Lỗi kết nối máy chủ!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide">Tạo Đơn Đặt Phòng</h3>
              <p className="text-xs text-primary-100">Dành cho Lễ tân & Quản trị viên lên đơn trực tiếp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/15 text-white transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* LỰA CHỌN TRẠNG THÁI: ĐẶT TRƯỚC vs Ở LUÔN */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
              Hình thức nhận phòng
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleModeChange("dat_truoc")}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  formData.loai_dat === "dat_truoc"
                    ? "border-amber-500 bg-amber-50/60 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    📅 Đặt trước
                  </span>
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    formData.loai_dat === "dat_truoc" ? "border-amber-600 bg-amber-600" : "border-slate-300"
                  }`}>
                    {formData.loai_dat === "dat_truoc" && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Tự chọn ngày giờ đến, vào trạng thái <strong>Chờ xác nhận</strong>
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange("o_luon")}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  formData.loai_dat === "o_luon"
                    ? "border-purple-600 bg-purple-50/60 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold text-sm text-purple-900 flex items-center gap-1.5">
                    🔑 Ở luôn (Check-in)
                  </span>
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    formData.loai_dat === "o_luon" ? "border-purple-600 bg-purple-600" : "border-slate-300"
                  }`}>
                    {formData.loai_dat === "o_luon" && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Nhận ngay bây giờ (khóa giờ IN), chuyển phòng sang <strong>Đang thuê</strong>
                </p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                Họ và tên khách hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.ten_khach_hang}
                onChange={(e) => setFormData({ ...formData, ten_khach_hang: e.target.value })}
                placeholder="VD: Nguyễn Văn A"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.sdt_khach_hang}
                onChange={(e) => setFormData({ ...formData, sdt_khach_hang: e.target.value })}
                placeholder="VD: 0987654321"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                Hạng phòng <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.id_loai_phong}
                onChange={(e) => setFormData({ ...formData, id_loai_phong: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none font-medium"
              >
                {loaiPhongs.map((lp) => (
                  <option key={lp.id} value={lp.id}>
                    {lp.ten_loai} - {Number(lp.gia_co_ban).toLocaleString("vi-VN")} đ
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                Số lượng phòng
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.so_luong_phong}
                onChange={(e) => setFormData({ ...formData, so_luong_phong: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          {/* CHỌN NGÀY VÀ GIỜ (datetime-local) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Nhận phòng (Check-in) <span className="text-red-500">*</span>
                </label>
                {formData.loai_dat === "o_luon" && (
                  <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">
                    Khóa giờ hiện tại
                  </span>
                )}
              </div>
              <input
                type="datetime-local"
                required
                readOnly={formData.loai_dat === "o_luon"}
                disabled={formData.loai_dat === "o_luon"}
                value={formData.ngay_nhan_phong}
                min={getNowDateTimeLocal()}
                onChange={(e) => handleCheckInChange(e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none font-medium transition-all ${
                  formData.loai_dat === "o_luon"
                    ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed select-none"
                    : "bg-slate-50 text-slate-800 border-slate-200 focus:ring-2 focus:ring-primary-500"
                }`}
              />
              {formData.loai_dat === "o_luon" && (
                <p className="text-[11px] text-purple-600 mt-1 flex items-center gap-1 font-medium">
                  <span>🔒</span> Tự động ghi nhận giờ khách vào ở ngay
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                Trả phòng (Check-out) <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={formData.ngay_tra_phong}
                min={formData.ngay_nhan_phong || getNowDateTimeLocal()}
                onChange={(e) => handleCheckOutChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Chuẩn trả phòng khách sạn: 12:00 trưa
              </p>
            </div>
          </div>

          {/* Tóm tắt tính tiền */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Hình thức tính: </span>
              <strong className="text-slate-800">
                {ketQuaTinh.loaiHinh === "Theo giờ" ? `${ketQuaTinh.soGioLe} giờ` : `${ketQuaTinh.soNgay || 1} ngày`}
              </strong>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {formData.so_luong_phong} phòng x {giaCoBan.toLocaleString("vi-VN")} đ/đêm
              </div>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[11px]">Tổng tiền dự kiến:</span>
              <strong className="text-base text-amber-700 font-extrabold">
                {tongTienDuKien.toLocaleString("vi-VN")} đ
              </strong>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                formData.loai_dat === "o_luon"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
              }`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <span>✓</span> {formData.loai_dat === "o_luon" ? "Tạo đơn & Nhận phòng" : "Tạo đơn đặt trước"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}