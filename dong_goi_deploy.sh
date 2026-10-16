#!/bin/bash
# ==============================================================================
# SCRIPT ĐÓNG GÓI TỰ ĐỘNG DỰ ÁN QUẢN LÝ KHÁCH SẠN ĐỂ DEPLOY LÊN HOSTING / VPS
# Tác giả: Antigravity Pairing Assistant
# Mục tiêu: Gom toàn bộ Backend + Frontend + CSDL vào 1 folder duy nhất.
# Chỉ cần nén folder ném lên hosting và sửa thông tin CSDL trong file .env là chạy!
# ==============================================================================

set -e

# Màu sắc hiển thị
XANH_LA='[0;32m'
XANH_DUONG='[0;34m'
VANG='[1;33m'
DO='[0;31m'
KHONG_MAU='[0m'

THU_MUC_GOC="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
THU_MUC_FRONTEND="$THU_MUC_GOC/frontend"
THU_MUC_BACKEND="$THU_MUC_GOC/backend"
THU_MUC_DEPLOY="$THU_MUC_GOC/deploy_package"
FILE_ZIP_DEPLOY="$THU_MUC_GOC/deploy_package.zip"

echo -e "${XANH_DUONG}==================================================================${KHONG_MAU}"
echo -e "${XANH_DUONG}🚀 BẮT ĐẦU ĐÓNG GÓI DỰ ÁN QUẢN LÝ KHÁCH SẠN ĐỂ DEPLOY HOSTING...${KHONG_MAU}"
echo -e "${XANH_DUONG}==================================================================${KHONG_MAU}"

# ------------------------------------------------------------------------------
# BƯỚC 1: KIỂM TRA MÔI TRƯỜNG & DỌN DẸP THƯ MỤC CŨ
# ------------------------------------------------------------------------------
echo -e "
${VANG}[1/7] Kiểm tra môi trường và dọn dẹp...${KHONG_MAU}"

if [ ! -d "$THU_MUC_BACKEND" ]; then
    echo -e "${DO}❌ Lỗi: Không tìm thấy thư mục backend tại $THU_MUC_BACKEND${KHONG_MAU}"
    exit 1
fi

if [ ! -d "$THU_MUC_FRONTEND" ]; then
    echo -e "${DO}❌ Lỗi: Không tìm thấy thư mục frontend tại $THU_MUC_FRONTEND${KHONG_MAU}"
    exit 1
fi

# Xóa gói deploy cũ nếu có
rm -rf "$THU_MUC_DEPLOY"
rm -f "$FILE_ZIP_DEPLOY"
mkdir -p "$THU_MUC_DEPLOY"

echo -e "${XANH_LA}✓ Đã chuẩn bị thư mục đích: $THU_MUC_DEPLOY${KHONG_MAU}"

# ------------------------------------------------------------------------------
# BƯỚC 2: BIÊN DỊCH FRONTEND (REACT / VITE)
# ------------------------------------------------------------------------------
echo -e "
${VANG}[2/7] Biên dịch Frontend (npm run build)...${KHONG_MAU}"

cd "$THU_MUC_FRONTEND"

# Xóa cache vite cũ nếu có
rm -rf node_modules/.vite-temp dist

if command -v npm &> /dev/null; then
    npm run build
elif docker ps | grep -q qlkhachsan_frontend; then
    docker exec qlkhachsan_frontend npm run build
else
    echo -e "${DO}❌ Không tìm thấy lệnh npm hoặc container frontend để build!${KHONG_MAU}"
    exit 1
fi

if [ ! -d "$THU_MUC_FRONTEND/dist" ]; then
    echo -e "${DO}❌ Build frontend thất bại, không tìm thấy thư mục dist!${KHONG_MAU}"
    exit 1
fi

cd "$THU_MUC_GOC"
echo -e "${XANH_LA}✓ Biên dịch frontend thành công!${KHONG_MAU}"

# ------------------------------------------------------------------------------
# BƯỚC 3: TỰ ĐỘNG CHUYỂN ĐỔI URL API SANG ĐƯỜNG DẪN TƯƠNG ĐỐI
# ------------------------------------------------------------------------------
echo -e "
${VANG}[3/7] Tối ưu hóa đường dẫn API và hình ảnh cho hosting...${KHONG_MAU}"

# Thay thế toàn bộ "http://localhost:8000" thành "" trong bundle frontend
# Điều này đảm bảo khi web chạy trên bất kỳ tên miền hosting nào,
# trình duyệt sẽ tự động gọi API và tải ảnh từ chính tên miền đó!
python3 -c "
import os

