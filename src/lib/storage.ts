import { SEED_ITEMS, STORAGE_KEY } from "./seed";
import type { ItemDraft, LibraryItem } from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeItem(item: LibraryItem): LibraryItem {
  return {
    ...item,
    tags: normalizeTags(item.tags ?? []),
    favorite: Boolean(item.favorite),
    archived: Boolean(item.archived),
    copyCount: item.copyCount ?? 0,
    lastUsedAt: item.lastUsedAt ?? null,
    models: item.models ?? [],
    preset: item.preset ?? {},
    variableDefs: item.variableDefs ?? [],
    variants: item.variants ?? [],
    activeVariantId: item.activeVariantId ?? null,
    collectionId: item.collectionId ?? null,
  };
}

export function loadLibrary(): LibraryItem[] {
  if (typeof window === "undefined") {
    return SEED_ITEMS.map(normalizeItem);
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = SEED_ITEMS.map(normalizeItem);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as LibraryItem[];
    if (!Array.isArray(parsed)) {
      return SEED_ITEMS.map(normalizeItem);
    }
    return parsed.map(normalizeItem);
  } catch {
    return SEED_ITEMS.map(normalizeItem);
  }
}

export function saveLibrary(items: LibraryItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function createItem(draft: ItemDraft): LibraryItem {
  const stamp = nowIso();
  return normalizeItem({
    id: createId(),
    kind: draft.kind,
    title: draft.title.trim(),
    body: draft.body.trim(),
    tags: normalizeTags(draft.tags),
    messages: draft.messages,
    favorite: Boolean(draft.favorite),
    archived: Boolean(draft.archived),
    copyCount: 0,
    lastUsedAt: null,
    models: draft.models ?? [],
    preset: draft.preset ?? {},
    variableDefs: draft.variableDefs ?? [],
    variants: draft.variants ?? [],
    activeVariantId: draft.activeVariantId ?? null,
    collectionId: draft.collectionId ?? null,
    createdAt: stamp,
    updatedAt: stamp,
  });
}

export function updateItem(
  items: LibraryItem[],
  id: string,
  patch: Partial<ItemDraft> & {
    favorite?: boolean;
    archived?: boolean;
    incrementCopy?: boolean;
  },
): LibraryItem[] {
  return items.map((item) => {
    if (item.id !== id) return item;
    const next = {
      ...item,
      ...patch,
      title: patch.title !== undefined ? patch.title.trim() : item.title,
      body: patch.body !== undefined ? patch.body.trim() : item.body,
      tags: patch.tags !== undefined ? normalizeTags(patch.tags) : item.tags,
      updatedAt: nowIso(),
    };
    if (patch.incrementCopy) {
      next.copyCount = (item.copyCount ?? 0) + 1;
      next.lastUsedAt = nowIso();
    }
    delete (next as { incrementCopy?: boolean }).incrementCopy;
    return normalizeItem(next);
  });
}

export function deleteItem(items: LibraryItem[], id: string): LibraryItem[] {
  return items.filter((item) => item.id !== id);
}

export function exportLibraryJson(items: LibraryItem[]): string {
  return JSON.stringify(items, null, 2);
}

export function importLibraryJson(raw: string): LibraryItem[] {
  const parsed = JSON.parse(raw) as LibraryItem[];
  if (!Array.isArray(parsed)) {
    throw new Error("Ожидался массив элементов библиотеки");
  }
  return parsed.map(normalizeItem);
}

function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const tag of tags) {
    const clean = tag.trim().toLowerCase();
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    result.push(clean);
  }
  return result;
}

export function itemPlainText(item: LibraryItem): string {
  if (item.kind === "chat" && item.messages?.length) {
    return item.messages
      .map((m) => `${m.role.toUpperCase()}:\n${m.content}`)
      .join("\n\n");
  }
  if (item.activeVariantId) {
    const variant = item.variants.find((v) => v.id === item.activeVariantId);
    if (variant) return variant.body;
  }
  return item.body;
}
