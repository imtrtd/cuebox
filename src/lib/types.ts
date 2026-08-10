export type ItemKind = "prompt" | "tip" | "task" | "chat";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LibraryItem {
  id: string;
  kind: ItemKind;
  title: string;
  body: string;
  tags: string[];
  /** For kind === "chat" — optional structured transcript */
  messages?: ChatMessage[];
  favorite: boolean;
  collectionId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export type ItemDraft = Omit<
  LibraryItem,
  "id" | "createdAt" | "updatedAt" | "favorite"
> & {
  favorite?: boolean;
};

export const KIND_LABELS: Record<ItemKind, string> = {
  prompt: "Промпт",
  tip: "Подсказка",
  task: "Задача",
  chat: "Чат",
};

export const KIND_ORDER: ItemKind[] = ["prompt", "tip", "task", "chat"];

export function extractPlaceholders(text: string): string[] {
  const found = new Set<string>();
  const re = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    found.add(match[1]);
  }
  return [...found];
}

export function applyPlaceholders(
  text: string,
  values: Record<string, string>,
): string {
  return text.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, key: string) => {
    return values[key] ?? `{{${key}}}`;
  });
}
