// app/api/assets/maintenance/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Mengambil semua jadwal maintenance
export async function GET() {
  try {
    const maintenances = await prisma.maintenance.findMany({
      include: {
        asset: true, // Sertakan detail aset terkait
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(maintenances);
  } catch (error) {
    return NextResponse.json({ message: "Gagal mengambil data maintenance" }, { status: 500 });
  }
}

// POST: Membuat jadwal maintenance baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { assetId, description, scheduledDate, cost, notes } = body;

    if (!assetId || !description) {
      return NextResponse.json({ message: "Aset dan deskripsi wajib diisi" }, { status: 400 });
    }

    const newMaintenance = await prisma.maintenance.create({
      data: {
        assetId,
        description,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        cost: cost ? parseFloat(cost) : null,
        notes,
      },
    });
    return NextResponse.json(newMaintenance, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Gagal membuat jadwal maintenance" }, { status: 500 });
  }
}