"use client";

import { useSession } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  apiCreateCollection,
  apiCreateItem,
  apiDeleteCollection,
  apiDeleteItem,
  apiExportItems,
  apiImportItems,
  apiListCollections,
  apiListItems,
  apiUpdateItem,
} from "@/lib/api";
import { SEED_ITEMS } from "@/lib/seed";
import {
  createItem,
  deleteItem,
  exportLibraryJson,
  importLibraryJson,
  loadLibrary,
  saveLibrary,
  updateItem,
} from "@/lib/storage";
import type {
  Collection,
  ItemDraft,
  ItemKind,
  LibraryItem,
} from "@/lib/types";

type SortMode = "updated" | "created" | "title" | "usage";

interface LibraryState {
  mode: "local" | "cloud";
  items: LibraryItem[];
  collections: Collection[];
  ready: boolean;
  loading: boolean;
  query: string;
  kindFilter: ItemKind | "all";
  collectionFilter: string | "all" | "none";
  favoritesOnly: boolean;
  showArchived: boolean;
  sort: SortMode;
  setQuery: (value: string) => void;
  setKindFilter: (value: ItemKind | "all") => void;
  setCollectionFilter: (value: string | "all" | "none") => void;
  setFavoritesOnly: (value: boolean) => void;
  setShowArchived: (value: boolean) => void;
  setSort: (value: SortMode) => void;
  addItem: (draft: ItemDraft) => Promise<LibraryItem>;
  editItem: (
    id: string,
    patch: Partial<ItemDraft> & {
      favorite?: boolean;
      archived?: boolean;
      incrementCopy?: boolean;
    },
  ) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  toggleArchived: (id: string) => Promise<void>;
  recordCopy: (id: string) => Promise<void>;
  resetToSeed: () => void;
  exportJson: () => Promise<string>;
  importJson: (raw: string) => Promise<void>;
  refresh: () => Promise<void>;
  importLocalToCloud: () => Promise<number>;
  addCollection: (
    name: string,
    parentId?: string | null,
  ) => Promise<Collection | null>;
  removeCollection: (id: string) => Promise<void>;
  filteredItems: LibraryItem[];
  localItemCount: number;
}

const LibraryContext = createContext<LibraryState | null>(null);

type UiSnapshot = {
  query: string;
  kindFilter: ItemKind | "all";
  collectionFilter: string | "all" | "none";
  favoritesOnly: boolean;
  showArchived: boolean;
  sort: SortMode;
};

