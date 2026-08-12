# Cuebox

Cuebox is a prompt library for individuals and small teams who want a clean place to store, organize, reuse, and sync AI working material. It combines prompt management, saved chats, reusable variables, prompt variants, usage tracking, and an Explore catalog in a lightweight Next.js app.

## Highlights

- Типы: промпт, подсказка, задача, чат
- Папки/коллекции с вложенностью до 5 уровней
- Избранное и архив
- Модели ИИ (ChatGPT, Claude, Gemini, Copilot, Perplexity, Grok, DeepSeek)
- Переменные `{{var}}` / `{var}` типов text, dropdown, toggle, date + default values
- Варианты промпта (несколько версий тела)
- Explore-каталог готовых промптов с импортом в один клик
- Статистика копирований и сортировка по использованию
- Локальный режим (`localStorage`) и облако (аккаунт + Prisma/PostgreSQL)
- Импорт/экспорт JSON

## Product overview

- Next.js App Router + React + TypeScript
- Auth.js (credentials)
- Prisma + PostgreSQL
- Tailwind CSS v4

| Mode | Storage | Best for |
| --- | --- | --- |
| Local | `localStorage` in the current browser | Fast personal use, demos, offline-style capture |
| Cloud | SQLite via Prisma + authenticated account | Sync across devices, collections, persistent account data |

The main library experience includes:

- a searchable sidebar of saved items
- a detail view for reading and copying content
- an editor for creating prompts, chats, variables, tags, and metadata
- an Explore page for importing starter content

## Tech stack

- **Framework:** Next.js 16 App Router
- **UI:** React 19 + TypeScript
- **Auth:** Auth.js credentials flow
- **Database:** Prisma + SQLite
- **Styling:** Tailwind CSS v4

## Core capabilities

### Library items

Cuebox supports four item types:

- **Prompt**
- **Tip**
- **Task**
- **Chat**

Each item can include tags, supported AI models, favorites state, archive state, and usage statistics.

### Variables and variants

Prompts can define placeholders such as `{{goal}}` or `{tone}` and attach structured variable definitions:

- `text`
- `dropdown`
- `toggle`
- `date`

Items can also contain multiple variants, making it easier to iterate on prompt phrasing without duplicating the whole entry.

### Explore catalog

The Explore page provides sample content that users can import into their own library with one click. This helps bootstrap new libraries with practical prompts for writing, coding, analytics, product work, and audio preset workflows.

### Audio preset metadata

Cuebox also supports lightweight metadata for effect-oriented prompt workflows, including:

- plugin name
- plugin type
- source
- BPM
- key

This is useful for storing structured prompt notes for local reverb, drive, and similar audio processing setups.

## Data model

The app stores three primary entities in cloud mode:

| Model | Purpose |
| --- | --- |
| `User` | Account and authentication record |
| `Collection` | Nested folder-style organization |
| `LibraryItem` | Saved prompt, tip, task, or chat |

`LibraryItem` stores the main content plus serialized arrays for tags, models, variables, variants, and optional chat messages.

## Getting started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
cp .env.example .env
# поднимите Postgres (нужен Docker):
docker compose up -d
npm install
```

### Configure environment

Set the following variables in `.env`:

| Variable | Description |
| --- | --- |
| `AUTH_SECRET` | Secret used by Auth.js |
| `DATABASE_URL` | Prisma database URL, for example `file:./dev.db` |
| `AUTH_URL` | Public application URL for production deployments |

### Prepare the database

```bash
npx prisma migrate deploy
```

For local schema development:

```bash
npm run db:migrate
```

### Run the app

```bash
npm run dev
```

Open:

Без Docker можно указать любой `DATABASE_URL` (Neon, Supabase, Vercel Postgres) в `.env`.

## Переменные окружения

| Переменная | Описание |
|------------|----------|
| `AUTH_SECRET` | Секрет Auth.js (`openssl rand -base64 32`) |
| `DATABASE_URL` | PostgreSQL URL для Prisma |
| `AUTH_URL` | Публичный URL приложения (production) |

## Деплой (Vercel)

1. Создайте Postgres (Neon / Supabase / Vercel Postgres) и скопируйте connection string в `DATABASE_URL`
2. Import репозитория на [vercel.com/new](https://vercel.com/new)
3. Env: `AUTH_SECRET`, `DATABASE_URL`, `AUTH_URL=https://<your-app>.vercel.app`
4. Build уже запускает `prisma migrate deploy` — схема применится при деплое

## Notes

- Local mode stores data in the current browser only.
- Cloud mode enables authenticated persistence and collection management.
- The project is optimized for practical prompt management rather than full collaboration or workflow automation.
