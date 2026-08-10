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