let uiSnapshot: UiSnapshot = {
  query: "",
  kindFilter: "all",
  collectionFilter: "all",
  favoritesOnly: false,
  showArchived: false,
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

function useUiState() {
  return useSyncExternalStore(subscribeUi, () => uiSnapshot, () => uiSnapshot);
}

function peekLocalCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    return loadLibrary().length;
  } catch {
    return 0;
  }
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const authed = Boolean(session?.user?.id);
  const mode: "local" | "cloud" = authed ? "cloud" : "local";

  const [items, setItems] = useState<LibraryItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localItemCount, setLocalItemCount] = useState(0);
  const ui = useUiState();

  useEffect(() => {
    // Sync localStorage into React state after mount (SSR-safe).
    const local = loadLibrary();
    /* eslint-disable react-hooks/set-state-in-effect -- intentional local hydration */
    setItems(local);
    setLocalItemCount(local.length);
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const refresh = useCallback(async () => {
    if (status === "loading") return;
    setLoading(true);
    try {
      if (authed) {
        const [cloudItems, cloudCollections] = await Promise.all([
          apiListItems(true),
          apiListCollections(),
        ]);
        setItems(cloudItems);
        setCollections(cloudCollections);
        setLocalItemCount(peekLocalCount());
      } else {
        const local = loadLibrary();
        setItems(local);
        setCollections([]);
        setLocalItemCount(local.length);
      }
      setReady(true);
    } catch {
      const local = loadLibrary();
      setItems(local);
      setCollections([]);
      setLocalItemCount(local.length);
      setReady(true);
    } finally {
      setLoading(false);
    }
  }, [authed, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional remote/local hydration
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (mode !== "local" || !ready) return;
    saveLibrary(items);
  }, [items, mode, ready]);

  const addItem = useCallback(
    async (draft: ItemDraft) => {
      if (mode === "cloud") {
        const item = await apiCreateItem(draft);
        setItems((prev) => [item, ...prev]);
        return item;
      }
      const item = createItem(draft);
      setItems((prev) => [item, ...prev]);
      return item;
    },
    [mode],
  );

  const editItem = useCallback(
    async (
      id: string,
      patch: Partial<ItemDraft> & {
        favorite?: boolean;
        archived?: boolean;
        incrementCopy?: boolean;
      },
    ) => {
      if (mode === "cloud") {
        const item = await apiUpdateItem(id, patch);
        setItems((prev) => prev.map((row) => (row.id === id ? item : row)));
        return;
      }
      setItems((prev) => updateItem(prev, id, patch));
    },
    [mode],
  );

  const removeItem = useCallback(
    async (id: string) => {
      if (mode === "cloud") {
        await apiDeleteItem(id);
        setItems((prev) => prev.filter((row) => row.id !== id));
        return;
      }
      setItems((prev) => deleteItem(prev, id));
    },
    [mode],
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const current = items.find((item) => item.id === id);
      if (!current) return;
      await editItem(id, { favorite: !current.favorite });
    },
    [editItem, items],
  );

  const toggleArchived = useCallback(
    async (id: string) => {
      const current = items.find((item) => item.id === id);
      if (!current) return;
      await editItem(id, { archived: !current.archived });
    },
    [editItem, items],
  );

  const recordCopy = useCallback(
    async (id: string) => {
      await editItem(id, { incrementCopy: true });
    },
    [editItem],
  );

  const resetToSeed = useCallback(() => {
    if (mode === "cloud") return;
    setItems(SEED_ITEMS);
    saveLibrary(SEED_ITEMS);
  }, [mode]);

  const exportJson = useCallback(async () => {
    if (mode === "cloud") {
      const cloud = await apiExportItems();
      return exportLibraryJson(cloud);
    }
    return exportLibraryJson(items);
  }, [items, mode]);

  const importJson = useCallback(
    async (raw: string) => {
      const parsed = importLibraryJson(raw);
      if (mode === "cloud") {
        await apiImportItems(parsed, false);
        await refresh();
        return;
      }
      setItems(parsed);
    },
    [mode, refresh],
  );

  const importLocalToCloud = useCallback(async () => {
    if (mode !== "cloud") return 0;
    const local = loadLibrary();
    if (!local.length) return 0;
    const created = await apiImportItems(local, false);
    await refresh();
    return created.length;
  }, [mode, refresh]);

  const addCollection = useCallback(
    async (name: string, parentId?: string | null) => {
      if (mode !== "cloud") return null;
      const collection = await apiCreateCollection(name, parentId);
      setCollections((prev) =>
        [...prev, collection].sort((a, b) => a.name.localeCompare(b.name, "ru")),
      );
      return collection;
    },
    [mode],
  );

  const removeCollection = useCallback(
    async (id: string) => {
      if (mode !== "cloud") return;
      await apiDeleteCollection(id);
      setCollections((prev) =>
        prev.filter((c) => c.id !== id && c.parentId !== id),
      );
      setItems((prev) =>
        prev.map((item) =>
          item.collectionId === id ? { ...item, collectionId: null } : item,
        ),
      );
      if (ui.collectionFilter === id) {
        patchUi({ collectionFilter: "all" });
      }
    },
    [mode, ui.collectionFilter],
  );

  const filteredItems = useMemo(() => {
    const q = ui.query.trim().toLowerCase();
    const list = items.filter((item) => {
      if (!ui.showArchived && item.archived) return false;
      if (ui.showArchived && !item.archived) return false;
      if (ui.kindFilter !== "all" && item.kind !== ui.kindFilter) return false;
      if (ui.favoritesOnly && !item.favorite) return false;
      if (ui.collectionFilter === "none" && item.collectionId) return false;
      if (
        ui.collectionFilter !== "all" &&
        ui.collectionFilter !== "none" &&
        item.collectionId !== ui.collectionFilter
      ) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        item.title,
        item.body,
        item.tags.join(" "),
        item.models.join(" "),
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
      if (ui.sort === "usage") {
        return (b.copyCount ?? 0) - (a.copyCount ?? 0);
      }
      const left = ui.sort === "created" ? a.createdAt : a.updatedAt;
      const right = ui.sort === "created" ? b.createdAt : b.updatedAt;
      return right.localeCompare(left);
    });
  }, [items, ui]);

  const value: LibraryState = {
    mode,
    items,
    collections,
    ready,
    loading,
    query: ui.query,
    kindFilter: ui.kindFilter,
    collectionFilter: ui.collectionFilter,
    favoritesOnly: ui.favoritesOnly,
    showArchived: ui.showArchived,
    sort: ui.sort,
    setQuery: (query) => patchUi({ query }),
    setKindFilter: (kindFilter) => patchUi({ kindFilter }),
    setCollectionFilter: (collectionFilter) => patchUi({ collectionFilter }),
    setFavoritesOnly: (favoritesOnly) => patchUi({ favoritesOnly }),
    setShowArchived: (showArchived) => patchUi({ showArchived }),
    setSort: (sort) => patchUi({ sort }),
    addItem,
    editItem,
    removeItem,
    toggleFavorite,
    toggleArchived,
    recordCopy,
    resetToSeed,
    exportJson,
    importJson,
    refresh,
    importLocalToCloud,
    addCollection,
    removeCollection,
    filteredItems,
    localItemCount,
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
