<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DatPhong;
use App\Models\Phong;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function dashboard(Request $request)
    {
        if ($request->user()->vai_tro !== 'Admin') {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        $tongDoanhThuThang = DatPhong::whereYear('created_at', Carbon::now()->year)
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereIn('trang_thai', ['Da_Thanh_Toan', 'Da_Tra_Phong'])
            ->sum('tong_tien');

        $tongDonHangThang = DatPhong::whereYear('created_at', Carbon::now()->year)
            ->whereMonth('created_at', Carbon::now()->month)
            ->count();

        $tongSoKhachHang = User::where('vai_tro', 'Khach_Hang')->count();

        $soPhongTrong = Phong::where('trang_thai', 'Trong')->count();
        $soPhongDangSuDung = Phong::where('trang_thai', 'Dang_Su_Dung')->count();
        $soPhongDangBaoTri = Phong::where('trang_thai', 'Bao_Tri')->count();

        return response()->json([
            'doanh_thu_thang' => (float)$tongDoanhThuThang,
            'tong_don_hang' => $tongDonHangThang,
            'tong_khach_hang' => $tongSoKhachHang,
            'trang_thai_phong' => [
                'trong' => $soPhongTrong,
                'dang_su_dung' => $soPhongDangSuDung,
                'bao_tri' => $soPhongDangBaoTri
            ]
        ]);
    }

    public function roomDiagram(Request $request)
    {
        if ($request->user()->vai_tro !== 'Admin') {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        $totalRooms = Phong::count();
        $pendingBookings = DatPhong::where('trang_thai', 'Moi_Dat')->count();
        
        $statusCounts = \Illuminate\Support\Facades\DB::table('phong')
            ->select('trang_thai', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
            ->groupBy('trang_thai')
            ->pluck('count', 'trang_thai')
            ->toArray();

        $floors = \App\Models\Tang::with(['phongs' => function($q) {
            $q->orderBy('so_phong', 'asc');
        }])->orderBy('ten_tang', 'asc')->get();

        $floorsData = [];
        foreach($floors as $floor) {
            $roomsData = [];
            foreach($floor->phongs as $room) {
                $roomItem = [
                    'id' => $room->id,
                    'so_phong' => $room->so_phong,
                    'trang_thai' => $room->trang_thai,
                    'khach_hang' => null,
                    'id_dat_phong' => null
                ];

                if ($room->trang_thai === 'Dang_Thue') {
                    $allocation = \App\Models\PhanBoPhong::where('id_phong', $room->id)
                        ->whereHas('datPhong', function($q) {
                            $q->whereIn('trang_thai', ['Da_Nhan_Phong']);
                        })
                        ->with('datPhong')
                        ->orderBy('id', 'desc')
                        ->first();
                    
                    if ($allocation && $allocation->datPhong) {
                        $roomItem['khach_hang'] = $allocation->datPhong->ten_khach_hang;
                        $roomItem['id_dat_phong'] = $allocation->datPhong->id;
                    }
                }
                $roomsData[] = $roomItem;
            }
            $floorsData[] = [
                'id' => $floor->id,
                'ten_tang' => $floor->ten_tang,
                'phongs' => $roomsData
            ];
        }

        return response()->json([
            'kpis' => [
                'total' => $totalRooms,
                'pending' => $pendingBookings,
                'statuses' => $statusCounts
            ],
            'floors' => $floorsData
        ]);
    }
}
