'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ role }) {
    const pathname = usePathname();

    const menus = {
        admin: [
            { label: 'Dashboard', href: '/admin/dashboard', icon: '🏠' },
            { label: 'Manajemen User', href: '/admin/users', icon: '👥' },
            { label: 'Data Alat', href: '/admin/alat', icon: '🛠️' },
            { label: 'Kategori', href: '/admin/kategori', icon: '🏷️' },
            { label: 'Peminjaman', href: '/admin/peminjaman', icon: '📋' },
            { label: 'Pengembalian', href: '/admin/pengembalian', icon: '🔄' },
            { label: 'Log Aktivitas', href: '/admin/log', icon: '📜' },
        ],
        petugas: [
            { label: 'Dashboard', href: '/petugas/dashboard', icon: '🏠' },
            { label: 'Verifikasi Peminjaman', href: '/petugas/verifikasi', icon: '✅' },
            { label: 'Proses Pengembalian', href: '/petugas/pengembalian', icon: '🔄' },
            { label: 'Laporan', href: '/petugas/laporan', icon: '📊' },
        ],
        peminjam: [
            { label: 'Dashboard', href: '/peminjam/dashboard', icon: '🏠' },
            { label: 'Katalog Alat', href: '/peminjam/alat', icon: '🔍' },
            { label: 'Peminjaman Saya', href: '/peminjam/riwayat', icon: '⌚' },
        ]
    };

    const activeMenus = menus[role] || [];

    return (
        <aside className="w-72 h-screen fixed left-0 top-0 z-50 bg-white border-r border-slate-200 flex flex-col transition-all duration-300">
            <div className="p-8 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <span className="text-xl">⚡</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 leading-tight tracking-tight">Inventaris</h2>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{role?.toUpperCase() || 'PENGGUNA'}</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu Utama</p>
                {activeMenus.map((menu) => {
                    const isActive = pathname === menu.href;
                    return (
                        <Link
                            key={menu.href}
                            href={menu.href}
                            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />}
                            <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{menu.icon}</span>
                            <span className="text-sm">{menu.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100 mx-4 mb-2">
                <button
                    onClick={async () => {
                        await fetch('/api/auth/logout', { method: 'POST' });
                        window.location.href = '/';
                    }}
                    className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-xl transition-all duration-200 group shadow-sm hover:shadow"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">🚪</span>
                    <span className="font-medium text-sm">Keluar</span>
                </button>
            </div>
        </aside>
    );
}
