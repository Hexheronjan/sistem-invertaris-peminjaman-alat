'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import DataTable from '@/components/DataTable';

export default function LogPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Need endpoint. I'll create /api/log inside this task too.
        fetch('/api/log')
            .then(res => res.json())
            .then(json => setData(json.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const columns = [
        { key: 'user.nama', label: 'User' },
        { key: 'aktivitas', label: 'Aktivitas' },
        {
            key: 'waktu',
            label: 'Waktu',
            render: (row) => row.waktu ? new Date(row.waktu).toLocaleString('id-ID') : '-'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <Sidebar role="admin" />
            <main className="ml-64 p-8">
                <h1 className="text-3xl font-bold text-white mb-8">Log Aktivitas Sistem</h1>

                {loading ? <p className="animate-pulse">Loading...</p> : (
                    <DataTable columns={columns} data={data} />
                )}
            </main>
        </div>
    );
}
