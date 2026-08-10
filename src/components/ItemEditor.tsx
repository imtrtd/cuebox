"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import type { ItemDraft, ItemKind, LibraryItem } from "@/lib/types";
import { KIND_LABELS, KIND_ORDER } from "@/lib/types";

interface ItemEditorProps {
  open: boolean;
  initial?: LibraryItem | null;
  defaultKind?: ItemKind;
  onClose: () => void;
  onSave: (draft: ItemDraft, id?: string) => void;
}

function buildInitialState(
  initial: LibraryItem | null | undefined,
  defaultKind: ItemKind,
) {
  if (initial) {
    return {
      kind: initial.kind,
      title: initial.title,
      body: initial.body,
      tags: initial.tags.join(", "),
      chatTranscript:
        initial.messages
          ?.map((m) => `${m.role}: ${m.content}`)
          .join("\n\n") ?? "",
    };
  }
  return {
    kind: defaultKind,
    title: "",
    body: "",
    tags: "",
    chatTranscript: "",
  };
}

function ItemEditorForm({
  initial,
  defaultKind,
  onClose,
  onSave,
}: {
  initial?: LibraryItem | null;
  defaultKind: ItemKind;
  onClose: () => void;
  onSave: (draft: ItemDraft, id?: string) => void;
}) {
  const titleId = useId();
  const seed = buildInitialState(initial, defaultKind);
  const [kind, setKind] = useState<ItemKind>(seed.kind);
  const [title, setTitle] = useState(seed.title);
  const [body, setBody] = useState(seed.body);
  const [tags, setTags] = useState(seed.tags);
  const [chatTranscript, setChatTranscript] = useState(seed.chatTranscript);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function parseChat(raw: string) {
    const blocks = raw
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .filter(Boolean);
    if (!blocks.length) return undefined;
    return blocks.map((block) => {
      const match = block.match(/^(user|assistant|system)\s*:\s*([\s\S]*)$/i);
      if (match) {
        return {
          role: match[1].toLowerCase() as "user" | "assistant" | "system",
          content: match[2].trim(),
        };
      }
      return { role: "user" as const, content: block };
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Укажите название");
      return;
    }
    if (!body.trim() && kind !== "chat") {
      setError("Добавьте текст");
      return;
    }
    if (kind === "chat" && !body.trim() && !chatTranscript.trim()) {
      setError("Добавьте описание или транскрипт чата");
      return;
    }

    const draft: ItemDraft = {
      kind,
      title,
      body: body || title,
      tags: tags
        .split(/[,;#]+/)
        .map((t) => t.trim())
        .filter(Boolean),
      messages: kind === "chat" ? parseChat(chatTranscript) : undefined,
      favorite: initial?.favorite,
    };

    onSave(draft, initial?.id);
    onClose();
  }

  return (
    <div className="modal-root" role="presentation" onClick={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-head">
          <h2 id={titleId}>{initial ? "Редактировать" : "Новый элемент"}</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </header>

        <form className="editor-form" onSubmit={handleSubmit}>
          <fieldset className="kind-picker">
            <legend>Тип</legend>
            <div className="kind-picker-row">
              {KIND_ORDER.map((k) => (
                <label key={k} className={kind === k ? "pill active" : "pill"}>
                  <input
                    type="radio"
                    name="kind"
                    value={k}
                    checked={kind === k}
                    onChange={() => setKind(k)}
                  />
                  {KIND_LABELS[k]}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="field">
            <span>Название</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Краткое имя для быстрого поиска"
              autoFocus
            />
          </label>

          <label className="field">
            <span>{kind === "chat" ? "Краткое описание" : "Текст"}</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={kind === "chat" ? 3 : 10}
              placeholder={
                kind === "prompt"
                  ? "Промпт с плейсхолдерами {{variable}}…"
                  : kind === "tip"
                    ? "Подсказка или best practice…"
                    : kind === "task"
                      ? "Общая задача для ассистента…"
                      : "О чём этот чат…"
              }
            />
          </label>

          {kind === "chat" ? (
            <label className="field">
              <span>Транскрипт (блоки user: / assistant: / system:)</span>
              <textarea
                value={chatTranscript}
                onChange={(e) => setChatTranscript(e.target.value)}
                rows={8}
                placeholder={"user: …\n\nassistant: …"}
                className="mono"
              />
            </label>
          ) : null}

          <label className="field">
            <span>Теги</span>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="engineering, docs, brand"
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <footer className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn-primary">
              Сохранить
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export function ItemEditor({
  open,
  initial,
  defaultKind = "prompt",
  onClose,
  onSave,
}: ItemEditorProps) {
  if (!open) return null;

  const formKey = initial?.id ?? `new-${defaultKind}`;

  return (
    <ItemEditorForm
      key={formKey}
      initial={initial}
      defaultKind={defaultKind}
      onClose={onClose}
      onSave={onSave}
    />
  );
}
