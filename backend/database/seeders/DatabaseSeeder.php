<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Tang;
use App\Models\LoaiPhong;
use App\Models\Phong;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Tạo User Admin
        User::create([
            'ho_ten' => 'Administrator',
            'email' => 'admin@hotel.com',
            'mat_khau' => Hash::make('password123'),
            'so_dien_thoai' => '0987654321',
            'vai_tro' => 'Admin',
            'dang_hoat_dong' => true,
        ]);

        // 2. Tạo User Khách hàng
        User::create([
            'ho_ten' => 'Khách Hàng',
            'email' => 'khachhang@hotel.com',
            'mat_khau' => Hash::make('password123'),
            'so_dien_thoai' => '0123456789',
            'vai_tro' => 'Khach_Hang',
            'dang_hoat_dong' => true,
        ]);

        // 3. Tạo Tầng
        $tang1 = Tang::create(['ten_tang' => 'Tầng 1', 'thu_tu' => 1]);
        $tang2 = Tang::create(['ten_tang' => 'Tầng 2', 'thu_tu' => 2]);

        // 4. Tạo Loại Phòng (cần 4 loại để khớp với giao diện)
        $standard = LoaiPhong::create(['ten_loai' => 'Standard', 'suc_chua' => 2, 'gia_co_ban' => 500000]);
        $superior = LoaiPhong::create(['ten_loai' => 'Superior', 'suc_chua' => 2, 'gia_co_ban' => 800000]);
        $deluxe = LoaiPhong::create(['ten_loai' => 'Deluxe', 'suc_chua' => 3, 'gia_co_ban' => 1200000]);
        $suite = LoaiPhong::create(['ten_loai' => 'Suite', 'suc_chua' => 4, 'gia_co_ban' => 2500000]);

        // 5. Tạo Phòng
        // Tầng 1
        Phong::create(['so_phong' => '101', 'id_loai_phong' => $standard->id, 'id_tang' => $tang1->id, 'trang_thai' => 'Trong']);
        Phong::create(['so_phong' => '102', 'id_loai_phong' => $standard->id, 'id_tang' => $tang1->id, 'trang_thai' => 'Trong']);
        Phong::create(['so_phong' => '103', 'id_loai_phong' => $superior->id, 'id_tang' => $tang1->id, 'trang_thai' => 'Trong']);
        
        // Tầng 2
        Phong::create(['so_phong' => '201', 'id_loai_phong' => $deluxe->id, 'id_tang' => $tang2->id, 'trang_thai' => 'Trong']);
        Phong::create(['so_phong' => '202', 'id_loai_phong' => $deluxe->id, 'id_tang' => $tang2->id, 'trang_thai' => 'Dang_Su_Dung']);
        Phong::create(['so_phong' => '203', 'id_loai_phong' => $suite->id, 'id_tang' => $tang2->id, 'trang_thai' => 'Trong']);
    }
}
