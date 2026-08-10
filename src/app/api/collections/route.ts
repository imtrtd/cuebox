import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";
import type { Collection } from "@/lib/types";

function serializeCollection(row: {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}): Collection {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.collection.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    collections: rows.map(serializeCollection),
  });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { name?: string };
    const name = body.name?.trim() ?? "";
    if (!name) {
      return NextResponse.json(
        { error: "Укажите название коллекции" },
        { status: 400 },
      );
    }

    const row = await prisma.collection.create({
      data: { userId, name },
    });

    return NextResponse.json(
      { collection: serializeCollection(row) },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Не удалось создать коллекцию" },
      { status: 500 },
    );
  }
}
