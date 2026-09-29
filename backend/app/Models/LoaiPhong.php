<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoaiPhong extends Model
{
    protected $table = 'loai_phong';
    protected $fillable = ['ten_loai', 'suc_chua', 'gia_co_ban', 'hinh_anh', 'mo_ta', 'tien_ich', 'hinh_anh_phu'];

    protected function casts(): array
    {
        return [
            'tien_ich' => 'array',
            'hinh_anh_phu' => 'array',
        ];
    }

    public function phongs()
    {
        return $this->hasMany(Phong::class, 'id_loai_phong');
    }
}
