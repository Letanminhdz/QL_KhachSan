<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\LoaiPhong;
use App\Models\Phong;
use App\Models\DatPhong;
use App\Models\PhanBoPhong;
use App\Models\DichVu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ChatBotController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1500',
            'history' => 'nullable|array',
        ]);

        $userMessage = trim($request->input('message'));
        $history = $request->input('history', []);

        // 1. Lấy dữ liệu loại phòng thực tế
        $loaiPhongs = LoaiPhong::all()->map(function ($item) {
            $img = $item->hinh_anh ?: 'storage/defaults/room_600.jpg';
            if (!str_starts_with($img, 'http') && !str_starts_with($img, '/')) {
                $img = '/' . ltrim($img, '/');
            }
            return [
                'id' => $item->id,
                'ten_loai' => $item->ten_loai,
                'suc_chua' => $item->suc_chua,
                'gia_co_ban' => (float) $item->gia_co_ban,
                'mo_ta' => $item->mo_ta ?: 'Phòng đầy đủ tiện nghi tiêu chuẩn cao cấp.',
                'tien_ich' => is_array($item->tien_ich) ? $item->tien_ich : ['WiFi miễn phí', 'Điều hòa', 'TV màn hình phẳng', 'Tủ lạnh mini', 'Vòi sen nóng lạnh'],
                'hinh_anh' => $img,
            ];
        });

        $dichVus = DichVu::where('dang_hoat_dong', 1)->get()->map(function ($dv) {
            return [
                'id' => $dv->id,
                'ten' => $dv->ten_dich_vu,
                'gia' => (float) $dv->gia,
            ];
        });

        // Đọc cài đặt khách sạn
        $settingsPath = database_path('json_data/settings.json');
        $settings = [];
        if (file_exists($settingsPath)) {
            $settings = json_decode(file_get_contents($settingsPath), true) ?: [];
        }

        $hotelInfo = [
            'ten' => 'Royal Hotel & Resort Đà Nẵng',
            'hotline' => $settings['hotline'] ?? '1900 6868',
            'dia_chi' => $settings['address'] ?? '123 Đường Bờ Biển, Đà Nẵng (sát bãi biển Mỹ Khê)',
            'email' => $settings['email'] ?? 'contact@royalhotel.vn',
            'deposit_percentage' => $settings['deposit_percentage'] ?? 25,
            'check_in' => '14:00',
            'check_out' => '12:00',
        ];

        // 2. Gọi AI nếu được bật
        $aiEnabled = $settings['ai_enabled'] ?? true;
        if ($aiEnabled) {
            $aiResponse = $this->callExternalAI($userMessage, $history, $loaiPhongs, $dichVus, $hotelInfo, $settings, $request);
            if ($aiResponse) {
                return response()->json($aiResponse);
            }
        }

        // 3. Fallback nếu AI lỗi
        $fallbackResponse = $this->handleFallbackChat($userMessage, $loaiPhongs, $dichVus, $hotelInfo);

        return response()->json($fallbackResponse);
    }

    /**
     * API chuyên dụng để xác nhận tạo đơn đặt phòng trực tiếp từ Chatbot
     */
    public function bookRoomDirect(Request $request)
    {
        $request->validate([
            'id_loai_phong' => 'required|exists:loai_phong,id',
            'ngay_nhan_phong' => 'required|date',
            'ngay_tra_phong' => 'required|date|after:ngay_nhan_phong',
            'so_luong_phong' => 'required|integer|min:1',
            'ten_khach_hang' => 'required|string|max:100',
            'sdt_khach_hang' => 'required|string|max:20',
            'loai_dat' => 'nullable|string|in:dat_truoc,o_luon',
        ]);

        $loaiPhong = LoaiPhong::findOrFail($request->id_loai_phong);
        $checkIn = $request->ngay_nhan_phong;
        $checkOut = $request->ngay_tra_phong;
        $soLuongCanDat = $request->so_luong_phong;

        // Kiểm tra phòng trống
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
            return response()->json([
                'success' => false,
                'message' => "Rất tiếc, loại phòng {$loaiPhong->ten_loai} hiện không còn đủ {$soLuongCanDat} phòng trống trong khoảng thời gian từ {$checkIn} đến {$checkOut}."
            ], 400);
        }

        // Tính tiền
        $ketQuaTinh = \App\Services\TinhTienPhong::tinh($checkIn, $checkOut, $loaiPhong->gia_co_ban);
        $tongTien = (isset($ketQuaTinh['tong_tien']) ? $ketQuaTinh['tong_tien'] : ($loaiPhong->gia_co_ban * max(1, Carbon::parse($checkIn)->diffInDays(Carbon::parse($checkOut))))) * $soLuongCanDat;

        $loaiDat = $request->input('loai_dat', 'dat_truoc');
        $targetStatusId = 'Cho_Xac_Nhan';
        $path = database_path('json_data/booking_statuses.json');
        $bookingStatuses = file_exists($path) ? json_decode(file_get_contents($path), true) : [];
        if (!is_array($bookingStatuses)) $bookingStatuses = [];

        if ($loaiDat === 'o_luon') {
            // Tìm trạng thái check-in (set_room_status == 'in' hoặc id == 'Da_Nhan_Phong')
            $checkinStatus = collect($bookingStatuses)->firstWhere('set_room_status', 'in');
            $targetStatusId = $checkinStatus ? $checkinStatus['id'] : 'Da_Nhan_Phong';
        } else {
            if (count($bookingStatuses) > 0 && isset($bookingStatuses[0]['id'])) {
                $targetStatusId = $bookingStatuses[0]['id'];
            }
        }

        DB::beginTransaction();
        try {
            $userId = $this->getUserIdFromRequest($request);
            $datPhong = DatPhong::create([
                'id_tai_khoan' => $userId,
                'ten_khach_hang' => $request->ten_khach_hang,
                'sdt_khach_hang' => $request->sdt_khach_hang,
                'ngay_nhan_phong' => $loaiDat === 'o_luon' ? now() : $checkIn,
                'ngay_tra_phong' => $checkOut,
                'id_loai_phong' => $loaiPhong->id,
                'ten_loai_phong_khi_dat' => $loaiPhong->ten_loai,
                'so_luong_phong' => $soLuongCanDat,
                'gia_phong_khi_dat' => $loaiPhong->gia_co_ban,
                'tong_tien' => $tongTien,
                'trang_thai' => $targetStatusId
            ]);

            foreach ($phongTrongList as $phong) {
                PhanBoPhong::create([
                    'id_dat_phong' => $datPhong->id,
                    'id_phong' => $phong->id,
                    'thoi_gian_phan_bo' => now()
                ]);

                // Nếu là 'o_luon', cập nhật trạng thái phòng sang 'Dang_Thue' (is_checkin)
                if ($loaiDat === 'o_luon') {
                    $roomStatusesPath = database_path('json_data/room_statuses.json');
                    $roomStatuses = file_exists($roomStatusesPath) ? json_decode(file_get_contents($roomStatusesPath), true) : [];
                    $checkinRoomStatus = collect($roomStatuses)->firstWhere('is_checkin', true);
                    $targetRoomStatus = $checkinRoomStatus ? $checkinRoomStatus['id'] : 'Dang_Thue';
                    $phong->update(['trang_thai' => $targetRoomStatus]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tạo đơn đặt phòng thành công!',
                'booking' => [
                    'id' => $datPhong->id,
                    'ten_khach_hang' => $datPhong->ten_khach_hang,
                    'sdt_khach_hang' => $datPhong->sdt_khach_hang,
                    'ten_loai_phong' => $loaiPhong->ten_loai,
                    'so_luong_phong' => $soLuongCanDat,
                    'ngay_nhan_phong' => $checkIn,
                    'ngay_tra_phong' => $checkOut,
                    'tong_tien' => $tongTien,
                    'trang_thai' => $targetStatusId,
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống khi tạo đơn: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Gọi AI với khả năng nhận diện quy trình chốt đơn và xác nhận đơn đặt phòng
     */
    private function callExternalAI($userMessage, $history, $loaiPhongs, $dichVus, $hotelInfo, $settings, $request)
    {
        $provider = $settings['ai_provider'] ?? 'gemini';
        $geminiKey = !empty($settings['gemini_api_key']) ? $settings['gemini_api_key'] : env('GEMINI_API_KEY');
        $geminiModel = !empty($settings['gemini_model']) ? $settings['gemini_model'] : env('GEMINI_MODEL', 'gemini-2.5-flash');
        $openaiKey = !empty($settings['openai_api_key']) ? $settings['openai_api_key'] : env('OPENAI_API_KEY');
        $openaiModel = !empty($settings['openai_model']) ? $settings['openai_model'] : 'gpt-4o-mini';

        $currentDate = Carbon::now()->format('Y-m-d');
        $currentYear = Carbon::now()->year;

        $roomSummary = $loaiPhongs->map(function ($r) {
            $tienIchStr = implode(', ', $r['tien_ich']);
            return "- [Mã ID: {$r['id']}] Hạng: {$r['ten_loai']} (Sức chứa: {$r['suc_chua']} người) - Giá: " . number_format($r['gia_co_ban'], 0, ',', '.') . " VNĐ/đêm. Tiện nghi: {$tienIchStr}.";
        })->implode("\n");

        $serviceSummary = $dichVus->map(function ($s) {
            return "- {$s['ten']}: " . number_format($s['gia'], 0, ',', '.') . " VNĐ";
        })->implode("\n");

        $systemPrompt = <<<PROMPT
Hôm nay là ngày {$currentDate}. Bạn là bạn Lễ tân trực tuyến của khách sạn {$hotelInfo['ten']}.
Xưng hô: Xưng "em", gọi khách là "anh/chị" hoặc "quý khách".
Giọng văn: Cực kỳ tự nhiên, lịch thiệp, thông minh, ấm áp và nhiệt tình như người thật chat Zalo/Livechat.

Thông tin khách sạn:
- Hotline: {$hotelInfo['hotline']} | Địa chỉ: {$hotelInfo['dia_chi']}
- Check-in: {$hotelInfo['check_in']} | Check-out: {$hotelInfo['check_out']}
- Mức cọc: {$hotelInfo['deposit_percentage']}%
Danh sách hạng phòng thực tế:
{$roomSummary}
Dịch vụ:
{$serviceSummary}

NHIỆM VỤ ĐẶC BIỆT: BẠN CÓ THẨM QUYỀN CHỐT ĐƠN VÀ ĐẶT PHÒNG TRỰC TIẾP CHO KHÁCH NGAY TRONG ĐOẠN CHAT!
Để tạo được đơn đặt phòng hoàn chỉnh, bạn BẮT BUỘC cần đủ 5 thông tin sau:
1. Hạng phòng muốn đặt (Standard, Superior, Deluxe, hoặc Suite)
2. Ngày nhận phòng (Check-in, định dạng YYYY-MM-DD)
3. Ngày trả phòng (Check-out, định dạng YYYY-MM-DD)
4. Tên của khách hàng
5. Số điện thoại liên hệ của khách hàng
(Số lượng phòng mặc định là 1 nếu khách không nói rõ).

QUY TRÌNH HỎI VÀ XÁC NHẬN (CỰC KỲ QUAN TRỌNG):
- Bước 1: Khi khách có ý định đặt phòng mà THIẾU THÔNG TIN (ví dụ thiếu ngày đi, thiếu tên, hoặc thiếu số điện thoại): Bạn phải trò chuyện tự nhiên, hỏi khéo léo những thông tin còn thiếu. Ví dụ: "Dạ anh/chị dự định nhận phòng ngày nào và trả phòng ngày nào ạ? Cho em xin thêm họ tên và số điện thoại để em giữ phòng cho mình nhé!"
- Bước 2: KHI ĐÃ CÓ ĐỦ 5 THÔNG TIN, BẠN PHẢI TỔNG HỢP VÀ XÁC NHẬN LẠI VỚI KHÁCH 1 LẦN NỮA trước khi chốt.
  Đồng thời, ở CUỐI CÙNG tin nhắn, bạn BẮT BUỘC ghi cú pháp:
  [CONFIRM_BOOKING: {"id_loai_phong": 1, "ten_loai_phong": "Standard", "ngay_nhan_phong": "2026-10-15", "ngay_tra_phong": "2026-10-17", "so_luong_phong": 1, "ten_khach_hang": "Nguyễn Văn A", "sdt_khach_hang": "0912345678", "gia_co_ban": 500000}]
  (Hệ thống website sẽ tự động dựng bảng xác nhận kèm nút "Xác nhận tạo đơn ngay" và "Chỉnh sửa" cho khách bấm).
- Bước 3: NẾU KHÁCH ĐỒNG Ý / XÁC NHẬN TẠO ĐƠN (ví dụ khách nói: "ok chốt đi em", "tạo đơn giúp anh", "xác nhận nhé", "đồng ý", "đặt luôn đi"):
  Bạn chúc mừng, thông báo đã đặt phòng thành công, nhắc nhở giữ máy hotline {$hotelInfo['hotline']} và ở CUỐI CÙNG ghi cú pháp:
  [EXECUTE_BOOKING: {"id_loai_phong": 1, "ten_loai_phong": "Standard", "ngay_nhan_phong": "2026-10-15", "ngay_tra_phong": "2026-10-17", "so_luong_phong": 1, "ten_khach_hang": "Nguyễn Văn A", "sdt_khach_hang": "0912345678"}]

QUY TẮC HIỂN THỊ THẺ PHÒNG THÔNG THƯỜNG:
Khi bạn gợi ý hoặc tư vấn các hạng phòng, ghi [ROOM_IDS: id1, id2] ở dòng cuối để hệ thống hiện thẻ phòng.
PROMPT;

        // Ưu tiên provider
        if ($provider === 'openai' && !empty($openaiKey)) {
            $res = $this->callOpenAI($userMessage, $history, $openaiKey, $openaiModel, $systemPrompt, $loaiPhongs, $request);
            if ($res) return $res;
        }

        if (!empty($geminiKey)) {
            $res = $this->callGemini($userMessage, $history, $geminiKey, $geminiModel, $systemPrompt, $loaiPhongs, $request);
            if ($res) return $res;
        }

        if (!empty($openaiKey)) {
            $res = $this->callOpenAI($userMessage, $history, $openaiKey, $openaiModel, $systemPrompt, $loaiPhongs, $request);
            if ($res) return $res;
        }

        return null;
    }

    private function callGemini($userMessage, $history, $geminiKey, $geminiModel, $systemPrompt, $loaiPhongs, $request)
    {
        try {
            $contents = [];
            $recentHistory = array_slice($history, -8);
            foreach ($recentHistory as $item) {
                $role = ($item['sender'] ?? '') === 'user' ? 'user' : 'model';
                $text = $item['text'] ?? '';
                if (!empty($text)) {
                    $contents[] = [
                        'role' => $role,
                        'parts' => [['text' => $text]]
                    ];
                }
            }
            $contents[] = [
                'role' => 'user',
                'parts' => [['text' => $userMessage]]
            ];

            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$geminiModel}:generateContent?key={$geminiKey}";

            $response = Http::timeout(12)->post($url, [
                'systemInstruction' => ['parts' => [['text' => $systemPrompt]]],
                'contents' => $contents,
                'generationConfig' => [
                    'temperature' => 0.6,
                    'maxOutputTokens' => 2048,
                    'thinkingConfig' => [
                        'thinkingBudget' => 0
                    ]
                ],
            ]);

            if ($response->successful()) {
                $json = $response->json();
                $replyText = $json['candidates'][0]['content']['parts'][0]['text'] ?? null;
                if ($replyText) {
                    return $this->formatAIOutput($replyText, $loaiPhongs, $request);
                }
            } else {
                Log::warning('Gemini API call failed: ' . $response->body());
            }
        } catch (\Exception $e) {
            Log::warning('Gemini AI exception: ' . $e->getMessage());
        }
        return null;
    }

    private function callOpenAI($userMessage, $history, $openaiKey, $openaiModel, $systemPrompt, $loaiPhongs, $request)
    {
        try {
            $messages = [['role' => 'system', 'content' => $systemPrompt]];
            $recentHistory = array_slice($history, -8);
            foreach ($recentHistory as $item) {
                $role = ($item['sender'] ?? '') === 'user' ? 'user' : 'assistant';
                $messages[] = ['role' => $role, 'content' => $item['text'] ?? ''];
            }
            $messages[] = ['role' => 'user', 'content' => $userMessage];

            $response = Http::timeout(10)->withToken($openaiKey)->post(
                'https://api.openai.com/v1/chat/completions',
                [
                    'model' => $openaiModel ?: 'gpt-4o-mini',
                    'messages' => $messages,
                    'temperature' => 0.6,
                    'max_tokens' => 1000,
                ]
            );

            if ($response->successful()) {
                $json = $response->json();
                $replyText = $json['choices'][0]['message']['content'] ?? null;
                if ($replyText) {
                    return $this->formatAIOutput($replyText, $loaiPhongs, $request);
                }
            } else {
                Log::warning('OpenAI call failed: ' . $response->body());
            }
        } catch (\Exception $e) {
            Log::warning('OpenAI exception: ' . $e->getMessage());
        }
        return null;
    }

    /**
     * Bóc tách các thẻ đặc biệt: [EXECUTE_BOOKING], [CONFIRM_BOOKING], [ROOM_IDS]
     */
    private function formatAIOutput($rawText, $loaiPhongs, $request)
    {
        $suggestedRooms = [];
        $bookingConfirmation = null;
        $bookingCreated = null;
        $cleanText = $rawText;

        // 1. Kiểm tra lệnh TẠO ĐƠN THỰC SỰ: [EXECUTE_BOOKING: {...}]
        if (preg_match('/\[EXECUTE_BOOKING:\s*(\{.*?\})\]/s', $cleanText, $execMatches)) {
            $bookingData = json_decode($execMatches[1], true);
            $cleanText = trim(str_replace($execMatches[0], '', $cleanText));

            if ($bookingData && !empty($bookingData['id_loai_phong'])) {
                $createReq = new Request($bookingData);
                $createRes = $this->bookRoomDirect($createReq);
                $createResData = $createRes->getData(true);
                if (!empty($createResData['success'])) {
                    $bookingCreated = $createResData['booking'];
                }
            }
        }

        // 2. Kiểm tra bảng XÁC NHẬN THÔNG TIN: [CONFIRM_BOOKING: {...}]
        if (!$bookingCreated && preg_match('/\[CONFIRM_BOOKING:\s*(\{.*?\})\]/s', $cleanText, $confirmMatches)) {
            $confirmData = json_decode($confirmMatches[1], true);
            $cleanText = trim(str_replace($confirmMatches[0], '', $cleanText));

            if ($confirmData && !empty($confirmData['id_loai_phong'])) {
                // Tính tạm số đêm và tổng tiền dự kiến
                $checkIn = $confirmData['ngay_nhan_phong'] ?? '';
                $checkOut = $confirmData['ngay_tra_phong'] ?? '';
                $loai = $loaiPhongs->firstWhere('id', $confirmData['id_loai_phong']);
                $soDem = 1;
                if ($checkIn && $checkOut) {
                    try {
                        $soDem = max(1, Carbon::parse($checkIn)->diffInDays(Carbon::parse($checkOut)));
                    } catch (\Exception $e) {}
                }
                $gia = $loai ? $loai['gia_co_ban'] : ($confirmData['gia_co_ban'] ?? 0);
                $soLuong = $confirmData['so_luong_phong'] ?? 1;
                $confirmData['so_dem'] = $soDem;
                $confirmData['tong_tien_du_kien'] = $gia * $soDem * $soLuong;
                $confirmData['hinh_anh'] = $loai ? $loai['hinh_anh'] : '/storage/defaults/room_600.jpg';
                $bookingConfirmation = $confirmData;
            }
        }

        // 3. Kiểm tra thẻ phòng gợi ý thông thường: [ROOM_IDS: ...]
        if (preg_match('/\[ROOM_IDS:\s*([0-9,\s]+)\]/i', $cleanText, $matches)) {
            $ids = array_map('intval', explode(',', $matches[1]));
            $cleanText = trim(str_replace($matches[0], '', $cleanText));
            $suggestedRooms = $loaiPhongs->whereIn('id', $ids)->values()->all();
        }

        if (empty($suggestedRooms) && !$bookingConfirmation && !$bookingCreated) {
            $suggestedRooms = $this->detectRoomsFromText($cleanText, $loaiPhongs);
        }

        return [
            'reply' => $cleanText,
            'suggested_rooms' => $suggestedRooms,
            'booking_confirmation' => $bookingConfirmation,
            'booking_created' => $bookingCreated,
            'source' => 'ai',
        ];
    }

    private function handleFallbackChat($userMessage, $loaiPhongs, $dichVus, $hotelInfo)
    {
        $msg = mb_strtolower($userMessage, 'UTF-8');
        $suggestedRooms = [];
        $reply = "Dạ em chào anh/chị ạ! Anh/chị đang có nhu cầu đặt phòng hay cần em tư vấn thêm thông tin gì, anh/chị cho em xin số người và ngày dự kiến nhận phòng nhé!";

        if (preg_match('/(đặt phòng|chốt|book)/u', $msg)) {
            $reply = "Dạ để em tạo đơn đặt phòng cho anh/chị ngay, anh/chị vui lòng cho em xin:\n1. Hạng phòng muốn đặt (Standard, Superior, Deluxe, Suite)\n2. Ngày nhận phòng và ngày trả phòng\n3. Họ tên và Số điện thoại liên hệ của mình ạ!";
        }

        $detected = $this->detectRoomsFromText($msg, $loaiPhongs);
        if (!empty($detected)) {
            $suggestedRooms = $detected;
        }

        return [
            'reply' => $reply,
            'suggested_rooms' => $suggestedRooms,
            'booking_confirmation' => null,
            'booking_created' => null,
            'source' => 'fallback',
        ];
    }

    private function detectRoomsFromText($text, $loaiPhongs)
    {
        $detected = [];
        $lower = mb_strtolower($text, 'UTF-8');
        foreach ($loaiPhongs as $r) {
            $nameLower = mb_strtolower($r['ten_loai'], 'UTF-8');
            if (str_contains($lower, $nameLower)) {
                $detected[] = $r;
            }
        }
        return $detected;
    }
    private function getUserIdFromRequest(Request $request)
    {
        $bearer = $request->bearerToken();
        if ($bearer) {
            $tokenStr = str_contains($bearer, '|') ? explode('|', $bearer, 2)[1] : $bearer;
            $tokenModel = \Laravel\Sanctum\PersonalAccessToken::where('token', hash('sha256', $tokenStr))->first();
            if ($tokenModel && $tokenModel->tokenable) {
                return $tokenModel->tokenable->id;
            }
        }
        return null;
    }
}
