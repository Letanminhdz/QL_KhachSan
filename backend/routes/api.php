<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\LoaiPhongController;
use App\Http\Controllers\API\PhongController;
use App\Http\Controllers\API\DatPhongController;
use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\SettingController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Settings APIs (Public read)
Route::get('/settings', [SettingController::class, 'getSettings']);
Route::get('/booking-statuses', [DatPhongController::class, 'getBookingStatuses']);
Route::get('/service-statuses', [DatPhongController::class, 'getServiceStatuses']);

Route::get('/loai-phong', [LoaiPhongController::class, 'index']);
Route::get('/loai-phong/{id}', [LoaiPhongController::class, 'show']);

Route::get('/phong', [PhongController::class, 'index']);
Route::post('/phong/tim-kiem', [PhongController::class, 'timKiem']);

// Đặt phòng không cần đăng nhập
Route::post('/dat-phong/khach-vang-lai', [DatPhongController::class, 'store']); 

// Protected routes (Requires token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/user/dich-vu', [DatPhongController::class, 'getDichVu']);
    Route::get('/user/loai-dich-vu', [DatPhongController::class, 'getLoaiDichVu']);

    // Đặt phòng cho thành viên
    Route::post('/dat-phong', [DatPhongController::class, 'store']);
    Route::get('/lich-su-dat-phong', [DatPhongController::class, 'lichSu']);
    Route::get('/user/lich-su-dich-vu', [DatPhongController::class, 'lichSuDichVu']);
    Route::get('/user/active-rooms', [DatPhongController::class, 'getActiveRooms']);
    Route::post('/user/order-dich-vu', [DatPhongController::class, 'orderDichVu']);

    // Settings (Admin can update)
    Route::post('/settings', [SettingController::class, 'updateSettings']);

    // Admin dashboard
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/admin/room-diagram', [AdminController::class, 'roomDiagram']);
    Route::get('/admin/pending-allocations', [AdminController::class, 'pendingAllocations']);
    Route::get('/admin/dat-phong', [DatPhongController::class, 'index']);
    Route::get('/admin/dat-phong/{id}', [DatPhongController::class, 'show']);
    Route::put('/admin/dat-phong/{id}/status', [DatPhongController::class, 'updateStatus']);

    // Admin Data Management
    Route::get('/admin/tang', [\App\Http\Controllers\API\AdminDataController::class, 'getTang']);
    Route::post('/admin/tang', [\App\Http\Controllers\API\AdminDataController::class, 'storeTang']);
    Route::put('/admin/tang/{id}', [\App\Http\Controllers\API\AdminDataController::class, 'updateTang']);
    Route::delete('/admin/tang/{id}', [\App\Http\Controllers\API\AdminDataController::class, 'destroyTang']);

    Route::get('/admin/loai-phong', [\App\Http\Controllers\API\AdminDataController::class, 'getLoaiPhong']);
    Route::post('/admin/loai-phong', [\App\Http\Controllers\API\AdminDataController::class, 'storeLoaiPhong']);
    Route::put('/admin/loai-phong/{id}', [\App\Http\Controllers\API\AdminDataController::class, 'updateLoaiPhong']);
    Route::delete('/admin/loai-phong/{id}', [\App\Http\Controllers\API\AdminDataController::class, 'destroyLoaiPhong']);
    Route::delete('/admin/loai-phong/{id}/hinh-anh-phu', [\App\Http\Controllers\API\AdminDataController::class, 'deleteHinhAnhPhuLoaiPhong']);

    Route::get('/admin/phong', [\App\Http\Controllers\API\AdminDataController::class, 'getPhong']);
    Route::post('/admin/phong', [\App\Http\Controllers\API\AdminDataController::class, 'storePhong']);
    Route::put('/admin/phong/{id}', [\App\Http\Controllers\API\AdminDataController::class, 'updatePhong']);
    Route::delete('/admin/phong/{id}', [\App\Http\Controllers\API\AdminDataController::class, 'destroyPhong']);

    Route::get('/admin/room-statuses', [\App\Http\Controllers\API\AdminDataController::class, 'getRoomStatuses']);
    Route::post('/admin/room-statuses', [\App\Http\Controllers\API\AdminDataController::class, 'storeRoomStatuses']);
    Route::get('/admin/booking-statuses', [\App\Http\Controllers\API\AdminDataController::class, 'getBookingStatuses']);
    Route::post('/admin/booking-statuses', [\App\Http\Controllers\API\AdminDataController::class, 'storeBookingStatuses']);
    Route::get('/admin/service-statuses', [\App\Http\Controllers\API\AdminDataController::class, 'getServiceStatuses']);
    Route::post('/admin/service-statuses', [\App\Http\Controllers\API\AdminDataController::class, 'storeServiceStatuses']);

    Route::get('/admin/phong', [\App\Http\Controllers\API\AdminDataController::class, 'getPhong']);
    Route::post('/admin/phong', [\App\Http\Controllers\API\AdminDataController::class, 'storePhong']);
    Route::put('/admin/phong/{id}', [\App\Http\Controllers\API\AdminDataController::class, 'updatePhong']);
    Route::delete('/admin/phong/{id}', [\App\Http\Controllers\API\AdminDataController::class, 'destroyPhong']);

    Route::get('/admin/dich-vu', [\App\Http\Controllers\API\AdminDataController::class, 'getDichVu']);
    Route::post('/admin/dich-vu', [\App\Http\Controllers\API\AdminDataController::class, 'storeDichVu']);
    Route::put('/admin/dich-vu/{id}', [\App\Http\Controllers\API\AdminDataController::class, 'updateDichVu']);
    Route::delete('/admin/dich-vu/{id}', [\App\Http\Controllers\API\AdminDataController::class, 'destroyDichVu']);
    
    // Loại Dịch Vụ
    Route::get('/admin/loai-dich-vu', [\App\Http\Controllers\API\AdminDataController::class, 'getLoaiDichVu']);
    Route::post('/admin/loai-dich-vu', [\App\Http\Controllers\API\AdminDataController::class, 'storeLoaiDichVu']);
    Route::put('/admin/loai-dich-vu/{id}', [\App\Http\Controllers\API\AdminDataController::class, 'updateLoaiDichVu']);
    Route::delete('/admin/loai-dich-vu/{id}', [\App\Http\Controllers\API\AdminDataController::class, 'destroyLoaiDichVu']);
    
    // Order Dịch Vụ
    Route::get('/admin/active-rooms', [\App\Http\Controllers\API\AdminDataController::class, 'getActiveRooms']);
    Route::post('/admin/order-dich-vu', [\App\Http\Controllers\API\AdminDataController::class, 'orderDichVu']);
    Route::get('/admin/su-dung-dich-vu', [\App\Http\Controllers\API\AdminDataController::class, 'getSuDungDichVu']);
    Route::put('/admin/su-dung-dich-vu/{id}/status', [\App\Http\Controllers\API\AdminDataController::class, 'updateSuDungDichVuStatus']);

    Route::get('/admin/tai-khoan', [\App\Http\Controllers\API\AdminDataController::class, 'getTaiKhoan']);
    Route::post('/admin/tai-khoan', [\App\Http\Controllers\API\AdminDataController::class, 'storeTaiKhoan']);
    Route::put('/admin/tai-khoan/{id}', [\App\Http\Controllers\API\AdminDataController::class, 'updateTaiKhoan']);
    Route::delete('/admin/tai-khoan/{id}', [\App\Http\Controllers\API\AdminDataController::class, 'destroyTaiKhoan']);
});
