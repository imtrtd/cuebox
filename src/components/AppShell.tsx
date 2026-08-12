"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AuthStatus } from "@/components/AuthStatus";
import { HomeDashboard } from "@/components/HomeDashboard";
import { ItemDetail } from "@/components/ItemDetail";
import { ItemEditor } from "@/components/ItemEditor";
import { ItemList } from "@/components/ItemList";
import { SiteNav, type AppView } from "@/components/SiteNav";
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
  const [view, setView] = useState<AppView>(() => {
    if (typeof window === "undefined") return "home";
    const params = new URLSearchParams(window.location.search);
    const nextView = params.get("view");
    if (nextView === "library" || nextView === "home") return nextView;
    if (params.get("create") === "1") return "library";
    return "home";
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("create") === "1";
  });
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

  function openItem(item: LibraryItem) {
    setSelectedId(item.id);
    setView("library");
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
      setView("library");
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
          setView("library");
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
          <div className="brand-row">
            <span className="brand-mark" aria-hidden>
              <svg viewBox="0 0 32 32" fill="none">
                <rect
                  x="4"
                  y="4"
                  width="24"
                  height="24"
                  rx="8"
                  fill="url(#cuebox-mark)"
                />
                <path
                  d="M11 16.5h10M16 11.5v10"
                  stroke="#f5fffb"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient
                    id="cuebox-mark"
                    x1="4"
                    y1="4"
                    x2="28"
                    y2="28"
                  >
                    <stop stopColor="#0f6b5c" />
                    <stop offset="1" stopColor="#0a4f44" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <p className="brand">Cuebox</p>
          </div>
          <p className="tagline">
            {view === "home"
              ? "Обзор библиотеки — статистика, сервисы и быстрый доступ"
              : "Папки, переменные, варианты и синхронизация в одном месте"}
          </p>
        </div>

        <SiteNav
          active={view}
          onNavigate={setView}
          onCreate={() => openCreate("prompt")}
        />

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

      {view === "home" ? (
        <HomeDashboard
          onOpenItem={openItem}
          onOpenLibrary={() => setView("library")}
          onCreate={() => openCreate("prompt")}
        />
      ) : (
        <>
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
              <div className="pane-label">Библиотека</div>
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
        </>
      )}

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
