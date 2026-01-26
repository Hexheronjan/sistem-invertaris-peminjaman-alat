'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function useToast() {
    return useContext(ToastContext);
}

export default function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-xs pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto transform transition-all duration-300 animate-fade-in-up flex items-center p-4 rounded-xl shadow-lg border border-white/20 backdrop-blur-md ${toast.type === 'success'
                                ? 'bg-emerald-500/90 text-white'
                                : toast.type === 'error'
                                    ? 'bg-rose-500/90 text-white'
                                    : 'bg-slate-800/90 text-white'
                            }`}
                    >
                        <div className="mr-3 text-xl">
                            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-sm">
                                {toast.type === 'success' ? 'Berhasil' : toast.type === 'error' ? 'Gagal' : 'Info'}
                            </p>
                            <p className="text-xs opacity-90">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-2 hover:bg-white/20 rounded-full p-1 transition"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
