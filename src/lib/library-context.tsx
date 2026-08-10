"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { SEED_ITEMS, STORAGE_KEY } from "@/lib/seed";
import {
  createItem,
  deleteItem,
  exportLibraryJson,
  importLibraryJson,
  loadLibrary,
  saveLibrary,
  updateItem,
} from "@/lib/storage";
import type { ItemDraft, ItemKind, LibraryItem } from "@/lib/types";

type SortMode = "updated" | "created" | "title";

interface LibraryState {
  items: LibraryItem[];
  ready: boolean;
  query: string;
  kindFilter: ItemKind | "all";
  favoritesOnly: boolean;
  sort: SortMode;
  setQuery: (value: string) => void;
  setKindFilter: (value: ItemKind | "all") => void;
  setFavoritesOnly: (value: boolean) => void;
  setSort: (value: SortMode) => void;
  addItem: (draft: ItemDraft) => LibraryItem;
  editItem: (
    id: string,
    patch: Partial<ItemDraft> & { favorite?: boolean },
  ) => void;
  removeItem: (id: string) => void;
  toggleFavorite: (id: string) => void;
  resetToSeed: () => void;
  exportJson: () => string;
  importJson: (raw: string) => void;
  filteredItems: LibraryItem[];
}

const LibraryContext = createContext<LibraryState | null>(null);

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getClientSnapshot(): string {
  if (typeof window === "undefined") {
    return JSON.stringify(SEED_ITEMS);
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ITEMS));
    return JSON.stringify(SEED_ITEMS);
  }
  return raw;
}

function getServerSnapshot(): string {
  return JSON.stringify(SEED_ITEMS);
}

function writeItems(items: LibraryItem[]) {
  saveLibrary(items);
  emit();
}

function parseItems(raw: string): LibraryItem[] {
  try {
    const parsed = JSON.parse(raw) as LibraryItem[];
    return Array.isArray(parsed) ? parsed : SEED_ITEMS;
  } catch {
    return SEED_ITEMS;
  }
}

function useUiState() {
  // Lightweight UI filters kept in memory (not persisted).
  const snapshot = useSyncExternalStore(
    subscribeUi,
    () => uiSnapshot,
    () => uiSnapshot,
  );
  return snapshot;
}

type UiSnapshot = {
  query: string;
  kindFilter: ItemKind | "all";
  favoritesOnly: boolean;
  sort: SortMode;
};

let uiSnapshot: UiSnapshot = {
  query: "",
  kindFilter: "all",
  favoritesOnly: false,
  sort: "updated",
};

const uiListeners = new Set<() => void>();

function subscribeUi(listener: () => void) {
  uiListeners.add(listener);
  return () => uiListeners.delete(listener);
}

function patchUi(patch: Partial<UiSnapshot>) {
  uiSnapshot = { ...uiSnapshot, ...patch };
  for (const listener of uiListeners) listener();
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const items = useMemo(() => parseItems(raw), [raw]);
  const ready = true;
  const ui = useUiState();

  const addItem = useCallback((draft: ItemDraft) => {
    const item = createItem(draft);
    const next = [item, ...loadLibrary()];
    writeItems(next);
    return item;
  }, []);

  const editItem = useCallback(
    (id: string, patch: Partial<ItemDraft> & { favorite?: boolean }) => {
      writeItems(updateItem(loadLibrary(), id, patch));
    },
    [],
  );

  const removeItem = useCallback((id: string) => {
    writeItems(deleteItem(loadLibrary(), id));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    writeItems(
      loadLibrary().map((item) =>
        item.id === id
          ? {
              ...item,
              favorite: !item.favorite,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
  }, []);

  const resetToSeed = useCallback(() => {
    writeItems(SEED_ITEMS);
  }, []);

  const exportJson = useCallback(() => exportLibraryJson(items), [items]);

  const importJson = useCallback((rawJson: string) => {
    writeItems(importLibraryJson(rawJson));
  }, []);

  const filteredItems = useMemo(() => {
    const q = ui.query.trim().toLowerCase();
    const list = items.filter((item) => {
      if (ui.kindFilter !== "all" && item.kind !== ui.kindFilter) return false;
      if (ui.favoritesOnly && !item.favorite) return false;
      if (!q) return true;
      const haystack = [
        item.title,
        item.body,
        item.tags.join(" "),
        ...(item.messages?.map((m) => m.content) ?? []),
      ]
        .join("\n")
        .toLowerCase();
      return haystack.includes(q);
    });

    return [...list].sort((a, b) => {
      if (ui.sort === "title") {
        return a.title.localeCompare(b.title, "ru");
      }
      const left = ui.sort === "created" ? a.createdAt : a.updatedAt;
      const right = ui.sort === "created" ? b.createdAt : b.updatedAt;
      return right.localeCompare(left);
    });
  }, [items, ui]);

  const value: LibraryState = {
    items,
    ready,
    query: ui.query,
    kindFilter: ui.kindFilter,
    favoritesOnly: ui.favoritesOnly,
    sort: ui.sort,
    setQuery: (query) => patchUi({ query }),
    setKindFilter: (kindFilter) => patchUi({ kindFilter }),
    setFavoritesOnly: (favoritesOnly) => patchUi({ favoritesOnly }),
    setSort: (sort) => patchUi({ sort }),
    addItem,
    editItem,
    removeItem,
    toggleFavorite,
    resetToSeed,
    exportJson,
    importJson,
    filteredItems,
  };

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryState {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error("useLibrary must be used within LibraryProvider");
  }
  return ctx;
}