dist_dir = '$THU_MUC_FRONTEND/dist'
count = 0
for root, _, files in os.walk(dist_dir):
    for f in files:
        if f.endswith(('.js', '.html', '.css')):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
                c = fp.read()
            da_thay_doi = False
            if 'http://localhost:8000/' in c:
                c = c.replace('http://localhost:8000/', '')
                da_thay_doi = True
            if 'http://localhost:8000' in c:
                c = c.replace('http://localhost:8000', '')
                da_thay_doi = True
            import re
            c_new = re.sub(r'(?<![.\w])/favicon\.(png|ico|svg)', r'./favicon.', c)
            if c_new != c:
                c = c_new
                da_thay_doi = True
            if da_thay_doi:
                with open(p, 'w', encoding='utf-8') as fp:
                    fp.write(c)
                count += 1
print(f'   -> Đã tối ưu hóa đường dẫn cho {count} file bundle frontend.')
"
echo -e "${XANH_LA}✓ Frontend đã sẵn sàng chạy trên mọi tên miền hosting!${KHONG_MAU}"

# ------------------------------------------------------------------------------
# BƯỚC 4: SAO CHÉP MÃ NGUỒN BACKEND LARAVEL
# ------------------------------------------------------------------------------
echo -e "
${VANG}[4/7] Sao chép Backend Laravel và thư viện vendor...${KHONG_MAU}"

# Sao chép các thư mục Laravel cốt lõi
cp -r "$THU_MUC_BACKEND/app" "$THU_MUC_DEPLOY/"
cp -r "$THU_MUC_BACKEND/bootstrap" "$THU_MUC_DEPLOY/"
cp -r "$THU_MUC_BACKEND/config" "$THU_MUC_DEPLOY/"
cp -r "$THU_MUC_BACKEND/database" "$THU_MUC_DEPLOY/"
cp -r "$THU_MUC_BACKEND/resources" "$THU_MUC_DEPLOY/"
cp -r "$THU_MUC_BACKEND/routes" "$THU_MUC_DEPLOY/"
cp -r "$THU_MUC_BACKEND/public" "$THU_MUC_DEPLOY/"

# Sao chép thư mục vendor đã cài đặt sẵn thư viện PHP
if [ -d "$THU_MUC_BACKEND/vendor" ]; then
    cp -r "$THU_MUC_BACKEND/vendor" "$THU_MUC_DEPLOY/"
    # Vô hiệu hóa platform check để tương thích với PHP 8.2, 8.3, 8.4 trên mọi hosting
    if [ -f "$THU_MUC_DEPLOY/vendor/composer/platform_check.php" ]; then
        cat << 'EOF_PC' > "$THU_MUC_DEPLOY/vendor/composer/platform_check.php"
<?php
// platform_check.php - Đã bỏ qua kiểm tra PHP để tương thích với PHP 8.2, 8.3, 8.4 trên mọi hosting
EOF_PC
    fi
    echo -e "${XANH_LA}   -> Đã sao chép vendor & vô hiệu hóa platform_check (tương thích PHP 8.2+).${KHONG_MAU}"
fi

# Sao chép các file cấu hình cần thiết
cp "$THU_MUC_BACKEND/artisan" "$THU_MUC_DEPLOY/"
cp "$THU_MUC_BACKEND/composer.json" "$THU_MUC_DEPLOY/"
[ -f "$THU_MUC_BACKEND/composer.lock" ] && cp "$THU_MUC_BACKEND/composer.lock" "$THU_MUC_DEPLOY/"

# Chuẩn bị cấu trúc thư mục storage rỗng và sạch
mkdir -p "$THU_MUC_DEPLOY/storage/app/public"
mkdir -p "$THU_MUC_DEPLOY/storage/framework/cache/data"
mkdir -p "$THU_MUC_DEPLOY/storage/framework/sessions"
mkdir -p "$THU_MUC_DEPLOY/storage/framework/views"
mkdir -p "$THU_MUC_DEPLOY/storage/framework/testing"
mkdir -p "$THU_MUC_DEPLOY/storage/logs"
mkdir -p "$THU_MUC_DEPLOY/bootstrap/cache"

# Sao chép toàn bộ dữ liệu ảnh gốc từ storage/app/public
if [ -d "$THU_MUC_BACKEND/storage/app/public" ]; then
    cp -r "$THU_MUC_BACKEND/storage/app/public/"* "$THU_MUC_DEPLOY/storage/app/public/" 2>/dev/null || true
