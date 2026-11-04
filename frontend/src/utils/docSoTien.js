const defaultNumbers = " hai ba bốn năm sáu bảy tám chín";
const chuSo = ("không một" + defaultNumbers).split(" ");
const tien = ["", " nghìn", " triệu", " tỷ", " nghìn tỷ", " triệu tỷ", " tỷ tỷ"];

function doc3So(baso) {
    let tram = Math.floor(baso / 100);
    let chuc = Math.floor((baso % 100) / 10);
    let donvi = baso % 10;
    let ketQua = "";

    if (tram === 0 && chuc === 0 && donvi === 0) return "";
    
    if (tram !== 0) {
        ketQua += chuSo[tram] + " trăm ";
        if (chuc === 0 && donvi !== 0) ketQua += " linh ";
    }
    
    if (chuc !== 0 && chuc !== 1) {
        ketQua += chuSo[chuc] + " mươi";
        if (chuc === 0 && donvi !== 0) ketQua += " linh ";
    }
    
    if (chuc === 1) ketQua += " mười ";
    
    switch (donvi) {
        case 1:
            if (chuc !== 0 && chuc !== 1) {
                ketQua += " mốt ";
            } else {
                ketQua += chuSo[donvi];
            }
            break;
        case 5:
            if (chuc === 0) {
                ketQua += chuSo[donvi];
            } else {
                ketQua += " lăm ";
            }
            break;
        default:
            if (donvi !== 0) {
                ketQua += chuSo[donvi];
            }
            break;
    }
    return ketQua;
}

export function docSoTien(soTien) {
    // Handle BigInt or String
    let soStr = soTien.toString().replace(/[^0-9]/g, "");
    if (!soStr || soStr === "0") return "Không đồng";
    
    // Pad to multiple of 3
    while (soStr.length % 3 !== 0) {
        soStr = "0" + soStr;
    }
    
    let parts = [];
    for (let i = 0; i < soStr.length; i += 3) {
        parts.push(parseInt(soStr.substring(i, i + 3), 10));
    }
    
    parts.reverse(); // so parts[0] is units, parts[1] is thousands...
    
    let ketQua = "";
    for (let i = 0; i < parts.length; i++) {
        let chunk = parts[i];
        if (chunk > 0 || (i === 0 && parts.length === 1)) {
            let chunkStr = doc3So(chunk);
            // fix "không trăm linh" if it is in middle but chunk > 0
            if (i < parts.length - 1 && chunk < 100 && chunk > 0) {
                 if (chunk < 10) {
                     chunkStr = " không trăm linh " + chuSo[chunk];
                 } else {
                     chunkStr = " không trăm " + chunkStr;
                 }
            }
            ketQua = chunkStr + (tien[i] || " tỷ tỷ") + " " + ketQua;
        }
    }
    
    // Clean up spaces
    ketQua = ketQua.replace(/\s+/g, " ").trim();
    if (ketQua.length > 0) {
        ketQua = ketQua.charAt(0).toUpperCase() + ketQua.slice(1);
    }
    
    return ketQua + " đồng";
}
