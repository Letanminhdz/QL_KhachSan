import { useState, useEffect } from "react";
import { useUI } from "../contexts/UIContext";

export default function ServiceStatusSettingsModal({ onClose, onSaveSuccess }) {
  const [bookingStatuses, setBookingStatuses] = useState([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState(null);
  const { showToast, showConfirm } = useUI();

  useEffect(() => {
    fetch("http://localhost:8000/api/admin/service-statuses", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => setBookingStatuses(Array.isArray(data) ? data : []))
      .catch(() => showToast("Lỗi khi tải trạng thái đơn", "error"));
  }, [showToast]);

  const addStatus = () => {
    setBookingStatuses([...bookingStatuses, { id: "", label: "", color: "#cccccc", textColor: "#000000", charge_fee: false }]);
  };

  const updateStatus = (index, field, value) => {
    const newStatuses = [...bookingStatuses];
    newStatuses[index][field] = value;
    setBookingStatuses(newStatuses);
  };

  const removeStatus = (index) => {
    showConfirm("Bạn có chắc chắn muốn xóa trạng thái này không?", () => {
      setBookingStatuses(bookingStatuses.filter((_, i) => i !== index));
    });
  };

  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", index); // Required for Firefox
  };

  const handleDragEnter = (e, index) => {
    setDragOverItemIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedItemIndex !== null && dragOverItemIndex !== null && draggedItemIndex !== dragOverItemIndex) {
      const newStatuses = [...bookingStatuses];
      const draggedItem = newStatuses[draggedItemIndex];
      newStatuses.splice(draggedItemIndex, 1);
      newStatuses.splice(dragOverItemIndex, 0, draggedItem);
      setBookingStatuses(newStatuses);
    }
    setDraggedItemIndex(null);
    setDragOverItemIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSaveStatuses = () => {
    fetch("http://localhost:8000/api/admin/service-statuses", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ statuses: bookingStatuses }),
    })
      .then(res => res.json())
      .then(data => {
        showToast("Lưu cấu hình trạng thái thành công!", "success");
        if(onSaveSuccess) onSaveSuccess();
        onClose();
      })
      .catch(() => showToast("Lỗi khi lưu trạng thái", "error"));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Cấu hình Trạng Thái Đơn Dịch Vụ
            </h3>
            <p className="text-slate-500 text-sm mt-1">Nắm giữ và kéo thả (Drag & Drop) để sắp xếp thứ tự các trạng thái</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto bg-slate-50">
          <div className="space-y-4">
            {bookingStatuses.map((status, index) => (
              <div 
                key={index} 
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                className={`flex flex-col md:flex-row items-center gap-4 p-4 rounded-xl shadow-sm transition-all cursor-move border-2 ${dragOverItemIndex === index ? 'border-primary-500 bg-primary-50 scale-[1.02]' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                {/* Drag Handle Icon */}
                <div className="hidden md:flex text-slate-400">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6a2 2 0 11-4 0 2 2 0 014 0zM8 12a2 2 0 11-4 0 2 2 0 014 0zM8 18a2 2 0 11-4 0 2 2 0 014 0zM20 6a2 2 0 11-4 0 2 2 0 014 0zM20 12a2 2 0 11-4 0 2 2 0 014 0zM20 18a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>

                <div className="flex flex-col gap-1 w-full md:w-32">
                  <label className="text-xs font-bold text-slate-500">Mã (ID)</label>
                  <input 
                    type="text" 
                    value={status.id} 
                    onChange={e => updateStatus(index, 'id', e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Moi_Dat"
                  />
                </div>
                <div className="flex flex-col gap-1 w-full md:w-48">
                  <label className="text-xs font-bold text-slate-500">Tên hiển thị</label>
                  <input 
                    type="text" 
                    value={status.label} 
                    onChange={e => updateStatus(index, 'label', e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Chờ duyệt"
                  />
                </div>
                <div className="flex flex-col gap-1 w-full md:w-24">
                  <label className="text-xs font-bold text-slate-500">Màu nền</label>
                  <input 
                    type="color" 
                    value={status.color} 
                    onChange={e => updateStatus(index, 'color', e.target.value)} 
                    className="w-full h-9 p-1 bg-slate-50 border border-slate-300 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-1 w-full md:w-24">
                  <label className="text-xs font-bold text-slate-500">Màu chữ</label>
                  <input 
                    type="color" 
                    value={status.textColor} 
                    onChange={e => updateStatus(index, 'textColor', e.target.value)} 
                    className="w-full h-9 p-1 bg-slate-50 border border-slate-300 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-1 w-full md:w-32">
                  <label className="text-xs font-bold text-slate-500">Tính tiền?</label>
                  <select 
                    value={status.charge_fee ? 'yes' : 'no'} 
                    onChange={e => updateStatus(index, 'charge_fee', e.target.value === 'yes')} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="yes">Có tính tiền</option>
                    <option value="no">Không tính</option>
                  </select>
                </div>


                <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0 justify-end md:ml-auto">
                  <button 
                    onClick={() => removeStatus(index)} 
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg ml-2 transition-colors"
                    title="Xóa"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <button 
              onClick={addStatus} 
              className="text-primary-600 bg-primary-50 hover:bg-primary-100 font-bold py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Thêm trạng thái
            </button>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-bold text-sm transition-colors">Hủy</button>
          <button onClick={handleSaveStatuses} className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-2 rounded-lg shadow-md transition-colors flex items-center gap-2 text-sm">
            Lưu Cấu Hình
          </button>
        </div>
      </div>
    </div>
  );
}
