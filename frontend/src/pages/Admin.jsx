import { useState, useEffect } from "react";
import { useUI } from "../contexts/UIContext";
import SearchBar from "../components/SearchBar";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("phong");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast, showConfirm } = useUI();
  
  // States for Modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  
  // States for LoaiDichVu Modal
  const [showLoaiDichVuModal, setShowLoaiDichVuModal] = useState(false);
  const [editingLdv, setEditingLdv] = useState(null);
  const [ldvName, setLdvName] = useState("");
  
  // Reference data
  const [loaiPhongs, setLoaiPhongs] = useState([]);
  const [tangs, setTangs] = useState([]);
  const [loaiDichVus, setLoaiDichVus] = useState([]);
  const [roomStatuses, setRoomStatuses] = useState([]);

  // States for Status Modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusId, setStatusId] = useState("");
  const [statusLabel, setStatusLabel] = useState("");
  const [statusColor, setStatusColor] = useState("#f59e0b");
  const [isCheckin, setIsCheckin] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);

  const tabs = [
    { id: "phong", label: "Phòng" },
    { id: "tang", label: "Tầng" },
    { id: "loaiphong", label: "Loại Phòng" },
    { id: "dichvu", label: "Dịch Vụ" },
    { id: "nguoidung", label: "Người Dùng" },
  ];

  useEffect(() => {
    setSearchTerm(""); // Reset search when changing tab
    fetchData();
    // Fetch reference data for 'phong' tab
    if (activeTab === 'phong' || activeTab === 'loaiphong' || activeTab === 'tang') {
      fetchRefs();
    }
    if (activeTab === 'dichvu') {
      fetchLoaiDichVu();
    }
  }, [activeTab]);

  const fetchRefs = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { "Authorization": `Bearer ${token}`, "Accept": "application/json" };
      const [resLp, resTang, resStatus] = await Promise.all([
        fetch("http://localhost:8000/api/admin/loai-phong", { headers }),
        fetch("http://localhost:8000/api/admin/tang", { headers }),
        fetch("http://localhost:8000/api/admin/room-statuses", { headers })
      ]);
      if (resLp.ok) setLoaiPhongs(await resLp.json());
      if (resTang.ok) setTangs(await resTang.json());
      if (resStatus.ok) setRoomStatuses(await resStatus.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLoaiDichVu = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { "Authorization": `Bearer ${token}`, "Accept": "application/json" };
      const res = await fetch("http://localhost:8000/api/admin/loai-dich-vu", { headers });
      if (res.ok) setLoaiDichVus(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveLdv = async (e) => {
    e.preventDefault();
    if (!ldvName.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const method = editingLdv ? "PUT" : "POST";
      const url = editingLdv ? `http://localhost:8000/api/admin/loai-dich-vu/${editingLdv.id}` : "http://localhost:8000/api/admin/loai-dich-vu";
      const res = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ ten_loai: ldvName })
      });
      if (res.ok) {
        showToast(editingLdv ? "Cập nhật thành công!" : "Thêm thành công!", "success");
        setLdvName("");
        setEditingLdv(null);
        fetchLoaiDichVu();
      } else {
        const d = await res.json();
        showToast(d.message || "Lỗi lưu dữ liệu", "error");
      }
    } catch (err) {
      showToast("Lỗi kết nối", "error");
    }
  };

  const handleDeleteLdv = (id) => {
    showConfirm("Xóa loại dịch vụ này?").then(async (result) => {
      if (result) {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`http://localhost:8000/api/admin/loai-dich-vu/${id}`, {
            method: 'DELETE',
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
            showToast("Đã xóa", "success");
            fetchLoaiDichVu();
          } else {
            const data = await res.json();
            showToast(data.message || "Lỗi xóa", "error");
          }
        } catch (err) {
          showToast("Lỗi kết nối", "error");
        }
      }
    });
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!statusId.trim() || !statusLabel.trim()) return;
    try {
      const newStatuses = [...roomStatuses];
      const textColor = getContrastYIQ(statusColor);
      const idx = newStatuses.findIndex(s => s.id === statusId);
      if (idx > -1) {
        newStatuses[idx].label = statusLabel;
        newStatuses[idx].color = statusColor;
        newStatuses[idx].textColor = textColor;
        newStatuses[idx].is_checkin = isCheckin;
        newStatuses[idx].is_checkout = isCheckout;
      } else {
        newStatuses.push({ id: statusId, label: statusLabel, color: statusColor, textColor: textColor, is_checkin: isCheckin, is_checkout: isCheckout });
      }

      // Đảm bảo chỉ có 1 trạng thái checkin/checkout
      if (isCheckin) {
        newStatuses.forEach((s, i) => { if (i !== (idx > -1 ? idx : newStatuses.length - 1)) s.is_checkin = false; });
      }
      if (isCheckout) {
        newStatuses.forEach((s, i) => { if (i !== (idx > -1 ? idx : newStatuses.length - 1)) s.is_checkout = false; });
      }

      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/admin/room-statuses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ statuses: newStatuses })
      });
      if (res.ok) {
        showToast("Lưu trạng thái thành công!", "success");
        setRoomStatuses(newStatuses);
        setStatusId("");
        setStatusLabel("");
        setStatusColor("#f59e0b");
        setIsCheckin(false);
        setIsCheckout(false);
      } else {
        showToast("Lỗi lưu trạng thái", "error");
      }
    } catch (err) {
      showToast("Lỗi kết nối", "error");
    }
  };

  const handleDeleteStatus = async (id) => {
    showConfirm("Xóa trạng thái này?").then(async (result) => {
      if (result) {
        try {
          const newStatuses = roomStatuses.filter(s => s.id !== id);
          const token = localStorage.getItem("token");
          const res = await fetch("http://localhost:8000/api/admin/room-statuses", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({ statuses: newStatuses })
          });
          if (res.ok) {
            showToast("Đã xóa trạng thái", "success");
            setRoomStatuses(newStatuses);
          } else {
            showToast("Lỗi xóa", "error");
          }
        } catch (err) {
          showToast("Lỗi kết nối", "error");
        }
      }
    });
  };

  const fetchData = async () => {
    setLoading(true);
    let endpoint = "";
    switch (activeTab) {
      case "phong": endpoint = "/api/admin/phong"; break;
      case "tang": endpoint = "/api/admin/tang"; break;
      case "loaiphong": endpoint = "/api/admin/loai-phong"; break;
      case "dichvu": endpoint = "/api/admin/dich-vu"; break;
      case "nguoidung": endpoint = "/api/admin/tai-khoan"; break;
      default: break;
    }
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000${endpoint}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      if (res.ok) {
        setData(await res.json());
      } else {
        showToast("Lỗi lấy dữ liệu", "error");
      }
    } catch (e) {
      showToast("Lỗi kết nối", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      // For editing, set form data
      const dataToSet = { ...item, mat_khau: '' };
      if (activeTab === 'loaiphong') {
        if (Array.isArray(dataToSet.tien_ich)) {
          dataToSet.tien_ich = dataToSet.tien_ich.join(', ');
        }
        if (dataToSet.gia_co_ban) dataToSet.gia_co_ban = Number(dataToSet.gia_co_ban);
      }
      if (activeTab === 'dichvu' && dataToSet.gia) {
        dataToSet.gia = Number(dataToSet.gia);
      }
      setFormData(dataToSet);
    } else {
      // Default values for new items
      if (activeTab === 'phong') setFormData({ so_phong: '', id_loai_phong: '', id_tang: '', trang_thai: 'Trong' });
      else if (activeTab === 'tang') setFormData({ ten_tang: '', thu_tu: 1 });
      else if (activeTab === 'loaiphong') setFormData({ ten_loai: '', suc_chua: 2, gia_co_ban: 500000, hinh_anh: '', mo_ta: '', tien_ich: '' });
      else if (activeTab === 'dichvu') setFormData({ ten_dich_vu: '', gia: 50000, dang_hoat_dong: 1 });
      else if (activeTab === 'nguoidung') setFormData({ ho_ten: '', email: '', mat_khau: '', so_dien_thoai: '', vai_tro: 'Khach_Hang', dang_hoat_dong: 1 });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({});
    setEditingItem(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      if (e.target.multiple) {
        setFormData(prev => ({ ...prev, [name]: Array.from(files) }));
      } else {
        setFormData(prev => ({ ...prev, [name]: files[0] }));
      }
      return;
    }
    let finalValue = value;
    if (type === 'checkbox') {
      finalValue = checked ? 1 : 0;
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let endpoint = "";
    switch (activeTab) {
      case "phong": endpoint = "/api/admin/phong"; break;
      case "tang": endpoint = "/api/admin/tang"; break;
      case "loaiphong": endpoint = "/api/admin/loai-phong"; break;
      case "dichvu": endpoint = "/api/admin/dich-vu"; break;
      case "nguoidung": endpoint = "/api/admin/tai-khoan"; break;
      default: break;
    }

    const isEdit = !!editingItem;
    const url = `http://localhost:8000${endpoint}${isEdit ? `/${editingItem.id}` : ''}`;
    
    try {
      const token = localStorage.getItem("token");
      const payload = { ...formData };
      
      let fetchOptions = {};

      if (activeTab === 'loaiphong' || activeTab === 'dichvu') {
        const formDataPayload = new FormData();
        
        // Fix boolean conversion for dichvu before looping
        if (activeTab === 'dichvu') {
           payload.dang_hoat_dong = payload.dang_hoat_dong ? 1 : 0;
        }

        Object.keys(payload).forEach(key => {
          if (key === 'tien_ich' && activeTab === 'loaiphong') {
            const tienIchArr = typeof payload.tien_ich === 'string' ? payload.tien_ich.split(',').map(s => s.trim()).filter(s => s) : payload.tien_ich;
            if (Array.isArray(tienIchArr)) {
              tienIchArr.forEach(ti => formDataPayload.append('tien_ich[]', ti));
            }
          } else if (key === 'file_hinh_anh') {
            if (payload.file_hinh_anh) formDataPayload.append('file_hinh_anh', payload.file_hinh_anh);
          } else if (key === 'file_hinh_anh_phu' && activeTab === 'loaiphong') {
            if (payload.file_hinh_anh_phu && Array.isArray(payload.file_hinh_anh_phu)) {
              payload.file_hinh_anh_phu.forEach(f => formDataPayload.append('file_hinh_anh_phu[]', f));
            }
          } else if (key !== 'hinh_anh' && key !== 'hinh_anh_phu') { // skip old image string fields
            if (payload[key] !== null && payload[key] !== undefined) {
               formDataPayload.append(key, payload[key]);
            }
          }
        });
        
        if (isEdit) {
           formDataPayload.append('_method', 'PUT');
        }
        
        fetchOptions = {
          method: 'POST', // always POST with _method=PUT for FormData in Laravel
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          },
          body: formDataPayload
        };
      } else {
        // Fix boolean/int conversions if needed
        if (activeTab === 'nguoidung') {
           payload.dang_hoat_dong = !!payload.dang_hoat_dong;
        }

        // Remove empty password if not changing
        if (activeTab === 'nguoidung' && isEdit && !payload.mat_khau) {
           delete payload.mat_khau;
        }

        fetchOptions = {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        };
      }

      const res = await fetch(url, fetchOptions);
      
      const resData = await res.json();
      
      if (res.ok) {
        showToast(isEdit ? "Cập nhật thành công" : "Thêm mới thành công", "success");
        handleCloseModal();
        fetchData();
      } else {
        showToast(resData.message || "Có lỗi xảy ra", "error");
      }
    } catch (e) {
      showToast("Lỗi kết nối", "error");
    }
  };

  const handleDelete = (id) => {
    showConfirm("Bạn có chắc chắn muốn xóa dữ liệu này?", async () => {
      let endpoint = "";
      switch (activeTab) {
        case "phong": endpoint = "/api/admin/phong"; break;
        case "tang": endpoint = "/api/admin/tang"; break;
        case "loaiphong": endpoint = "/api/admin/loai-phong"; break;
        case "dichvu": endpoint = "/api/admin/dich-vu"; break;
        case "nguoidung": endpoint = "/api/admin/tai-khoan"; break;
        default: break;
      }
      
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8000${endpoint}/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
        
        if (res.ok) {
          showToast("Xóa thành công", "success");
          fetchData();
        } else {
          const resData = await res.json();
          showToast(resData.message || "Lỗi khi xóa", "error");
        }
      } catch (e) {
        showToast("Lỗi kết nối", "error");
      }
    });
  };

  const removeNewMainImage = () => {
    setFormData({ ...formData, file_hinh_anh: null });
  };

  const removeNewSubImage = (index) => {
    const newFiles = [...(formData.file_hinh_anh_phu || [])];
    newFiles.splice(index, 1);
    setFormData({ ...formData, file_hinh_anh_phu: newFiles });
  };

  const removeOldSubImage = (url) => {
    showConfirm("Bạn có chắc muốn xóa ảnh phụ này không? Ảnh sẽ bị xóa ngay lập tức.", async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8000/api/admin/loai-phong/${editingItem.id}/hinh-anh-phu`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ image_url: url })
        });
        if (res.ok) {
          showToast("Đã xóa ảnh phụ", "success");
          const newOldImgs = editingItem.hinh_anh_phu.filter(u => u !== url);
          setEditingItem({ ...editingItem, hinh_anh_phu: newOldImgs });
          // Update the list of loaiPhongs in state so the table updates too without a full refresh
          setLoaiPhongs(loaiPhongs.map(lp => lp.id === editingItem.id ? { ...lp, hinh_anh_phu: newOldImgs } : lp));
        } else {
          const data = await res.json();
          showToast(data.message || "Xóa ảnh thất bại", "error");
        }
      } catch (err) {
        console.error(err);
        showToast("Lỗi kết nối", "error");
      }
    });
  };

  // Render Form based on tab
  const renderForm = () => {
    if (activeTab === 'phong') {
      return (
        <>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Số phòng</label>
            <input type="text" name="so_phong" value={formData.so_phong || ''} onChange={handleChange} className="w-full border p-2 rounded" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Loại phòng</label>
            <select name="id_loai_phong" value={formData.id_loai_phong || ''} onChange={handleChange} className="w-full border p-2 rounded" required>
              <option value="">-- Chọn loại phòng --</option>
              {loaiPhongs.map(lp => <option key={lp.id} value={lp.id}>{lp.ten_loai}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Tầng</label>
            <select name="id_tang" value={formData.id_tang || ''} onChange={handleChange} className="w-full border p-2 rounded" required>
              <option value="">-- Chọn tầng --</option>
              {tangs.map(t => <option key={t.id} value={t.id}>{t.ten_tang}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-bold">Trạng thái</label>
              <button 
                type="button" 
                onClick={() => setShowStatusModal(true)}
                className="text-primary-600 hover:text-primary-800 flex items-center gap-1 text-xs font-semibold bg-primary-50 px-2 py-1 rounded"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Quản lý trạng thái
              </button>
            </div>
            {formData.trang_thai === 'Dang_Thue' ? (
              <div className="w-full border border-red-200 bg-red-50 p-3 rounded-lg flex items-start gap-2">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                <div>
                  <p className="text-red-700 font-bold text-sm">Phòng đang có khách — Khóa trạng thái</p>
                  <p className="text-red-500 text-xs mt-0.5">Chỉ có thể đổi trạng thái sau khi thực hiện Check-out qua trang Quản Lý Đặt Phòng.</p>
                </div>
              </div>
            ) : (
              <select name="trang_thai" value={formData.trang_thai || 'Trong'} onChange={handleChange} className="w-full border p-2 rounded">
                {roomStatuses.length > 0 ? (
                  <>
                    {roomStatuses.filter(s => s.id !== 'Dang_Thue').map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    {formData.trang_thai && !roomStatuses.find(s => s.id === formData.trang_thai) && (
                      <option value={formData.trang_thai}>{formData.trang_thai} (Chưa định nghĩa)</option>
                    )}
                  </>
                ) : (
                  <option value={formData.trang_thai || 'Trong'}>{formData.trang_thai || 'Trống'}</option>
                )}
              </select>
            )}
          </div>
        </>
      );
    }
    
    if (activeTab === 'tang') {
      return (
        <>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Tên tầng (vd: Tầng 1)</label>
            <input type="text" name="ten_tang" value={formData.ten_tang || ''} onChange={handleChange} className="w-full border p-2 rounded" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Thứ tự hiển thị (tùy chọn)</label>
            <input type="number" name="thu_tu" value={formData.thu_tu || 0} onChange={handleChange} className="w-full border p-2 rounded" required />
          </div>
        </>
      );
    }

    if (activeTab === 'loaiphong') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cột trái: Thông tin văn bản */}
          <div>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-1 text-slate-700">Tên loại phòng</label>
              <input type="text" name="ten_loai" value={formData.ten_loai || ''} onChange={handleChange} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" required />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2 mb-4">
                <label className="block text-sm font-bold mb-1 text-slate-700">Sức chứa (người)</label>
                <input type="number" name="suc_chua" value={formData.suc_chua || ''} onChange={handleChange} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" required />
              </div>
              <div className="w-1/2 mb-4">
                <label className="block text-sm font-bold mb-1 text-slate-700">Giá cơ bản (VNĐ)</label>
                <input type="number" name="gia_co_ban" value={formData.gia_co_ban || ''} onChange={handleChange} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" required />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-1 text-slate-700">Mô tả</label>
              <textarea name="mo_ta" value={formData.mo_ta || ''} onChange={handleChange} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" rows="4"></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-1 text-slate-700">Các tiện ích (cách nhau bởi dấu phẩy)</label>
              <textarea name="tien_ich" value={formData.tien_ich || ''} onChange={handleChange} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="Wifi, Ban công, Bồn tắm..." rows="3"></textarea>
            </div>
          </div>
          
          {/* Cột phải: Hình ảnh */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2 text-slate-700">Hình ảnh chính</label>
              <input type="file" accept="image/*" name="file_hinh_anh" onChange={handleChange} className="w-full border p-2 rounded-lg text-sm bg-white mb-3" />
              
              <div className="flex gap-4 flex-wrap">
                {formData.file_hinh_anh ? (
                  <div className="relative w-48 h-32 rounded-lg overflow-hidden border-2 border-emerald-500 shadow-md">
                    <span className="absolute top-2 left-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-md font-bold shadow">Mới</span>
                    <button type="button" onClick={removeNewMainImage} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm shadow-md transition-colors z-10">&times;</button>
                    <img src={URL.createObjectURL(formData.file_hinh_anh)} alt="New Main" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  editingItem && editingItem.hinh_anh && (
                    <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-slate-300 shadow-sm opacity-90">
                      <span className="absolute top-2 left-2 bg-slate-600 text-white text-xs px-2 py-0.5 rounded-md font-bold shadow">Hiện tại</span>
                      <img src={editingItem.hinh_anh.startsWith('http') ? editingItem.hinh_anh : `http://localhost:8000/${editingItem.hinh_anh}`} alt="Current Main" className="w-full h-full object-cover" />
                    </div>
                  )
                )}
                {/* Placeholder if no main image */}
                {!formData.file_hinh_anh && !(editingItem && editingItem.hinh_anh) && (
                  <div className="w-48 h-32 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-white">
                    <svg className="w-8 h-8 mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span className="text-xs">Chưa có ảnh</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700">Các hình ảnh phụ (Chọn nhiều)</label>
              <input type="file" accept="image/*" multiple name="file_hinh_anh_phu" onChange={handleChange} className="w-full border p-2 rounded-lg text-sm bg-white mb-3" />
              
              <div className="flex gap-3 overflow-x-auto pb-4 pt-2 px-2 -mx-2 snap-x min-h-[120px]" style={{ scrollbarWidth: 'thin' }}>
                {/* Placeholder if no sub images */}
                {!(editingItem && editingItem.hinh_anh_phu?.length) && !(formData.file_hinh_anh_phu?.length) && (
                  <div className="flex-none w-32 h-24 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-white">
                    <svg className="w-6 h-6 mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span className="text-[10px]">Trống</span>
                  </div>
                )}

                {/* Ảnh phụ cũ */}
                {editingItem && editingItem.hinh_anh_phu && editingItem.hinh_anh_phu.map((anh, index) => (
                  <div key={`old-${index}`} className="flex-none w-32 h-24 relative rounded-lg overflow-hidden border border-slate-300 shadow-sm group snap-start bg-white">
                    <button type="button" onClick={() => removeOldSubImage(anh)} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md transition-colors opacity-0 group-hover:opacity-100 z-10" title="Xóa ảnh này">&times;</button>
                    <img src={anh.startsWith('http') ? anh : `http://localhost:8000/${anh}`} alt={`Old Sub ${index}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                
                {/* Ảnh phụ mới */}
                {formData.file_hinh_anh_phu && formData.file_hinh_anh_phu.map((file, index) => (
                  <div key={`new-${index}`} className="flex-none w-32 h-24 relative rounded-lg overflow-hidden border-2 border-emerald-500 shadow-sm snap-start bg-white">
                    <span className="absolute top-1 left-1 bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-bold z-10">Mới</span>
                    <button type="button" onClick={() => removeNewSubImage(index)} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md transition-colors z-10" title="Bỏ chọn">&times;</button>
                    <img src={URL.createObjectURL(file)} alt={`New Sub ${index}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    }

    if (activeTab === 'dichvu') {
      return (
        <>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Tên dịch vụ</label>
            <input type="text" name="ten_dich_vu" value={formData.ten_dich_vu || ''} onChange={handleChange} className="w-full border p-2 rounded" required />
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-bold">Loại dịch vụ</label>
              <button 
                type="button" 
                onClick={() => setShowLoaiDichVuModal(true)}
                className="text-primary-600 hover:text-primary-800 flex items-center gap-1 text-xs font-semibold bg-primary-50 px-2 py-1 rounded"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Quản lý loại dịch vụ
              </button>
            </div>
            <select name="id_loai_dich_vu" value={formData.id_loai_dich_vu || ''} onChange={handleChange} className="w-full border p-2 rounded" required>
              <option value="">-- Chọn loại dịch vụ --</option>
              {loaiDichVus.map(ldv => (
                <option key={ldv.id} value={ldv.id}>{ldv.ten_loai}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Giá</label>
            <input type="number" name="gia" value={formData.gia || ''} onChange={handleChange} className="w-full border p-2 rounded" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">Hình ảnh minh họa</label>
            <input type="file" accept="image/*" name="file_hinh_anh" onChange={handleChange} className="w-full border p-2 rounded text-sm mb-3" />
            
            <div className="flex gap-4 flex-wrap">
              {formData.file_hinh_anh ? (
                <div className="relative w-40 h-28 rounded-lg overflow-hidden border border-emerald-500 shadow-sm">
                  <span className="absolute top-1 left-1 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Mới</span>
                  <button type="button" onClick={removeNewMainImage} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md transition-colors z-10">&times;</button>
                  <img src={URL.createObjectURL(formData.file_hinh_anh)} alt="New Main" className="w-full h-full object-cover" />
                </div>
              ) : (
                editingItem && editingItem.hinh_anh ? (
                  <div className="relative w-40 h-28 rounded-lg overflow-hidden border border-slate-300 shadow-sm opacity-80">
                    <span className="absolute top-1 left-1 bg-slate-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Hiện tại</span>
                    <img src={editingItem.hinh_anh.startsWith('http') ? editingItem.hinh_anh : `http://localhost:8000/${editingItem.hinh_anh}`} alt="Current Main" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-40 h-28 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                    <svg className="w-8 h-8 mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span className="text-xs">Chưa có ảnh</span>
                  </div>
                )
              )}
            </div>
          </div>
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="dang_hoat_dong" checked={formData.dang_hoat_dong == 1} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded" />
              <span className="text-sm font-bold">Đang hoạt động</span>
            </label>
          </div>
        </>
      );
    }

    if (activeTab === 'nguoidung') {
      return (
        <>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Họ tên</label>
            <input type="text" name="ho_ten" value={formData.ho_ten || ''} onChange={handleChange} className="w-full border p-2 rounded" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Email</label>
            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full border p-2 rounded" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Số điện thoại</label>
            <input type="text" name="so_dien_thoai" value={formData.so_dien_thoai || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">{editingItem ? "Đổi mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}</label>
            <input type="password" name="mat_khau" value={formData.mat_khau || ''} onChange={handleChange} className="w-full border p-2 rounded" required={!editingItem} minLength={6} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Vai trò</label>
            <select name="vai_tro" value={formData.vai_tro || 'Khach_Hang'} onChange={handleChange} className="w-full border p-2 rounded">
              <option value="Khach_Hang">Khách Hàng</option>
              <option value="Nhan_Vien">Nhân Viên</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="dang_hoat_dong" checked={formData.dang_hoat_dong == 1} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded" />
              <span className="text-sm font-bold">Đang hoạt động</span>
            </label>
          </div>
        </>
      );
    }
  };

  const renderTableHead = () => {
    if (activeTab === 'phong') return (
      <>
        <th className="p-4 font-bold border-b border-slate-200">ID</th>
        <th className="p-4 font-bold border-b border-slate-200">Số Phòng</th>
        <th className="p-4 font-bold border-b border-slate-200">Loại</th>
        <th className="p-4 font-bold border-b border-slate-200">Tầng</th>
        <th className="p-4 font-bold border-b border-slate-200">Trạng Thái</th>
        <th className="p-4 font-bold border-b border-slate-200 text-right">Thao Tác</th>
      </>
    );
    if (activeTab === 'tang') return (
      <>
        <th className="p-4 font-bold border-b border-slate-200">ID</th>
        <th className="p-4 font-bold border-b border-slate-200">Tên Tầng</th>
        <th className="p-4 font-bold border-b border-slate-200">Thứ Tự</th>
        <th className="p-4 font-bold border-b border-slate-200 text-right">Thao Tác</th>
      </>
    );
    if (activeTab === 'loaiphong') return (
      <>
        <th className="p-4 font-bold border-b border-slate-200">ID</th>
        <th className="p-4 font-bold border-b border-slate-200">Tên Loại</th>
        <th className="p-4 font-bold border-b border-slate-200">Sức Chứa</th>
        <th className="p-4 font-bold border-b border-slate-200">Giá Cơ Bản</th>
        <th className="p-4 font-bold border-b border-slate-200 text-right">Thao Tác</th>
      </>
    );
    if (activeTab === 'dichvu') return (
      <>
        <th className="p-4 font-bold border-b border-slate-200">ID</th>
        <th className="p-4 font-bold border-b border-slate-200">Tên Dịch Vụ</th>
        <th className="p-4 font-bold border-b border-slate-200">Loại</th>
        <th className="p-4 font-bold border-b border-slate-200">Giá</th>
        <th className="p-4 font-bold border-b border-slate-200">Trạng Thái</th>
        <th className="p-4 font-bold border-b border-slate-200 text-right">Thao Tác</th>
      </>
    );
    if (activeTab === 'nguoidung') return (
      <>
        <th className="p-4 font-bold border-b border-slate-200">ID</th>
        <th className="p-4 font-bold border-b border-slate-200">Họ Tên</th>
        <th className="p-4 font-bold border-b border-slate-200">Email</th>
        <th className="p-4 font-bold border-b border-slate-200">SĐT</th>
        <th className="p-4 font-bold border-b border-slate-200">Vai Trò</th>
        <th className="p-4 font-bold border-b border-slate-200">Trạng Thái</th>
        <th className="p-4 font-bold border-b border-slate-200 text-right">Thao Tác</th>
      </>
    );
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val) + ' đ';

  const getContrastYIQ = (hexcolor) => {
    if (!hexcolor) return '#1e293b';
    hexcolor = hexcolor.replace("#", "");
    if (hexcolor.length === 3) {
      hexcolor = hexcolor.split('').map(c => c + c).join('');
    }
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#1e293b' : '#ffffff';
  };

  const renderTableRow = (item) => {
    return (
      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
        <td className="p-4 text-slate-600 font-medium">#{item.id}</td>
        
        {activeTab === 'phong' && (
          <>
            <td className="p-4 font-bold text-slate-800">{item.so_phong}</td>
            <td className="p-4">{item.loai_phong?.ten_loai}</td>
            <td className="p-4">{item.tang?.ten_tang}</td>
            <td className="p-4">
              <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                item.trang_thai === 'Trong' ? 'bg-emerald-100 text-emerald-700' :
                item.trang_thai === 'Dang_Thue' ? 'bg-red-100 text-red-700' :
                item.trang_thai === 'Bao_Tri' ? 'bg-slate-200 text-slate-700' : 
                item.trang_thai === 'Dang_Don' ? 'bg-primary-100 text-primary-700' :
                (!roomStatuses.find(s => s.id === item.trang_thai)?.color ? 'bg-amber-100 text-amber-700' : '')
              }`}
              style={
                roomStatuses.find(s => s.id === item.trang_thai)?.color && !['Trong', 'Dang_Thue', 'Bao_Tri', 'Dang_Don'].includes(item.trang_thai) 
                ? { 
                    backgroundColor: roomStatuses.find(s => s.id === item.trang_thai).color, 
                    color: roomStatuses.find(s => s.id === item.trang_thai).textColor 
                  } 
                : {}
              }
              >{roomStatuses.find(s => s.id === item.trang_thai)?.label || item.trang_thai}</span>
            </td>
          </>
        )}

        {activeTab === 'tang' && (
          <>
            <td className="p-4 font-bold text-slate-800">{item.ten_tang}</td>
            <td className="p-4">{item.thu_tu}</td>
          </>
        )}

        {activeTab === 'loaiphong' && (
          <>
            <td className="p-4 font-bold text-slate-800">{item.ten_loai}</td>
            <td className="p-4">{item.suc_chua} người</td>
            <td className="p-4 font-bold text-red-600">{formatCurrency(item.gia_co_ban)}</td>
          </>
        )}

        {activeTab === 'dichvu' && (
          <>
            <td className="p-4 font-bold text-slate-800">{item.ten_dich_vu}</td>
            <td className="p-4">
              <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-bold">
                {item.loai_dich_vu?.ten_loai || 'Chưa phân loại'}
              </span>
            </td>
            <td className="p-4 font-bold text-red-600">{formatCurrency(item.gia)}</td>
            <td className="p-4">
              {item.dang_hoat_dong ? 
                <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-bold">Hoạt động</span> :
                <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-bold">Tạm ngưng</span>
              }
            </td>
          </>
        )}

        {activeTab === 'nguoidung' && (
          <>
            <td className="p-4 font-bold text-slate-800">{item.ho_ten}</td>
            <td className="p-4">{item.email}</td>
            <td className="p-4">{item.so_dien_thoai}</td>
            <td className="p-4">
              <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                item.vai_tro === 'Admin' ? 'bg-purple-100 text-purple-700' :
                item.vai_tro === 'Nhan_Vien' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
              }`}>{item.vai_tro}</span>
            </td>
            <td className="p-4">
              {item.dang_hoat_dong ? 
                <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-bold">Kích hoạt</span> :
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold">Khóa</span>
              }
            </td>
          </>
        )}

        <td className="p-4 text-right">
          <button onClick={() => handleOpenModal(item)} className="text-primary-600 hover:text-primary-800 font-bold mx-2">Sửa</button>
          <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 font-bold">Xóa</button>
        </td>
      </tr>
    );
  };

  const getFilteredData = () => {
    if (!searchTerm) return data;
    const lowercasedTerm = searchTerm.toLowerCase();
    return data.filter(item => {
      // Basic search strategy: stringify object values and check if it includes search term
      // Exclude specific fields like timestamps or long nested objects if needed, 
      // but stringify is a quick catch-all for simple tables.
      return JSON.stringify(item).toLowerCase().includes(lowercasedTerm);
    });
  };

  const filteredData = getFilteredData();

  return (
    <div className="p-4 md:p-8 flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quản Lý Dữ Liệu Hệ Thống</h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý các danh mục cốt lõi của khách sạn
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-center">
          <div className="w-full md:w-72">
             <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder={`Tìm kiếm ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}...`} />
          </div>
          <button onClick={() => handleOpenModal()} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center gap-2 w-full md:w-auto justify-center h-[42px]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Thêm mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col relative z-10">
        {/* Horizontal Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-6 py-4 text-sm font-bold transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? "border-primary-600 text-primary-600 bg-white" 
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="overflow-x-auto min-h-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  {renderTableHead()}
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="10" className="text-center p-8 text-slate-500">Đang tải...</td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan="10" className="text-center p-8 text-slate-500">Không có dữ liệu</td></tr>
                ) : (
                  filteredData.map(renderTableRow)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm ${(showStatusModal || showLoaiDichVuModal) ? 'hidden' : ''}`}>
          <div className={`bg-white rounded-2xl shadow-xl w-full ${activeTab === 'loaiphong' ? 'max-w-5xl' : 'max-w-lg'} overflow-hidden flex flex-col max-h-[90vh]`}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">
                {editingItem ? 'Chỉnh sửa' : 'Thêm mới'} {tabs.find(t => t.id === activeTab)?.label}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-red-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex-1">
              {renderForm()}
              
              <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">Hủy</button>
                <button type="submit" className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-md shadow-primary-500/20">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal Quản lý Loại Dịch Vụ */}
      {showLoaiDichVuModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Quản lý Loại Dịch Vụ</h3>
              <button onClick={() => { setShowLoaiDichVuModal(false); setEditingLdv(null); setLdvName(""); }} className="text-slate-400 hover:text-red-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-5 flex-1 flex flex-col gap-4">
              <form onSubmit={handleSaveLdv} className="flex gap-2">
                <input type="text" value={ldvName} onChange={(e) => setLdvName(e.target.value)} placeholder="Tên loại dịch vụ..." className="flex-1 border p-2 rounded outline-none focus:border-primary-500 transition-colors" required />
                <button type="submit" className="bg-emerald-500 text-white px-4 py-2 rounded font-bold hover:bg-emerald-600 transition-colors">
                  {editingLdv ? 'Cập nhật' : 'Thêm'}
                </button>
                {editingLdv && (
                  <button type="button" onClick={() => { setEditingLdv(null); setLdvName(""); }} className="bg-slate-200 text-slate-600 px-3 py-2 rounded font-bold hover:bg-slate-300">
                    Hủy
                  </button>
                )}
              </form>
              <div className="border border-slate-200 rounded-lg overflow-y-auto max-h-60" style={{ scrollbarWidth: 'thin' }}>
                {loaiDichVus.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-sm">Chưa có loại dịch vụ nào</div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {loaiDichVus.map(ldv => (
                      <li key={ldv.id} className="p-3 flex justify-between items-center hover:bg-slate-50 group">
                        <span className="font-semibold text-slate-700 text-sm">{ldv.ten_loai}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingLdv(ldv); setLdvName(ldv.ten_loai); }} className="text-primary-600 p-1 hover:bg-primary-50 rounded" title="Sửa"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                          <button onClick={() => handleDeleteLdv(ldv.id)} className="text-red-500 p-1 hover:bg-red-50 rounded" title="Xóa"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quản lý Trạng Thái Phòng */}
      {showStatusModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Quản lý Trạng Thái Phòng</h3>
              <button onClick={() => { setShowStatusModal(false); setStatusId(""); setStatusLabel(""); setStatusColor("#f59e0b"); setIsCheckin(false); setIsCheckout(false); }} className="text-slate-400 hover:text-red-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-5 flex-1 flex flex-col gap-4">
              <form onSubmit={handleSaveStatus} className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <input type="text" value={statusId} onChange={(e) => setStatusId(e.target.value)} placeholder="Mã trạng thái (vd: Dang_Su_Dung)..." className="flex-1 border p-2 rounded outline-none focus:border-primary-500 transition-colors" required />
                  <div className="flex items-center gap-2 border p-1 pl-2 pr-3 rounded bg-white border-slate-200">
                    <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Màu sắc</span>
                    <input type="color" value={statusColor} onChange={(e) => setStatusColor(e.target.value)} className="w-8 h-8 border-0 p-0 rounded cursor-pointer" title="Chọn màu" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <input type="text" value={statusLabel} onChange={(e) => setStatusLabel(e.target.value)} placeholder="Tên hiển thị (vd: Đang có người ở)..." className="flex-1 border p-2 rounded outline-none focus:border-primary-500 transition-colors" required />
                  <button type="submit" className="bg-emerald-500 text-white px-5 py-2 rounded font-bold hover:bg-emerald-600 transition-colors whitespace-nowrap">
                    {statusId && roomStatuses.find(s => s.id === statusId) ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                  {statusId && roomStatuses.find(s => s.id === statusId) && (
                    <button type="button" onClick={() => { setStatusId(""); setStatusLabel(""); setStatusColor("#f59e0b"); setIsCheckin(false); setIsCheckout(false); }} className="bg-slate-200 text-slate-600 px-4 py-2 rounded font-bold hover:bg-slate-300 transition-colors">
                      Hủy
                    </button>
                  )}
                </div>
                {statusId && roomStatuses.find(s => s.id === statusId) && (
                  <div className="flex gap-4 mb-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isCheckin} 
                        onChange={(e) => {
                          setIsCheckin(e.target.checked);
                          if (e.target.checked) setIsCheckout(false);
                        }} 
                        className="rounded text-primary-500 w-4 h-4" 
                      />
                      <span className="text-sm font-medium text-slate-700">Khóa Nhận phòng</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isCheckout} 
                        onChange={(e) => {
                          setIsCheckout(e.target.checked);
                          if (e.target.checked) setIsCheckin(false);
                        }} 
                        className="rounded text-primary-500 w-4 h-4" 
                      />
                      <span className="text-sm font-medium text-slate-700">Khóa Trả phòng</span>
                    </label>
                  </div>
                )}
              </form>
              <div className="border border-slate-200 rounded-lg overflow-y-auto max-h-60" style={{ scrollbarWidth: 'thin' }}>
                {roomStatuses.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-sm">Chưa có trạng thái nào</div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {roomStatuses.map(status => (
                      <li key={status.id} className="p-3 flex justify-between items-center hover:bg-slate-50 group">
                        <div className="flex items-center gap-2">
                          {status.color && <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: status.color }}></div>}
                          <div>
                            <span className="font-semibold text-slate-700 text-sm block" style={{ color: status.color || 'inherit' }}>{status.label}</span>
                            <span className="text-xs text-slate-400 font-mono">{status.id}</span>
                          </div>
                          {status.is_checkin && <span className="text-[10px] bg-sky-100 text-sky-700 font-bold px-1.5 py-0.5 rounded border border-sky-200 ml-2">Check-in</span>}
                          {status.is_checkout && <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded border border-rose-200 ml-1">Check-out</span>}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setStatusId(status.id); setStatusLabel(status.label); setStatusColor(status.color || "#f59e0b"); setIsCheckin(status.is_checkin || false); setIsCheckout(status.is_checkout || false); }} className="text-primary-600 p-1 hover:bg-primary-50 rounded" title="Sửa"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                          <button onClick={() => handleDeleteStatus(status.id)} className="text-red-500 p-1 hover:bg-red-50 rounded" title="Xóa"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
