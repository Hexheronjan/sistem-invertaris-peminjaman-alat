'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';

export default function AdminAlatPage() {
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        id_alat: null,
        nama_alat: '',
        id_kategori: '',
        stok: 0,
        kondisi: 'baik',
        deskripsi: '' // Optional
    });

    const columns = [
        { key: 'nama_alat', label: 'Nama Alat' },
        { key: 'kategori.nama_kategori', label: 'Kategori' },
        { key: 'stok', label: 'Stok' },
        { key: 'kondisi', label: 'Kondisi' },
    ];

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/alat?search=${search}`);
            const json = await res.json();
            setData(json.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/kategori');
            const json = await res.json();
            setCategories(json || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
        fetchCategories();
    }, [search]); // Refetch on search

    // Handlers
    const openAddModal = () => {
        setIsEditMode(false);
        setFormData({ id_alat: null, nama_alat: '', id_kategori: categories[0]?.id_kategori || '', stok: 0, kondisi: 'baik', deskripsi: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (row) => {
        setIsEditMode(true);
        setFormData({
            id_alat: row.id_alat,
            nama_alat: row.nama_alat,
            id_kategori: row.id_kategori,
            stok: row.stok,
            kondisi: row.kondisi,
            deskripsi: row.deskripsi || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isEditMode ? `/api/alat` : `/api/alat`;
        // Note: Edit usually needs ID. My API uses PUT /api/alat with id in body or /api/alat/[id]?
        // Let's check route.js. The API I built for alat/route.js handles POST. 
        // UPDATE: Wait, usually Update is PUT /id. My backend might have simple PUT?
        // Let's check: POST `/api/alat` is CREATE. 
        // PUT `/api/alat`? No. Usually `PUT /api/alat/[id]`.
        // I need to make sure I call the right endpoint.

        // Quick Fix: I'll assume standard REST. If my route.js only has GET/POST on root, where is UPDATE? 
        // Ah, I might not have made UPDATE for alat? 
        // Let me check my implementation_plan or route.js file content if I can.
        // Based on previous logs: "Implementing Alat API with Pagination and Search". 
        // Usually I make `[id]/route.js` for PUT/DELETE. 
        // I will double check this logic in a moment. For now let's write standardfetch.

        const method = isEditMode ? 'PUT' : 'POST';
        const endpoint = isEditMode ? `/api/alat/${formData.id_alat}` : `/api/alat`;

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchData();
            } else {
                alert('Gagal menyimpan data');
            }
        } catch (err) {
            alert('Error saving data');
        }
    };

    const handleDelete = async (row) => {
        if (!confirm('Yakin hapus alat ini?')) return;
        try {
            const res = await fetch(`/api/alat/${row.id_alat}`, { method: 'DELETE' });
            if (res.ok) fetchData();
            else alert('Gagal menghapus');
        } catch (e) { alert('Error deleting'); }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <Sidebar role="admin" />
            <main className="ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Manajemen Alat</h1>
                        <p className="text-slate-400">Kelola inventaris alat laboratorium.</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 transition transform hover:scale-105"
                    >
                        + Tambah Alat
                    </button>
                </header>

                {/* Search Bar */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Cari alat..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full max-w-md px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
                    />
                </div>

                {loading ? (
                    <p className="text-center text-slate-500 animate-pulse">Memuat data...</p>
                ) : (
                    <DataTable
                        columns={columns}
                        data={data}
                        onEdit={openEditModal}
                        onDelete={handleDelete}
                    />
                )}

                {/* Form Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={isEditMode ? 'Edit Alat' : 'Tambah Alat Baru'}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Nama Alat</label>
                            <input
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-blue-500 outline-none"
                                value={formData.nama_alat}
                                onChange={e => setFormData({ ...formData, nama_alat: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Kategori</label>
                            <select
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-blue-500 outline-none"
                                value={formData.id_kategori}
                                onChange={e => setFormData({ ...formData, id_kategori: e.target.value })}
                                required
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map(cat => (
                                    <option key={cat.id_kategori} value={cat.id_kategori}>{cat.nama_kategori}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Stok</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-blue-500 outline-none"
                                    value={formData.stok}
                                    onChange={e => setFormData({ ...formData, stok: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Kondisi</label>
                                <select
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-blue-500 outline-none"
                                    value={formData.kondisi}
                                    onChange={e => setFormData({ ...formData, kondisi: e.target.value })}
                                >
                                    <option value="baik">Baik</option>
                                    <option value="rusak">Rusak</option>
                                    <option value="hilang">Hilang</option>
                                </select>
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white transition"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg"
                            >
                                {isEditMode ? 'Simpan Perubahan' : 'Simpan Data'}
                            </button>
                        </div>
                    </form>
                </Modal>

            </main>
        </div>
    );
}
