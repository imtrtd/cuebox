# Cuebox

Личная библиотека для хранения **промптов**, **подсказок**, **общих задач** и **чатов с ИИ** с синхронизацией между устройствами.

## Возможности

- Типы записей: промпт, подсказка, задача, чат
- Локальный режим (гость) на `localStorage`
- Облачный режим: аккаунт (email + пароль), библиотека в SQLite через Prisma
- Импорт локальных записей в облако после входа
- Поиск, фильтры по типу/коллекции, избранное, сортировка
- Коллекции, плейсхолдеры `{{variable}}`, редактор сообщений чата
- Импорт и экспорт JSON

## Стек

- Next.js (App Router) + React + TypeScript
- Auth.js (NextAuth v5) — credentials
- Prisma + SQLite
- Tailwind CSS v4

## Быстрый старт

```bash
cp .env.example .env
# задайте AUTH_SECRET (openssl rand -base64 32) и DATABASE_URL

npm install
npx prisma migrate deploy
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

## Переменные окружения

| Переменная | Описание |
|------------|----------|
| `AUTH_SECRET` | Секрет Auth.js |
| `DATABASE_URL` | Prisma URL, по умолчанию `file:./dev.db` |
| `AUTH_URL` | Публичный URL приложения (для production) |

## Синхронизация

1. Гость работает локально в браузере.
2. Регистрация / вход переключает UI в облачный режим.
3. Если в `localStorage` есть записи — предлагается импорт в облако.
4. На другом устройстве тот же аккаунт видит ту же библиотеку.

## API (авторизованные)

- `GET/POST /api/items`
- `PATCH/DELETE /api/items/[id]`
- `POST /api/items/import`
- `GET /api/items/export`
- `GET/POST /api/collections`
- `PATCH/DELETE /api/collections/[id]`

## Структура

```
prisma/          # схема и миграции
src/app/api/     # auth + items + collections
src/auth.ts      # Auth.js
src/components/  # UI
src/lib/         # prisma, storage, api client, types
```

## Postgres позже

Смените `provider` в `prisma/schema.prisma` на `postgresql`, обновите `DATABASE_URL`, выполните миграции — API менять не нужно.
