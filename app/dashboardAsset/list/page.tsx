// app/dashboardAsset/list/page.tsx

"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Asset, Location } from '@prisma/client';
import AssetForm from '../components/AssetForm';
import { QRCodeSVG } from 'qrcode.react';

// Tipe data ini penting untuk mendefinisikan struktur data yang diterima dari API
type AssetWithDetails = Asset & { 
  location: Location; 
  qrCodeValue: string; // Properti baru untuk isi QR Code
};
type ApiResponse = { assets: AssetWithDetails[] };

// Fungsi untuk styling status
const getStatusClass = (status: string) => {
    switch (status.toUpperCase()) {
        case 'BAIK': return 'bg-green-100 text-green-800';
        case 'RUSAK': return 'bg-red-100 text-red-800';
        case 'PERBAIKAN': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

// Komponen utama dipisahkan untuk menggunakan useSearchParams
function AssetListContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const locationFromUrl = searchParams.get('location');

    // State untuk data
    const [allAssets, setAllAssets] = useState<AssetWithDetails[]>([]);
    const [filteredAssets, setFilteredAssets] = useState<AssetWithDetails[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    
    // State untuk UI
    const [selectedLocation, setSelectedLocation] = useState(locationFromUrl || '');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [assetToEdit, setAssetToEdit] = useState<AssetWithDetails | null>(null);

    // Fungsi untuk mengambil semua data yang dibutuhkan dari API
    const fetchData = async () => {
        try {
            const [assetsRes, locationsRes] = await Promise.all([
                fetch('/api/assets'),
                fetch('/api/assets/locations')
            ]);
            if (!assetsRes.ok || !locationsRes.ok) throw new Error('Gagal memuat data dari server');
            
            const assetsData: ApiResponse = await assetsRes.json();
            const locationsData = await locationsRes.json();

            setAllAssets(assetsData.assets);
            setLocations(locationsData);
            
            // Terapkan filter awal dari URL jika ada
            const initialLocation = locationFromUrl || selectedLocation;
            if (initialLocation === '') {
                setFilteredAssets(assetsData.assets);
            } else {
                setFilteredAssets(assetsData.assets.filter(a => a.locationId.toString() === initialLocation));
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Ambil data saat komponen pertama kali dimuat
    useEffect(() => {
        fetchData();
    }, []);

    // Jalankan filter setiap kali pilihan dropdown berubah
    useEffect(() => {
        const newUrl = selectedLocation ? `/dashboardAsset/list?location=${selectedLocation}` : '/dashboardAsset/list';
        router.replace(newUrl, { scroll: false });

        if (selectedLocation === '') {
            setFilteredAssets(allAssets);
        } else {
            const filtered = allAssets.filter(
                asset => asset.locationId === parseInt(selectedLocation)
            );
            setFilteredAssets(filtered);
        }
    }, [selectedLocation, allAssets, router]);

    // Handler untuk tombol-tombol aksi
    const handleAddClick = () => {
        setAssetToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (asset: AssetWithDetails) => {
        setAssetToEdit(asset);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (assetId: string) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus aset ini? Tindakan ini tidak bisa dibatalkan.")) {
            try {
                const response = await fetch(`/api/assets/${assetId}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.message || "Gagal menghapus aset.");
                }
                fetchData(); // Refresh data di tabel setelah berhasil hapus
            } catch (err: any) {
                alert(`Error: ${err.message}`);
            }
        }
    };

    if (isLoading) return <div className="text-center p-8 text-gray-500">Loading data aset...</div>;
    if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">Error: {error}</div>;

    return (
        <>
            <AssetForm 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onFormSubmit={fetchData}
                assetToEdit={assetToEdit}
            />
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h3 className="text-2xl font-bold text-gray-800 self-start md:self-center">Daftar Semua Aset</h3>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="block w-full sm:w-56 rounded-md border-gray-300 shadow-sm h-10 focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">Filter Berdasarkan Lokasi</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                        <button onClick={handleAddClick} className="bg-[#01449D] text-white px-4 py-2 rounded-lg hover:bg-blue-800 whitespace-nowrap h-10 font-semibold">
                            + Tambah Aset Baru
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">QR Code</th>
                                <th scope="col" className="px-6 py-3">Nama Produk</th>
                                <th scope="col" className="px-6 py-3">Lokasi</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">PIC</th>
                                <th scope="col" className="px-6 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAssets.length > 0 ? (
                                filteredAssets.map(asset => (
                                    <tr key={asset.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="p-1 border inline-block bg-white">
                                                <QRCodeSVG value={asset.qrCodeValue} size={64} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{asset.productName}</td>
                                        <td className="px-6 py-4">{asset.location.name}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(asset.status)}`}>{asset.status}</span></td>
                                        <td className="px-6 py-4">{asset.picName || <span className="text-gray-400 italic">--</span>}</td>
                                        <td className="px-6 py-4 space-x-4">
                                            <button onClick={() => handleEditClick(asset)} className="text-blue-600 hover:text-blue-900 font-medium">✏️ Edit</button>
                                            <button onClick={() => handleDeleteClick(asset.id)} className="text-red-600 hover:text-red-900 font-medium">🗑️ Hapus</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-gray-500">
                                        Tidak ada aset yang ditemukan untuk lokasi ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

// Bungkus dengan Suspense untuk memastikan useSearchParams bekerja dengan baik
export default function AssetListPageWrapper() {
    return (
        <Suspense fallback={<div className="text-center p-8">Memuat halaman...</div>}>
            <AssetListContent />
        </Suspense>
    );
}