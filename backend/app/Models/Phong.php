<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Phong extends Model
{
    protected $table = 'phong';
    protected $fillable = ['so_phong', 'id_loai_phong', 'id_tang', 'trang_thai'];

    public function loaiPhong()
    {
        return $this->belongsTo(LoaiPhong::class, 'id_loai_phong');
    }

    public function tang()
    {
        return $this->belongsTo(Tang::class, 'id_tang');
    }
}
