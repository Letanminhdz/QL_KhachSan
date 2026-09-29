import { Link, useSearchParams } from "react-router-dom";

export default function DatPhongThanhCong() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('id');
  const roomName = searchParams.get('roomName');
  const roomCount = searchParams.get('count') || 1;

  return (
    <main className="flex-grow bg-slate-50 py-16 flex items-center justify-center">
      <div className="max-w-xl w-full px-4">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden text-center">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 text-white relative">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              {/* Optional animated ping */}
              <div className="absolute inset-0 rounded-full border-4 border-white animate-ping opacity-20"></div>
            </div>
            <h2 className="text-3xl font-extrabold mb-2">
              ĐẶT PHÒNG THÀNH CÔNG!
            </h2>
            <p className="text-emerald-100 font-medium">
              Cảm ơn bạn đã lựa chọn Royal Hotel & Resort
            </p>
          </div>

          <div className="p-8">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8 inline-block w-full max-w-sm text-left">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                Mã Đặt Phòng
              </div>
              <div className="text-3xl font-extrabold text-slate-800 tracking-widest mb-4 font-mono">
                #{bookingId || '10294'}
              </div>

              {roomName && (
                <div className="bg-emerald-50 rounded-xl p-4 mb-4 border border-emerald-100 flex items-center justify-between">
                  <div className="font-bold text-emerald-800">{roomName}</div>
                  <div className="text-emerald-600 font-bold bg-white px-3 py-1 rounded-lg text-sm shadow-sm">
                    {roomCount} phòng
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 text-sm text-slate-600">
                <svg
                  className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <p>
                  Chúng tôi đã gửi email xác nhận chi tiết đơn đặt phòng đến địa
                  chỉ email của bạn.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/"
                className="px-8 py-3 border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all text-center"
              >
                Về Trang Chủ
              </Link>
              <Link
                to={`/chi-tiet-dat-phong?id=${bookingId}`}
                className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:from-primary-700 hover:to-primary-800 transition-all text-center flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  ></path>
                </svg>
                Xem Chi Tiết Đơn
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
