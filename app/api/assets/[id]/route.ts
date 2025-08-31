// app/api/assets/[id]/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// --- FUNGSI UNTUK UPDATE (EDIT) ASET ---
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { 
        productName, purchaseDate, locationId, assetType, 
        price, usefulLife, salvageValue, picId, status 
    } = body;

    const updatedAsset = await prisma.asset.update({
      where: { id: id },
      data: {
        productName,
        purchaseDate: new Date(purchaseDate),
        locationId,
        assetType,
        price: new Decimal(price),
        usefulLife: parseInt(usefulLife, 10),
        salvageValue: new Decimal(salvageValue),
        picId: picId ? parseInt(picId, 10) : null,
        status,
      },
    });

    return NextResponse.json(updatedAsset);
  } catch (error) {
    console.error("Gagal update aset:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}

// --- FUNGSI UNTUK DELETE (HAPUS) ASET ---
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.asset.delete({
      where: { id: id },
    });
    return NextResponse.json({ message: "Aset berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("Gagal menghapus aset:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}