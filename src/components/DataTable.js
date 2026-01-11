'use client';

export default function DataTable({ columns, data, onEdit, onDelete }) {
    if (!data || data.length === 0) {
        return (
            <div className="text-center p-8 text-slate-500 glass-card rounded-xl">
                Data tidak ditemukan.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto glass-card rounded-xl">
            <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-white/5 text-slate-200">
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} className="px-6 py-4 font-semibold tracking-wider">
                                {col.label}
                            </th>
                        ))}
                        {(onEdit || onDelete) && <th className="px-6 py-4 text-right">Aksi</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {data.map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition">
                            {columns.map((col) => (
                                <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                                    {/* Handle Nested Objects (e.g., kategori.nama_kategori) */}
                                    {col.render ? col.render(row) : (
                                        col.key.includes('.')
                                            ? row[col.key.split('.')[0]]?.[col.key.split('.')[1]]
                                            : row[col.key]
                                    )}
                                </td>
                            ))}
                            {(onEdit || onDelete) && (
                                <td className="px-6 py-4 text-right space-x-2">
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(row)}
                                            className="text-blue-400 hover:text-blue-300 transition font-medium"
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(row)}
                                            className="text-red-400 hover:text-red-300 transition font-medium"
                                        >
                                            Hapus
                                        </button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
