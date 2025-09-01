// app/api/maintenance/[id]/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json();
    const { description, status, scheduledDate, completionDate, cost, notes } = body;
    
    const updatedMaintenance = await prisma.maintenance.update({
      where: { id },
      data: {
        description,
        status,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        completionDate: completionDate ? new Date(completionDate) : null,
        cost: cost ? parseFloat(cost) : null,
        notes,
      },
    });
    return NextResponse.json(updatedMaintenance);
  } catch (error) {
    return NextResponse.json({ message: "Gagal memperbarui data maintenance" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    await prisma.maintenance.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Data maintenance berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ message: "Gagal menghapus data maintenance" }, { status: 500 });
  }
}