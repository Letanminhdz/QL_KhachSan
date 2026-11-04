<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThanhToan extends Model
{
    protected $table = 'thanh_toan';
    protected $fillable = ['id_dat_phong', 'so_tien_thanh_toan', 'phuong_thuc_thanh_toan', 'thoi_gian_thanh_toan'];

    public function datPhong()
    {
        return $this->belongsTo(DatPhong::class, 'id_dat_phong');
    }
}
