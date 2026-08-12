"use client";

import Link from "next/link";
import { AiFoldersBar } from "@/components/AiFoldersBar";
import { useLibrary } from "@/lib/library-context";
import { KIND_LABELS, KIND_ORDER, type ItemKind } from "@/lib/types";

function folderLabel(
  collections: { id: string; name: string; parentId?: string | null }[],
  id: string,
): string {
  const parts: string[] = [];
  let cursor: string | null | undefined = id;
  let guard = 0;
  while (cursor && guard < 6) {
    const node = collections.find((c) => c.id === cursor);
    if (!node) break;
    parts.unshift(node.name);
    cursor = node.parentId;
    guard += 1;
  }
  return parts.join(" / ");
}

export function Toolbar({
  onCreate,
  onImportClick,
}: {
  onCreate: (kind?: ItemKind) => void;
  onImportClick: () => void;
}) {
  const {
    query,
    setQuery,
    kindFilter,
    setKindFilter,
    collectionFilter,
    setCollectionFilter,
    favoritesOnly,
    setFavoritesOnly,
    showArchived,
    setShowArchived,
    sort,
    setSort,
    exportJson,
    filteredItems,
    items,
    collections,
    mode,
    addCollection,
    removeCollection,
  } = useLibrary();

  async function handleExport() {
    try {
      const json = await exportJson();
      const blob = new Blob([json], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cuebox-library-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Экспорт не удался");
    }
  }

  async function handleAddCollection() {
    const name = window.prompt("Название папки");
    if (!name?.trim()) return;
    const parentId =
      collectionFilter !== "all" && collectionFilter !== "none"
        ? collectionFilter
        : null;
    try {
      await addCollection(name.trim(), parentId);
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Не удалось создать папку",
      );
    }
  }

  const activeCollection =
    collectionFilter !== "all" && collectionFilter !== "none"
      ? collections.find((c) => c.id === collectionFilter)
      : null;

  return (
    <section className="toolbar" aria-label="Фильтры библиотеки">
      <AiFoldersBar />

      <div className="toolbar-row">
        <label className="search-field">
          <span className="sr-only">Поиск</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию, тексту, тегам, моделям…"
            type="search"
          />
        </label>

        <div className="toolbar-actions">
          <Link href="/explore" className="btn btn-ghost">
            Explore
          </Link>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => void handleExport()}
          >
            Экспорт
          </button>
          <button type="button" className="btn btn-ghost" onClick={onImportClick}>
            Импорт
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onCreate("prompt")}
          >
            Новый элемент
          </button>
        </div>
      </div>

      <div className="toolbar-row toolbar-meta">
        <div className="kind-tabs" role="tablist" aria-label="Тип">
          <button
            type="button"
            role="tab"
            aria-selected={kindFilter === "all"}
            className={kindFilter === "all" ? "kind-tab active" : "kind-tab"}
            onClick={() => setKindFilter("all")}
          >
            Все
          </button>
          {KIND_ORDER.map((kind) => (
            <button
              key={kind}
              type="button"
              role="tab"
              aria-selected={kindFilter === kind}
              className={kindFilter === kind ? "kind-tab active" : "kind-tab"}
              onClick={() => setKindFilter(kind)}
            >
              {KIND_LABELS[kind]}
            </button>
          ))}
        </div>

        <div className="toolbar-side">
          {mode === "cloud" ? (
            <label className="sort-field">
              <span>Папка</span>
              <select
                value={collectionFilter}
                onChange={(e) =>
                  setCollectionFilter(
                    e.target.value as string | "all" | "none",
                  )
                }
              >
                <option value="all">Все</option>
                <option value="none">Без папки</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {folderLabel(collections, c.id)}
                    {c.externalUrl ? " ↗" : ""}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {mode === "cloud" ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => void handleAddCollection()}
            >
              + Папка
            </button>
          ) : null}

          {activeCollection?.externalUrl ? (
            <a
              className="btn btn-ghost"
              href={activeCollection.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Открыть {activeCollection.name}
            </a>
          ) : null}

          {mode === "cloud" && activeCollection ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                if (
                  window.confirm(`Удалить папку «${activeCollection.name}»?`)
                ) {
                  void removeCollection(activeCollection.id);
                }
              }}
            >
              Удалить папку
            </button>
          ) : null}

          <label className="check-line">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(e) => setFavoritesOnly(e.target.checked)}
            />
            Избранное
          </label>

          <label className="check-line">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
            />
            Архив
          </label>

          <label className="sort-field">
            <span>Сортировка</span>
            <select
              value={sort}
              onChange={(e) =>
                setSort(
                  e.target.value as
                    | "updated"
                    | "created"
                    | "title"
                    | "usage",
                )
              }
            >
              <option value="updated">По обновлению</option>
              <option value="created">По созданию</option>
              <option value="title">По названию</option>
              <option value="usage">По использованию</option>
            </select>
          </label>

          <p className="count-line">
            {filteredItems.length} из {items.length}
          </p>
        </div>
      </div>
    </section>
  );
}
