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
- Локальный режим (`localStorage`) и облако (аккаунт + Prisma/PostgreSQL)
- Импорт/экспорт JSON

## Стек

- Next.js App Router + React + TypeScript
- Auth.js (credentials)
- Prisma + PostgreSQL
- Tailwind CSS v4

## Быстрый старт

```bash
cp .env.example .env
# поднимите Postgres (нужен Docker):
docker compose up -d
npm install
npx prisma migrate deploy
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) и [http://localhost:3000/explore](http://localhost:3000/explore).

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

## Ориентир UX

Функции библиотеки выровнены с PromptCodex (папки, typed variables, variants, explore, usage tracking), плюс облачный sync Cuebox.
