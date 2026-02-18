'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import { useToast } from '@/components/ToastProvider';

export default function KategoriPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id_kategori: null, nama_kategori: '' });
    const { showToast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/kategori');
            const json = await res.json();
            setData(json || []);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id) => {
        if (!confirm('Hapus kategori ini?')) return;
        try {
            const res = await fetch(`/api/kategori/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('Kategori berhasil dihapus');
                fetchData();
            }
            else {
                const json = await res.json();
                showToast(json.message || 'Gagal hapus', 'error');
            }
        } catch (e) { showToast('Error hapus', 'error'); }
    };

    const openEdit = (item) => {
        setFormData(item);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isEdit = !!formData.id_kategori;
        const url = isEdit ? `/api/kategori/${formData.id_kategori}` : '/api/kategori';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nama_kategori: formData.nama_kategori })
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchData();
                showToast(isEdit ? 'Kategori diperbarui' : 'Kategori ditambahkan');
            } else {
                showToast('Gagal simpan kategori', 'error');
            }
        } catch (e) { showToast('Error', 'error'); }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="admin" />

            <main className="md:ml-72 p-8 transition-all duration-300">
                {/* Header */}
                <div className="section-header animate-fade-in-up">
                    <div>
                        <h1 className="section-title">Kategori Alat</h1>
                        <p className="text-slate-500 mt-1">Kelola kategori untuk klasifikasi alat</p>
                    </div>
                    <button
                        onClick={() => { setFormData({ id_kategori: null, nama_kategori: '' }); setIsModalOpen(true); }}
                        className="btn-primary flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Kategori
                    </button>
                </div>

                {/* Table Card */}
                <div className="premium-card p-6 animate-fade-in-up delay-100">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-500">Memuat data kategori...</p>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🏷️</div>
                            <h3 className="empty-state-title">Belum Ada Kategori</h3>
                            <p className="empty-state-description">Tambahkan kategori untuk mengklasifikasi alat Anda</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th className="rounded-tl-xl">ID</th>
                                        <th>Nama Kategori</th>
                                        <th className="rounded-tr-xl text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((row) => (
                                        <tr key={row.id_kategori}>
                                            <td className="font-semibold text-slate-500">#{row.id_kategori}</td>
                                            <td className="font-semibold">{row.nama_kategori}</td>
                                            <td>
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => openEdit(row)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(row.id_kategori)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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
                    title={formData.id_kategori ? 'Edit Kategori' : 'Tambah Kategori'}
                >
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="label-field">Nama Kategori</label>
                            <input
                                className="input-field"
                                value={formData.nama_kategori}
                                onChange={e => setFormData({ ...formData, nama_kategori: e.target.value })}
                                placeholder="Masukkan nama kategori"
                                required
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">
                                Batal
                            </button>
                            <button type="submit" className="btn-primary flex-1">
                                Simpan
                            </button>
                        </div>
                    </form>
                </Modal>
            </main>
        </div>
    );
}
