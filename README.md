# Hướng Dẫn Chạy & Tắt Dự Án Quản Lý Khách Sạn

Dự án này bao gồm Frontend (React + Vite) và Backend (Laravel API + MySQL). Cả hệ thống được đóng gói và vận hành qua Docker để đảm bảo tính đồng bộ trên mọi môi trường.

---

## 🚀 Cách Chạy Dự Án (Start)

Bạn chỉ cần thực hiện 1 lệnh duy nhất tại thư mục gốc của dự án (thư mục chứa file `docker-compose.yml`) để khởi động toàn bộ hệ thống:

```bash
docker compose up -d --build
```

> **Lưu ý:**
> - Lần đầu tiên chạy lệnh này sẽ mất chút thời gian để tải các Docker Images (PHP, Node, MySQL) về máy. Ở các lần sau sẽ rất nhanh.
> - Hệ thống sẽ tự động cài đặt các thư viện (node_modules cho Frontend và vendor cho Backend) nên bạn không cần cài đặt thủ công.

### Kiểm tra kết quả
Sau khi chạy thành công, bạn có thể truy cập dự án qua các địa chỉ:
- **Frontend (Giao diện Web):** [http://localhost:5173](http://localhost:5173)
- **Backend (Laravel API):** [http://localhost:8000](http://localhost:8000)

---

## 🛑 Cách Tắt Dự Án (Stop)

Khi không sử dụng nữa, bạn có thể tắt các Docker containers để giải phóng tài nguyên máy tính.

Đứng ở thư mục gốc của dự án (nơi có file `docker-compose.yml`), chạy lệnh:

```bash
docker compose down
```

Lệnh này sẽ tắt và gỡ bỏ các container đang chạy. Dữ liệu của MySQL vẫn sẽ được **giữ lại an toàn** (vì đã mount vào volume `db_data`).

---

## 🛠 Một Số Lệnh Hữu Ích Khác

**1. Xem log lỗi (Nếu hệ thống không chạy):**
```bash
docker compose logs -f
```

**2. Chạy Migration CSDL (Chỉ dùng khi Code Backend thay đổi cấu trúc bảng):**
```bash
docker compose exec backend php artisan migrate
```

**3. Reset toàn bộ CSDL (Xóa sạch Data hiện có):**
```bash
docker compose exec backend php artisan migrate:fresh
```

**4. Khởi động lại hệ thống (Restart):**
```bash
docker compose restart
```

**5. Import dữ liệu mẫu (Khôi phục DB):**
```bash
docker exec -i qlkhachsan_db mysql -uroot -proot ql_khachsan < dump-ql_khachsan-202609252019.sql
```


---

## 📂 Cấu Trúc Dự Án

```text
QL_KhachSan/
├── backend/            # Source code Laravel (PHP API)
│   ├── app/            # Chứa các Controller, Models
│   ├── database/       # Migrations và các file cấu hình CSDL
│   ├── routes/         # Khai báo các API Endpoints (routes/api.php)
│   └── ...
├── frontend/           # Source code ReactJS + Vite (Giao diện)
│   ├── src/
│   │   ├── components/ # Các component giao diện dùng chung
│   │   ├── pages/      # Các trang hiển thị (Home, Tìm Phòng, Admin...)
│   │   └── ...
├── docker-compose.yml  # File cấu hình triển khai Docker (chạy tất cả các dịch vụ)
├── dump-ql_khachsan-202609252019.sql # File backup cơ sở dữ liệu MySQL (Data mẫu)
├── BaoCaoMonHoc_v1.xlsx # File theo dõi tiến độ công việc/đồ án
└── README.md           # Hướng dẫn sử dụng hệ thống
```
