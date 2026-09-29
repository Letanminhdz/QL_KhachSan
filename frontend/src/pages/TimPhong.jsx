import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function TimPhong() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const formatForDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return '';
      const pad = (n) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  };

  const getDefaultDate = (isCheckOut = false) => {
    const d = new Date();
    if (isCheckOut) {
      d.setDate(d.getDate() + 1); // Tomorrow
      d.setHours(12, 0, 0); // 12:00 OUT
    } else {
      d.setHours(14, 0, 0); // 14:00 IN
    }
    return formatForDateTimeLocal(d);
  };

  const [checkIn, setCheckIn] = useState(() => searchParams.get('checkIn') ? formatForDateTimeLocal(searchParams.get('checkIn')) : getDefaultDate(false));
  const [checkOut, setCheckOut] = useState(() => searchParams.get('checkOut') ? formatForDateTimeLocal(searchParams.get('checkOut')) : getDefaultDate(true));
  const [adults, setAdults] = useState(() => parseInt(searchParams.get('adults')) || 1);
  const [children, setChildren] = useState(() => parseInt(searchParams.get('children')) || 0);
  const [showFilterBar, setShowFilterBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowFilterBar(false);
      } else {
        setShowFilterBar(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRooms = async (cin, cout) => {
    if (!cin || !cout) return;
    setLoading(true);
    setError(null);
    try {
      // Create proper MySQL datetime format from local time
      const cinDate = new Date(cin);
      const coutDate = new Date(cout);
      const pad = (n) => n.toString().padStart(2, '0');
      
      const fmtCin = `${cinDate.getFullYear()}-${pad(cinDate.getMonth()+1)}-${pad(cinDate.getDate())} ${pad(cinDate.getHours())}:${pad(cinDate.getMinutes())}:00`;
      const fmtCout = `${coutDate.getFullYear()}-${pad(coutDate.getMonth()+1)}-${pad(coutDate.getDate())} ${pad(coutDate.getHours())}:${pad(coutDate.getMinutes())}:00`;

      const res = await fetch("http://localhost:8000/api/phong/tim-kiem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          ngay_nhan_phong: fmtCin,
          ngay_tra_phong: fmtCout
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      } else {
        const errData = await res.json();
        setError(errData.message || "Lỗi khi tìm phòng");
      }
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms(checkIn, checkOut);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRooms(checkIn, checkOut);
  };

  const [roomCounts, setRoomCounts] = useState({});

  const handleRoomCountChange = (roomId, delta, max) => {
    setRoomCounts((prev) => {
      const current = prev[roomId] || 1;
      const next = Math.max(1, Math.min(max, current + delta));
      return { ...prev, [roomId]: next };
    });
  };

  const handleBook = (roomId) => {
    const count = roomCounts[roomId] || 1;
    navigate(`/checkout?room=${roomId}&count=${count}&in=${checkIn}&out=${checkOut}`);
  };

  return (
    <main className="flex-grow bg-slate-50 flex flex-col">
      {/* Filter Bar */}
      <div
        className={`bg-white border-b border-slate-200 py-5 shadow-sm sticky top-16 z-40 transition-transform duration-300 ease-in-out ${showFilterBar ? "translate-y-0" : "-translate-y-[150%]"}`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="grid grid-cols-2 md:flex md:flex-row bg-white rounded-2xl md:rounded-full overflow-hidden p-1.5 gap-0 md:gap-1 border border-slate-200 shadow-md">
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
              disabled={loading}
              className="col-span-2 md:col-span-1 md:w-36 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl md:rounded-full py-2.5 md:py-0 px-4 transition-transform hover:-translate-y-0.5 shadow-md flex items-center justify-center gap-2 m-1 disabled:opacity-50"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
              Cập nhật
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Phòng khả dụng
            </h2>
            <p className="text-slate-500 text-sm mt-2 flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 inline-flex shadow-sm">
              <svg
                className="w-4 h-4 text-primary-500"
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
              {checkIn && new Date(checkIn).toLocaleDateString('vi-VN')} &rarr; {checkOut && new Date(checkOut).toLocaleDateString('vi-VN')} &middot;{" "}
              <span className="font-bold text-slate-700">{checkIn && checkOut ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))) : 1} đêm</span> &middot; {adults}
              người lớn
            </p>
          </div>
          <span className="bg-primary-100 text-primary-800 text-sm font-bold px-4 py-2 rounded-full border border-primary-200 shadow-sm whitespace-nowrap">
            {rooms.length} loại phòng
          </span>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-8 font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-500 font-medium">Đang tìm phòng trống...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {rooms.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Rất tiếc! Không có phòng trống</h3>
                <p className="text-slate-500">Xin vui lòng thử thay đổi ngày nhận/trả phòng hoặc số lượng người.</p>
              </div>
            ) : (
              rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="md:w-2/5 h-64 md:h-auto bg-slate-200 relative overflow-hidden group">
                    <img
                      src={room.danh_sach_phong[0]?.hinh_anh ? (room.danh_sach_phong[0].hinh_anh.startsWith('http') ? room.danh_sach_phong[0].hinh_anh : `http://localhost:8000/${room.danh_sach_phong[0].hinh_anh}`) : "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=600&q=80"}
                      alt={room.ten_loai}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 flex items-center gap-1 shadow-sm">
                      <svg
                        className="w-3.5 h-3.5 text-primary-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                      </svg>
                      Tối đa {room.suc_chua} khách
                    </div>
                  </div>
                  <div className="p-6 md:p-8 md:w-3/5 flex flex-col">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                      <h3 className="text-2xl font-extrabold text-slate-900">
                        {room.ten_loai}
                      </h3>
                      <div className="text-left sm:text-right">
                        <span className="block text-2xl font-extrabold text-primary-600">
                          {new Intl.NumberFormat('vi-VN').format(room.gia_co_ban)}₫
                        </span>
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                          / đêm
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {['Wifi miễn phí', 'TV', 'Điều hòa', 'Phòng tắm riêng'].map((amenity, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-50 text-slate-600 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1"
                        >
                          <svg
                            className="w-3 h-3 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                          {amenity}
                        </span>
                      ))}
                    </div>

                    <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                      Hạng phòng {room.ten_loai} tiêu chuẩn với đầy đủ tiện nghi cơ bản, phù hợp cho nhu cầu nghỉ dưỡng của bạn.
                    </p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-auto pt-5 border-t border-slate-100 gap-4">
                      <div className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        Còn {room.so_luong_trong} phòng trống
                      </div>
                      <div className="flex gap-3 items-center w-full sm:w-auto">
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2 py-1.5 shadow-sm">
                          <button
                            type="button"
                            onClick={() =>
                              handleRoomCountChange(room.id, -1, room.so_luong_trong)
                            }
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-primary-100 hover:text-primary-600 flex items-center justify-center font-bold text-slate-500 transition-colors"
                          >
                            -
                          </button>
                          <span className="font-bold text-slate-900 w-16 text-center text-sm">
                            {roomCounts[room.id] || 1} phòng
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleRoomCountChange(room.id, 1, room.so_luong_trong)
                            }
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-primary-100 hover:text-primary-600 flex items-center justify-center font-bold text-slate-500 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleBook(room.danh_sach_phong[0]?.id)}
                          className="flex-1 sm:flex-none bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-2.5 px-8 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                          Đặt Ngay
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
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
