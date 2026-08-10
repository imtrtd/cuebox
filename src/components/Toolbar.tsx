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
    favoritesOnly,
    setFavoritesOnly,
    sort,
    setSort,
    exportJson,
    filteredItems,
    items,
  } = useLibrary();

  function handleExport() {
    const blob = new Blob([exportJson()], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cuebox-library-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
          <button type="button" className="btn btn-ghost" onClick={handleExport}>
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
