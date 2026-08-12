# Cuebox

Cuebox is a prompt library for individuals and small teams who want a clean place to store, organize, reuse, and sync AI working material. It combines prompt management, saved chats, reusable variables, prompt variants, usage tracking, and an Explore catalog in a lightweight Next.js app.

## Highlights

- **Multi-format library** for prompts, tips, tasks, and saved chats
- **Reusable variables** with `{{var}}` / `{var}` placeholders and typed inputs
- **Prompt variants** to keep multiple versions of the same idea
- **Collections** with nesting for structured organization in cloud mode
- **Favorites, archive, and usage tracking** for day-to-day retrieval
- **Explore catalog** with one-click import of ready-made examples
- **Local-first flow** with browser storage and optional cloud sync
- **Preset metadata** for local audio FX workflows such as reverb and drive
- **JSON import/export** for backup and migration

## Product overview

Cuebox is designed around two usage modes:

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

This is useful for storing structured prompt notes for reverb, drive, and similar audio processing setups. Preset metadata is persisted in both local and cloud mode.

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

- `http://localhost:3000`
- `http://localhost:3000/explore`

## Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Generate Prisma client and build the app |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Create and apply a development migration |
| `npm run db:deploy` | Apply existing migrations |

## Typical workflow

1. Create or import prompts in local mode.
2. Add variables, tags, variants, and optional preset metadata.
3. Sign in to switch to cloud mode.
4. Import local items into the cloud library when prompted.
5. Organize synced content into collections and reuse it across devices.

## Project structure

```text
src/
  app/              Next.js routes
  components/       UI building blocks and screens
  lib/              storage, API, sample data, and shared types
prisma/
  schema.prisma     database schema
  migrations/       Prisma migrations
```

## Notes

- Local mode stores data in the current browser only.
- Cloud mode enables authenticated persistence and collection management.
- The project is optimized for practical prompt management rather than full collaboration or workflow automation.
