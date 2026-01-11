'use client';

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass-card w-full max-w-lg rounded-2xl animate-float shadow-2xl border border-white/10" style={{ animation: 'none' }}>
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <h3 className="text-xl font-bold text-white shadow-sm">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
