"use client";

import { useMemo, useRef, useState } from "react";
import { ItemDetail } from "@/components/ItemDetail";
import { ItemEditor } from "@/components/ItemEditor";
import { ItemList } from "@/components/ItemList";
import { Toolbar } from "@/components/Toolbar";
import { useLibrary } from "@/lib/library-context";
import type { ItemDraft, ItemKind, LibraryItem } from "@/lib/types";

export function AppShell() {
  const {
    items,
    ready,
    addItem,
    editItem,
    removeItem,
    importJson,
    resetToSeed,
  } = useLibrary();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<LibraryItem | null>(null);
  const [defaultKind, setDefaultKind] = useState<ItemKind>("prompt");
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  function openCreate(kind: ItemKind = "prompt") {
    setEditing(null);
    setDefaultKind(kind);
    setEditorOpen(true);
  }

  function openEdit() {
    if (!selected) return;
    setEditing(selected);
    setDefaultKind(selected.kind);
    setEditorOpen(true);
  }

  function handleSave(draft: ItemDraft, id?: string) {
    if (id) {
      editItem(id, draft);
      setSelectedId(id);
    } else {
      const created = addItem(draft);
      setSelectedId(created.id);
    }
  }

  function handleDelete() {
    if (!selected) return;
    if (!window.confirm(`Удалить «${selected.title}»?`)) return;
    const id = selected.id;
    removeItem(id);
    setSelectedId(null);
  }

  function handleImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importJson(String(reader.result ?? ""));
        setSelectedId(null);
      } catch (err) {
        window.alert(
          err instanceof Error ? err.message : "Не удалось импортировать JSON",
        );
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand-block">
          <p className="brand">Cuebox</p>
          <p className="tagline">
            Личная библиотека промптов, подсказок, задач и чатов с ИИ
          </p>
        </div>
        <div className="header-actions">
          {ready ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                if (
                  window.confirm(
                    "Сбросить библиотеку к демо-данным? Текущие записи будут заменены.",
                  )
                ) {
                  resetToSeed();
                  setSelectedId(null);
                }
              }}
            >
              Сброс демо
            </button>
          ) : null}
        </div>
      </header>

      <Toolbar
        onCreate={openCreate}
        onImportClick={() => fileRef.current?.click()}
      />

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImportFile(file);
          e.target.value = "";
        }}
      />

      <div className="workspace">
        <aside className="sidebar">
          <ItemList
            selectedId={selectedId}
            onSelect={(item) => setSelectedId(item.id)}
          />
        </aside>
        <main className="main-pane">
          <ItemDetail
            item={selected}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </main>
      </div>

      <ItemEditor
        open={editorOpen}
        initial={editing}
        defaultKind={defaultKind}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
