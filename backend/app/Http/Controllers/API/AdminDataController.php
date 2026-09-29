<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tang;
use App\Models\LoaiPhong;
use App\Models\Phong;
use App\Models\DichVu;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AdminDataController extends Controller
{
    // Cần là Admin
    public function __construct()
    {
        // Middleware được khai báo ở routes
    }

    private function checkAdmin(Request $request) {
        if ($request->user()->vai_tro !== 'Admin') {
            abort(403, 'Không có quyền truy cập');
        }
    }

    // ================= TẦNG =================
    public function getTang(Request $request) {
        $this->checkAdmin($request);
        return response()->json(Tang::orderBy('thu_tu')->get());
    }

    public function storeTang(Request $request) {
        $this->checkAdmin($request);
        $validated = $request->validate([
            'ten_tang' => 'required|string|max:50',
            'thu_tu' => 'required|integer',
        ]);
        $tang = Tang::create($validated);
        return response()->json(['message' => 'Đã thêm tầng', 'data' => $tang], 201);
    }

    public function updateTang(Request $request, $id) {
        $this->checkAdmin($request);
        $validated = $request->validate([
            'ten_tang' => 'required|string|max:50',
            'thu_tu' => 'required|integer',
        ]);
        $tang = Tang::findOrFail($id);
        $tang->update($validated);
        return response()->json(['message' => 'Đã cập nhật', 'data' => $tang]);
    }

    public function destroyTang(Request $request, $id) {
        $this->checkAdmin($request);
        try {
            $tang = Tang::findOrFail($id);
            $tang->delete();
            return response()->json(['message' => 'Đã xóa']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể xóa dữ liệu đang được sử dụng ở nơi khác'], 400);
        }
    }

    // ================= LOẠI PHÒNG =================
    public function getLoaiPhong(Request $request) {
        $this->checkAdmin($request);
        return response()->json(LoaiPhong::orderBy('id', 'desc')->get());
    }

    public function storeLoaiPhong(Request $request) {
        $this->checkAdmin($request);
        $validated = $request->validate([
            'ten_loai' => 'required|string|max:100',
            'suc_chua' => 'required|integer|min:1',
            'gia_co_ban' => 'required|numeric|min:0',
            'hinh_anh' => 'nullable|string|max:255',
            'mo_ta' => 'nullable|string',
            'tien_ich' => 'nullable|array',
            'file_hinh_anh' => 'nullable|image|max:5120',
            'file_hinh_anh_phu.*' => 'nullable|image|max:5120',
        ]);

        $lp = LoaiPhong::create($validated);

        $hasUpdates = false;
        if ($request->hasFile('file_hinh_anh')) {
            $ext = $request->file('file_hinh_anh')->getClientOriginalExtension();
            $path = $request->file('file_hinh_anh')->storeAs("loai_phong/{$lp->id}", "anh_chinh.{$ext}", 'public');
            $lp->hinh_anh = 'storage/' . $path;
            $hasUpdates = true;
        }

        if ($request->hasFile('file_hinh_anh_phu')) {
            $hinhAnhPhu = [];
            foreach ($request->file('file_hinh_anh_phu') as $file) {
                $ext = $file->getClientOriginalExtension();
                $uniq = uniqid();
                $path = $file->storeAs("loai_phong/{$lp->id}", "anh_phu_{$uniq}.{$ext}", 'public');
                $hinhAnhPhu[] = 'storage/' . $path;
            }
            $lp->hinh_anh_phu = $hinhAnhPhu;
            $hasUpdates = true;
        }

        if ($hasUpdates) {
            $lp->save();
        }

        return response()->json(['message' => 'Đã thêm', 'data' => $lp], 201);
    }

    public function updateLoaiPhong(Request $request, $id) {
        $this->checkAdmin($request);
        $validated = $request->validate([
            'ten_loai' => 'required|string|max:100',
            'suc_chua' => 'required|integer|min:1',
            'gia_co_ban' => 'required|numeric|min:0',
            'hinh_anh' => 'nullable|string|max:255',
            'mo_ta' => 'nullable|string',
            'tien_ich' => 'nullable|array',
            'file_hinh_anh' => 'nullable|image|max:5120',
            'file_hinh_anh_phu.*' => 'nullable|image|max:5120',
        ]);

        $lp = LoaiPhong::findOrFail($id);

        if ($request->hasFile('file_hinh_anh')) {
            $ext = $request->file('file_hinh_anh')->getClientOriginalExtension();
            $path = $request->file('file_hinh_anh')->storeAs("loai_phong/{$lp->id}", "anh_chinh.{$ext}", 'public');
            $validated['hinh_anh'] = 'storage/' . $path;
        }

        if ($request->hasFile('file_hinh_anh_phu')) {
            $hinhAnhPhu = $lp->hinh_anh_phu ?: [];
            foreach ($request->file('file_hinh_anh_phu') as $file) {
                $ext = $file->getClientOriginalExtension();
                $uniq = uniqid();
                $path = $file->storeAs("loai_phong/{$lp->id}", "anh_phu_{$uniq}.{$ext}", 'public');
                $hinhAnhPhu[] = 'storage/' . $path;
            }
            $validated['hinh_anh_phu'] = $hinhAnhPhu;
        }

        $lp->update($validated);
        return response()->json(['message' => 'Đã cập nhật', 'data' => $lp]);
    }

    public function destroyLoaiPhong(Request $request, $id) {
        $this->checkAdmin($request);
        try {
            $lp = LoaiPhong::findOrFail($id);
            $lp->delete();
            \Illuminate\Support\Facades\Storage::disk('public')->deleteDirectory('loai_phong/' . $id);
            return response()->json(['message' => 'Đã xóa']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể xóa loại phòng đang có phòng'], 400);
        }
    }

    public function deleteHinhAnhPhuLoaiPhong(Request $request, $id) {
        $this->checkAdmin($request);
        $validated = $request->validate([
            'image_url' => 'required|string'
        ]);

        $lp = LoaiPhong::findOrFail($id);
        $hinhAnhPhu = $lp->hinh_anh_phu ?: [];
        
        $urlToRemove = $validated['image_url'];
        
        if (in_array($urlToRemove, $hinhAnhPhu)) {
            $hinhAnhPhu = array_values(array_diff($hinhAnhPhu, [$urlToRemove]));
            $lp->hinh_anh_phu = $hinhAnhPhu;
            $lp->save();

            // Xóa file khỏi storage
            $pathToRemove = str_replace('storage/', '', $urlToRemove);
            \Illuminate\Support\Facades\Storage::disk('public')->delete($pathToRemove);

            return response()->json(['message' => 'Đã xóa ảnh phụ', 'data' => $lp]);
        }

        return response()->json(['message' => 'Không tìm thấy ảnh phụ'], 404);
    }

    // ================= PHÒNG =================
    public function getPhong(Request $request) {
        $this->checkAdmin($request);
        return response()->json(Phong::with(['loaiPhong', 'tang'])->orderBy('id', 'desc')->get());
    }

    public function storePhong(Request $request) {
        $this->checkAdmin($request);
        $validated = $request->validate([
            'so_phong' => 'required|string|max:20|unique:phong,so_phong',
            'id_loai_phong' => 'required|exists:loai_phong,id',
            'id_tang' => 'required|exists:tang,id',
            'trang_thai' => 'required|string',
        ]);
        $p = Phong::create($validated);
        return response()->json(['message' => 'Đã thêm', 'data' => Phong::with(['loaiPhong', 'tang'])->find($p->id)], 201);
    }

    public function updatePhong(Request $request, $id) {
        $this->checkAdmin($request);
        $validated = $request->validate([
            'so_phong' => 'required|string|max:20|unique:phong,so_phong,' . $id,
            'id_loai_phong' => 'required|exists:loai_phong,id',
            'id_tang' => 'required|exists:tang,id',
            'trang_thai' => 'required|string',
        ]);
        $p = Phong::findOrFail($id);
        
        // Block status change if room is currently being rented (Dang_Thue)
        if ($p->trang_thai === 'Dang_Thue' && isset($validated['trang_thai']) && $validated['trang_thai'] !== 'Dang_Thue') {
            return response()->json(['message' => 'Không thể thay đổi trạng thái phòng đang có khách ở. Vui lòng thực hiện Check-out trước.'], 422);
        }
        
        // Block manually setting a room to Dang_Thue (only allowed via check-in flow)
        if (isset($validated['trang_thai']) && $validated['trang_thai'] === 'Dang_Thue' && $p->trang_thai !== 'Dang_Thue') {
            return response()->json(['message' => 'Không thể chuyển trạng thái thành "Đang thuê" thủ công. Hãy thực hiện qua quy trình Check-in.'], 422);
        }
        
        $p->update($validated);
        return response()->json(['message' => 'Đã cập nhật', 'data' => Phong::with(['loaiPhong', 'tang'])->find($p->id)]);
    }

    public function destroyPhong(Request $request, $id) {
        $this->checkAdmin($request);
        try {
            $p = Phong::findOrFail($id);
            $p->delete();
            return response()->json(['message' => 'Đã xóa']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể xóa phòng đang được sử dụng'], 400);
        }
    }

    // ================= TRẠNG THÁI PHÒNG (JSON) =================
    public function getRoomStatuses(Request $request) {
        $this->checkAdmin($request);
        $path = 'room_statuses.json';
        if (Storage::exists($path)) {
            $content = Storage::get($path);
            return response()->json(json_decode($content, true));
        }
        return response()->json([]);
    }

    public function storeRoomStatuses(Request $request) {
        $this->checkAdmin($request);
        $statuses = $request->input('statuses');
        if (!is_array($statuses)) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ'], 400);
        }
        Storage::put('room_statuses.json', json_encode($statuses, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        return response()->json(['message' => 'Lưu trạng thái thành công']);
    }

    // ================= TRẠNG THÁI ĐƠN ĐẶT PHÒNG (JSON) =================
    public function getBookingStatuses(Request $request) {
        $this->checkAdmin($request);
        $path = 'booking_statuses.json';
        if (Storage::exists($path)) {
            $content = Storage::get($path);
            return response()->json(json_decode($content, true));
        }
        return response()->json([]);
    }

    public function storeBookingStatuses(Request $request) {
        $this->checkAdmin($request);
        $statuses = $request->input('statuses');
        if (!is_array($statuses)) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ'], 400);
        }
        $saved = Storage::put('booking_statuses.json', json_encode($statuses, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        if (!$saved) {
            return response()->json(['message' => 'Lỗi cấp quyền (Permission Denied). Không thể ghi đè file JSON.'], 500);
        }
        return response()->json(['message' => 'Lưu trạng thái thành công']);
    }

    // ================= TRẠNG THÁI ĐƠN DỊCH VỤ (JSON) =================
    public function getServiceStatuses(Request $request) {
        $path = 'service_statuses.json';
        if (Storage::exists($path)) {
            $content = Storage::get($path);
            return response()->json(json_decode($content, true));
        }
        return response()->json([]);
    }

    public function storeServiceStatuses(Request $request) {
        $this->checkAdmin($request);
        $statuses = $request->input('statuses');
        if (!is_array($statuses)) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ'], 400);
        }
        $saved = Storage::put('service_statuses.json', json_encode($statuses, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        if (!$saved) {
            return response()->json(['message' => 'Lỗi cấp quyền (Permission Denied). Không thể ghi đè file JSON.'], 500);
        }
        return response()->json(['message' => 'Lưu trạng thái thành công']);
    }

    // ================= DỊCH VỤ =================
    public function getDichVu(Request $request) {
        $this->checkAdmin($request);
        return response()->json(DichVu::with('loaiDichVu')->orderBy('id', 'desc')->get());
    }

    public function storeDichVu(Request $request) {
        $this->checkAdmin($request);
        $validated = $request->validate([
            'ten_dich_vu' => 'required|string|max:100',
            'id_loai_dich_vu' => 'required|exists:loai_dich_vu,id',
            'gia' => 'required|numeric|min:0',
            'dang_hoat_dong' => 'required|boolean',
            'file_hinh_anh' => 'nullable|image|max:5120',
        ]);
        
        if ($request->hasFile('file_hinh_anh')) {
            $path = $request->file('file_hinh_anh')->store('dich_vu', 'public');
            $validated['hinh_anh'] = 'storage/' . $path;
        }

        $dv = DichVu::create($validated);
        return response()->json(['message' => 'Đã thêm', 'data' => DichVu::with('loaiDichVu')->find($dv->id)], 201);
    }

    public function updateDichVu(Request $request, $id) {
        $this->checkAdmin($request);
        $validated = $request->validate([
            'ten_dich_vu' => 'required|string|max:100',
            'id_loai_dich_vu' => 'required|exists:loai_dich_vu,id',
            'gia' => 'required|numeric|min:0',
            'dang_hoat_dong' => 'required|boolean',
            'file_hinh_anh' => 'nullable|image|max:5120',
        ]);
        
        if ($request->hasFile('file_hinh_anh')) {
            $path = $request->file('file_hinh_anh')->store('dich_vu', 'public');
            $validated['hinh_anh'] = 'storage/' . $path;
        }

        $dv = DichVu::findOrFail($id);
        $dv->update($validated);
        return response()->json(['message' => 'Đã cập nhật', 'data' => DichVu::with('loaiDichVu')->find($dv->id)]);
    }

    public function destroyDichVu(Request $request, $id) {
        $this->checkAdmin($request);
        try {
            $dv = DichVu::findOrFail($id);
            $dv->delete();
            return response()->json(['message' => 'Đã xóa']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể xóa dịch vụ này'], 400);
        }
    }

    // ================= LOẠI DỊCH VỤ =================
    public function getLoaiDichVu(Request $request) {
        $this->checkAdmin($request);
        return response()->json(\App\Models\LoaiDichVu::orderBy('id', 'desc')->get());
    }

    public function storeLoaiDichVu(Request $request) {
        $this->checkAdmin($request);
        $validated = $request->validate([
            'ten_loai' => 'required|string|max:100',
        ]);
        $ldv = \App\Models\LoaiDichVu::create($validated);
        return response()->json(['message' => 'Đã thêm', 'data' => $ldv], 201);
    }

    public function updateLoaiDichVu(Request $request, $id) {
        $this->checkAdmin($request);
        $validated = $request->validate([
            'ten_loai' => 'required|string|max:100',
        ]);
        $ldv = \App\Models\LoaiDichVu::findOrFail($id);
        $ldv->update($validated);
        return response()->json(['message' => 'Đã cập nhật', 'data' => $ldv]);
    }

    public function destroyLoaiDichVu(Request $request, $id) {
        $this->checkAdmin($request);
        try {
            $ldv = \App\Models\LoaiDichVu::findOrFail($id);
            $ldv->delete();
            return response()->json(['message' => 'Đã xóa']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể xóa loại dịch vụ đang được sử dụng'], 400);
        }
    }


    // ================= ORDER DỊCH VỤ =================
    public function getActiveRooms(Request $request) {
        $this->checkAdmin($request);
        // Lấy danh sách các phòng đang được thuê
        $rooms = Phong::where('trang_thai', 'Dang_Thue')
            ->orderBy('so_phong')
            ->get();
            
        // Trong tương lai có thể join với bảng don_dat_phong để lấy tên khách
        return response()->json($rooms);
    }

    public function orderDichVu(Request $request) {
        $this->checkAdmin($request);
        $validated = $request->validate([
            'id_phong' => 'required|exists:phong,id',
            'items' => 'required|array',
            'items.*.id_dich_vu' => 'required|exists:dich_vu,id',
            'items.*.so_luong' => 'required|integer|min:1',
            'items.*.don_gia' => 'required|numeric|min:0'
        ]);

        // Tìm id_dat_phong đang active cho phòng này
        $phanBo = \Illuminate\Support\Facades\DB::table('phan_bo_phong')
            ->join('dat_phong', 'phan_bo_phong.id_dat_phong', '=', 'dat_phong.id')
            ->where('dat_phong.trang_thai', 'Da_Nhan_Phong')
            ->where('phan_bo_phong.id_phong', $validated['id_phong'])
            ->select('dat_phong.id as id_dat_phong')
            ->first();
            
        if (!$phanBo) {
            return response()->json(['message' => 'Phòng này không có đơn đặt phòng nào đang ở trạng thái Đang ở (Da_Nhan_Phong).'], 400);
        }

        // Thêm từng record vào bảng su_dung_dich_vu
        $thoi_gian_su_dung = date('Y-m-d H:i:s');
        
        $statusPath = storage_path('app/private/service_statuses.json');
        $defaultStatus = 'Cho_Phuc_Vu';
        if (file_exists($statusPath)) {
            $statuses = json_decode(file_get_contents($statusPath), true);
            if (!empty($statuses) && isset($statuses[0]['id'])) {
                $defaultStatus = $statuses[0]['id'];
            }
        }
        
        foreach ($validated['items'] as $item) {
            \Illuminate\Support\Facades\DB::table('su_dung_dich_vu')->insert([
                'id_dat_phong' => $phanBo->id_dat_phong,
                'id_phong' => $validated['id_phong'],
                'id_dich_vu' => $item['id_dich_vu'],
                'so_luong' => $item['so_luong'],
                'tong_tien' => $item['so_luong'] * $item['don_gia'],
                'trang_thai' => $defaultStatus,
                'thoi_gian_su_dung' => $thoi_gian_su_dung
            ]);
        }

        return response()->json(['message' => 'Đã thêm dịch vụ vào phòng thành công']);
    }

    public function getSuDungDichVu(Request $request) {
        $this->checkAdmin($request);
        $danhSach = \Illuminate\Support\Facades\DB::table('su_dung_dich_vu')
            ->join('dich_vu', 'su_dung_dich_vu.id_dich_vu', '=', 'dich_vu.id')
            ->leftJoin('phong', 'su_dung_dich_vu.id_phong', '=', 'phong.id')
            ->join('dat_phong', 'su_dung_dich_vu.id_dat_phong', '=', 'dat_phong.id')
            ->select(
                'su_dung_dich_vu.*',
                'dich_vu.ten_dich_vu',
                'phong.so_phong',
                'dat_phong.ten_khach_hang',
                'dat_phong.sdt_khach_hang',
                'dat_phong.trang_thai as trang_thai_dat_phong'
            )
            ->orderBy('su_dung_dich_vu.id', 'desc')
            ->get();
            
        return response()->json($danhSach);
    }

    public function updateSuDungDichVuStatus(Request $request, $id) {
        $this->checkAdmin($request);
        $validated = $request->validate([
            'trang_thai' => 'required|string'
        ]);

        $updated = \Illuminate\Support\Facades\DB::table('su_dung_dich_vu')
            ->where('id', $id)
            ->update(['trang_thai' => $validated['trang_thai']]);

        if ($updated) {
            return response()->json(['message' => 'Cập nhật trạng thái thành công']);
        }
        return response()->json(['message' => 'Không tìm thấy đơn dịch vụ'], 404);
    }

    // ================= TÀI KHOẢN (NGƯỜI DÙNG) =================
    public function getTaiKhoan(Request $request) {
        $this->checkAdmin($request);
        return response()->json(User::orderBy('id', 'desc')->get());
    }

    public function storeTaiKhoan(Request $request) {
        $this->checkAdmin($request);
        $validated = $request->validate([
            'ho_ten' => 'required|string|max:100',
            'email' => 'required|string|email|max:100|unique:tai_khoan,email',
            'mat_khau' => 'required|string|min:6',
            'so_dien_thoai' => 'nullable|string|max:15',
            'vai_tro' => 'required|in:Khach_Hang,Nhan_Vien,Admin',
            'dang_hoat_dong' => 'required|boolean',
        ]);
        $validated['mat_khau'] = Hash::make($validated['mat_khau']);
        $u = User::create($validated);
        return response()->json(['message' => 'Đã thêm', 'data' => $u], 201);
    }

    public function updateTaiKhoan(Request $request, $id) {
        $this->checkAdmin($request);
        $validated = $request->validate([
            'ho_ten' => 'required|string|max:100',
            'email' => 'required|string|email|max:100|unique:tai_khoan,email,' . $id,
            'so_dien_thoai' => 'nullable|string|max:15',
            'vai_tro' => 'required|in:Khach_Hang,Nhan_Vien,Admin',
            'dang_hoat_dong' => 'required|boolean',
        ]);
        if ($request->filled('mat_khau')) {
            $request->validate(['mat_khau' => 'string|min:6']);
            $validated['mat_khau'] = Hash::make($request->mat_khau);
        }
        $u = User::findOrFail($id);
        $u->update($validated);
        return response()->json(['message' => 'Đã cập nhật', 'data' => $u]);
    }

    public function destroyTaiKhoan(Request $request, $id) {
        $this->checkAdmin($request);
        if ($request->user()->id == $id) {
            return response()->json(['message' => 'Không thể tự xóa chính mình'], 400);
        }
        try {
            $u = User::findOrFail($id);
            $u->delete();
            return response()->json(['message' => 'Đã xóa']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể xóa người dùng này'], 400);
        }
    }
}
