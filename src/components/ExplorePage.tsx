"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { AuthStatus } from "@/components/AuthStatus";
import { useLibrary } from "@/lib/library-context";
import { SAMPLE_CATEGORIES, SAMPLE_PROMPTS } from "@/lib/samples";
import { KIND_LABELS, type ItemDraft } from "@/lib/types";

export function ExplorePage() {
  const { status } = useSession();
  const { addItem, mode } = useLibrary();
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [imported, setImported] = useState<Record<string, boolean>>({});

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SAMPLE_PROMPTS.filter((sample) => {
      if (category !== "all" && sample.category !== category) return false;
      if (!q) return true;
      return (
        sample.title.toLowerCase().includes(q) ||
        sample.body.toLowerCase().includes(q) ||
        sample.tags.some((t) => t.includes(q))
      );
    });
  }, [category, query]);

  async function handleImport(sampleId: string) {
    const sample = SAMPLE_PROMPTS.find((s) => s.id === sampleId);
    if (!sample) return;
    const draft: ItemDraft = {
      kind: sample.kind,
      title: sample.title,
      body: sample.body,
      tags: [...sample.tags, "sample", sample.category.toLowerCase()],
      models: sample.models,
      variableDefs: sample.variableDefs ?? [],
      variants: [],
      archived: false,
      favorite: false,
      collectionId: null,
      messages:
        sample.kind === "chat"
          ? [
              {
                role: "user",
                content: "Как назвать приложение для библиотеки промптов?",
              },
              {
                role: "assistant",
                content: "Cuebox — короткая «коробка подсказок» для ИИ.",
              },
            ]
          : undefined,
    };
    try {
      await addItem(draft);
      setImported((prev) => ({ ...prev, [sampleId]: true }));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Импорт не удался");
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand-block">
          <p className="brand">
            <Link href="/" className="brand-link">
              Cuebox
            </Link>
          </p>
          <p className="tagline">
            Explore — каталог готовых промптов в духе PromptCodex
          </p>
        </div>
        <div className="header-actions">
          <Link href="/" className="btn btn-ghost">
            Библиотека
          </Link>
          <AuthStatus />
        </div>
      </header>

      {status !== "loading" && mode === "local" ? (
        <p className="sync-banner">
          Импорт идёт в локальную библиотеку браузера.{" "}
          <Link href="/register">Создайте аккаунт</Link>, чтобы сохранить в
          облаке.
        </p>
      ) : null}

      <section className="toolbar">
        <div className="toolbar-row">
          <label className="search-field">
            <span className="sr-only">Поиск</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по каталогу…"
              type="search"
            />
          </label>
        </div>
        <div className="kind-tabs">
          <button
            type="button"
            className={category === "all" ? "kind-tab active" : "kind-tab"}
            onClick={() => setCategory("all")}
          >
            Все
          </button>
          {SAMPLE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={category === cat ? "kind-tab active" : "kind-tab"}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <div className="explore-grid">
        {list.map((sample) => (
          <article key={sample.id} className="explore-card">
            <div className="item-row-top">
              <span className={`kind-badge kind-${sample.kind}`}>
                {KIND_LABELS[sample.kind]}
              </span>
              <span className="item-date">{sample.category}</span>
            </div>
            <h3>{sample.title}</h3>
            <p className="item-row-preview">{sample.body}</p>
            <div className="tag-row">
              {sample.models.map((model) => (
                <span key={model} className="tag">
                  {model}
                </span>
              ))}
            </div>
            <footer className="explore-card-foot">
              <button
                type="button"
                className="btn btn-primary"
                disabled={Boolean(imported[sample.id])}
                onClick={() => void handleImport(sample.id)}
              >
                {imported[sample.id] ? "Добавлено" : "Импортировать"}
              </button>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