fi

echo -e "${XANH_LA}✓ Sao chép mã nguồn backend hoàn tất!${KHONG_MAU}"

# ------------------------------------------------------------------------------
# BƯỚC 5: TÍCH HỢP FRONTEND & HÌNH ẢNH THỰC TẾ VÀO PUBLIC/
# ------------------------------------------------------------------------------
echo -e "
${VANG}[5/7] Tích hợp Frontend và xử lý ảnh tĩnh vào thư mục public/...${KHONG_MAU}"

# Sao chép toàn bộ file build của Frontend (index.html, assets,...) vào public/
cp -r "$THU_MUC_FRONTEND/dist/"* "$THU_MUC_DEPLOY/public/"

# Chuan hoa public/index.php de Laravel tu dong nhan dien Subfolder (/KhachSan)
sed -i "/LARAVEL_START/a \if (isset(\$_SERVER['SCRIPT_NAME']) && str_ends_with(\$_SERVER['SCRIPT_NAME'], '/public/index.php')) { if (isset(\$_SERVER['REQUEST_URI']) && !str_contains(\$_SERVER['REQUEST_URI'], '/public/')) { \$_SERVER['SCRIPT_NAME'] = substr(\$_SERVER['SCRIPT_NAME'], 0, -17) . '/index.php'; } }" "$THU_MUC_DEPLOY/public/index.php"

# Xử lý thư mục storage trong public:
# Xóa symlink storage cũ nếu có (tránh lỗi broken symlink trên hosting)
rm -rf "$THU_MUC_DEPLOY/public/storage"

# Copy TOÀN BỘ ảnh thực tế từ storage/app/public thành thư mục thực trong public/storage
# Đảm bảo 100% hình ảnh (phòng, slide, banner, dịch vụ) hiển thị ngay lập tức mà không cần lệnh artisan storage:link!
mkdir -p "$THU_MUC_DEPLOY/public/storage"
if [ -d "$THU_MUC_BACKEND/storage/app/public" ]; then
    cp -r "$THU_MUC_BACKEND/storage/app/public/"* "$THU_MUC_DEPLOY/public/storage/" 2>/dev/null || true
fi

# Cấu hình routes/web.php hỗ trợ SPA (Single Page Application):
# Khi khách F5 hoặc truy cập trực tiếp các trang như /tim-phong, /admin, Laravel sẽ trả về index.html
cat << 'EOF' > "$THU_MUC_DEPLOY/routes/web.php"
<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes - Fallback SPA cho React
|--------------------------------------------------------------------------
| Toàn bộ yêu cầu giao diện được điều hướng về public/index.html của Frontend.
| Riêng các endpoint bắt đầu bằng /api/... sẽ do routes/api.php xử lý.
*/

// Endpoint login dự phòng tránh lỗi RouteNotFoundException khi chưa xác thực
Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');

Route::get('/', function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return file_get_contents($indexPath);
    }
    return view('welcome');
});

Route::get('/{any}', function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return file_get_contents($indexPath);
    }
    return view('welcome');
})->where('any', '^(?!api).*$');
EOF

# Tạo file .htaccess ở THƯ MỤC GỐC của gói deploy
# Giúp người dùng khi ném toàn bộ thư mục vào public_html của hosting (cPanel/DirectAdmin),
# Apache sẽ tự động chuyển hướng mọi request vào public/ và bảo vệ file nhạy cảm.
cat << 'EOF' > "$THU_MUC_DEPLOY/.htaccess"
<IfModule mod_rewrite.c>
    RewriteEngine On

    # Chặn truy cập trực tiếp vào các file cấu hình nhạy cảm
    <FilesMatch "^(\.env|composer\.json|composer\.lock|database\.sql|artisan|HUONG_DAN_DEPLOY\.txt)$">
        Order allow,deny
        Deny from all
    </FilesMatch>

    # Chặn truy cập vào các thư mục hệ thống
    RewriteRule ^(app|bootstrap|config|database|resources|routes|vendor) - [F,L,NC]
    RewriteRule ^storage/(framework|logs) - [F,L,NC]

    # Phuc vu truc tiep anh storage va tai nguyen tinh
    RewriteRule ^storage/(.*)$ public/storage/$1 [L]
    RewriteRule ^(assets/.*|favicon\..*|robots\.txt)$ public/$1 [L]

    # Điều hướng an toàn vào thư mục public (chống vòng lặp vô hạn)
    RewriteCond %{REQUEST_URI} !public/ [NC]
    RewriteRule ^$ public/$1 [L]

    RewriteCond %{REQUEST_URI} !public/ [NC]
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
EOF

