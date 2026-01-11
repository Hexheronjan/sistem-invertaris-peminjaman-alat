'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';

export default function AdminUsersPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const [formData, setFormData] = useState({
        id_user: null,
        nama: '',
        username: '',
        password: '',
        id_role: '3', // Default Peminjam
        status: 'aktif'
    });

    const columns = [
        { key: 'nama', label: 'Nama Lengkap' },
        { key: 'username', label: 'Username' },
        { key: 'role.nama_role', label: 'Role' },
        { key: 'status', label: 'Status' }
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/users');
            const json = await res.json();
            // Check if array (my API returns plain array or object with data? GET /users returns array)
            setData(Array.isArray(json) ? json : json.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

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
            password: '', // Leave blank unless changing
            id_role: row.id_role.toString(),
            status: row.status
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isEditMode ? `/api/users/${formData.id_user}` : '/api/users';
        const method = isEditMode ? 'PUT' : 'POST';

        // Clean payload (don't send empty password if editing)
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
            } else {
                const err = await res.json();
                alert(err.message || 'Gagal menyimpan');
            }
        } catch (e) { alert('Error network'); }
    };

    const handleDelete = async (row) => {
        if (!confirm(`Hapus user ${row.username}?`)) return;
        try {
            const res = await fetch(`/api/users/${row.id_user}`, { method: 'DELETE' });
            if (res.ok) fetchData();
            else {
                const json = await res.json();
                alert(json.message || 'Gagal hapus');
            }
        } catch (e) { alert('Error network'); }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <Sidebar role="admin" />
            <main className="ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Manajemen User</h1>
                    <button onClick={openAddModal} className="px-6 py-2 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-500 shadow-lg">+ User Baru</button>
                </header>

                {loading ? <p className="animate-pulse text-slate-500">Memuat data...</p> : (
                    <DataTable
                        columns={columns}
                        data={data}
                        onEdit={openEditModal}
                        onDelete={handleDelete}
                    />
                )}

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={isEditMode ? 'Edit User' : 'Tambah User Baru'}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400">Nama Lengkap</label>
                            <input className="w-full px-4 py-2 bg-slate-800 border-slate-700 rounded-lg" value={formData.nama} onChange={e => setFormData({ ...formData, nama: e.target.value })} required />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400">Username</label>
                            <input className="w-full px-4 py-2 bg-slate-800 border-slate-700 rounded-lg" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400">Password {isEditMode && '(Kosongkan jika tidak ubah)'}</label>
                            <input type="password" className="w-full px-4 py-2 bg-slate-800 border-slate-700 rounded-lg" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required={!isEditMode} />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400">Role</label>
                            <select className="w-full px-4 py-2 bg-slate-800 border-slate-700 rounded-lg" value={formData.id_role} onChange={e => setFormData({ ...formData, id_role: e.target.value })}>
                                <option value="1">Admin</option>
                                <option value="2">Petugas</option>
                                <option value="3">Peminjam</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-slate-400">Status</label>
                            <select className="w-full px-4 py-2 bg-slate-800 border-slate-700 rounded-lg" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Non-Aktif</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full py-2 bg-blue-600 rounded-lg text-white font-bold mt-4">Simpan</button>
                    </form>
                </Modal>
            </main>
        </div>
    );
}
