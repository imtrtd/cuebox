import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  messagesToJson,
  serializeItem,
  tagsToJson,
} from "@/lib/item-mapper";
import { requireUserId } from "@/lib/session";
import type { ChatMessage, ItemKind } from "@/lib/types";
import { KIND_ORDER } from "@/lib/types";

const KIND_SET = new Set<string>(KIND_ORDER);

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.libraryItem.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ items: rows.map(serializeItem) });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      kind?: ItemKind;
      title?: string;
      body?: string;
      tags?: string[];
      messages?: ChatMessage[];
      favorite?: boolean;
      collectionId?: string | null;
    };

    const kind = body.kind;
    const title = body.title?.trim() ?? "";
    const text = body.body?.trim() ?? "";

    if (!kind || !KIND_SET.has(kind)) {
      return NextResponse.json({ error: "Некорректный тип" }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: "Укажите название" }, { status: 400 });
    }

    if (body.collectionId) {
      const collection = await prisma.collection.findFirst({
        where: { id: body.collectionId, userId },
      });
      if (!collection) {
        return NextResponse.json(
          { error: "Коллекция не найдена" },
          { status: 400 },
        );
      }
    }

    const row = await prisma.libraryItem.create({
      data: {
        userId,
        kind,
        title,
        body: text || title,
        tags: tagsToJson(body.tags),
        messages: messagesToJson(body.messages),
        favorite: Boolean(body.favorite),
        collectionId: body.collectionId ?? null,
      },
    });

    return NextResponse.json({ item: serializeItem(row) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Не удалось создать" }, { status: 500 });
  }
}
