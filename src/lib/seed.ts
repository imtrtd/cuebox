import type { LibraryItem } from "./types";

export const STORAGE_KEY = "cuebox.library.v1";

export const SEED_ITEMS: LibraryItem[] = [
  {
    id: "seed-prompt-1",
    kind: "prompt",
    title: "Редактор кода: ревью PR",
    body: `Ты — senior-инженер. Проведи ревью pull request.

Контекст:
- Язык / стек: {{stack}}
- Цель изменений: {{goal}}

Правила:
1. Сначала краткий вердикт (approve / request changes / needs discussion).
2. Затем список рисков по приоритету.
3. Предложи конкретные правки с примерами кода.
4. Не переписывай весь PR — только точечные улучшения.`,
    tags: ["code-review", "engineering"],
    favorite: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "seed-tip-1",
    kind: "tip",
    title: "Как писать переменные в промпте",
    body: `Используйте явные плейсхолдеры вида {{variable}} — так проще искать и подставлять значения.

Хорошая практика:
- одно слово или snake_case внутри скобок;
- рядом с плейсхолдером кратко опишите ожидаемый формат;
- не смешивайте {{}} с другим синтаксисом шаблонов в одном промпте.`,
    tags: ["craft", "templates"],
    favorite: false,
    createdAt: "2026-08-02T12:00:00.000Z",
    updatedAt: "2026-08-02T12:00:00.000Z",
  },
  {
    id: "seed-task-1",
    kind: "task",
    title: "Набросать структуру README",
    body: `Общая задача для ИИ-ассистента:

1. Прочитать описание продукта Cuebox.
2. Составить оглавление README (установка, запуск, модель данных, roadmap).
3. Написать черновик на русском, короткий и практичный.
4. Вынести открытые вопросы в конец.`,
    tags: ["docs", "bootstrap"],
    favorite: false,
    createdAt: "2026-08-03T09:30:00.000Z",
    updatedAt: "2026-08-03T09:30:00.000Z",
  },
  {
    id: "seed-chat-1",
    kind: "chat",
    title: "Имя и позиционирование продукта",
    body: "Короткий общий чат про бренд Cuebox — библиотека промптов и чатов.",
    tags: ["brand", "product"],
    favorite: true,
    messages: [
      {
        role: "user",
        content:
          "Нужно имя для приложения, которое хранит промпты, подсказки, задачи и чаты с ИИ. Хочу короткое и запоминающееся.",
      },
      {
        role: "assistant",
        content:
          "Cuebox — «коробка подсказок». Коротко, легко произносится, сразу намекает на коллекцию готовых cues для работы с ИИ.",
      },
      {
        role: "user",
        content: "Ок, берём Cuebox. Какой однострочный слоган?",
      },
      {
        role: "assistant",
        content:
          "Cuebox — личная библиотека промптов, задач и чатов с ИИ.",
      },
    ],
    createdAt: "2026-08-04T15:00:00.000Z",
    updatedAt: "2026-08-04T15:20:00.000Z",
  },
];
