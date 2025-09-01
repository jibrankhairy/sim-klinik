"use client";
import React, { useState, useEffect } from "react";
import type { Asset, User, Location } from "@prisma/client";

type AssetWithDetails = Asset & {
  pic: User | null;
  location: Location;
  currentValue: number;
  accumulatedDepreciation: number;
};
type ApiResponse = {
  summary: {
    totalInitialValue: number;
    totalCurrentValue: number;
    totalDepreciation: number;
  };
  assets: AssetWithDetails[];
};

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

const DonutChartCard = ({
  title,
  data,
  summaryText,
}: {
  title: string;
  data: any;
  summaryText: React.ReactNode;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.915" fill="#fff" />
          <circle
            cx="18"
            cy="18"
            r="15.915"
            fill="none"
            stroke="#e6e6e6"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r="15.915"
            fill="none"
            stroke="#fdba74"
            strokeWidth="3"
            strokeDasharray={`${data.percent1}, ${100 - data.percent1}`}
          />
          <circle
            cx="18"
            cy="18"
            r="15.915"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="3"
            strokeDasharray={`${data.percent2}, ${100 - data.percent2}`}
            strokeDashoffset={`-${data.percent1}`}
          />
        </svg>
      </div>
      <div className="text-sm text-gray-600 space-y-2">{summaryText}</div>
    </div>
  </div>
);

const LineChartCard = ({ title }: { title: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
    <div className="h-60 bg-gray-50 rounded-md flex items-center justify-center">
      <p className="text-gray-400">Line Chart Placeholder</p>
    </div>
  </div>
);

const CalendarCard = () => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-lg font-bold text-gray-800 mb-4">Kalender Aset</h3>
    <div className="text-center font-semibold">January 2024</div>
    <div className="grid grid-cols-7 gap-2 mt-4 text-center text-sm">
      <div>Su</div>
      <div>Mo</div>
      <div>Tu</div>
      <div>We</div>
      <div>Th</div>
      <div>Fr</div>
      <div>Sa</div>
      <div className="text-gray-400">31</div>
      <div>1</div>
      <div>2</div>
      <div>3</div>
      <div>4</div>
      <div>5</div>
      <div>6</div>
      <div>7</div>
      <div>8</div>
      <div>9</div>
      <div>10</div>
      <div className="bg-blue-500 text-white rounded-full">11</div>
      <div>12</div>
      <div>13</div>
    </div>
  </div>
);

const JournalCard = ({ asset }: { asset?: AssetWithDetails }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-lg font-bold text-gray-800 mb-4">Jurnal Terakhir</h3>
    {asset ? (
      <div className="space-y-2">
        <p className="font-bold text-[#01449D]">
          {asset.productName.toUpperCase()}
        </p>
        <p className="text-sm text-gray-500">
          Tanggal Beli:{" "}
          {new Date(asset.purchaseDate).toLocaleDateString("id-ID")}
        </p>
        <p className="text-sm text-gray-500">
          Harga: {formatRupiah(parseFloat(asset.price as any))}
        </p>
        <p className="text-sm text-gray-500">Lokasi: {asset.location.name}</p>
      </div>
    ) : (
      <p className="text-sm text-gray-500">Tidak ada jurnal terbaru.</p>
    )}
  </div>
);

export default function AssetDashboardPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/assets");
        if (!response.ok) throw new Error("Gagal memuat data aset");
        const apiData: ApiResponse = await response.json();
        setData(apiData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <div className="text-center p-8">Loading data...</div>;
  if (error)
    return <div className="text-center p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="text-center p-8">Tidak ada data.</div>;

  const { summary, assets } = data;
  const valuePercent =
    summary.totalInitialValue > 0
      ? (summary.totalCurrentValue / summary.totalInitialValue) * 100
      : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChartCard
          title="Aset Aktif"
          data={{ percent1: 70, percent2: 30 }}
          summaryText={<p>Ringkasan Aset Aktif</p>}
        />
        <DonutChartCard
          title="Nilai Aset"
          data={{ percent1: valuePercent, percent2: 100 - valuePercent }}
          summaryText={
            <>
              <p>Nilai Awal: {formatRupiah(summary.totalInitialValue)}</p>
              <p>Nilai Buku: {formatRupiah(summary.totalCurrentValue)}</p>
              <p>Penyusutan: {formatRupiah(summary.totalDepreciation)}</p>
            </>
          }
        />
      </div>
      <LineChartCard title="Nilai Aset" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalendarCard />
        <JournalCard asset={assets[0]} />
      </div>
    </div>
  );
}
