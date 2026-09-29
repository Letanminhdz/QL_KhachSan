import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const [loaiPhongs, setLoaiPhongs] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    const formatLocal = (d) => {
      const pad = (n) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const today = new Date();
    // Làm tròn lên giờ chẵn
    if (today.getMinutes() > 0 || today.getSeconds() > 0) {
      today.setHours(today.getHours() + 1);
    }
    today.setMinutes(0, 0, 0);
    
    // +1 tiếng mặc định
    today.setHours(today.getHours() + 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    setCheckIn(formatLocal(today));
    setCheckOut(formatLocal(tomorrow));

    // Fetch room types
    const fetchRooms = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/loai-phong");
        if (res.ok) {
          const data = await res.json();
          setLoaiPhongs(data);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách phòng:", err);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(
      `/tim-phong?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}`,
    );
  };

  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80",
  ];

  return (
    <main className="flex-grow flex flex-col">
      {/* Hero Panoramic */}
      <div className="relative min-h-[520px] flex items-center overflow-hidden text-white rounded-3xl m-4 z-0">
        {/* Lớp ảnh nền */}
        <div className="absolute -top-[5%] -bottom-[5%] -left-[8%] -right-[8%] bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=90')] bg-center bg-cover scale-105 z-0"></div>
        {/* Hiệu ứng tối 2 bên (vignette) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050a14d9] via-[#050a1473] to-[#050a14d9] z-10"></div>
        {/* Overlay gradient trên-dưới */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050a148c] via-[#050a1440] to-[#050a14b3] z-20"></div>

        {/* Nội dung */}
        <div className="relative z-30 w-full py-14 px-4 text-center">
          <div className="container mx-auto">
            {/* Badge 5 sao */}
            <span className="inline-flex items-center gap-1 bg-gradient-to-br from-primary-600 to-primary-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-[0_4px_14px_rgba(217,119,6,0.4)] mb-5">
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              5 Sao
            </span>

            {/* Tiêu đề nổi bật */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-3 mb-4 text-white/50">
                <span className="block h-px w-16 bg-white/30"></span>
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="block h-px w-16 bg-white/30"></span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-2">
                ROYAL HOTEL
                <br />
                <span className="text-primary-500 font-serif italic">
                  &amp;
                </span>{" "}
                RESORT
              </h1>
              <p className="text-lg md:text-xl font-medium text-white/90">
                Sang trọng &nbsp;·&nbsp; Dịch vụ chuẩn quốc tế &nbsp;·&nbsp; Ẩm
                thực đỉnh cao
              </p>
            </div>

            {/* Search Box */}
            <div className="max-w-[980px] mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl md:rounded-full border border-white/20 shadow-2xl">
              <form
                onSubmit={handleSearch}
                className="grid grid-cols-2 md:flex md:flex-row bg-white rounded-2xl md:rounded-full overflow-hidden p-1.5 gap-0 md:gap-1 border border-slate-200 shadow-md"
              >
                <div className="col-span-1 md:flex-1 px-3 md:px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer group rounded-tl-xl md:rounded-l-full md:rounded-none relative border-r border-b md:border-b-0 border-slate-100 md:border-transparent">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <svg
                      className="w-3 h-3 text-primary-500 hidden sm:block"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    NHẬN PHÒNG
                  </label>
                  <div className="relative mt-0.5">
                    <div className="font-bold text-slate-900 pointer-events-none text-sm md:text-base flex items-center justify-between w-full pr-1 md:pr-2">
                      <span>
                        {checkIn ? new Date(checkIn).toLocaleString('vi-VN', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'}) : ""}
                      </span>
                      <svg
                        className="w-3.5 h-3.5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                    </div>
                    <input
                      type="datetime-local"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      required
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="hidden md:block absolute right-0 top-1/4 bottom-1/4 w-px bg-slate-200"></div>
                </div>

                <div className="col-span-1 md:flex-1 px-3 md:px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer group rounded-tr-xl md:rounded-none relative border-b md:border-b-0 border-slate-100 md:border-transparent">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <svg
                      className="w-3 h-3 text-primary-500 hidden sm:block"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    TRẢ PHÒNG
                  </label>
                  <div className="relative mt-0.5">
                    <div className="font-bold text-slate-900 pointer-events-none text-sm md:text-base flex items-center justify-between w-full pr-1 md:pr-2">
                      <span>
                        {checkOut ? new Date(checkOut).toLocaleString('vi-VN', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'}) : ""}
                      </span>
                      <svg
                        className="w-3.5 h-3.5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                    </div>
                    <input
                      type="datetime-local"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      required
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="hidden md:block absolute right-0 top-1/4 bottom-1/4 w-px bg-slate-200"></div>
                </div>

                <div className="col-span-1 md:w-32 px-3 md:px-4 py-2 hover:bg-slate-50 transition-colors group relative border-r border-slate-100 md:border-transparent flex flex-col justify-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <svg
                      className="w-3 h-3 text-primary-500 hidden sm:block"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    NGƯỜI LỚN
                  </label>
                  <div className="flex items-center gap-2 md:gap-3 mt-0.5">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-slate-100 hover:bg-primary-100 hover:text-primary-600 flex items-center justify-center font-bold text-slate-500 transition-colors"
                    >
                      -
                    </button>
                    <span className="font-bold text-slate-900 w-4 text-center text-sm md:text-base">
                      {adults}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults + 1))}
                      className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-slate-100 hover:bg-primary-100 hover:text-primary-600 flex items-center justify-center font-bold text-slate-500 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="hidden md:block absolute right-0 top-1/4 bottom-1/4 w-px bg-slate-200"></div>
                </div>

                <div className="col-span-1 md:w-32 px-3 md:px-4 py-2 hover:bg-slate-50 transition-colors group relative border-slate-100 md:border-transparent flex flex-col justify-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <svg
                      className="w-3 h-3 text-primary-500 hidden sm:block"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    TRẺ EM
                  </label>
                  <div className="flex items-center gap-2 md:gap-3 mt-0.5">
                    <button
                      type="button"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-slate-100 hover:bg-primary-100 hover:text-primary-600 flex items-center justify-center font-bold text-slate-500 transition-colors"
                    >
                      -
                    </button>
                    <span className="font-bold text-slate-900 w-4 text-center text-sm md:text-base">
                      {children}
                    </span>
                    <button
                      type="button"
                      onClick={() => setChildren(Math.max(0, children + 1))}
                      className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-slate-100 hover:bg-primary-100 hover:text-primary-600 flex items-center justify-center font-bold text-slate-500 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="col-span-2 md:col-span-1 md:w-36 bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-xl md:rounded-full py-2.5 md:py-0 px-4 transition-transform hover:-translate-y-0.5 shadow-md flex items-center justify-center gap-2 m-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                  Tìm phòng
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Features Strip */}
      <div className="bg-white border-b border-slate-200 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl border border-primary-500 bg-primary-50 text-primary-600 flex items-center justify-center mb-2">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <span className="font-medium text-slate-800 text-sm">
                Đặt phòng an toàn
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl border border-primary-500 bg-primary-50 text-primary-600 flex items-center justify-center mb-2">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <span className="font-medium text-slate-800 text-sm">
                Phục vụ 24/7
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl border border-primary-500 bg-primary-50 text-primary-600 flex items-center justify-center mb-2">
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
                    d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"
                  ></path>
                </svg>
              </div>
              <span className="font-medium text-slate-800 text-sm">
                Ẩm thực đỉnh cao
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl border border-primary-500 bg-primary-50 text-primary-600 flex items-center justify-center mb-2">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <span className="font-medium text-slate-800 text-sm">
                Vị trí đắc địa
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Room Types Showcase */}
      <div className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="text-primary-500 font-bold uppercase tracking-[2px] text-xs mb-1">
              Bộ sưu tập
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">
              CÁC HẠNG PHÒNG
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingRooms ? (
              <div className="col-span-1 md:col-span-2 lg:col-span-4 text-center py-8 text-slate-500">
                Đang tải danh sách hạng phòng...
              </div>
            ) : loaiPhongs.length === 0 ? (
              <div className="col-span-1 md:col-span-2 lg:col-span-4 text-center py-8 text-slate-500">
                Chưa có hạng phòng nào.
              </div>
            ) : (
              loaiPhongs.map((phong) => (
                <div key={phong.id} className="bg-white rounded-[14px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 group flex flex-col">
                  <div className="relative h-[200px] overflow-hidden">
                    <Link to={`/chi-tiet-phong/${phong.id}`}>
                      <img
                        src={phong.hinh_anh ? (phong.hinh_anh.startsWith('http') ? phong.hinh_anh : `http://localhost:8000/${phong.hinh_anh}`) : "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=600&q=80"}
                        alt={phong.ten_loai}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                      />
                    </Link>
                    <span className="absolute bottom-2 left-2 bg-slate-900/70 text-white text-[11px] px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm pointer-events-none">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      Tối đa {phong.suc_chua} khách
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <Link to={`/chi-tiet-phong/${phong.id}`} className="hover:text-primary-600 transition-colors">
                      <h6 className="font-bold text-slate-900 mb-1">
                        {phong.ten_loai}
                      </h6>
                    </Link>
                    <p className="text-slate-500 text-[13px] leading-relaxed line-clamp-2 mb-4 flex-grow">
                      {phong.mo_ta || "Phòng tiêu chuẩn với đầy đủ tiện nghi, mang lại sự thoải mái nhất cho kỳ nghỉ của bạn."}
                    </p>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                      <div>
                        <div className="text-slate-500 text-[11px]">Từ</div>
                        <div className="font-bold text-red-600 text-base">
                          {new Intl.NumberFormat('vi-VN').format(phong.gia_co_ban)} đ
                        </div>
                      </div>
                      <Link
                        to={`/chi-tiet-phong/${phong.id}`}
                        className="bg-gradient-to-br from-primary-600 to-primary-700 text-white text-sm font-semibold py-1.5 px-4 rounded-full hover:from-primary-700 hover:to-primary-800 shadow-sm flex items-center gap-1"
                      >
                        Chi tiết{" "}
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          ></path>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tiện Nghi & Dịch Vụ */}
      <div className="py-16 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="w-full lg:w-5/12">
              <div className="text-primary-500 font-bold uppercase tracking-[2px] text-xs mb-2">
                Dịch vụ cao cấp
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
                TIỆN NGHI NỔI BẬT
              </h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Trải nghiệm những dịch vụ đẳng cấp 5 sao được thiết kế riêng
                biệt để mang lại cho bạn một kỳ nghỉ hoàn hảo và trọn vẹn nhất.
              </p>

              <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setActiveSlide(0)}
                  className={`p-4 flex items-center gap-4 text-left transition-colors border-b border-slate-100 ${activeSlide === 0 ? "bg-slate-50" : "bg-white hover:bg-slate-50"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${activeSlide === 0 ? "bg-primary-100 text-primary-600" : "bg-slate-100 text-slate-700"}`}
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
                        d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"
                      ></path>
                    </svg>
                  </div>
                  <h6 className="font-bold text-slate-800 m-0">
                    Bữa sáng Buffet Á - Âu tại phòng
                  </h6>
                </button>
                <button
                  onClick={() => setActiveSlide(1)}
                  className={`p-4 flex items-center gap-4 text-left transition-colors border-b border-slate-100 ${activeSlide === 1 ? "bg-slate-50" : "bg-white hover:bg-slate-50"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${activeSlide === 1 ? "bg-primary-100 text-primary-600" : "bg-slate-100 text-slate-700"}`}
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
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      ></path>
                    </svg>
                  </div>
                  <h6 className="font-bold text-slate-800 m-0">
                    Giặt ủi quần áo lấy ngay
                  </h6>
                </button>
                <button
                  onClick={() => setActiveSlide(2)}
                  className={`p-4 flex items-center gap-4 text-left transition-colors ${activeSlide === 2 ? "bg-slate-50" : "bg-white hover:bg-slate-50"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${activeSlide === 2 ? "bg-primary-100 text-primary-600" : "bg-slate-100 text-slate-700"}`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path>
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-2a1 1 0 011-1h1.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-4a1 1 0 00-.293-.707l-2-2A1 1 0 0017 5h-4a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 00-1-1z"></path>
                    </svg>
                  </div>
                  <h6 className="font-bold text-slate-800 m-0">
                    Xe đưa đón sân bay 4 chỗ
                  </h6>
                </button>
              </div>
            </div>

            <div className="w-full lg:w-7/12">
              <div className="relative h-[400px] rounded-[24px] overflow-hidden shadow-2xl">
                {slides.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt="Amenity"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${activeSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                  />
                ))}

                {/* Dots */}
                <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveSlide(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${activeSlide === index ? "bg-white" : "bg-white/50 hover:bg-white/80"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
