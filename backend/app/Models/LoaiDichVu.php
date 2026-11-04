<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoaiDichVu extends Model
{
    use HasFactory;

    protected $table = 'loai_dich_vu';

    protected $fillable = [
        'ten_loai',
    ];

    public function dichVus()
    {
        return $this->hasMany(DichVu::class, 'id_loai_dich_vu');
    }
}
