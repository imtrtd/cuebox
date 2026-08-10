"use client";

import { useLibrary } from "@/lib/library-context";
import { KIND_LABELS, KIND_ORDER, type ItemKind } from "@/lib/types";

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
    const name = window.prompt("Название коллекции");
    if (!name?.trim()) return;
    try {
      await addCollection(name.trim());
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Не удалось создать коллекцию",
      );
    }
  }

  return (
    <section className="toolbar" aria-label="Фильтры библиотеки">
      <div className="toolbar-row">
        <label className="search-field">
          <span className="sr-only">Поиск</span>
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию, тексту, тегам…"
            type="search"
          />
        </label>

        <div className="toolbar-actions">
          <button type="button" className="btn btn-ghost" onClick={() => void handleExport()}>
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
              <span>Коллекция</span>
              <select
                value={collectionFilter}
                onChange={(e) =>
                  setCollectionFilter(
                    e.target.value as string | "all" | "none",
                  )
                }
              >
                <option value="all">Все</option>
                <option value="none">Без коллекции</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
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
              + Коллекция
            </button>
          ) : null}

          {mode === "cloud" &&
          collectionFilter !== "all" &&
          collectionFilter !== "none" ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                const col = collections.find((c) => c.id === collectionFilter);
                if (
                  col &&
                  window.confirm(`Удалить коллекцию «${col.name}»?`)
                ) {
                  void removeCollection(col.id);
                }
              }}
            >
              Удалить коллекцию
            </button>
          ) : null}

          <label className="check-line">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(e) => setFavoritesOnly(e.target.checked)}
            />
            Только избранное
          </label>

          <label className="sort-field">
            <span>Сортировка</span>
            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value as "updated" | "created" | "title")
              }
            >
              <option value="updated">По обновлению</option>
              <option value="created">По созданию</option>
              <option value="title">По названию</option>
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
