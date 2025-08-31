// app/dashboardAsset/list/page.tsx

"use client";
import React, { useState, useEffect } from 'react';
import type { Asset, User } from '@prisma/client';
import AddAssetForm from '../components/AddAssetForm';
import { QRCodeSVG } from 'qrcode.react';

// --- PERUBAHAN DI SINI: pic sekarang boleh null ---
type AssetWithPic = Asset & { pic: User | null };
type ApiResponse = { assets: AssetWithPic[] };

const getStatusClass = (status: string) => {
    switch (status.toUpperCase()) {
        case 'BAIK': return 'bg-green-100 text-green-800';
        case 'RUSAK': return 'bg-red-100 text-red-800';
        case 'PERBAIKAN': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export default function AssetListPage() {
    const [assets, setAssets] = useState<AssetWithPic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchAssets = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/assets');
            if (!response.ok) throw new Error('Gagal memuat data aset');
            const data: ApiResponse = await response.json();
            setAssets(data.assets);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchAssets();
    }, []);

    if (isLoading) return <div className="text-center p-8">Loading data...</div>;
    if (error) return <div className="text-center p-8 text-red-600">Error: {error}</div>;

    return (
        <>
            <AddAssetForm 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onAssetAdded={fetchAssets}
            />
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">Daftar Semua Aset</h3>
                    <button onClick={() => setIsModalOpen(true)} className="bg-[#01449D] text-white px-4 py-2 rounded-lg hover:bg-blue-800">+ Tambah Aset Baru</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Barcode</th>
                                <th scope="col" className="px-6 py-3">Nama Produk</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Lokasi</th>
                                <th scope="col" className="px-6 py-3">PIC</th>
                                <th scope="col" className="px-6 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assets.map(asset => (
                                <tr key={asset.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4"><div className="p-1 border inline-block"><QRCodeSVG value={asset.barcode} size={64} /></div></td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{asset.productName}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(asset.status)}`}>{asset.status}</span></td>
                                    <td className="px-6 py-4">{asset.location}</td>
                                    {/* --- PERUBAHAN DI SINI --- */}
                                    <td className="px-6 py-4">
                                        {asset.pic ? asset.pic.fullName : <span className="text-gray-400 italic">Belum Ditentukan</span>}
                                    </td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button className="text-blue-600 hover:text-blue-900">✏️</button>
                                        <button className="text-red-600 hover:text-red-900">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}