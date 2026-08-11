# Cuebox

Личная библиотека промптов в духе **PromptCodex**: папки, переменные, варианты, каталог Explore, учёт копирований и облачная синхронизация.

## Возможности

- Типы: промпт, подсказка, задача, чат
- Папки/коллекции с вложенностью до 5 уровней
- Избранное и архив
- Модели ИИ (ChatGPT, Claude, Gemini, Copilot, Perplexity, Grok, DeepSeek)
- Переменные `{{var}}` / `{var}` типов text, dropdown, toggle, date + default values
- Варианты промпта (несколько версий тела)
- Explore-каталог готовых промптов с импортом в один клик
- Статистика копирований и сортировка по использованию
- Локальный режим (`localStorage`) и облако (аккаунт + Prisma/SQLite)
- Импорт/экспорт JSON

## Стек

- Next.js App Router + React + TypeScript
- Auth.js (credentials)
- Prisma + SQLite
- Tailwind CSS v4

## Быстрый старт

```bash
cp .env.example .env
npm install
npx prisma migrate deploy
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) и [http://localhost:3000/explore](http://localhost:3000/explore).

## Переменные окружения

| Переменная | Описание |
|------------|----------|
| `AUTH_SECRET` | Секрет Auth.js |
| `DATABASE_URL` | Prisma URL (`file:./dev.db`) |
| `AUTH_URL` | Публичный URL (production) |

## Ориентир UX

Функции библиотеки выровнены с PromptCodex (папки, typed variables, variants, explore, usage tracking), плюс облачный sync Cuebox.
