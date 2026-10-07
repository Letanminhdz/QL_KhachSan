import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function KhuyenMai() {
  const promotions = [
    {
      id: 1,
      title: "Ưu Đãi Nghỉ Dưỡng Mùa Hè 2026",
      description: "Tận hưởng kỳ nghỉ trọn vẹn với gói ưu đãi giảm ngay 25% cho tất cả các hạng phòng khi đặt trước 30 ngày.",
      image: "http://localhost:8000/storage/promotions/promo1.jpg",
      code: "SUMMER26",
      date: "Áp dụng đến 30/08/2026",
    },
    {
      id: 2,
      title: "Trăng Mật Lãng Mạn",
      description: "Gói dịch vụ cao cấp bao gồm bữa tối lãng mạn bên bờ biển, trang trí phòng miễn phí và dịch vụ đón sân bay 2 chiều.",
      image: "http://localhost:8000/storage/promotions/promo2.jpg",
      code: "HONEYMOON",
      date: "Áp dụng quanh năm",
    },
    {
      id: 3,
      title: "Ưu Đãi Dành Riêng Khách Hàng Thân Thiết",
      description: "Giảm trực tiếp 15% khi xuất trình thẻ thành viên. Tích lũy điểm nhân đôi cho các dịch vụ Nhà hàng và Spa.",
      image: "http://localhost:8000/storage/promotions/promo3.jpg",
      code: "ROYALVIP",
      date: "Không thời hạn",
    }
  ];

  return (
    <main className="flex-grow bg-slate-50">
      {/* Banner */}
      <div className="relative bg-slate-900 h-64 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img src="http://localhost:8000/storage/banners/promotion_hero.jpg" alt="Banner" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">Khuyến Mãi & Ưu Đãi</h1>
          <p className="text-lg text-slate-200 max-w-2xl mx-auto font-medium drop-shadow-md">
            Khám phá những đặc quyền và gói nghỉ dưỡng đẳng cấp dành riêng cho bạn.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {promotions.map((promo) => (
            <div key={promo.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="relative h-64 overflow-hidden">
                <img src={promo.image} alt={promo.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 right-4 bg-primary-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
                  Mã: {promo.code}
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors">{promo.title}</h3>
                <p className="text-slate-600 mb-6 line-clamp-3 leading-relaxed">
                  {promo.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">{promo.date}</span>
                  <Link to="/tim-phong" className="text-primary-600 font-bold hover:text-primary-700 flex items-center gap-1">
                    Đặt Ngay
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
