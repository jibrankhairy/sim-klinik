// app/dashboardAsset/components/AddAssetForm.tsx

"use client";
import { useState, useEffect } from 'react';
import type { User } from '@prisma/client';
import { QRCodeSVG } from 'qrcode.react';

interface AddAssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetAdded: () => void;
}

export default function AddAssetForm({ isOpen, onClose, onAssetAdded }: AddAssetFormProps) {
  const [formData, setFormData] = useState({
    productName: '',
    purchaseDate: '',
    location: '',
    assetType: '',
    price: '',
    usefulLife: '',
    salvageValue: '',
    picId: '', // Default-nya string kosong
    status: 'BAIK',
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    }
    if (isOpen) fetchUsers();
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          usefulLife: parseInt(formData.usefulLife, 10),
          salvageValue: parseFloat(formData.salvageValue),
          // --- PERUBAHAN DI SINI ---
          // Jika picId kosong, kirim null. Jika ada, kirim sebagai angka.
          picId: formData.picId ? parseInt(formData.picId, 10) : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menambahkan aset');
      }

      onAssetAdded();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 m-4 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Tambah Aset Baru</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <div className="flex flex-col md:flex-row gap-8">
            <form onSubmit={handleSubmit} className="space-y-4 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label className="block text-sm font-medium">Nama Produk</label><input type="text" name="productName" value={formData.productName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required /></div>
                <div><label className="block text-sm font-medium">Tanggal Beli</label><input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required /></div>
                {/* --- PERUBAHAN DI SINI: required dihapus --- */}
                <div><label className="block text-sm font-medium">PIC (Opsional)</label><select name="picId" value={formData.picId} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"><option value="">-- Tidak Ada --</option>{users.map(user => (<option key={user.id} value={user.id}>{user.fullName}</option>))}</select></div>
                <div><label className="block text-sm font-medium">Harga Beli (Rp)</label><input type="number" name="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required /></div>
                <div><label className="block text-sm font-medium">Masa Manfaat (Tahun)</label><input type="number" name="usefulLife" value={formData.usefulLife} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required /></div>
                <div><label className="block text-sm font-medium">Nilai Sisa (Rp)</label><input type="number" name="salvageValue" value={formData.salvageValue} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required /></div>
                <div><label className="block text-sm font-medium">Lokasi</label><input type="text" name="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required /></div>
                <div><label className="block text-sm font-medium">Tipe Aset</label><input type="text" name="assetType" value={formData.assetType} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required /></div>
                <div><label className="block text-sm font-medium">Status</label><select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required><option value="BAIK">Baik</option><option value="PERBAIKAN">Perbaikan</option><option value="RUSAK">Rusak</option></select></div>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-[#01449D] text-white rounded-lg hover:bg-blue-800 disabled:bg-gray-400">{isSubmitting ? 'Menyimpan...' : 'Simpan Aset'}</button>
              </div>
            </form>
            <div className="flex-shrink-0 w-full md:w-48 flex flex-col items-center justify-center bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-bold mb-2">Barcode Preview</h4>
                <div className="p-2 bg-white border rounded-md"><QRCodeSVG value={formData.productName || 'Ketik nama produk'} size={150} /></div>
                <p className="text-xs text-center mt-2 text-gray-500">Barcode final akan di-generate otomatis.</p>
            </div>
        </div>
      </div>
    </div>
  );
}