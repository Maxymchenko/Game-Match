# 🎮 GameMatch

Мобільний вебзастосунок, який підбирає відеоігри під платформи, жанри та бюджет користувача.

Користувач налаштовує вподобання, переглядає рекомендації, зберігає ігри та формує список «Хочу зіграти».

## Стек

- **Frontend:** React, TypeScript, Vite, React Router
- **Server state:** TanStack Query
- **Client state:** Zustand
- **Motion:** Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **Game catalog:** IGDB API через Supabase Edge Function
- **Quality:** ESLint, Prettier

## Архітектура

- React-клієнт використовує Supabase для авторизації та власних даних користувача.
- PostgreSQL зберігає профіль, вподобання та записи бібліотеки.
- RLS обмежує доступ до профілю, вподобань і бібліотеки власником акаунта.
- IGDB credentials зберігаються лише в Supabase Edge Function secrets. Вони ніколи не потрапляють у браузер.
- У бібліотеці зберігається IGDB game ID, а не дубль усіх даних каталогу.

## Структура

```
src/
  api/                 # Supabase Auth, preferences, library, IGDB client
  features/            # onboarding, deck, library, search, profile
  hooks/               # React hooks
  store/               # Zustand stores
  types/               # shared TypeScript types
  pages/
supabase/
  migrations/          # PostgreSQL schema + RLS
  functions/igdb/      # server-side IGDB proxy
```

## Налаштування локально

Потрібні Node.js 20.19+ або 22.12+, npm та Supabase CLI для локального запуску Edge Functions.

```
npm ci
Copy-Item .env.example .env
npm run dev
```

У кореневому .env заповни лише публічні налаштування Supabase:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY (або publishable key, якщо проєкт його використовує)

Не додавай до кореневого .env Twitch Client Secret чи IGDB access token.

## Налаштування Supabase

1. Створи Supabase project і прив'яжи локальний проєкт через Supabase CLI.
2. Застосуй міграції: supabase db push.
3. Для локального запуску Edge Function створи локальний файл секретів:

```
Copy-Item supabase/functions/.env.example supabase/functions/.env
```

Заповни TWITCH_CLIENT_ID і TWITCH_CLIENT_SECRET у supabase/functions/.env, після чого запусти:

```
supabase functions serve igdb
```

4. Для production задай ті самі секрети в Supabase:

```
supabase secrets set TWITCH_CLIENT_ID=... TWITCH_CLIENT_SECRET=... APP_ORIGIN=https://your-domain.example
supabase functions deploy igdb
```

Локальний файл supabase/functions/.env ігнорується Git. Не коміть його та не вставляй секрети у frontend.

Функція igdb вимагає валідну Supabase-сесію. Вона отримує Twitch app access token на сервері та проксуює запити до https://api.igdb.com/v4/games. Режим popular повертає ігри з рейтингом IGDB для колоди, а режим search виконує пошук за назвою. Дані каталогу проходять через src/api/igdb.ts; Twitch Client Secret та access token не потрапляють у браузер.

## Команди

```
npm run dev
npm run build
npm run lint
npm run format:check
```

## Модель даних

- **profiles:** профіль, пов'язаний з auth.users.
- **preferences:** платформи, жанри, бюджет, підписки.
- **library_entries:** IGDB ID, статус гри та ознака superlike.

Статуси бібліотеки: skipped, saved, want_to_play, playing, completed, owned.

## Безпека

- Усі таблиці користувацьких даних мають увімкнений Row Level Security.
- Користувацькі запити перевіряються за auth.uid().
- Не використовуй service-role key, Twitch Client Secret або IGDB token у frontend.