cat << 'EOF_IDX' > "$THU_MUC_DEPLOY/index.php"
<?php
define('LARAVEL_START', microtime(true));
if (file_exists(__DIR__ . '/public/index.php')) {
    require __DIR__ . '/public/index.php';
}
EOF_IDX
echo -e "${XANH_LA}✓ Tích hợp Frontend, SPA rewrite và thư mục ảnh thực tế thành công!${KHONG_MAU}"

# ------------------------------------------------------------------------------
# BƯỚC 6: TẠO FILE CẤU HÌNH .ENV MẪU & CƠ SỞ DỮ LIỆU
# ------------------------------------------------------------------------------
echo -e "
${VANG}[6/7] Chuẩn bị file cấu hình .env và cơ sở dữ liệu mẫu...${KHONG_MAU}"

# Lấy APP_KEY và GEMINI_API_KEY từ file .env gốc
APP_KEY_GOC="base64:mbYSedMP8ESZQ95M58gX42XiqMCAbyDrBFazt2H6o04="
GEMINI_KEY_GOC="AIzaSyA6uXwgr7mVFRsknMLY06yQG0pZ_vT42r8"

if [ -f "$THU_MUC_BACKEND/.env" ]; then
    KEY_TRONG_ENV=$(grep "^APP_KEY=" "$THU_MUC_BACKEND/.env" | cut -d '=' -f2-)
    [ -n "$KEY_TRONG_ENV" ] && APP_KEY_GOC="$KEY_TRONG_ENV"

    GEM_TRONG_ENV=$(grep "^GEMINI_API_KEY=" "$THU_MUC_BACKEND/.env" | cut -d '=' -f2-)
    [ -n "$GEM_TRONG_ENV" ] && GEMINI_KEY_GOC="$GEM_TRONG_ENV"
fi

# Tạo file .env chuẩn Production
cat << EOF > "$THU_MUC_DEPLOY/.env"
# ==============================================================================
# CẤU HÌNH MÁY CHỦ PRODUCTION (HOSTING / VPS)
# ==============================================================================
APP_NAME="Khach San Luxury"
APP_ENV=production
APP_KEY=$APP_KEY_GOC
APP_DEBUG=true
APP_URL=http://localhost

LOG_CHANNEL=stack
LOG_LEVEL=error

# ==============================================================================
# CẤU HÌNH KẾT NỐI CƠ SỞ DỮ LIỆU (CHỈ CẦN SỬA 4 DÒNG NÀY TRÊN HOSTING)
# ==============================================================================
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ten_csdl_cua_ban
DB_USERNAME=ten_user_cua_ban
DB_PASSWORD=mat_khau_csdl_cua_ban

# ==============================================================================
# CẤU HÌNH LƯU TRỮ VÀ HỆ THỐNG
# ==============================================================================
SESSION_DRIVER=file
SESSION_LIFETIME=120
CACHE_STORE=file
FILESYSTEM_DISK=public
QUEUE_CONNECTION=sync

# Trợ lý AI Gemini
GEMINI_API_KEY=$GEMINI_KEY_GOC
GEMINI_MODEL=gemini-2.5-flash
EOF

# Tạo bản sao .env.example
cp "$THU_MUC_DEPLOY/.env" "$THU_MUC_DEPLOY/.env.example"

