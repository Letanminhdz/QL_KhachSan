<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Phong;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PhongController extends Controller
{
    public function index()
    {
        $phongs = Phong::with(['loaiPhong', 'tang'])->get();
        return response()->json($phongs);
    }

    // Tìm phòng trống theo khoảng thời gian
    public function timKiem(Request $request)
    {
        $request->validate([
            'ngay_nhan_phong' => 'required|date|after_or_equal:today',
            'ngay_tra_phong' => 'required|date|after:ngay_nhan_phong',
        ]);

        $checkIn = $request->ngay_nhan_phong;
        $checkOut = $request->ngay_tra_phong;

        // Lấy id phòng đã được phân bổ trong thời gian này
        // Logic Overlap: StartA < EndB AND EndA > StartB
        $phongDaDat = DB::table('phan_bo_phong')
            ->join('dat_phong', 'phan_bo_phong.id_dat_phong', '=', 'dat_phong.id')
            ->where('dat_phong.ngay_nhan_phong', '<', $checkOut)
            ->where('dat_phong.ngay_tra_phong', '>', $checkIn)
            ->whereIn('dat_phong.trang_thai', ['Moi_Dat', 'Da_Nhan_Phong', 'Da_Thanh_Toan'])
            ->pluck('phan_bo_phong.id_phong');

        // Tìm các phòng trống: Không trùng lịch VÀ hiện tại không bị khóa bảo trì (Bao_Tri)
        // Lưu ý: Không lọc 'Trong' vì khách có thể đặt phòng cho tương lai dù hiện tại phòng đang có người.
        $phongTrong = Phong::with(['loaiPhong', 'tang'])
            ->whereNotIn('id', $phongDaDat)
            ->where('trang_thai', '!=', 'Bao_Tri')
            ->get();

        // Nhóm theo loại phòng
        $loaiPhongTrong = [];
        foreach ($phongTrong as $phong) {
            $loaiId = $phong->id_loai_phong;
            if (!isset($loaiPhongTrong[$loaiId])) {
                $loaiPhongTrong[$loaiId] = [
                    'id' => $phong->loaiPhong->id,
                    'ten_loai' => $phong->loaiPhong->ten_loai,
                    'suc_chua' => $phong->loaiPhong->suc_chua,
                    'gia_co_ban' => $phong->loaiPhong->gia_co_ban,
                    'so_luong_trong' => 0,
                    'danh_sach_phong' => []
                ];
            }
            $loaiPhongTrong[$loaiId]['so_luong_trong']++;
            $loaiPhongTrong[$loaiId]['danh_sach_phong'][] = $phong;
        }

        return response()->json(array_values($loaiPhongTrong));
    }
}
