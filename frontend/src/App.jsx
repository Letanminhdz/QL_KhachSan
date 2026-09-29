import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import TimPhong from "./pages/TimPhong";
import Checkout from "./pages/Checkout";
import DatPhongThanhCong from "./pages/DatPhongThanhCong";
import ChiTietPhong from "./pages/ChiTietPhong";
import ChiTietDatPhong from "./pages/ChiTietDatPhong";
import AdminDashboard from "./pages/AdminDashboard";
import OrderDichVu from "./pages/OrderDichVu";
import UserOrderDichVu from "./pages/UserOrderDichVu";
import ThanhToan from "./pages/ThanhToan";
import Admin from "./pages/Admin";
import TaiKhoan from "./pages/TaiKhoan";
import CauHinhWebsite from "./pages/CauHinhWebsite";
import QuanLyDatPhong from "./pages/QuanLyDatPhong";
import QuanLyDonDichVu from "./pages/QuanLyDonDichVu";

import KhuyenMai from "./pages/KhuyenMai";
import LienHe from "./pages/LienHe";

function App() {
  return (
    <Router>
      <Routes>
        {/* Nhánh giao diện Khách Hàng */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/chi-tiet-phong/:id" element={<ChiTietPhong />} />
          <Route path="/khuyen-mai" element={<KhuyenMai />} />
          <Route path="/lien-he" element={<LienHe />} />
          <Route path="/dang-nhap" element={<Auth />} />
          <Route path="/tim-phong" element={<TimPhong />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/dat-phong-thanh-cong" element={<DatPhongThanhCong />} />
          <Route path="/chi-tiet-dat-phong" element={<ChiTietDatPhong />} />
          <Route path="/dat-dich-vu" element={<UserOrderDichVu />} />
          <Route path="/tai-khoan" element={<TaiKhoan />} />
        </Route>

        {/* Nhánh giao diện Quản Trị / Lễ Tân */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/so-do-phong" element={<AdminDashboard />} />
          <Route path="/admin/dat-phong" element={<QuanLyDatPhong />} />
          <Route path="/admin/su-dung-dich-vu" element={<QuanLyDonDichVu />} />
          <Route path="/order-dich-vu" element={<OrderDichVu />} />
          <Route path="/admin/thanh-toan" element={<ThanhToan />} />
          <Route path="/admin/cau-hinh" element={<CauHinhWebsite />} />
          <Route path="/admin/chi-tiet-dat-phong" element={<ChiTietDatPhong />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
