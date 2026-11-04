import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function ChiTietPhong() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [phong, setPhong] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhong = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/loai-phong/${id}`);
        if (res.ok) {
          const data = await res.json();
          setPhong(data);
        } else {
          navigate("/"); // Về trang chủ nếu lỗi
        }
      } catch (error) {
        console.error("Lỗi khi tải chi tiết phòng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPhong();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!phong) return null;

  const hinhAnh = phong.hinh_anh ? (phong.hinh_anh.startsWith('http') ? phong.hinh_anh : `http://localhost:8000/${phong.hinh_anh}`) : 'http://localhost:8000/storage/defaults/room_1200.jpg';
  const moTa = phong.mo_ta || "Chưa có mô tả cho loại phòng này.";
  const tienIch = phong.tien_ich || ["Wifi miễn phí", "Điều hòa", "Tivi", "Phòng tắm riêng"];

  return (
    <div className="flex-grow bg-slate-50">
      {/* Banner Ảnh */}
      <div className="relative h-[40vh] md:h-[60vh] overflow-hidden">
        <img src={hinhAnh} alt={phong.ten_loai} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4">{phong.ten_loai}</h1>
            <p className="text-lg md:text-xl font-medium flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
              </svg>
              Sức chứa tối đa: {phong.suc_chua} người
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Thông tin chi tiết */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-4">Mô Tả Hạng Phòng</h2>
              <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {moTa}
              </div>
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-4">Tiện Ích Nổi Bật</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tienIch.map((ti, index) => (
                  <div key={index} className="flex items-center gap-2 text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span className="font-medium text-sm">{ti}</span>
                  </div>
                ))}
              </div>
            </section>

            {phong.hinh_anh_phu && phong.hinh_anh_phu.length > 0 && (
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-4">Thư Viện Ảnh</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {phong.hinh_anh_phu.map((anh, idx) => (
                    <div key={idx} className="relative h-32 md:h-48 rounded-lg overflow-hidden border border-slate-200">
                      <img src={anh.startsWith('http') ? anh : `http://localhost:8000/${anh}`} alt={`Ảnh phụ ${idx+1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Đặt phòng Sticky Card */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-primary-100 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Giá Cơ Bản</div>
                <div className="text-4xl font-extrabold text-red-600">
                  {new Intl.NumberFormat('vi-VN').format(phong.gia_co_ban)} đ
                </div>
                <div className="text-slate-400 text-sm mt-1">/ đêm</div>
              </div>
              
              <Link 
                to={`/checkout?loai_phong=${phong.id}`}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                Đặt Phòng Ngay
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
