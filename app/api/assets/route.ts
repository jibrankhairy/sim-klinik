// app/api/assets/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

const generateBarcode = (productName: string): string => {
    const prefix = productName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
    const timestamp = Date.now();
    return `${prefix}-${timestamp}`;
};

// --- FUNGSI GET INI YANG KITA PERBAIKI ---
export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      include: { pic: true },
      orderBy: { createdAt: 'desc' }
    });

    // Kalkulasi nilai untuk setiap aset
    const assetsWithCalculations = assets.map(asset => {
      const price = asset.price.toNumber();
      const salvageValue = asset.salvageValue.toNumber();
      const usefulLife = asset.usefulLife;
      const annualDepreciation = (price - salvageValue) / usefulLife;
      const ageInYears = (new Date().getTime() - new Date(asset.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      let accumulatedDepreciation = annualDepreciation * ageInYears;
      if (accumulatedDepreciation > (price - salvageValue)) {
          accumulatedDepreciation = price - salvageValue;
      }
      if (accumulatedDepreciation < 0) accumulatedDepreciation = 0;
      const currentValue = price - accumulatedDepreciation;
      return { ...asset, currentValue, accumulatedDepreciation };
    });

    // Kalkulasi ringkasan data
    const summary = assetsWithCalculations.reduce((acc, asset) => {
        acc.totalInitialValue += asset.price.toNumber();
        acc.totalCurrentValue += asset.currentValue;
        acc.totalDepreciation += asset.accumulatedDepreciation;
        return acc;
    }, { totalInitialValue: 0, totalCurrentValue: 0, totalDepreciation: 0 });

    // Kembalikan summary dan assets
    return NextResponse.json({ summary, assets: assetsWithCalculations });

  } catch (error) {
    console.error("Failed to fetch assets:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}


// Fungsi POST (tidak berubah)
export async function POST(req: Request) {
    // ... kode POST yang sudah ada sebelumnya
    try {
        const body = await req.json();
        const { 
            productName, purchaseDate, location, assetType, 
            price, usefulLife, salvageValue, picId, status 
        } = body;
    
        if (!productName) {
            return NextResponse.json({ message: "Nama Produk wajib diisi" }, { status: 400 });
        }
    
        const barcode = generateBarcode(productName);
    
        const newAsset = await prisma.asset.create({
          data: {
            productName,
            barcode,
            purchaseDate: new Date(purchaseDate),
            location,
            assetType,
            price: new Decimal(price),
            usefulLife,
            salvageValue: new Decimal(salvageValue),
            picId: picId ? picId : null,
            status,
          },
        });
    
        return NextResponse.json(newAsset, { status: 201 });
    
      } catch (error) {
        console.error("Failed to create asset:", error);
        return NextResponse.json({ message: "Terjadi kesalahan pada server" }, { status: 500 });
      }
}