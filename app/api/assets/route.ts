// app/api/assets/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// Fungsi untuk membuat barcode unik
const generateBarcode = (productName: string): string => {
    const prefix = productName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
    const timestamp = Date.now();
    return `${prefix}-${timestamp}`;
};

// --- FUNGSI GET DENGAN PENAMBAHAN LOGIKA QR CODE ---
export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      // 1. Mengambil semua relasi yang dibutuhkan
      include: { 
        location: true 
      },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Melakukan kalkulasi nilai penyusutan
    const assetsWithCalculations = assets.map(asset => {
      const price = asset.price.toNumber();
      const salvageValue = asset.salvageValue.toNumber();
      const usefulLife = asset.usefulLife;
      
      const annualDepreciation = usefulLife > 0 ? (price - salvageValue) / usefulLife : 0;
      const ageInYears = (new Date().getTime() - new Date(asset.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25);

      let accumulatedDepreciation = annualDepreciation * ageInYears;
      if (accumulatedDepreciation > (price - salvageValue)) {
          accumulatedDepreciation = price - salvageValue;
      }
      if (accumulatedDepreciation < 0) {
          accumulatedDepreciation = 0;
      }

      const currentValue = price - accumulatedDepreciation;

      // Kembalikan objek dengan semua nilai finansial DAN QR code value
      return {
        ...asset,
        price,
        salvageValue,
        currentValue,
        accumulatedDepreciation,
        // --- UPDATE DI SINI: Tambahkan properti baru untuk isi QR Code ---
        qrCodeValue: `${asset.productName} - ${asset.location.name}`
      };
    });

    // 3. Membuat ringkasan data (TETAP ADA, TIDAK DIUBAH)
    const summary = assetsWithCalculations.reduce((acc, asset) => {
        acc.totalInitialValue += asset.price;
        acc.totalCurrentValue += asset.currentValue;
        acc.totalDepreciation += asset.accumulatedDepreciation;
        return acc;
    }, { totalInitialValue: 0, totalCurrentValue: 0, totalDepreciation: 0 });


    // 4. Mengembalikan respons lengkap
    return NextResponse.json({ summary, assets: assetsWithCalculations });

  } catch (error) {
    console.error("Gagal mengambil data aset:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}


// --- FUNGSI POST (TIDAK ADA PERUBAHAN) ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
        productName, purchaseDate, locationId, assetType, 
        price, usefulLife, salvageValue, picName, picContact, status 
    } = body;

    if (!productName || !locationId) {
        return NextResponse.json({ message: "Nama Produk dan Lokasi wajib diisi" }, { status: 400 });
    }

    const barcode = generateBarcode(productName);

    const newAsset = await prisma.asset.create({
      data: {
        productName,
        barcode,
        purchaseDate: new Date(purchaseDate),
        locationId: parseInt(locationId, 10),
        assetType,
        price: new Decimal(price),
        usefulLife: parseInt(usefulLife, 10),
        salvageValue: new Decimal(salvageValue),
        picName,
        picContact,
        status,
      },
    });
    return NextResponse.json(newAsset, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat aset:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}