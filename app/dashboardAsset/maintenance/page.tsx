// app/dashboardAsset/maintenance/page.tsx

"use client";
import React, { useState, useEffect } from 'react';
import type { Maintenance, Asset } from '@prisma/client';
import MaintenanceTable from '../components/MaintenanceTable';
import MaintenanceDialog from '../components/MaintenanceDialog';

type MaintenanceWithAsset = Maintenance & { asset: Asset };

export default function MaintenancePage() {
  const [maintenances, setMaintenances] = useState<MaintenanceWithAsset[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [maintenanceToEdit, setMaintenanceToEdit] = useState<Maintenance | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // --- PERUBAHAN DI SINI ---
      const [maintRes, assetsRes] = await Promise.all([
        fetch('/api/assets/maintenance'), // URL diubah
        fetch('/api/assets')
      ]);
      if (!maintRes.ok || !assetsRes.ok) throw new Error('Gagal memuat data');
      
      const maintData = await maintRes.json();
      const assetsData = await assetsRes.json();
      
      setMaintenances(maintData);
      setAssets(assetsData.assets);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClick = () => {
    setMaintenanceToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (maintenance: Maintenance) => {
    setMaintenanceToEdit(maintenance);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm('Yakin ingin menghapus jadwal ini?')) {
      try {
        // --- PERUBAHAN DI SINI ---
        const response = await fetch(`/api/assets/maintenance/${id}`, { method: 'DELETE' }); // URL diubah
        if (!response.ok) throw new Error('Gagal menghapus data');
        fetchData();
      } catch (error) {
        alert('Gagal menghapus data');
      }
    }
  };
  
  return (
    <>
      <MaintenanceDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onFormSubmit={fetchData}
        maintenanceToEdit={maintenanceToEdit}
        assets={assets}
      />
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Jadwal Maintenance</h3>
          <button
            onClick={handleAddClick}
            className="bg-[#01449D] text-white px-4 py-2 rounded-lg font-semibold"
          >
            + Tambah Jadwal
          </button>
        </div>
        
        {isLoading ? (
          <p className="text-center text-gray-500">Memuat data...</p>
        ) : (
          <MaintenanceTable
            maintenances={maintenances}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        )}
      </div>
    </>
  );
}