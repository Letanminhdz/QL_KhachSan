<?php

namespace App\Services;

use Carbon\Carbon;

class TinhTienPhong
{
    /**
     * Tính tổng tiền phòng dựa trên chuẩn khách sạn quốc tế.
     * Áp dụng phụ thu Check-in sớm và Check-out muộn.
     *
     * @param string|Carbon $ngayNhan
     * @param string|Carbon $ngayTra
     * @param float $giaCoBan (Giá 1 đêm)
     * @return array
     */
    public static function tinh($ngayNhan, $ngayTra, $giaCoBan)
    {
        $nhan = Carbon::parse($ngayNhan);
        $tra = Carbon::parse($ngayTra);

        if ($tra->lessThanOrEqualTo($nhan)) {
            return [
                'tong_tien' => 0, 'so_ngay' => 0, 'so_gio_le' => 0,
                'loi' => 'Thời gian trả phòng phải sau thời gian nhận phòng.'
            ];
        }

        // Tính theo giờ (Nếu dưới 12 tiếng thì tính theo giờ)
        $diffHours = $nhan->diffInHours($tra, false);
        if ($diffHours <= 12 && $nhan->isSameDay($tra)) {
            // Khách thuê ngắn hạn trong ngày
            // 2 giờ đầu = 30% giá phòng. Mỗi giờ tiếp theo = 10%
            $gioTinh = max(1, ceil($nhan->diffInMinutes($tra) / 60));
            $tienGio = 0;
            if ($gioTinh <= 2) {
                $tienGio = $giaCoBan * 0.3;
            } else {
                $tienGio = ($giaCoBan * 0.3) + (($gioTinh - 2) * ($giaCoBan * 0.1));
            }
            if ($tienGio > $giaCoBan) $tienGio = $giaCoBan;
            
            return [
                'tong_tien' => $tienGio,
                'so_ngay' => 0,
                'so_gio_le' => $gioTinh,
                'loai_hinh' => 'Theo giờ',
                'phu_thu' => 0,
                'chi_tiet_phu_thu' => [],
                'gia_co_ban_ap_dung' => $giaCoBan,
                'gia_mot_gio_ap_dung' => $giaCoBan * 0.1
            ];
        }

        // Tính theo ngày đêm (Chuẩn: IN 14:00 - OUT 12:00)
        // Số đêm lưu trú cơ bản (tính theo ngày calendar)
        $dateIn = $nhan->copy()->startOfDay();
        $dateOut = $tra->copy()->startOfDay();
        
        $soDem = $dateIn->diffInDays($dateOut);
        if ($soDem == 0) $soDem = 1; // Qua đêm nhưng cùng 1 ngày (ví dụ in 01:00 out 12:00) => tính 1 đêm.

        $tienPhong = $soDem * $giaCoBan;
        $phuThu = 0;
        $chiTietPhuThu = [];

        // Phụ thu Early Check-in (trước 14:00)
        $hourIn = $nhan->hour + ($nhan->minute / 60);
        if ($hourIn < 6) {
            $phuThu += $giaCoBan; // +100%
            $chiTietPhuThu[] = "Nhận phòng sớm trước 6h (+100%)";
        } elseif ($hourIn < 9) {
            $phuThu += $giaCoBan * 0.5;
            $chiTietPhuThu[] = "Nhận phòng sớm 6h-9h (+50%)";
        } elseif ($hourIn < 14) {
            $phuThu += $giaCoBan * 0.3;
            $chiTietPhuThu[] = "Nhận phòng sớm 9h-14h (+30%)";
        }

        // Phụ thu Late Check-out (sau 12:00)
        $hourOut = $tra->hour + ($tra->minute / 60);
        if ($hourOut > 18) {
            $phuThu += $giaCoBan;
            $chiTietPhuThu[] = "Trả phòng muộn sau 18h (+100%)";
        } elseif ($hourOut > 15) {
            $phuThu += $giaCoBan * 0.5;
            $chiTietPhuThu[] = "Trả phòng muộn 15h-18h (+50%)";
        } elseif ($hourOut > 12) {
            $phuThu += $giaCoBan * 0.3;
            $chiTietPhuThu[] = "Trả phòng muộn 12h-15h (+30%)";
        }

        return [
            'tong_tien' => $tienPhong + $phuThu,
            'so_ngay' => $soDem,
            'so_gio_le' => 0,
            'phu_thu' => $phuThu,
            'chi_tiet_phu_thu' => $chiTietPhuThu,
            'loai_hinh' => 'Theo ngày',
            'gia_co_ban_ap_dung' => $giaCoBan,
            'gia_mot_gio_ap_dung' => 0
        ];
    }
}