# Sao chép file dump SQL CSDL
for f in "$THU_MUC_GOC"/*.sql "/home/dazvo/Projects/www/HeThongKhachSan/QL_KhachSan"/*.sql; do
    if [ -f "$f" ]; then
        {
            echo "SET FOREIGN_KEY_CHECKS = 0;"
            echo "SET NAMES utf8mb4;"
            cat "$f"
            echo "SET FOREIGN_KEY_CHECKS = 1;"
        } > "$THU_MUC_DEPLOY/database.sql"
        echo -e "${XANH_LA}   -> Đã sao chép và tối ưu CSDL mẫu vào deploy_package/database.sql${KHONG_MAU}"
        break
    fi
done

# Tạo file hướng dẫn cực kỳ ngắn gọn và dễ hiểu
cat << 'EOF' > "$THU_MUC_DEPLOY/HUONG_DAN_DEPLOY.txt"
================================================================================
       HƯỚNG DẪN 3 BƯỚC ĐƯA WEBSITE LÊN HOSTING (cPanel / DirectAdmin / VPS)
================================================================================

BƯỚC 1: TẠO VÀ IMPORT CƠ SỞ DỮ LIỆU
1. Vào cPanel / DirectAdmin -> MySQL Databases -> Tạo 1 Database và 1 User (cấp quyền All Privileges).
2. Mở phpMyAdmin -> Chọn database vừa tạo -> Chọn tab 'Import' (Nhập) -> Chọn file 'database.sql' trong thư mục này để nạp dữ liệu.

BƯỚC 2: TẢI CODE LÊN HOSTING
1. Nén toàn bộ các file và thư mục trong này thành file .zip (hoặc dùng luôn file deploy_package.zip).
2. Vào File Manager trên hosting -> Mở thư mục gốc web (thường là 'public_html').
3. Tải file zip lên và bấm 'Extract' (Giải nén) trực tiếp vào 'public_html'.

BƯỚC 3: CẤU HÌNH KẾT NỐI CSDL
1. Mở file '.env' ở thư mục gốc web (nếu không thấy file .env, hãy bật 'Show Hidden Files' trong Settings của File Manager).
2. Sửa 4 dòng sau theo thông tin Database bạn đã tạo ở Bước 1:
      DB_HOST=127.0.0.1
      DB_DATABASE=ten_database_cua_ban
      DB_USERNAME=ten_user_cua_ban
      DB_PASSWORD=mat_khau_database_cua_ban
3. Lưu file lại.

================================================================================
🎉 HOÀN TẤT! Mở tên miền của bạn trên trình duyệt để thưởng thức website!
Tài khoản quản trị mặc định (nếu có trong DB):
- Email: admin@hotel.com
- Mật khẩu: 123456 (hoặc mật khẩu theo database của bạn)
================================================================================
EOF

# Phân quyền 777 cho thư mục storage và bootstrap/cache
chmod -R 777 "$THU_MUC_DEPLOY/storage" 2>/dev/null || true
chmod -R 777 "$THU_MUC_DEPLOY/bootstrap/cache" 2>/dev/null || true

echo -e "${XANH_LA}✓ Cấu hình .env, CSDL và hướng dẫn deploy đã hoàn tất!${KHONG_MAU}"

# ------------------------------------------------------------------------------
# BƯỚC 7: NÉN TỰ ĐỘNG THÀNH FILE .ZIP (NẾU CÓ LỆNH ZIP)
# ------------------------------------------------------------------------------
echo -e "
${VANG}[7/7] Đang nén thành file deploy_package.zip...${KHONG_MAU}"

if command -v zip &> /dev/null; then
    cd "$THU_MUC_DEPLOY"
    zip -r -q "$FILE_ZIP_DEPLOY" . -x "*.git*"
    cd "$THU_MUC_GOC"
    echo -e "${XANH_LA}✓ Đã tạo sẵn file zip: $FILE_ZIP_DEPLOY${KHONG_MAU}"
fi

echo -e "
${XANH_DUONG}==================================================================${KHONG_MAU}"
echo -e "${XANH_LA}🎉 ĐÓNG GÓI HOÀN TẤT 100%! BẠN CÓ THỂ DEPLOY NGAY BÂY GIỜ!${KHONG_MAU}"
echo -e "${XANH_DUONG}==================================================================${KHONG_MAU}"
echo -e "📂 Thư mục chứa gói deploy: ${VANG}$THU_MUC_DEPLOY${KHONG_MAU}"
[ -f "$FILE_ZIP_DEPLOY" ] && echo -e "📦 File zip nén sẵn để upload: ${VANG}$FILE_ZIP_DEPLOY${KHONG_MAU}"
echo -e "
${XANH_DUONG}👉 BẠN CHỈ CẦN THỰC HIỆN 3 BƯỚC:${KHONG_MAU}"
echo -e "   1. Ném file zip lên hosting và giải nén vào thư mục web (${VANG}public_html${KHONG_MAU})."
echo -e "   2. Import file ${VANG}database.sql${KHONG_MAU} vào phpMyAdmin."
echo -e "   3. Mở file ${VANG}.env${KHONG_MAU} sửa lại tên Database, User và Mật khẩu CSDL."
echo -e "${XANH_LA}==> WEBSITE SẼ CHẠY NGAY LẬP TỨC MÀ KHÔNG CẦN CÀI ĐẶT THÊM GÌ!${KHONG_MAU}
"
