<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DichVu extends Model
{
    protected $table = 'dich_vu';
    protected $fillable = ['ten_dich_vu', 'gia', 'dang_hoat_dong', 'hinh_anh', 'id_loai_dich_vu'];

    public function loaiDichVu()
    {
        return $this->belongsTo(LoaiDichVu::class, 'id_loai_dich_vu');
    }
}
