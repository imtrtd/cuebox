"use client";

import { useMemo, useState } from "react";
import { useLibrary } from "@/lib/library-context";
import { itemPlainText } from "@/lib/storage";
import {
  applyPlaceholders,
  extractPlaceholders,
  KIND_LABELS,
  type LibraryItem,
} from "@/lib/types";

export function ItemDetail({
  item,
  onEdit,
  onDelete,
}: {
  item: LibraryItem | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { collections } = useLibrary();
  const [copied, setCopied] = useState(false);
  const [fillOpen, setFillOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  const placeholders = useMemo(
    () => (item ? extractPlaceholders(item.body) : []),
    [item],
  );

  const collectionName = item?.collectionId
    ? collections.find((c) => c.id === item.collectionId)?.name
    : null;

  if (!item) {
    return (
      <div className="detail-empty">
        <p className="detail-empty-brand">Cuebox</p>
        <p>
          Выберите элемент слева или создайте новый промпт, подсказку, задачу
          или чат.
        </p>
      </div>
    );
  }

  async function handleCopy(text?: string) {
    const payload = text ?? itemPlainText(item!);
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function openFill() {
    const next: Record<string, string> = {};
    for (const key of placeholders) {
      next[key] = values[key] ?? "";
    }
    setValues(next);
    setFillOpen(true);
  }

  const filled = applyPlaceholders(item.body, values);

  return (
    <article className="detail-panel">
      <header className="detail-head">
        <div>
          <span className={`kind-badge kind-${item.kind}`}>
            {KIND_LABELS[item.kind]}
          </span>
          {collectionName ? (
            <span className="collection-chip">{collectionName}</span>
          ) : null}
          <h2>{item.title}</h2>
        </div>
        <div className="detail-actions">
          {placeholders.length > 0 ? (
            <button type="button" className="btn btn-ghost" onClick={openFill}>
              Подставить
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => void handleCopy()}
          >
            {copied ? "Скопировано" : "Копировать"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onEdit}>
            Изменить
          </button>
          <button type="button" className="btn btn-danger" onClick={onDelete}>
            Удалить
          </button>
        </div>
      </header>

      {item.tags.length ? (
        <div className="tag-row detail-tags">
          {item.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {item.kind === "chat" && item.messages?.length ? (
        <div className="chat-thread">
          {item.body ? <p className="chat-summary">{item.body}</p> : null}
          {item.messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`chat-bubble role-${message.role}`}
            >
              <span className="chat-role">{message.role}</span>
              <p>{message.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <pre className="body-block">{item.body}</pre>
      )}

      {fillOpen ? (
        <div className="modal-root" role="presentation" onClick={() => setFillOpen(false)}>
          <div
            className="modal-panel"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-head">
              <h2>Подстановка переменных</h2>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setFillOpen(false)}
                aria-label="Закрыть"
              >
                ×
              </button>
            </header>
            <div className="editor-form">
              {placeholders.map((key) => (
                <label key={key} className="field">
                  <span>{`{{${key}}}`}</span>
                  <input
                    value={values[key] ?? ""}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                  />
                </label>
              ))}
              <pre className="body-block">{filled}</pre>
              <footer className="modal-foot">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setFillOpen(false)}
                >
                  Закрыть
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => void handleCopy(filled)}
                >
                  Копировать результат
                </button>
              </footer>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
