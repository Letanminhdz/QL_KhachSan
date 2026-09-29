import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUI } from "../contexts/UIContext";

export default function OrderDichVu() {
  const navigate = useNavigate();
  const { showToast } = useUI();
  const [categories, setCategories] = useState([
    { id: "Tất cả", label: "Tất cả" }
  ]);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [menuItems, setMenuItems] = useState([]);
  const [activeRooms, setActiveRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch Menu Items
        const menuRes = await fetch("http://localhost:8000/api/admin/dich-vu", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (menuRes.ok) {
          const data = await menuRes.json();
          setMenuItems(data.filter(item => item.dang_hoat_dong === 1));
        } else if (menuRes.status === 401) {
          navigate("/login");
          return;
        }

        // Fetch Active Rooms
        const roomRes = await fetch("http://localhost:8000/api/admin/active-rooms", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (roomRes.ok) {
          const rooms = await roomRes.json();
          setActiveRooms(rooms);
        }

        // Fetch Categories
        const catRes = await fetch("http://localhost:8000/api/admin/loai-dich-vu", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories([
            { id: "Tất cả", label: "Tất cả" },
            ...catData.map(c => ({ id: c.id, label: c.ten_loai }))
          ]);
        }

      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      }
    };
    fetchInitialData();
  }, [navigate]);

  const filteredItems = activeCategory === "Tất cả" 
    ? menuItems 
    : menuItems.filter(item => item.id_loai_dich_vu === activeCategory);

  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.gia * item.quantity), 0);

  const handleCheckout = async () => {
    if (!selectedRoom) {
      showToast("Vui lòng chọn phòng để thêm dịch vụ!", "error");
      return;
    }
    if (cartItems.length === 0) {
      showToast("Giỏ hàng đang trống!", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        id_phong: selectedRoom,
        items: cartItems.map(item => ({
          id_dich_vu: item.id,
          so_luong: item.quantity,
          don_gia: item.gia
        }))
      };

      const res = await fetch("http://localhost:8000/api/admin/order-dich-vu", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast("Đã thêm dịch vụ vào hóa đơn phòng thành công!", "success");
        setCartItems([]);
        setSelectedRoom("");
      } else {
        const data = await res.json();
        showToast(data.message || "Có lỗi xảy ra khi lưu hóa đơn", "error");
      }
    } catch (err) {
      showToast("Lỗi kết nối đến máy chủ", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 flex-1 flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path>
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path>
              </svg>
              GỌI MÓN & DỊCH VỤ TẬN PHÒNG
            </h2>
            <p className="text-slate-500 text-sm mt-1">Phục vụ thực đơn và các tiện ích tận phòng cho khách</p>
          </div>
          <Link to="/admin/so-do-phong" className="bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-slate-300 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Quay Về Sơ Đồ
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Menu */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
              <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 scrollbar-hide">
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`whitespace-nowrap px-6 py-4 text-sm font-bold transition-colors border-b-2 ${
                      activeCategory === cat.id 
                        ? "border-primary-600 text-primary-600 bg-white" 
                        : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="p-6">
                {filteredItems.length === 0 ? (
                  <div className="text-center text-slate-500 py-10">Không có dịch vụ nào trong mục này.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                      <div key={item.id} onClick={() => addToCart(item)} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group">
                        <div className="h-40 overflow-hidden relative">
                          <img
                            src={item.hinh_anh ? (item.hinh_anh.startsWith('http') ? item.hinh_anh : `http://localhost:8000/${item.hinh_anh}`) : "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400"}
                            alt={item.ten_dich_vu}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-white text-primary-600 font-bold px-3 py-1 rounded-full shadow-lg text-sm">+ Thêm dịch vụ</span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-slate-800 mb-1 truncate" title={item.ten_dich_vu}>{item.ten_dich_vu}</h4>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-extrabold text-primary-600">{Number(item.gia).toLocaleString()}₫</span>
                            <button className="bg-slate-900 text-white rounded-full w-8 h-8 flex items-center justify-center group-hover:bg-primary-500 transition-colors shadow-sm">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cart */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 sticky top-24">
              <div className="bg-slate-900 text-white p-4 rounded-t-2xl">
                <h5 className="font-bold m-0 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path></svg>
                  Hóa Đơn Dịch Vụ
                </h5>
              </div>
              <div className="p-5">
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chọn phòng đang thuê <span className="text-red-500">*</span></label>
                  <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm font-bold text-slate-800 focus:border-primary-500 outline-none transition-all">
                    <option value="">-- Chọn phòng để order --</option>
                    {activeRooms.map(room => (
                      <option key={room.id} value={room.id}>Phòng {room.so_phong}</option>
                    ))}
                  </select>
                </div>

                <div className="min-h-[250px] max-h-[350px] overflow-y-auto border-t border-slate-100 pt-4 mb-4 -mx-2 px-2" style={{ scrollbarWidth: 'thin' }}>
                  {cartItems.length === 0 ? (
                    <div className="text-center text-slate-400 py-12 flex flex-col items-center">
                      <svg className="w-16 h-16 mb-3 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                      <span className="text-sm">Chưa có món nào được chọn</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-3 items-center group">
                          <img src={item.hinh_anh ? (item.hinh_anh.startsWith('http') ? item.hinh_anh : `http://localhost:8000/${item.hinh_anh}`) : "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400"} alt={item.ten_dich_vu} className="w-12 h-12 rounded-lg object-cover shadow-sm border border-slate-100" />
                          <div className="flex-1 min-w-0">
                            <h6 className="font-bold text-slate-800 text-sm truncate">{item.ten_dich_vu}</h6>
                            <div className="text-primary-600 font-extrabold text-xs">{Number(item.gia).toLocaleString()}₫</div>
                          </div>
                          <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center rounded-md bg-white text-slate-600 hover:text-red-500 hover:bg-red-50 shadow-sm transition-colors">-</button>
                            <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center rounded-md bg-white text-slate-600 hover:text-emerald-500 hover:bg-emerald-50 shadow-sm transition-colors">+</button>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity" title="Xóa">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-4 bg-white relative z-10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-slate-600">Tổng cộng</span>
                    <span className="text-2xl font-black text-red-600">{totalAmount.toLocaleString()}₫</span>
                  </div>
                  <button 
                    onClick={handleCheckout} 
                    disabled={isSubmitting || cartItems.length === 0}
                    className="w-full bg-primary-600 text-white font-bold py-2.5 rounded-xl hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Đang xử lý...
                      </span>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Thêm Vào Hóa Đơn Phòng
                      </>
                    )}
                  </button>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
