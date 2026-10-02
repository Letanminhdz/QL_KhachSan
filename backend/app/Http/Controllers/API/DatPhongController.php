<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DatPhong;
use App\Models\LoaiPhong;
use App\Models\Phong;
use App\Models\PhanBoPhong;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DatPhongController extends Controller
{
    // Lấy config trạng thái (public)
    public function getBookingStatuses() {
        $path = database_path('json_data/booking_statuses.json');
        if (file_exists($path)) {
            $content = file_get_contents($path);
            return response()->json(json_decode($content, true));
        }
        return response()->json([]);
    }

    // Đặt phòng
    public function store(Request $request)
    {
        $request->validate([
            'ngay_nhan_phong' => 'required|date|after_or_equal:today',
            'ngay_tra_phong' => 'required|date|after:ngay_nhan_phong',
            'id_loai_phong' => 'required|exists:loai_phong,id',
            'so_luong_phong' => 'required|integer|min:1',
            'ten_khach_hang' => 'required|string|max:100',
            'sdt_khach_hang' => 'required|string|max:15',
        ]);

        $loaiPhong = LoaiPhong::findOrFail($request->id_loai_phong);
        
        $checkIn = $request->ngay_nhan_phong;
        $checkOut = $request->ngay_tra_phong;
        $soLuongCanDat = $request->so_luong_phong;

        // Lấy phòng đã đặt
        $phongDaDat = DB::table('phan_bo_phong')
            ->join('dat_phong', 'phan_bo_phong.id_dat_phong', '=', 'dat_phong.id')
            ->where(function($query) use ($checkIn, $checkOut) {
                $query->whereBetween('dat_phong.ngay_nhan_phong', [$checkIn, $checkOut])
                      ->orWhereBetween('dat_phong.ngay_tra_phong', [$checkIn, $checkOut])
                      ->orWhere(function($q) use ($checkIn, $checkOut) {
                          $q->where('dat_phong.ngay_nhan_phong', '<=', $checkIn)
                            ->where('dat_phong.ngay_tra_phong', '>=', $checkOut);
                      });
            })
            ->whereIn('dat_phong.trang_thai', ['Moi_Dat', 'Da_Nhan_Phong'])
            ->pluck('phan_bo_phong.id_phong');

        $phongTrongList = Phong::where('id_loai_phong', $loaiPhong->id)
            ->whereNotIn('id', $phongDaDat)
            ->where('trang_thai', 'Trong')
            ->limit($soLuongCanDat)
            ->get();

        if ($phongTrongList->count() < $soLuongCanDat) {
            return response()->json(['message' => 'Không đủ số lượng phòng trống cho loại phòng này trong khoảng thời gian đã chọn'], 400);
        }

        // Tính tiền
        $ketQuaTinh = \App\Services\TinhTienPhong::tinh($checkIn, $checkOut, $loaiPhong->gia_co_ban);
        if (isset($ketQuaTinh['loi'])) {
            return response()->json(['message' => $ketQuaTinh['loi']], 400);
        }
        $tongTien = $ketQuaTinh['tong_tien'] * $soLuongCanDat;

        $firstStatusId = 'Moi_Dat';
        $path = database_path('json_data/booking_statuses.json');
        if (file_exists($path)) {
            $statuses = json_decode(file_get_contents($path), true);
            if (is_array($statuses) && count($statuses) > 0) {
                $firstStatusId = $statuses[0]['id'];
            }
        }

        DB::beginTransaction();
        try {
            $datPhong = DatPhong::create([
                'id_tai_khoan' => $request->user('sanctum') ? $request->user('sanctum')->id : null,
                'ten_khach_hang' => $request->ten_khach_hang,
                'sdt_khach_hang' => $request->sdt_khach_hang,
                'ngay_nhan_phong' => $checkIn,
                'ngay_tra_phong' => $checkOut,
                'id_loai_phong' => $loaiPhong->id,
                'ten_loai_phong_khi_dat' => $loaiPhong->ten_loai,
                'so_luong_phong' => $soLuongCanDat,
                'gia_phong_khi_dat' => $loaiPhong->gia_co_ban,
                'tong_tien' => $tongTien,
                'trang_thai' => $firstStatusId
            ]);

            // Phân bổ phòng
            foreach ($phongTrongList as $phong) {
                PhanBoPhong::create([
                    'id_dat_phong' => $datPhong->id,
                    'id_phong' => $phong->id,
                    'thoi_gian_phan_bo' => now()
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Đặt phòng thành công',
                'data' => $datPhong
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi hệ thống khi đặt phòng', 'error' => $e->getMessage(), 'trace' => $e->getTraceAsString(), 'line' => $e->getLine()], 500);
        }
    }

    // Lấy lịch sử đặt phòng của user
    public function lichSu(Request $request)
    {
        $datPhongs = DatPhong::with(['phanBoPhongs.phong'])
            ->where('id_tai_khoan', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($datPhongs);
    }

    public function lichSuDichVu(Request $request)
    {
        $dichVus = \App\Models\SuDungDichVu::with(['dichVu', 'datPhong', 'phong'])
            ->whereHas('datPhong', function ($query) use ($request) {
                $query->where('id_tai_khoan', $request->user()->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($dichVus);
    }

    public function getServiceStatuses()
    {
        $path = database_path('json_data/service_statuses.json');
        if (file_exists($path)) {
            return response()->json(json_decode(file_get_contents($path)));
        }
        return response()->json([]);
    }

    // Lấy danh sách phòng đang thuê của user
    public function getActiveRooms(Request $request)
    {
        // Trả về các phòng thuộc đơn đặt phòng 'Da_Nhan_Phong' của user này
        $activeRooms = DB::table('phan_bo_phong')
            ->join('dat_phong', 'phan_bo_phong.id_dat_phong', '=', 'dat_phong.id')
            ->join('phong', 'phan_bo_phong.id_phong', '=', 'phong.id')
            ->where('dat_phong.id_tai_khoan', $request->user()->id)
            ->where('dat_phong.trang_thai', 'Da_Nhan_Phong')
            ->select('phong.id', 'phong.so_phong')
            ->get();

        return response()->json($activeRooms);
    }

    // User đặt dịch vụ cho phòng
    public function orderDichVu(Request $request)
    {
        $validated = $request->validate([
            'id_phong' => 'required|exists:phong,id',
            'items' => 'required|array',
            'items.*.id_dich_vu' => 'required|exists:dich_vu,id',
            'items.*.so_luong' => 'required|integer|min:1',
            'items.*.don_gia' => 'required|numeric|min:0'
        ]);

        // Kiểm tra xem phòng này có đang được thuê bởi user hiện tại hay không
        $isActive = DB::table('phan_bo_phong')
            ->join('dat_phong', 'phan_bo_phong.id_dat_phong', '=', 'dat_phong.id')
            ->where('dat_phong.id_tai_khoan', $request->user()->id)
            ->where('dat_phong.trang_thai', 'Da_Nhan_Phong')
            ->where('phan_bo_phong.id_phong', $validated['id_phong'])
            ->select('dat_phong.id as id_dat_phong')
            ->first();

        if (!$isActive) {
            return response()->json(['message' => 'Bạn không có quyền đặt dịch vụ cho phòng này hoặc phòng chưa được nhận.'], 403);
        }

        $thoi_gian_su_dung = date('Y-m-d H:i:s');
        
        $defaultStatus = 'Cho_Phuc_Vu';
        $statusPath = database_path('json_data/service_statuses.json');
        if (file_exists($statusPath)) {
            $statuses = json_decode(file_get_contents($statusPath), true);
            if (!empty($statuses) && isset($statuses[0]['id'])) {
                $defaultStatus = $statuses[0]['id'];
            }
        }
        
        foreach ($validated['items'] as $item) {
            DB::table('su_dung_dich_vu')->insert([
                'id_dat_phong' => $isActive->id_dat_phong,
                'id_phong' => $validated['id_phong'],
                'id_dich_vu' => $item['id_dich_vu'],
                'so_luong' => $item['so_luong'],
                'tong_tien' => $item['so_luong'] * $item['don_gia'],
                'trang_thai' => $defaultStatus,
                'thoi_gian_su_dung' => $thoi_gian_su_dung
            ]);
        }

        return response()->json(['message' => 'Đã thêm dịch vụ thành công!']);
    }

    // Lấy danh sách toàn bộ đơn đặt phòng (Admin)
    public function index(Request $request)
    {
        if ($request->user()->vai_tro !== 'Admin') {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        $datPhongs = DatPhong::with(['phanBoPhongs.phong', 'taiKhoan'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($datPhongs);
    }

    // Lấy chi tiết 1 đơn đặt phòng (Admin)
    public function show(Request $request, $id)
    {
        if ($request->user()->vai_tro !== 'Admin') {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        $datPhong = DatPhong::with(['phanBoPhongs.phong', 'taiKhoan', 'suDungDichVus.dichVu'])
            ->findOrFail($id);

        return response()->json($datPhong);
    }

    // Cập nhật trạng thái đơn đặt phòng (Admin)
    public function updateStatus(Request $request, $id)
    {
        if ($request->user()->vai_tro !== 'Admin') {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        $bookingStatuses = [];
        $bookingStatusPath = database_path('json_data/booking_statuses.json');
        if (file_exists($bookingStatusPath)) {
            $bookingStatuses = json_decode(file_get_contents($bookingStatusPath), true);
        }

        $validStatuses = array_column($bookingStatuses, 'id');
        
        $request->validate([
            'trang_thai' => 'sometimes|required|in:' . implode(',', $validStatuses),
            'trang_thai_thanh_toan' => 'sometimes|required|string|max:50',
            'so_tien_da_thanh_toan' => 'sometimes|numeric|min:0',
            'tong_tien' => 'sometimes|numeric|min:0'
        ]);

        $datPhong = DatPhong::findOrFail($id);
        
        if ($request->has('trang_thai')) {
            $datPhong->trang_thai = $request->trang_thai;
            
            // Cập nhật thời gian nhận/trả phòng thực tế
            $currentStatusConfig = collect($bookingStatuses)->firstWhere('id', $request->trang_thai);
            if ($currentStatusConfig && isset($currentStatusConfig['set_room_status'])) {
                if ($currentStatusConfig['set_room_status'] === 'in') {
                    $datPhong->ngay_nhan_phong = now();
                } elseif ($currentStatusConfig['set_room_status'] === 'out') {
                    $datPhong->ngay_tra_phong = now();
                }
            }
        }
        if ($request->has('trang_thai_thanh_toan')) {
            $datPhong->trang_thai_thanh_toan = $request->trang_thai_thanh_toan;
        }
        if ($request->has('so_tien_da_thanh_toan')) {
            $datPhong->so_tien_da_thanh_toan = $request->so_tien_da_thanh_toan;
        }
        if ($request->has('tong_tien')) {
            $datPhong->tong_tien = $request->tong_tien;
        }
        $datPhong->save();

        if ($request->has('trang_thai')) {
            // Tìm trạng thái hiện tại trong cấu hình
            $currentStatusConfig = collect($bookingStatuses)->firstWhere('id', $request->trang_thai);
        
        // Tự động chuyển trạng thái phòng nếu có cấu hình set_room_status
        if ($currentStatusConfig && isset($currentStatusConfig['set_room_status'])) {
            $roomStatuses = [];
            $path = database_path('json_data/room_statuses.json');
            if (file_exists($path)) {
                $roomStatuses = json_decode(file_get_contents($path), true);
            }

            $targetStatusId = null;
            $action = $currentStatusConfig['set_room_status']; // 'in' or 'out'

            foreach ($roomStatuses as $status) {
                if ($action === 'in' && isset($status['is_checkin']) && $status['is_checkin']) {
                    $targetStatusId = $status['id'];
                    break;
                }
                if ($action === 'out' && isset($status['is_checkout']) && $status['is_checkout']) {
                    $targetStatusId = $status['id'];
                    break;
                }
            }

            if ($targetStatusId) {
                $phongIds = DB::table('phan_bo_phong')
                    ->where('id_dat_phong', $datPhong->id)
                    ->pluck('id_phong');
                if ($phongIds->count() > 0) {
                    DB::table('phong')
                        ->whereIn('id', $phongIds)
                        ->update(['trang_thai' => $targetStatusId]);
                }
            }
        }
        }

        return response()->json([
            'message' => 'Cập nhật trạng thái thành công',
            'data' => $datPhong
        ]);
    }

    // Danh sách dịch vụ public
    public function getDichVu(Request $request)
    {
        $dichVus = \App\Models\DichVu::with('loaiDichVu')
            ->where('dang_hoat_dong', 1)
            ->orderBy('id', 'desc')
            ->get();
        return response()->json($dichVus);
    }

    // Danh sách loại dịch vụ public
    public function getLoaiDichVu(Request $request)
    {
        $loaiDichVus = \App\Models\LoaiDichVu::orderBy('id', 'desc')->get();
        return response()->json($loaiDichVus);
    }
}
