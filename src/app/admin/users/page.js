'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { useToast } from '@/components/ToastProvider';

export default function AdminUsersPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const { showToast } = useToast();

    // Pagination State
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalData, setTotalData] = useState(0);

    const [formData, setFormData] = useState({
        id_user: null,
        nama: '',
        username: '',
        password: '',
        id_role: '3',
        status: 'aktif'
    });

    const columns = [
        { key: 'nama', label: 'Nama Lengkap' },
        { key: 'username', label: 'Username' },
        { key: 'role.nama_role', label: 'Role' },
        { key: 'status', label: 'Status' }
    ];

    const fetchData = async (currentPage = 1) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/users?page=${currentPage}&limit=${limit}`);
            const json = await res.json();

            // Handle new paginated response structure
            const userData = json.data || (Array.isArray(json) ? json : []);
            setData(userData);

            if (json.pagination) {
                setTotalPages(json.pagination.totalPages);
                setTotalData(json.pagination.total);
                setPage(json.pagination.page);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(page); }, [page]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const openAddModal = () => {
        setIsEditMode(false);
        setFormData({ id_user: null, nama: '', username: '', password: '', id_role: '3', status: 'aktif' });
        setIsModalOpen(true);
    };

    const openEditModal = (row) => {
        setIsEditMode(true);
        setFormData({
            id_user: row.id_user,
            nama: row.nama,
            username: row.username,
            password: '',
            id_role: row.id_role.toString(),
            status: row.status
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isEditMode ? `/api/users/${formData.id_user}` : '/api/users';
        const method = isEditMode ? 'PUT' : 'POST';

        const payload = { ...formData };
        if (isEditMode && !payload.password) delete payload.password;

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setIsModalOpen(false);
                fetchData();
                showToast(isEditMode ? 'Data user diperbarui' : 'User baru ditambahkan');
            } else {
                const err = await res.json();
                showToast(err.message || 'Gagal menyimpan', 'error');
            }
        } catch (e) { showToast('Error network', 'error'); }
    };

    const handleDelete = async (row) => {
        if (!confirm(`Hapus user ${row.username}?`)) return;
        try {
            const res = await fetch(`/api/users/${row.id_user}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('User berhasil dihapus');
                fetchData();
            }
            else {
                const json = await res.json();
                showToast(json.message || 'Gagal hapus', 'error');
            }
        } catch (e) { showToast('Error network', 'error'); }
    };

    const getRoleBadge = (roleName) => {
        const styles = {
            'Admin': 'badge badge-danger',
            'Petugas': 'badge badge-primary',
            'Peminjam': 'badge badge-secondary'
        };
        return <span className={styles[roleName] || 'badge'}>{roleName}</span>;
    };

    const getStatusBadge = (status) => {
        return status === 'aktif'
            ? <span className="badge badge-success">Aktif</span>
            : <span className="badge badge-secondary">Non-Aktif</span>;
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="admin" />

            <main className="md:ml-72 p-8 transition-all duration-300">
                {/* Header Premium */}
                <div className="section-header animate-fade-in-up bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Manajemen Pengguna</h1>
                        <p className="text-slate-500 mt-2 text-lg">Kelola akun pengguna, hak akses, dan status.</p>
                    </div>
                    <button onClick={openAddModal} className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2 hover:-translate-y-0.5">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Tambah Pengguna
                    </button>
                </div>

                {/* Table Card HD */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] animate-fade-in-up delay-100">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-14 h-14 border-4 border-slate-100 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-500 font-medium animate-pulse">Memuat data pengguna...</p>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-5xl mb-6 opacity-80">👥</div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Pengguna</h3>
                            <p className="text-slate-500 max-w-sm">Klik tombol "Tambah Pengguna" di atas untuk membuat akun baru.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Info Akun</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Username</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {data.map((row, idx) => (
                                        <tr key={row.id_user} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md ${row.role?.nama_role === 'Admin' ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/20' :
                                                        row.role?.nama_role === 'Petugas' ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/20' :
                                                            'bg-gradient-to-br from-slate-400 to-slate-500'
                                                        }`}>
                                                        {row.nama?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-700">{row.nama}</p>
                                                        <p className="text-xs text-slate-400 font-medium">ID: {row.id_user}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">@{row.username}</span>
                                            </td>
                                            <td className="px-6 py-4">{getRoleBadge(row.role?.nama_role)}</td>
                                            <td className="px-6 py-4">{getStatusBadge(row.status)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openEditModal(row)}
                                                        className="p-2 text-blue-600 hover:bg-white hover:shadow-md border border-transparent hover:border-blue-100 rounded-xl transition-all"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(row)}
                                                        className="p-2 text-red-600 hover:bg-white hover:shadow-md border border-transparent hover:border-red-100 rounded-xl transition-all"
                                                        title="Hapus"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                >
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="label-field">Nama Lengkap</label>
                            <input
                                className="input-field"
                                value={formData.nama}
                                onChange={e => setFormData({ ...formData, nama: e.target.value })}
                                placeholder="Masukkan nama lengkap"
                                required
                            />
                        </div>

                        <div>
                            <label className="label-field">Username</label>
                            <input
                                className="input-field"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                placeholder="Masukkan username"
                                required
                            />
                        </div>

                        <div>
                            <label className="label-field">
                                Password {isEditMode && <span className="text-slate-400 font-normal">(Kosongkan jika tidak diubah)</span>}
                            </label>
                            <input
                                type="password"
                                className="input-field"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Masukkan password"
                                required={!isEditMode}
                            />
                        </div>

                        <div>
                            <label className="label-field">Role</label>
                            <select
                                className="select-field"
                                value={formData.id_role}
                                onChange={e => setFormData({ ...formData, id_role: e.target.value })}
                            >
                                <option value="1">Admin</option>
                                <option value="2">Petugas</option>
                                <option value="3">Peminjam</option>
                            </select>
                        </div>

                        <div>
                            <label className="label-field">Status</label>
                            <select
                                className="select-field"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Non-Aktif</option>
                            </select>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">
                                Batal
                            </button>
                            <button type="submit" className="btn-primary flex-1">
                                {isEditMode ? 'Perbarui' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </Modal>
            </main>
        </div>
    );
}
