/**
 * Tiện ích xử lý và định dạng ngày/tháng/năm đồng bộ toàn hệ thống
 */

/**
 * Định dạng ngày sang DD/MM/YYYY
 * @param {string|Date} dateStr
 * @returns {string} Ví dụ: "11/10/2026"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Định dạng ngày giờ sang DD/MM/YYYY HH:mm
 * @param {string|Date} dateStr
 * @returns {string} Ví dụ: "11/10/2026 14:00"
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Định dạng giờ ngày sang HH:mm DD/MM/YYYY
 * @param {string|Date} dateStr
 * @returns {string} Ví dụ: "14:00 11/10/2026"
 */
export const formatTimeDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

/**
 * Chuyển đổi Date sang định dạng YYYY-MM-DDTHH:mm dùng cho input type="datetime-local"
 * @param {Date|string} d
 * @returns {string}
 */
export const toDateTimeLocal = (d) => {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  const pad = (n) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/**
 * Lấy thời điểm hiện tại dạng YYYY-MM-DDTHH:mm
 */
export const getNowDateTimeLocal = () => {
  return toDateTimeLocal(new Date());
};
