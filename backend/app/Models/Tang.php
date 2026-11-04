<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tang extends Model
{
    protected $table = 'tang';
    protected $fillable = ['ten_tang', 'thu_tu'];
    
    public function phongs()
    {
        return $this->hasMany(Phong::class, 'id_tang');
    }
}
