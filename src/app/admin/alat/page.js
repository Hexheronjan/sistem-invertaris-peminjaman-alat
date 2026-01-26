'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import { useToast } from '@/components/ToastProvider';

export default function AdminAlatPage() {
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { showToast } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        id_alat: null,
        kode_alat: '',
        nama_alat: '',
        id_kategori: '',
        stok: 0,
        kondisi: 'baik',
        foto: '',
        deskripsi: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/alat?search=${search}`);
            const json = await res.json();
            setData(json.data || []);
        } catch (err) {
            showToast('Gagal memuat data alat', 'error');
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
    }, [search]);

    const openAddModal = () => {
        setIsEditMode(false);
        setFormData({ id_alat: null, kode_alat: '', nama_alat: '', id_kategori: categories[0]?.id_kategori || '', stok: 0, kondisi: 'baik', foto: '', deskripsi: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (row) => {
        setIsEditMode(true);
        setFormData({
            id_alat: row.id_alat,
            kode_alat: row.kode_alat || '',
            nama_alat: row.nama_alat,
            id_kategori: row.id_kategori,
            stok: row.stok,
            kondisi: row.kondisi,
            foto: row.foto || '',
            deskripsi: row.deskripsi || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                showToast(isEditMode ? 'Data alat diperbarui' : 'Alat baru berhasil ditambahkan');
            } else {
                const json = await res.json();
                showToast(json.message || json.error || 'Gagal menyimpan data', 'error');
            }
        } catch (err) {
            showToast('Error saving data', 'error');
        }
    };

    const handleDelete = async (row) => {
        if (!confirm('Yakin hapus alat ini?')) return;
        try {
            const res = await fetch(`/api/alat/${row.id_alat}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('Alat berhasil dihapus');
                fetchData();
            } else {
                const json = await res.json();
                showToast(json.message || 'Gagal menghapus', 'error');
            }
        } catch (e) { showToast('Terjadi kesalahan koneksi', 'error'); }
    };

    const handleStockAction = async (id, action) => {
        if (!confirm(`Yakin ingin mengubah status stok ke ${action}?`)) return;
        try {
            const res = await fetch(`/api/alat/${id}/rusak`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });

            if (res.ok) {
                showToast(`Berhasil mengubah status barang (${action})`);
                fetchData();
            } else {
                const json = await res.json();
                showToast(json.message || 'Gagal mengubah status', 'error');
            }
        } catch (e) {
            showToast('Terjadi kesalahan koneksi', 'error');
        }
    };

    const getKondisiBadge = (kondisi) => {
        const styles = {
            'baik': 'badge badge-success',
            'rusak': 'badge badge-warning',
            'hilang': 'badge badge-danger'
        };
        return <span className={styles[kondisi] || 'badge'}>{kondisi.toUpperCase()}</span>;
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="admin" />

            <main className="ml-72 p-8 transition-all duration-300">
                {/* Header Premium */}
                <div className="section-header animate-fade-in-up bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Manajemen Alat</h1>
                        <p className="text-slate-500 mt-1">Kelola inventaris dan stok alat di sini.</p>
                    </div>
                    <button onClick={openAddModal} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Alat
                    </button>
                </div>

                {/* Search Bar HD */}
                <div className="mb-8 animate-fade-in-up delay-100 px-1">
                    <div className="relative max-w-lg">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Cari nama alat / kode..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Card Grid HD */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-96 bg-slate-100 rounded-3xl animate-pulse"></div>
                        ))}
                    </div>
                ) : data.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm animate-fade-in-up delay-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">📦</div>
                        <h3 className="text-xl font-bold text-slate-800">Alat Tidak Ditemukan</h3>
                        <p className="text-slate-500 mt-2">Coba kata kunci lain atau tambahkan alat baru.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up delay-200">
                        {data.map((tool) => (
                            <div key={tool.id_alat} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] transition-all duration-300 relative group flex flex-col">
                                {/* Image Container */}
                                <div className="h-48 w-full bg-slate-50 rounded-2xl mb-4 overflow-hidden relative">
                                    {tool.foto ? (
                                        <img src={tool.foto} alt={tool.nama_alat} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-5xl opacity-20 text-slate-400">📷</div>
                                    )}
                                    <div className="absolute top-3 right-3 shadow-sm">
                                        {getKondisiBadge(tool.kondisi)}
                                    </div>
                                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600 border border-slate-100 shadow-sm">
                                        {tool.kode_alat}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 px-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-blue-600 transition-colors line-clamp-2" title={tool.nama_alat}>{tool.nama_alat}</h3>
                                    </div>

                                    <div className="flex items-center justify-between mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{tool.kategori?.nama_kategori || 'Umum'}</span>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 justify-end">
                                                <span className="text-xs text-slate-400">Stok:</span>
                                                <span className="text-sm font-bold text-slate-800">{tool.stok}</span>
                                            </div>
                                            <span className={`text-[10px] font-bold block ${tool.stok_rusak > 0 ? 'text-red-500' : 'text-slate-300'}`}>
                                                Rusak: {tool.stok_rusak || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => openEditModal(tool)}
                                            className="py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tool)}
                                            className="py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => handleStockAction(tool.id_alat, 'rusak')}
                                            disabled={tool.stok <= 0}
                                            className="py-2 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            ⚠️ Rusak
                                        </button>
                                        <button
                                            onClick={() => handleStockAction(tool.id_alat, 'perbaiki')}
                                            disabled={tool.stok_rusak <= 0}
                                            className="py-2 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            🔧 Benarkan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={isEditMode ? 'Edit Alat' : 'Tambah Alat Baru'}
                >
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="label-field">Kode Alat</label>
                                <input
                                    className="input-field bg-slate-50 cursor-not-allowed"
                                    placeholder={isEditMode ? formData.kode_alat : "Auto"}
                                    disabled
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="label-field">Nama Alat</label>
                                <input
                                    className="input-field"
                                    value={formData.nama_alat}
                                    onChange={e => setFormData({ ...formData, nama_alat: e.target.value })}
                                    placeholder="Masukkan nama alat"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label-field">Kategori</label>
                            <select
                                className="select-field"
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
                                <label className="label-field">Stok</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={formData.stok}
                                    onChange={e => setFormData({ ...formData, stok: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="label-field">Kondisi</label>
                                <select
                                    className="select-field"
                                    value={formData.kondisi}
                                    onChange={e => setFormData({ ...formData, kondisi: e.target.value })}
                                >
                                    <option value="baik">Baik</option>
                                    <option value="rusak">Rusak</option>
                                    <option value="hilang">Hilang</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="label-field">URL Foto (Opsional)</label>
                            <input
                                className="input-field"
                                value={formData.foto}
                                onChange={e => setFormData({ ...formData, foto: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                            />
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
