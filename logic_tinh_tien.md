# Tài Liệu Logic Tính Tiền Phòng

Tài liệu này giải thích chi tiết thuật toán tính tiền phòng hiện đang được áp dụng trong hệ thống **Quản Lý Khách Sạn**. Logic này được đóng gói tập trung ở hai file để đảm bảo Frontend và Backend luôn đồng bộ:
- **Backend (PHP):** `backend/app/Services/TinhTienPhong.php`
- **Frontend (JS):** `frontend/src/utils/tinhTienPhong.js`

---

## 1. Đầu vào (Inputs)
Hàm tính toán nhận vào 3 tham số cốt lõi:
- **`ngayNhan`**: Ngày và giờ khách bắt đầu nhận phòng (Check-in).
- **`ngayTra`**: Ngày và giờ khách trả phòng (Check-out).
- **`giaCoBan`**: Giá niêm yết của 1 đêm cho loại phòng tương ứng.

---

## 2. Các hình thức tính giá phòng

Hệ thống tự động nhận diện hành vi của khách hàng để áp dụng 1 trong 2 hình thức: **Theo giờ** hoặc **Theo ngày (Đêm)**.

### A. Tính theo giờ (Thuê ngắn hạn)
**Điều kiện áp dụng:** Khách thuê tổng cộng **dưới 12 tiếng** VÀ trong **cùng một ngày** dương lịch.
- **2 giờ đầu tiên:** Tính một mức giá cố định bằng **30%** giá cơ bản (giá 1 đêm).
- **Từ giờ thứ 3 trở đi:** Mỗi giờ phát sinh cộng thêm **10%** giá cơ bản.
- *Lưu ý (Cap Price):* Tổng tiền thuê theo giờ sẽ bị giới hạn (cap). Nếu tiền giờ đắt hơn giá 1 đêm, hệ thống sẽ tự động hạ xuống bằng đúng giá 1 đêm để bảo vệ quyền lợi của khách hàng.

### B. Tính theo ngày đêm (Lưu trú qua đêm)
**Điều kiện áp dụng:** Khách ở trên 12 tiếng HOẶC thời gian lưu trú vắt ngang qua đêm sang ngày hôm sau.
- Theo tiêu chuẩn quốc tế, 1 đêm được tính bằng khoảng cách giữa các ngày (VD: 25/09 đến 26/09 là 1 đêm).
- **Tiền phòng = Số đêm × Giá cơ bản (1 đêm)**.
- Mốc tính tiền dựa trên quy chuẩn: Giờ nhận phòng tiêu chuẩn là **14:00** và Giờ trả phòng tiêu chuẩn là **12:00 trưa hôm sau**.

---

## 3. Chính sách Phụ thu (Surcharge)

Khi áp dụng hình thức **Tính theo ngày đêm**, nếu khách hàng Check-in sớm hoặc Check-out muộn so với khung giờ tiêu chuẩn (14:00 IN - 12:00 OUT), hệ thống tự động cộng thêm phí phụ thu.

### 3.1. Phụ thu Nhận phòng sớm (Early Check-in)
Nếu khách đến trước 14:00:
- **Từ 09:00 đến trước 14:00:** Phụ thu **30%** giá phòng 1 đêm.
- **Từ 06:00 đến trước 09:00:** Phụ thu **50%** giá phòng 1 đêm.
- **Trước 06:00 sáng:** Phụ thu **100%** giá phòng 1 đêm (Tính như ở thêm 1 đêm hôm trước).

### 3.2. Phụ thu Trả phòng muộn (Late Check-out)
Nếu khách rời đi sau 12:00 trưa:
- **Từ 12:00 đến 15:00:** Phụ thu **30%** giá phòng 1 đêm.
- **Từ 15:00 đến 18:00:** Phụ thu **50%** giá phòng 1 đêm.
- **Sau 18:00 tối:** Phụ thu **100%** giá phòng 1 đêm.

---

## 4. Tổng Tiền Hóa Đơn

**Tổng tiền = Tiền phòng cơ bản + Tổng các khoản phụ thu**

*Lưu ý: Mọi sự thay đổi về chính sách giá (ví dụ như tăng phụ thu ngày lễ, đổi công thức tính giờ) đều chỉ cần thực hiện bên trong 2 file `TinhTienPhong` đã đề cập ở trên.*
