import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ChatWidget() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [unreadBadge, setUnreadBadge] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const initialMessage = {
    id: 1,
    sender: "bot",
    text: "Dạ em chào anh/chị ạ! 🌸 Em là nhân viên lễ tân trực tuyến của Royal Hotel Đà Nẵng.\n\nEm có thể tư vấn phòng, báo giá và hỗ trợ anh/chị **chốt đơn đặt phòng trực tiếp** ngay tại đây luôn ạ. Anh/chị đang cần tìm phòng như thế nào cứ nhắn tự nhiên cho em nhé! 😊",
    suggested_rooms: [],
    booking_confirmation: null,
    booking_created: null,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  const [messages, setMessages] = useState([initialMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    setUnreadBadge(false);
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    const historyPayload = messages.slice(-8).map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/chat-bot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
        }),
      });

      if (!res.ok) throw new Error("Lỗi kết nối máy chủ");

      const data = await res.json();

      const botMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: data.reply || "Dạ em đã nhận được thông tin, anh/chị cần em hỗ trợ thêm gì nữa không ạ?",
        suggested_rooms: data.suggested_rooms || [],
        booking_confirmation: data.booking_confirmation || null,
        booking_created: data.booking_created || null,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: "Dạ kết nối của em vừa bị chập chờn một chút xíu. Anh/chị nhắn lại giúp em hoặc gọi trực tiếp hotline **1900 6868** để em hỗ trợ liền nhé ạ! 🙏",
        suggested_rooms: [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Khách bấm nút "Xác nhận tạo đơn ngay" trên bảng xác nhận
  const handleConfirmBooking = async (confirmData) => {
    if (isBookingLoading) return;
    setIsBookingLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat-bot/book-direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: JSON.stringify({
          id_loai_phong: confirmData.id_loai_phong,
          ngay_nhan_phong: confirmData.ngay_nhan_phong,
          ngay_tra_phong: confirmData.ngay_tra_phong,
          so_luong_phong: confirmData.so_luong_phong || 1,
          ten_khach_hang: confirmData.ten_khach_hang,
          sdt_khach_hang: confirmData.sdt_khach_hang,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            sender: "bot",
            text: `🎉 **CHÚC MỪNG ANH/CHỊ ĐÃ ĐẶT PHÒNG THÀNH CÔNG!**\n\nEm đã lưu đơn đặt phòng của mình vào hệ thống của Royal Hotel & Resort rồi ạ.\nBộ phận lễ tân sẽ sớm liên hệ hotline hoặc Zalo để hướng dẫn nhận phòng chu đáo nhất cho anh/chị nhé!`,
            booking_created: data.booking,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            sender: "bot",
            text: `Dạ rất tiếc: ${data.message || "Không thể tạo đơn lúc này."} Anh/chị vui lòng thử chọn ngày khác hoặc liên hệ hotline 1900 6868 giúp em nhé ạ!`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối khi tạo đơn đặt phòng!");
    } finally {
      setIsBookingLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        ...initialMessage,
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Format markdown tự nhiên
  const renderFormattedText = (raw) => {
    if (!raw) return null;
    const lines = raw.split("\n");
    return lines.map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={idx} className="block min-h-[1.25rem]">
          {parts.map((p, pIdx) => {
            if (p.startsWith("**") && p.endsWith("**")) {
              return (
                <strong key={pIdx} className="font-semibold text-slate-900">
                  {p.slice(2, -2)}
                </strong>
              );
            }
            return p;
          })}
        </span>
      );
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* 1. Nút Floating Mở Chat */}
      {!isOpen && (
        <div className="relative group">
          {unreadBadge && (
            <div className="absolute right-0 bottom-16 mb-2 hidden sm:flex items-center gap-2 bg-white text-slate-800 text-xs font-medium px-3.5 py-2 rounded-2xl shadow-xl border border-slate-100 whitespace-nowrap animate-bounce">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Cần đặt phòng? <strong>Chat & chốt đơn ngay</strong></span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUnreadBadge(false);
                }}
                className="text-slate-400 hover:text-slate-600 ml-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <button
            onClick={handleOpenChat}
            className="flex items-center gap-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer"
            aria-label="Tư vấn và đặt phòng"
          >
            <div className="relative flex items-center justify-center">
              <svg
                className="w-6 h-6 transform group-hover:rotate-12 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border-2 border-blue-600"></span>
              </span>
            </div>
            <span className="hidden sm:inline-block font-semibold text-sm tracking-wide">
              Tư vấn & Đặt phòng
            </span>
          </button>
        </div>
      )}

      {/* 2. Cửa sổ Chat */}
      {isOpen && (
        <div className="w-[360px] sm:w-[430px] max-w-[calc(100vw-32px)] h-[620px] max-h-[calc(100vh-80px)] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-4 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-indigo-700 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide flex items-center gap-1.5">
                  Lễ tân Royal Hotel
                  <span className="bg-emerald-500/20 text-emerald-200 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-emerald-400/30">
                    Online
                  </span>
                </h3>
                <p className="text-[11px] text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Tư vấn & Chốt đơn tự động 24/7
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-blue-100">
              <button
                onClick={handleClearHistory}
                title="Bắt đầu cuộc trò chuyện mới"
                className="p-1.5 rounded-lg hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Thu nhỏ"
                className="p-1.5 rounded-lg hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/70">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs"
                  }`}
                >
                  <div className="space-y-1">{renderFormattedText(msg.text)}</div>
                  <span
                    className={`text-[10px] block mt-1.5 text-right ${
                      msg.sender === "user" ? "text-blue-100" : "text-slate-400"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {/* KHUNG XÁC NHẬN ĐẶT PHÒNG (BƯỚC CHỐT ĐƠN) */}
                {msg.booking_confirmation && (
                  <div className="w-full mt-2.5 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 shadow-md animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200/80">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📋</span>
                        <h4 className="font-extrabold text-xs text-amber-900 uppercase tracking-wide">
                          Xác nhận đơn đặt phòng
                        </h4>
                      </div>
                      <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                        Chờ chốt đơn
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Khách hàng:</span>
                        <span className="font-bold text-slate-900">{msg.booking_confirmation.ten_khach_hang}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Số điện thoại:</span>
                        <span className="font-bold text-slate-900">{msg.booking_confirmation.sdt_khach_hang}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Hạng phòng:</span>
                        <span className="font-bold text-indigo-700">{msg.booking_confirmation.ten_loai_phong} ({msg.booking_confirmation.so_luong_phong || 1} phòng)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Thời gian lưu trú:</span>
                        <span className="font-medium text-slate-900">
                          {formatDate(msg.booking_confirmation.ngay_nhan_phong)} → {formatDate(msg.booking_confirmation.ngay_tra_phong)} ({msg.booking_confirmation.so_dem || 1} đêm)
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-amber-200/60 items-center">
                        <span className="font-bold text-slate-700">Tổng tiền dự kiến:</span>
                        <span className="text-sm font-extrabold text-amber-700">
                          {Number(msg.booking_confirmation.tong_tien_du_kien || 0).toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                    </div>

                    <div className="mt-3.5 flex gap-2">
                      <button
                        onClick={() => handleConfirmBooking(msg.booking_confirmation)}
                        disabled={isBookingLoading}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-2.5 px-3 rounded-xl shadow-md text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isBookingLoading ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Đang tạo đơn...
                          </>
                        ) : (
                          <>
                            <span>✓</span> Xác nhận tạo đơn ngay
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setInputMessage("Em sửa lại giúp anh ngày/thông tin...");
                          inputRef.current?.focus();
                        }}
                        className="bg-white hover:bg-slate-100 text-slate-700 font-semibold px-3 py-2.5 rounded-xl border border-slate-300 text-xs transition-all cursor-pointer"
                      >
                        Đổi lại
                      </button>
                    </div>
                  </div>
                )}

                {/* THÔNG BÁO TẠO ĐƠN THÀNH CÔNG */}
                {msg.booking_created && (
                  <div className="w-full mt-2.5 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-4 shadow-md animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-emerald-200">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                        ✓
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-emerald-900 uppercase">
                          Đơn đặt phòng #{msg.booking_created.id} đã được tạo!
                        </h4>
                        <span className="text-[10px] text-emerald-700">Trạng thái: Chờ xác nhận</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-slate-700">
                      <p>• Khách hàng: <strong>{msg.booking_created.ten_khach_hang}</strong> ({msg.booking_created.sdt_khach_hang})</p>
                      <p>• Hạng phòng: <strong>{msg.booking_created.ten_loai_phong}</strong> ({msg.booking_created.so_luong_phong} phòng)</p>
                      <p>• Nhận phòng: <strong>{formatDate(msg.booking_created.ngay_nhan_phong)}</strong> → Trả: <strong>{formatDate(msg.booking_created.ngay_tra_phong)}</strong></p>
                      <p className="pt-1 font-bold text-amber-700 text-sm">
                        Tổng tiền: {Number(msg.booking_created.tong_tien).toLocaleString("vi-VN")} đ
                      </p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/chi-tiet-dat-phong?id=${msg.booking_created.id}`);
                        }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer text-center"
                      >
                        Xem chi tiết đơn đặt phòng
                      </button>
                    </div>
                  </div>
                )}

                {/* Thẻ phòng gợi ý */}
                {msg.suggested_rooms && msg.suggested_rooms.length > 0 && !msg.booking_confirmation && !msg.booking_created && (
                  <div className="w-full mt-2.5 space-y-2">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                      🏨 Hạng phòng đề xuất:
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.suggested_rooms.map((room) => {
                        const cleanPath = (room.hinh_anh || "storage/defaults/room_600.jpg").replace(/^\/+/, "");
                        const imgUrl = room.hinh_anh?.startsWith("http")
                          ? room.hinh_anh
                          : `http://localhost:8000/${cleanPath}`;
                        return (
                          <div
                            key={room.id}
                            className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex gap-3 items-center"
                          >
                            <img
                              src={imgUrl}
                              alt={room.ten_loai}
                              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100"
                              onError={(e) => {
                                e.target.src = "http://localhost:8000/storage/defaults/room_600.jpg";
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-sm text-slate-800 truncate">
                                  {room.ten_loai}
                                </h4>
                                <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                                  👥 {room.suc_chua} người
                                </span>
                              </div>
                              <p className="text-xs font-extrabold text-amber-600 mt-0.5">
                                {Number(room.gia_co_ban).toLocaleString("vi-VN")} đ
                                <span className="text-[10px] text-slate-400 font-normal"> /đêm</span>
                              </p>
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => {
                                    setIsOpen(false);
                                    navigate(`/chi-tiet-phong/${room.id}`);
                                  }}
                                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                >
                                  Chi tiết
                                </button>
                                <button
                                  onClick={() => {
                                    setInputMessage(`Anh muốn đặt phòng ${room.ten_loai}`);
                                    inputRef.current?.focus();
                                  }}
                                  className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-3 py-1 rounded-lg transition-colors cursor-pointer shadow-xs"
                                >
                                  Đặt phòng này
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs px-3.5 py-2.5 shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce"></span>
                  <span className="text-[11px] text-slate-500 font-medium ml-1">Lễ tân đang trả lời...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Form */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhắn tin với lễ tân (VD: Đặt 1 phòng Deluxe...)..."
                disabled={isLoading}
                className="flex-1 bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-800 text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-2.5 rounded-2xl shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                title="Gửi tin nhắn"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}