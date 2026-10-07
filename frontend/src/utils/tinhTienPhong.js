/**
 * Tính tổng tiền phòng dựa trên chuẩn khách sạn quốc tế.
 * Áp dụng phụ thu Check-in sớm và Check-out muộn.
 *
 * @param {string|Date} ngayNhan
 * @param {string|Date} ngayTra
 * @param {number} giaCoBan
 * @returns {object}
 */
export const tinhTienPhong = (ngayNhan, ngayTra, giaCoBan) => {
    giaCoBan = Number(giaCoBan) || 0;
    const nhan = new Date(ngayNhan);
    const tra = new Date(ngayTra);

    if (tra <= nhan) {
        return {
            tongTien: 0, soNgay: 0, soGioLe: 0,
            loi: 'Thời gian trả phòng phải sau thời gian nhận phòng.'
        };
    }

    const diffMs = tra - nhan;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // Check same day string comparison
    const isSameDay = nhan.toISOString().split('T')[0] === tra.toISOString().split('T')[0];

    // Thuê ngắn hạn (dưới 12 tiếng trong cùng ngày)
    if (diffHours <= 12 && isSameDay) {
        const gioTinh = Math.max(1, Math.ceil(diffHours));
        let tienGio = 0;
        if (gioTinh <= 2) {
            tienGio = giaCoBan * 0.3;
        } else {
            tienGio = (giaCoBan * 0.3) + ((gioTinh - 2) * (giaCoBan * 0.1));
        }
        if (tienGio > giaCoBan) tienGio = giaCoBan;

        return {
            tongTien: tienGio,
            soNgay: 0,
            soGioLe: gioTinh,
            loaiHinh: 'Theo giờ',
            phuThu: 0,
            chiTietPhuThu: [],
            giaCoBanApDung: giaCoBan,
            giaMotGioApDung: giaCoBan * 0.1
        };
    }

    // Thuê qua đêm / theo ngày (chuẩn 14:00 IN - 12:00 OUT)
    const dateIn = new Date(nhan.getFullYear(), nhan.getMonth(), nhan.getDate());
    const dateOut = new Date(tra.getFullYear(), tra.getMonth(), tra.getDate());
    let soDem = Math.round((dateOut - dateIn) / (1000 * 60 * 60 * 24));
    if (soDem === 0) soDem = 1;

    let tienPhong = soDem * giaCoBan;
    let phuThu = 0;
    let chiTietPhuThu = [];

    // Early Check-in
    const hourIn = nhan.getHours() + (nhan.getMinutes() / 60);
    if (hourIn < 6) {
        phuThu += giaCoBan;
        chiTietPhuThu.push("Nhận phòng sớm trước 6h (+100%)");
    } else if (hourIn < 9) {
        phuThu += giaCoBan * 0.5;
        chiTietPhuThu.push("Nhận phòng sớm 6h-9h (+50%)");
    } else if (hourIn < 14) {
        phuThu += giaCoBan * 0.3;
        chiTietPhuThu.push("Nhận phòng sớm 9h-14h (+30%)");
    }

    // Late Check-out
    const hourOut = tra.getHours() + (tra.getMinutes() / 60);
    if (hourOut > 18) {
        phuThu += giaCoBan;
        chiTietPhuThu.push("Trả phòng muộn sau 18h (+100%)");
    } else if (hourOut > 15) {
        phuThu += giaCoBan * 0.5;
        chiTietPhuThu.push("Trả phòng muộn 15h-18h (+50%)");
    } else if (hourOut > 12) {
        phuThu += giaCoBan * 0.3;
        chiTietPhuThu.push("Trả phòng muộn 12h-15h (+30%)");
    }

    return {
        tongTien: tienPhong + phuThu,
        soNgay: soDem,
        soGioLe: 0,
        phuThu,
        chiTietPhuThu,
        loaiHinh: 'Theo ngày',
        giaCoBanApDung: giaCoBan,
        giaMotGioApDung: 0
    };
};
