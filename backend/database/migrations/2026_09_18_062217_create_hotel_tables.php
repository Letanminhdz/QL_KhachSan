<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 2. Bảng Tầng -> tang
        Schema::create('tang', function (Blueprint $table) {
            $table->id();
            $table->string('ten_tang', 50);
            $table->integer('thu_tu')->default(0);
            $table->timestamps();
        });

        // 3. Bảng Loại Phòng -> loai_phong
        Schema::create('loai_phong', function (Blueprint $table) {
            $table->id();
            $table->string('ten_loai', 100);
            $table->integer('suc_chua');
            $table->decimal('gia_co_ban', 15, 2);
            $table->timestamps();
        });

        // 4. Bảng Phòng -> phong
        Schema::create('phong', function (Blueprint $table) {
            $table->id();
            $table->string('so_phong', 20);
            $table->foreignId('id_loai_phong')->constrained('loai_phong')->onDelete('restrict');
            $table->foreignId('id_tang')->constrained('tang')->onDelete('restrict');
            $table->string('trang_thai', 50)->default('Trong');
            $table->timestamps();
        });

        // 5. Bảng Đơn Đặt Phòng -> dat_phong
        Schema::create('dat_phong', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_tai_khoan')->nullable()->constrained('tai_khoan')->onDelete('set null');
            $table->string('ten_khach_hang', 100);
            $table->string('sdt_khach_hang', 15);
            $table->dateTime('ngay_nhan_phong');
            $table->dateTime('ngay_tra_phong');
            $table->foreignId('id_loai_phong')->constrained('loai_phong')->onDelete('restrict');
            $table->string('ten_loai_phong_khi_dat', 100);
            $table->integer('so_luong_phong');
            $table->decimal('gia_phong_khi_dat', 15, 2);
            $table->decimal('tong_tien', 15, 2)->default(0);
            $table->string('trang_thai', 50)->default('Moi_Dat');
            $table->timestamps();
        });

        // 6. Bảng Phân Bổ Phòng -> phan_bo_phong
        Schema::create('phan_bo_phong', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_dat_phong')->constrained('dat_phong')->onDelete('cascade');
            $table->foreignId('id_phong')->constrained('phong')->onDelete('restrict');
            $table->dateTime('thoi_gian_phan_bo')->useCurrent();
            $table->timestamps();
        });

        // 7. Bảng Dịch Vụ -> dich_vu
        Schema::create('dich_vu', function (Blueprint $table) {
            $table->id();
            $table->string('ten_dich_vu', 100);
            $table->decimal('gia', 15, 2);
            $table->boolean('dang_hoat_dong')->default(true);
            $table->timestamps();
        });

        // 8. Bảng Sử Dụng Dịch Vụ -> su_dung_dich_vu
        Schema::create('su_dung_dich_vu', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_dat_phong')->constrained('dat_phong')->onDelete('cascade');
            $table->foreignId('id_phong')->nullable()->constrained('phong')->onDelete('set null');
            $table->foreignId('id_dich_vu')->constrained('dich_vu')->onDelete('restrict');
            $table->integer('so_luong');
            $table->decimal('tong_tien', 15, 2);
            $table->dateTime('thoi_gian_su_dung')->useCurrent();
            $table->timestamps();
        });

        // 9. Bảng Thanh Toán -> thanh_toan
        Schema::create('thanh_toan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_dat_phong')->constrained('dat_phong')->onDelete('cascade');
            $table->decimal('so_tien_thanh_toan', 15, 2);
            $table->string('phuong_thuc_thanh_toan', 50);
            $table->dateTime('thoi_gian_thanh_toan')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('thanh_toan');
        Schema::dropIfExists('su_dung_dich_vu');
        Schema::dropIfExists('dich_vu');
        Schema::dropIfExists('phan_bo_phong');
        Schema::dropIfExists('dat_phong');
        Schema::dropIfExists('phong');
        Schema::dropIfExists('loai_phong');
        Schema::dropIfExists('tang');
    }
};
