<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\LoaiPhong;
use Illuminate\Http\Request;

class LoaiPhongController extends Controller
{
    public function index()
    {
        $loaiPhongs = LoaiPhong::all();
        return response()->json($loaiPhongs);
    }

    public function show($id)
    {
        $loaiPhong = LoaiPhong::findOrFail($id);
        return response()->json($loaiPhong);
    }
}
