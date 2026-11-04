<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PhanBoPhong extends Model
{
    protected $table = 'phan_bo_phong';
    protected $fillable = ['id_dat_phong', 'id_phong', 'thoi_gian_phan_bo'];

    public function datPhong()
    {
        return $this->belongsTo(DatPhong::class, 'id_dat_phong');
    }

    public function phong()
    {
        return $this->belongsTo(Phong::class, 'id_phong');
    }
}
