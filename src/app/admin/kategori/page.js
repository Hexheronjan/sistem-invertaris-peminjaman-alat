'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';

export default function KategoriPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id_kategori: null, nama_kategori: '' });

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
            if (res.ok) fetchData();
            else {
                const json = await res.json();
                alert(json.message || 'Gagal hapus');
            }
        } catch (e) { alert('Error hapus'); }
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
            } else {
                alert('Gagal simpan kategori');
            }
        } catch (e) { alert('Error'); }
    };

    const columns = [
        { key: 'id_kategori', label: 'ID' },
        { key: 'nama_kategori', label: 'Nama Kategori' },
        {
            key: 'actions',
            label: 'Aksi',
            render: (row) => (
                <div className="flex gap-2">
                    <button onClick={() => openEdit(row)} className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded hover:bg-yellow-500/30">Edit</button>
                    <button onClick={() => handleDelete(row.id_kategori)} className="px-3 py-1 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30">Hapus</button>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <Sidebar role="admin" />
            <main className="ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Kategori Alat</h1>
                    <button onClick={() => { setFormData({ id_kategori: null, nama_kategori: '' }); setIsModalOpen(true); }} className="px-6 py-2 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-500 shadow-lg">+ Kategori Baru</button>
                </header>

                {loading ? <p className="animate-pulse">Loading...</p> : (
                    <DataTable columns={columns} data={data} />
                )}

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id_kategori ? 'Edit Kategori' : 'Tambah Kategori'}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400">Nama Kategori</label>
                            <input className="w-full px-4 py-2 bg-slate-800 border-slate-700 rounded-lg text-white" value={formData.nama_kategori} onChange={e => setFormData({ ...formData, nama_kategori: e.target.value })} required />
                        </div>
                        <button type="submit" className="w-full py-2 bg-blue-600 rounded-lg text-white font-bold mt-4">Simpan</button>
                    </form>
                </Modal>
            </main>
        </div>
    );
}
