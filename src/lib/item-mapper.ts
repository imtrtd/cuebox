import type { LibraryItem as DbItem } from "@prisma/client";
import type { ChatMessage, ItemKind, LibraryItem } from "@/lib/types";

export function serializeItem(row: DbItem): LibraryItem {
  let tags: string[] = [];
  try {
    tags = JSON.parse(row.tags) as string[];
    if (!Array.isArray(tags)) tags = [];
  } catch {
    tags = [];
  }

  let messages: ChatMessage[] | undefined;
  if (row.messages) {
    try {
      messages = JSON.parse(row.messages) as ChatMessage[];
    } catch {
      messages = undefined;
    }
  }

  return {
    id: row.id,
    kind: row.kind as ItemKind,
    title: row.title,
    body: row.body,
    tags,
    messages,
    favorite: row.favorite,
    collectionId: row.collectionId ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function tagsToJson(tags: string[] | undefined): string {
  return JSON.stringify(
    (tags ?? [])
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function messagesToJson(
  messages: ChatMessage[] | undefined,
): string | null {
  if (!messages?.length) return null;
  return JSON.stringify(messages);
}
