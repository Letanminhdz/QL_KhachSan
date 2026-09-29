<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\LoaiPhong;
use App\Models\DichVu;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [
            [
                'ten_loai' => 'Phòng Standard',
                'suc_chua' => 2,
                'gia_co_ban' => 500000,
                'mo_ta' => 'Phòng tiêu chuẩn với đầy đủ tiện nghi cơ bản, phù hợp cho khách lẻ hoặc cặp đôi.',
                'tien_ich' => ['Wifi miễn phí', 'Điều hòa', 'Tivi', 'Phòng tắm riêng'],
                'img_url' => 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
                'imgs_phu' => [
                    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
                ]
            ],
            [
                'ten_loai' => 'Phòng Deluxe',
                'suc_chua' => 3,
                'gia_co_ban' => 800000,
                'mo_ta' => 'Không gian rộng rãi, view thành phố tuyệt đẹp cùng bồn tắm nằm thư giãn.',
                'tien_ich' => ['Wifi tốc độ cao', 'Điều hòa 2 chiều', 'Smart TV 55 inch', 'Bồn tắm', 'Minibar miễn phí'],
                'img_url' => 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
                'imgs_phu' => [
                    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
                ]
            ],
            [
                'ten_loai' => 'Phòng Suite VIP',
                'suc_chua' => 4,
                'gia_co_ban' => 1500000,
                'mo_ta' => 'Trải nghiệm thượng lưu với phòng khách riêng, ban công lớn và dịch vụ đặc quyền.',
                'tien_ich' => ['Wifi VIP', 'Phòng khách riêng', 'Ban công view biển', 'Bồn tắm sục Jacuzzi', 'Đưa đón sân bay', 'Ăn sáng tận phòng'],
                'img_url' => 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
                'imgs_phu' => [
                    'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80'
                ]
            ]
        ];

        foreach ($rooms as $room) {
            $mainImgName = Str::random(10) . '.jpg';
            $mainImgContent = @file_get_contents($room['img_url']);
            if ($mainImgContent) {
                Storage::disk('public')->put('loai_phong/' . $mainImgName, $mainImgContent);
                $room['hinh_anh'] = 'storage/loai_phong/' . $mainImgName;
            }

            $hinhAnhPhu = [];
            foreach ($room['imgs_phu'] as $phuUrl) {
                $phuImgName = Str::random(10) . '.jpg';
                $phuImgContent = @file_get_contents($phuUrl);
                if ($phuImgContent) {
                    Storage::disk('public')->put('loai_phong/' . $phuImgName, $phuImgContent);
                    $hinhAnhPhu[] = 'storage/loai_phong/' . $phuImgName;
                }
            }
            $room['hinh_anh_phu'] = $hinhAnhPhu;
            unset($room['img_url'], $room['imgs_phu']);

            LoaiPhong::updateOrCreate(
                ['ten_loai' => $room['ten_loai']],
                $room
            );
        }

        $services = [
            [
                'ten_dich_vu' => 'Phở Bò Kobe',
                'gia' => 150000,
                'dang_hoat_dong' => 1,
                'img_url' => 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb431?w=400',
            ],
            [
                'ten_dich_vu' => 'Bít Tết Bò Mỹ',
                'gia' => 350000,
                'dang_hoat_dong' => 1,
                'img_url' => 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400',
            ],
            [
                'ten_dich_vu' => 'Nước Ép Cam Tươi',
                'gia' => 60000,
                'dang_hoat_dong' => 1,
                'img_url' => 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400',
            ],
            [
                'ten_dich_vu' => 'Massage Thư Giãn',
                'gia' => 500000,
                'dang_hoat_dong' => 1,
                'img_url' => 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
            ]
        ];

        foreach ($services as $service) {
            $imgName = Str::random(10) . '.jpg';
            $imgContent = @file_get_contents($service['img_url']);
            if ($imgContent) {
                Storage::disk('public')->put('dich_vu/' . $imgName, $imgContent);
                $service['hinh_anh'] = 'storage/dich_vu/' . $imgName;
            }
            unset($service['img_url']);

            DichVu::updateOrCreate(
                ['ten_dich_vu' => $service['ten_dich_vu']],
                $service
            );
        }
    }
}
