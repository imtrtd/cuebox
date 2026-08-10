"use client";

import { useState } from "react";
import { itemPlainText } from "@/lib/storage";
import { KIND_LABELS, type LibraryItem } from "@/lib/types";

export function ItemDetail({
  item,
  onEdit,
  onDelete,
}: {
  item: LibraryItem | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!item) {
    return (
      <div className="detail-empty">
        <p className="detail-empty-brand">Cuebox</p>
        <p>Выберите элемент слева или создайте новый промпт, подсказку, задачу или чат.</p>
      </div>
    );
  }

  async function handleCopy() {
    const text = itemPlainText(item!);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="detail-panel">
      <header className="detail-head">
        <div>
          <span className={`kind-badge kind-${item.kind}`}>
            {KIND_LABELS[item.kind]}
          </span>
          <h2>{item.title}</h2>
        </div>
        <div className="detail-actions">
          <button type="button" className="btn btn-ghost" onClick={handleCopy}>
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
    </article>
  );
}
