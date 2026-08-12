"use client";

import { useCallback } from "react";
import { useLibrary } from "@/lib/library-context";
import { MemoizedItemRow } from "@/components/MemoizedItemRow";
import type { LibraryItem } from "@/lib/types";

export function ItemList({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (item: LibraryItem) => void;
}) {
  const { filteredItems, ready, toggleFavorite } = useLibrary();
  const handleSelect = useCallback((item: LibraryItem) => onSelect(item), [onSelect]);
  const handleToggleFavorite = useCallback(
    (id: string) => {
      void toggleFavorite(id);
    },
    [toggleFavorite],
  );

  if (!ready) {
    return <div className="list-empty">Загрузка библиотеки…</div>;
  }

  if (!filteredItems.length) {
    return (
      <div className="list-empty">
        <p>Ничего не найдено.</p>
        <p className="muted">Измените фильтр или создайте новый элемент.</p>
      </div>
    );
  }

  return (
    <ul className="item-list" role="listbox" aria-label="Элементы библиотеки">
      {filteredItems.map((item) => {
        const active = item.id === selectedId;
        return <MemoizedItemRow key={item.id} item={item} active={active} onSelect={handleSelect} onToggleFavorite={handleToggleFavorite} />;
      })}
    </ul>
  );
}
