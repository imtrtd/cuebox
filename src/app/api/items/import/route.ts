import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  messagesToJson,
  modelsToJson,
  serializeItem,
  tagsToJson,
  variableDefsToJson,
  variantsToJson,
} from "@/lib/item-mapper";
import { requireUserId } from "@/lib/session";
import type { LibraryItem } from "@/lib/types";
import { KIND_ORDER } from "@/lib/types";

const KIND_SET = new Set<string>(KIND_ORDER);

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as {
      items?: LibraryItem[];
      replace?: boolean;
    };
    const items = payload.items;
    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Ожидался массив items" },
        { status: 400 },
      );
    }

    if (payload.replace) {
      await prisma.libraryItem.deleteMany({ where: { userId } });
    }

    const created = [];
    for (const item of items) {
      if (!item.kind || !KIND_SET.has(item.kind)) continue;
      const title = item.title?.trim();
      if (!title) continue;

      const row = await prisma.libraryItem.create({
        data: {
          userId,
          kind: item.kind,
          title,
          body: (item.body ?? title).trim(),
          tags: tagsToJson(item.tags),
          messages: messagesToJson(item.messages),
          favorite: Boolean(item.favorite),
          archived: Boolean(item.archived),
          copyCount: item.copyCount ?? 0,
          lastUsedAt: item.lastUsedAt ? new Date(item.lastUsedAt) : null,
          models: modelsToJson(item.models),
          variableDefs: variableDefsToJson(item.variableDefs),
          variants: variantsToJson(item.variants),
          activeVariantId: item.activeVariantId ?? null,
          collectionId: null,
          createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
        },
      });
      created.push(serializeItem(row));
    }

    return NextResponse.json({ items: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Импорт не удался" }, { status: 500 });
  }
}
