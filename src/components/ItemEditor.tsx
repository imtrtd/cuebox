"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { useLibrary } from "@/lib/library-context";
import type {
  ChatMessage,
  ItemDraft,
  ItemKind,
  LibraryItem,
} from "@/lib/types";
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
      collectionId: initial.collectionId ?? "",
      messages: initial.messages?.length
        ? initial.messages
        : [{ role: "user" as const, content: "" }],
    };
  }
  return {
    kind: defaultKind,
    title: "",
    body: "",
    tags: "",
    collectionId: "",
    messages: [{ role: "user" as const, content: "" }],
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
  const { collections, mode } = useLibrary();
  const seed = buildInitialState(initial, defaultKind);
  const [kind, setKind] = useState<ItemKind>(seed.kind);
  const [title, setTitle] = useState(seed.title);
  const [body, setBody] = useState(seed.body);
  const [tags, setTags] = useState(seed.tags);
  const [collectionId, setCollectionId] = useState(seed.collectionId);
  const [messages, setMessages] = useState<ChatMessage[]>(seed.messages);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function updateMessage(
    index: number,
    patch: Partial<ChatMessage>,
  ) {
    setMessages((prev) =>
      prev.map((msg, i) => (i === index ? { ...msg, ...patch } : msg)),
    );
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

    const cleanedMessages =
      kind === "chat"
        ? messages
            .map((m) => ({
              role: m.role,
              content: m.content.trim(),
            }))
            .filter((m) => m.content)
        : undefined;

    if (kind === "chat" && !body.trim() && !cleanedMessages?.length) {
      setError("Добавьте описание или сообщения чата");
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
      messages: cleanedMessages,
      favorite: initial?.favorite,
      collectionId: collectionId || null,
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
            <div className="chat-editor">
              <div className="chat-editor-head">
                <span>Сообщения</span>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() =>
                    setMessages((prev) => [
                      ...prev,
                      { role: "assistant", content: "" },
                    ])
                  }
                >
                  + Сообщение
                </button>
              </div>
              {messages.map((msg, index) => (
                <div key={index} className="chat-editor-row">
                  <select
                    value={msg.role}
                    onChange={(e) =>
                      updateMessage(index, {
                        role: e.target.value as ChatMessage["role"],
                      })
                    }
                  >
                    <option value="user">user</option>
                    <option value="assistant">assistant</option>
                    <option value="system">system</option>
                  </select>
                  <textarea
                    value={msg.content}
                    onChange={(e) =>
                      updateMessage(index, { content: e.target.value })
                    }
                    rows={3}
                    placeholder="Текст сообщения…"
                  />
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() =>
                      setMessages((prev) => prev.filter((_, i) => i !== index))
                    }
                    disabled={messages.length <= 1}
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {mode === "cloud" ? (
            <label className="field">
              <span>Коллекция</span>
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
              >
                <option value="">Без коллекции</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
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
