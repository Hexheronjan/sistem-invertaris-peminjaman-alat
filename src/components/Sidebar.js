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
        <aside className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0 z-20">
            <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold gradient-text">Inventaris App</h2>
                <span className="text-xs text-slate-500 uppercase tracking-widest mt-1 block">{role} Panel</span>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {activeMenus.map((menu) => {
                    const isActive = pathname === menu.href;
                    return (
                        <Link
                            key={menu.href}
                            href={menu.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                        >
                            <span className="text-lg">{menu.icon}</span>
                            <span className="font-medium text-sm">{menu.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={async () => {
                        await fetch('/api/auth/logout', { method: 'POST' });
                        window.location.href = '/';
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition font-medium text-sm"
                >
                    🚪 Logout
                </button>
            </div>
        </aside>
    );
}
