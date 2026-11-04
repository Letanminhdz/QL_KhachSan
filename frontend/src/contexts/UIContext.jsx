import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const UIContext = createContext();

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirm, setConfirm] = useState({ show: false, message: '', onConfirm: null, onCancel: null });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const loginUser = useCallback((userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  const showConfirm = useCallback((message, onConfirm, onCancel = null) => {
    setConfirm({ show: true, message, onConfirm, onCancel });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirm((prev) => ({ ...prev, show: false }));
  }, []);

  return (
    <UIContext.Provider value={{ showToast, showConfirm, user, loginUser, logoutUser }}>
      {children}
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-2xl text-white font-semibold transition-all transform z-[9999] animate-bounce flex items-center gap-2 
          ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'warning' ? 'bg-amber-500' : 'bg-primary-600'}`}>
          {toast.type === 'success' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
          {toast.type === 'error' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>}
          {toast.type === 'warning' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Confirm Modal */}
      {confirm.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Xác nhận
            </h3>
            <p className="text-slate-600 mb-6 text-sm">{confirm.message}</p>
            <div className="flex gap-3 justify-end">
              <button 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors text-sm cursor-pointer"
                onClick={() => {
                  if (confirm.onCancel) confirm.onCancel();
                  closeConfirm();
                }}
              >
                Hủy bỏ
              </button>
              <button 
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold shadow-sm transition-colors text-sm cursor-pointer"
                onClick={() => {
                  if (confirm.onConfirm) confirm.onConfirm();
                  closeConfirm();
                }}
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
};
