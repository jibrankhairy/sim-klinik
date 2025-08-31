// app/dashboardAsset/master-data/page.tsx

"use client";
import React, { useState, useEffect } from 'react';
import type { Location } from '@prisma/client';
import { useRouter } from 'next/navigation';

// Tipe data baru untuk lokasi dengan semua data finansialnya
type LocationWithFinancials = Location & { 
    assetCount: number;
    totalInitialValue: number;
    totalCurrentValue: number;
    totalDepreciation: number;
};

// Helper untuk memformat angka menjadi format mata uang Rupiah
const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

export default function MasterDataPage() {
  const router = useRouter();
  
  // State untuk data lokasi
  const [locations, setLocations] = useState<LocationWithFinancials[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk form tambah lokasi
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationAddress, setNewLocationAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi untuk mengambil data lokasi terbaru dari API
  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/assets/locations');
      if (!res.ok) throw new Error("Gagal memuat data lokasi dari server.");
      const data = await res.json();
      setLocations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Ambil data saat komponen pertama kali dimuat
  useEffect(() => {
    fetchLocations();
  }, []);
  
  // Handler untuk submit form tambah lokasi baru
  const handleAddLocationSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError(null);
      try {
          const res = await fetch('/api/assets/locations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: newLocationName, address: newLocationAddress }),
          });
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Gagal menambahkan lokasi");
          }
          // Reset form dan refresh data di tabel
          setNewLocationName('');
          setNewLocationAddress('');
          fetchLocations();
      } catch (err: any) {
          setError(err.message);
      } finally {
          setIsSubmitting(false);
      }
  };

  // Handler untuk tombol "Lihat Aset"
  const handleViewAssets = (locationId: number) => {
    router.push(`/dashboardAsset/list?location=${locationId}`);
  };
  
  // Handler untuk tombol "Hapus"
  const handleDeleteLocation = async (id: number) => {
      if (window.confirm("Yakin ingin menghapus lokasi ini? Pastikan tidak ada aset yang terdaftar di dalamnya.")) {
          try {
              const res = await fetch(`/api/assets/locations/${id}`, { method: 'DELETE' });
              if (!res.ok) {
                  const data = await res.json();
                  throw new Error(data.message || "Gagal menghapus lokasi.");
              }
              fetchLocations(); // Refresh data setelah berhasil hapus
          } catch (err: any) {
              alert(`Error: ${err.message}`);
          }
      }
  };

  return (
    <div className="space-y-8">
      {/* --- Card Master Lokasi --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Master Lokasi Aset (Cabang)</h3>
        
        <form onSubmit={handleAddLocationSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Cabang Baru</label>
                    <input type="text" value={newLocationName} onChange={(e) => setNewLocationName(e.target.value)} placeholder="e.g., Klinik YM Cibitung" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Alamat (Opsional)</label>
                    <input type="text" value={newLocationAddress} onChange={(e) => setNewLocationAddress(e.target.value)} placeholder="e.g., Jl. Raya Cibitung No. 123" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
                <button type="submit" disabled={isSubmitting} className="bg-[#01449D] text-white px-4 py-2 rounded-lg hover:bg-blue-800 h-10 font-semibold disabled:bg-gray-400">
                    {isSubmitting ? 'Menyimpan...' : '+ Tambah Lokasi'}
                </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1024px] text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Nama Cabang</th>
                <th className="px-6 py-3 text-center">Total Aset</th>
                <th className="px-6 py-3">Nilai Awal</th>
                <th className="px-6 py-3">Penyusutan</th>
                <th className="px-6 py-3">Nilai Buku</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center p-6 text-gray-500">Memuat data lokasi...</td></tr>
              ) : locations.length > 0 ? (
                locations.map(location => (
                  <tr key={location.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                        <div>{location.name}</div>
                        <div className="text-xs text-gray-500">{location.address || ''}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-lg text-gray-700">{location.assetCount}</td>
                    <td className="px-6 py-4 text-gray-600">{formatRupiah(location.totalInitialValue)}</td>
                    <td className="px-6 py-4 text-red-600">({formatRupiah(location.totalDepreciation)})</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{formatRupiah(location.totalCurrentValue)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => handleViewAssets(location.id)} className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors">Lihat Aset</button>
                        <button onClick={() => alert('Fitur Edit sedang dikembangkan!')} className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">✏️ Edit</button>
                        <button onClick={() => handleDeleteLocation(location.id)} className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">🗑️ Hapus</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="text-center p-6 text-gray-500">Belum ada data lokasi. Silakan tambahkan lokasi baru.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* --- Card Master PIC --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Master Teknisi / PIC</h3>
           <p className="text-sm text-gray-500">Manajemen data PIC (Penanggung Jawab) kini dilakukan langsung saat menambah atau mengedit data aset untuk fleksibilitas yang lebih tinggi.</p>
      </div>
    </div>
  );
}