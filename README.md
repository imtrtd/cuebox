# Cuebox

Cuebox is a focused library for reusable prompts, instructions, saved chats, and structured working notes. It gives individuals and small teams a clean place to capture material, organize it into collections, add variables and variants, and move between local browser storage and a synced account library.

Live app: [https://cuebox-liart.vercel.app](https://cuebox-liart.vercel.app)

## Highlights

- Save prompts, tips, tasks, and chat-style notes
- Organize cloud items into nested collections
- Use reusable placeholders such as `{{goal}}` or `{tone}`
- Keep multiple variants of the same entry
- Track favorites, archive state, copy count, and last-used dates
- Import sample content from the Explore catalog
- Export and import JSON for backup or migration
- Work locally first, then sign in when sync is needed

## Product shape

Cuebox supports two storage modes.

| Mode | Storage | Use case |
| --- | --- | --- |
| Local | Browser `localStorage` | Fast capture, demos, personal drafts |
| Cloud | PostgreSQL through Prisma | Account-based sync and persistent collections |

The main interface is built around a searchable library, item detail view, editor, collection sidebar, Explore catalog, and account controls.

## Tech stack

- Next.js 16 App Router
- React 19 and TypeScript
- Auth.js credentials authentication
- Prisma with PostgreSQL
- Tailwind CSS v4
- Vercel deployment

## Data model

Cloud mode stores three main records.

| Model | Purpose |
| --- | --- |
| `User` | Account and authentication data |
| `Collection` | Folder-style organization scoped to a user |
| `LibraryItem` | Saved prompt, tip, task, or chat entry |

`LibraryItem` stores the main body plus JSON-backed arrays for tags, models, variables, variants, messages, and optional preset metadata.

## Getting started

Use Node.js 20 or newer.

```bash
cp .env.example .env
npm install
```

Set the environment variables in `.env`.

| Variable | Description |
| --- | --- |
| `AUTH_SECRET` | Secret used by Auth.js sessions |
| `AUTH_URL` | Public app URL in production |
| `DATABASE_URL` | Pooled PostgreSQL connection string |
| `DATABASE_URL_UNPOOLED` | Direct PostgreSQL connection string for migrations |

For local PostgreSQL with Docker:

```bash
docker compose up -d
npm run db:deploy
```

Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Generate Prisma client and build the app |
| `npm run vercel-build` | Run production migrations, then build for Vercel |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Create and apply a development migration |
| `npm run db:deploy` | Apply committed migrations |
| `npm run build:catalog` | Rebuild the Explore catalog from source data |

## Deployment

Vercel uses `npm run vercel-build`. Production migrations run only when `VERCEL_ENV` is `production`, so preview deployments do not mutate the production database.

Production must define a fresh `AUTH_SECRET`, `AUTH_URL`, `DATABASE_URL`, and `DATABASE_URL_UNPOOLED` in the Vercel project settings.

## Security baseline

- Security headers are configured in `next.config.ts`.
- Registration and import endpoints reject oversized payloads.
- Import replacement runs transactionally to avoid partial data loss.
- Dependabot is configured for weekly dependency updates.
- GitHub quality checks are present for lint and build when repository Actions are enabled.

## Repository layout

```text
src/app/          Next.js routes and API handlers
src/components/   Interface components
src/lib/          Storage, mapping, sample data, and shared helpers
src/types/        Type augmentation
prisma/           Schema and migrations
scripts/          Build and deployment helpers
data/             Catalog source data
```

## Notes

Local mode is browser-only. Cloud mode is account-based and scoped by user ownership checks on the server routes.
