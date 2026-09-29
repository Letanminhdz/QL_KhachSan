<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DatPhong extends Model
{
    protected $table = 'dat_phong';
    protected $fillable = [
        'id_tai_khoan',
        'ten_khach_hang',
        'sdt_khach_hang',
        'ngay_nhan_phong',
        'ngay_tra_phong',
        'id_loai_phong',
        'ten_loai_phong_khi_dat',
        'so_luong_phong',
        'gia_phong_khi_dat',
        'tong_tien',
        'trang_thai',
        'trang_thai_thanh_toan',
        'so_tien_da_thanh_toan'
    ];

    public function taiKhoan()
    {
        return $this->belongsTo(User::class, 'id_tai_khoan');
    }

    public function loaiPhong()
    {
        return $this->belongsTo(LoaiPhong::class, 'id_loai_phong');
    }

    public function phanBoPhongs()
    {
        return $this->hasMany(PhanBoPhong::class, 'id_dat_phong');
    }

    public function suDungDichVus()
    {
        return $this->hasMany(SuDungDichVu::class, 'id_dat_phong');
    }
}
