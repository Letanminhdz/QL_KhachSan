<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SuDungDichVu extends Model
{
    protected $table = 'su_dung_dich_vu';
    protected $fillable = ['id_dat_phong', 'id_phong', 'id_dich_vu', 'so_luong', 'tong_tien', 'thoi_gian_su_dung'];

    public function datPhong()
    {
        return $this->belongsTo(DatPhong::class, 'id_dat_phong');
    }

    public function dichVu()
    {
        return $this->belongsTo(DichVu::class, 'id_dich_vu');
    }

    public function phong()
    {
        return $this->belongsTo(Phong::class, 'id_phong');
    }
}
