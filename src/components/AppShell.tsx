"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AuthStatus } from "@/components/AuthStatus";
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
    mode,
    localItemCount,
    addItem,
    editItem,
    removeItem,
    importJson,
    resetToSeed,
    importLocalToCloud,
  } = useLibrary();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<LibraryItem | null>(null);
  const [defaultKind, setDefaultKind] = useState<ItemKind>("prompt");
  const [importPromptShown, setImportPromptShown] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const askedImportRef = useRef(false);

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  useEffect(() => {
    if (
      mode !== "cloud" ||
      !ready ||
      askedImportRef.current ||
      localItemCount === 0
    ) {
      return;
    }
    askedImportRef.current = true;
    setImportPromptShown(true);
  }, [mode, ready, localItemCount]);

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

  async function handleSave(draft: ItemDraft, id?: string) {
    try {
      if (id) {
        await editItem(id, draft);
        setSelectedId(id);
      } else {
        const created = await addItem(draft);
        setSelectedId(created.id);
      }
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Ошибка сохранения");
    }
  }

  async function handleDelete() {
    if (!selected) return;
    if (!window.confirm(`Удалить «${selected.title}»?`)) return;
    const id = selected.id;
    try {
      await removeItem(id);
      setSelectedId(null);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Ошибка удаления");
    }
  }

  function handleImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      void (async () => {
        try {
          await importJson(String(reader.result ?? ""));
          setSelectedId(null);
        } catch (err) {
          window.alert(
            err instanceof Error
              ? err.message
              : "Не удалось импортировать JSON",
          );
        }
      })();
    };
    reader.readAsText(file);
  }

  async function handleImportLocal() {
    try {
      const count = await importLocalToCloud();
      setImportPromptShown(false);
      window.alert(
        count > 0
          ? `Импортировано записей: ${count}`
          : "Локальных записей не найдено",
      );
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Импорт не удался");
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand-block">
          <p className="brand">Cuebox</p>
          <p className="tagline">
            Сохраняйте промпты, подставляйте переменные и копируйте в любимый
            ИИ
          </p>
        </div>
        <div className="header-actions">
          <AuthStatus />
          {ready && mode === "local" ? (
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

      {mode === "local" ? (
        <p className="sync-banner">
          Сейчас данные только в этом браузере.{" "}
          <a href="/register">Создайте аккаунт</a>, чтобы синхронизировать
          библиотеку между устройствами.
        </p>
      ) : null}

      {importPromptShown ? (
        <div className="sync-banner action">
          <span>
            Найдены локальные записи ({localItemCount}). Импортировать их в
            облачную библиотеку?
          </span>
          <span className="banner-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void handleImportLocal()}
            >
              Импортировать
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setImportPromptShown(false)}
            >
              Позже
            </button>
          </span>
        </div>
      ) : null}

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
            onDelete={() => void handleDelete()}
          />
        </main>
      </div>

      <ItemEditor
        open={editorOpen}
        initial={editing}
        defaultKind={defaultKind}
        onClose={() => setEditorOpen(false)}
        onSave={(draft, id) => void handleSave(draft, id)}
      />
    </div>
  );
}
