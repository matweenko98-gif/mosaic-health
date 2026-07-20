# Архитектура проекта «Мозаика Здоровья»

> **Назначение файла:** карта проекта — где что лежит и куда вносить изменения.
> Читать **до** правок, чтобы не искать по всем файлам. **Обновлять при каждом значимом изменении**
> (особенно разделы «Что подключено к серверу» и «Журнал изменений»).

---

## 1. Общая схема

```
Браузер → frontend (Vercel) → /api → backend (Render) → база (Supabase)
                                          ↓
                                   хранилище файлов (S3/MinIO) — в проде пока НЕ настроено
```

| Часть | Папка | Технологии | Где живёт в проде |
|---|---|---|---|
| Интерфейс | `frontend/` | React 19 + Vite, JS (не TS) | Vercel (автодеплой при push) |
| «Двигатель» | `backend/` | NestJS + Prisma, TypeScript | Render (**только Manual Deploy**) |
| База | — | PostgreSQL | Supabase (локально — Homebrew) |
| Файлы | — | S3-совместимое | локально MinIO; **в проде выключено** |

**Связка:** `vercel.json` в корне переадресует `/api/*` → `https://mosaic-health-backend.onrender.com/api/*`.
Поэтому фронт всегда ходит на относительный `/api` — и cookie остаются first-party.

**Локальная разработка:** backend на `:4000` (`npm run start:dev`), frontend на `:5173` (`npm run dev`, проксирует `/api` на `:4000`).

---

## 2. Backend — карта модулей

Все модули в `backend/src/`, подключаются в `app.module.ts`. Префикс всех маршрутов — `/api`.

| Модуль | Папка | За что отвечает |
|---|---|---|
| Auth | `auth/` | Регистрация, вход, refresh, роли. **Глобальные guard'ы** |
| Users | `users/` | Профиль `/me`, настройки, аватар |
| Exercises | `exercises/` | Каталог упражнений |
| History | `history/` | История тренировок, достижения |
| Programs | `programs/` | Индивидуальные программы, пациенты врача |
| Codes | `codes/` | **Коды доступа** (врач создаёт, пациент активирует) |
| Content | `content/` | Статьи и подкасты (+ админ-CRUD) |
| Shop | `shop/` | Товары, заказы (+ админ) |
| Admin | `admin/` | **Пользователи и смена ролей** |
| Storage | `storage/` | Подписанные ссылки на медиа (S3) |
| Mail | `mail/` | Отправка писем — **пока заглушка, пишет ссылки в лог** |
| Prisma | `prisma/` | `PrismaService` — доступ к базе |

### Ключевые механизмы авторизации (`auth/`)
- `guards/jwt-auth.guard.ts` — **глобальный**, проверяет токен. Пропускает `@Public()`.
- `guards/roles.guard.ts` — **глобальный**, проверяет `@Roles(...)`.
- Декораторы: `@Public()`, `@Roles(Role.ADMIN)`, `@CurrentUser()` / `@CurrentUser('id')`.
- Токены: access — в заголовке `Authorization: Bearer`; refresh — httpOnly cookie (path `/api/auth`).

---

## 3. Полный список эндпоинтов

| Метод + путь | Кто может | Файл |
|---|---|---|
| `GET /api/health` | все | `app.controller.ts` |
| `POST /api/auth/register` \| `login` \| `refresh` \| `logout` | все | `auth/auth.controller.ts` |
| `GET /api/auth/me` | вошедшие | `auth/auth.controller.ts` |
| `POST /api/auth/verify-email` \| `forgot-password` \| `reset-password` | все | `auth/auth.controller.ts` |
| `GET/PATCH /api/me` | вошедшие | `users/users.controller.ts` |
| `POST /api/me/avatar/upload-url`, `PATCH /api/me/avatar` | вошедшие | `users/users.controller.ts` |
| `GET/PATCH /api/me/settings` | вошедшие | `users/users.controller.ts` |
| `GET /api/exercises` | вошедшие | `exercises/exercises.controller.ts` |
| `GET /api/exercises/individual` | врач/админ | `exercises/exercises.controller.ts` |
| `GET /api/exercises/:id` | вошедшие | `exercises/exercises.controller.ts` |
| `GET/POST /api/me/history`, `GET /api/me/achievements` | вошедшие | `history/history.controller.ts` |
| `GET /api/me/programs`, `/:id`, `/:id/progress` (GET/PATCH) | пациент (свои) | `programs/patient-programs.controller.ts` |
| `GET /api/specialist/patients`, `POST/GET/PATCH/DELETE /api/specialist/programs` | врач/админ | `programs/specialist.controller.ts` |
| `GET/POST /api/specialist/codes`, `DELETE /api/specialist/codes/:id` | врач/админ | `codes/codes.controller.ts` |
| `GET /api/me/access`, `POST /api/me/activate-code` | вошедшие | `codes/codes.controller.ts` |
| `GET /api/articles`, `/:id`, `GET /api/podcasts`, `/:id` | вошедшие | `content/content.controller.ts` |
| `POST/PATCH/DELETE /api/admin/articles`, `/api/admin/podcasts` | админ | `content/content-admin.controller.ts` |
| `GET /api/products`, `/:id`, `POST /api/orders`, `GET /api/me/orders` | вошедшие | `shop/shop.controller.ts` |
| `GET /api/admin/orders`, `PATCH /api/admin/orders/:id`, `POST/PATCH/DELETE /api/admin/products` | админ | `shop/shop-admin.controller.ts` |
| `GET /api/admin/users`, `PATCH /api/admin/users/:id/role` | админ | `admin/admin.controller.ts` |
| `GET /api/media/sign` | вошедшие (с проверкой прав) | `storage/media.controller.ts` |
| `POST /api/media/upload-url` | врач/админ | `storage/media.controller.ts` |

---

## 4. Модель данных

Схема: `backend/prisma/schema.prisma`. Наполнение: `backend/prisma/seed.ts` (+ `exercises.json`).

| Таблица | Смысл |
|---|---|
| `User` | Пользователь: email, пароль (хэш), **role** (PATIENT/SPECIALIST/ADMIN), имя, телефон, возраст, страна, аватар |
| `UserSettings` | Напоминания, уведомления, язык |
| `EmailToken` | Токены подтверждения email и сброса пароля |
| `Exercise` | Упражнение: название, описание, длительность, категория, `videoKey`, `isIndividual` |
| `Program` / `ProgramItem` | Индивидуальная программа врача пациенту и её упражнения (с порядком) |
| `ProgramProgress` | Прогресс прохождения программы |
| `WorkoutLog` | Запись о выполненной тренировке (история) |
| `AccessCode` | **Код доступа**: `code` (5 букв), `label`, кто создал, кто активировал, когда |
| `Article` / `Podcast` | Материалы (текст статьи в `body`, абзацы разделены пустой строкой) |
| `Product` / `Order` / `OrderItem` | Магазин: товар (`imageKey`), заказ и его позиции |

**Роли:** `PATIENT` (по умолчанию при регистрации), `SPECIALIST` (врач), `ADMIN`.

---

## 5. Frontend — карта

| Файл | За что отвечает |
|---|---|
| `src/App.jsx` | **Центр**: глобальное состояние + `renderScreen()` (switch по `currentScreen`). Сюда добавлять новые экраны |
| `src/main.jsx` | Точка входа, оборачивает в `AuthProvider` |
| `src/context/AuthContext.jsx` | Сессия: `user`, `isLoggedIn`, `login`, `register`, `logout`, восстановление сессии при загрузке |
| `src/api/client.js` | Fetch-клиент: `api.get/post/patch/del`, токен в памяти, авто-refresh при 401 |
| `src/api/auth.js` | Функции входа/регистрации/выхода/восстановления сессии |
| `src/index.css` | ~1600 строк кастомных BEM-классов + CSS-переменные |
| `src/data/mockData.js` | Остатки моков (история пуста, настройки) |
| `src/data/countries.js` | Страны с флагами и телефонными кодами |

### Экраны (`src/screens/`) и их `currentScreen`-идентификаторы

| id | Файл | Примечание |
|---|---|---|
| `onboarding-video` | `OnboardingVideoScreen.jsx` | Первый экран, картинка-превью + кнопка входа |
| `onboarding-consent` | `OnboardingConsentScreen.jsx` | Дисклеймер (90 дней, `localStorage.consentDate`) |
| `login` / `register` | `LoginScreen.jsx` / `RegisterScreen.jsx` | Через сервер. Регистрация: 2 шага, флаги/коды стран |
| `home` | `HomeScreen.jsx` (~2500 строк) | Каталог, **ДЗ + окно активации кода**, плеер |
| `profile` | `ProfileScreen.jsx` (~1000 строк) | Профиль, достижения, история, вход в панели |
| `health-helpers` | `HealthHelpersScreen.jsx` | Масла/Омега-3, «Купить» → магазин/Добавки |
| `creator-materials` | `CreatorMaterialsScreen.jsx` | Статьи (модалка с текстом) + подкасты (плеер) — **с сервера** |
| `shop` / `cart` / `checkout` | `ShopScreen.jsx` / `CartScreen.jsx` / `CheckoutScreen.jsx` | Товары — **с сервера**; корзина/оформление — пока локально |
| `specialist-codes` | `SpecialistCodesScreen.jsx` | **Панель врача**: коды доступа |
| `admin` | `AdminScreen.jsx` | **Панель админа**: пользователи/товары/статьи/подкасты/заказы |

**Навигация:** роутера нет. `currentScreen` — строка, все экраны получают `onNavigate(id)`.
Нижнее меню (`components/BottomNav.jsx`) — только на `home` и `profile`.

### Компоненты
- `components/WorkoutModal.jsx` — плеер тренировки (реальное `<video>`, если у упражнения есть `video`).
- `components/BottomNav.jsx` — нижняя навигация.

---

## 6. ⚠️ Что подключено к серверу, а что ещё нет

| Область | Статус |
|---|---|
| Вход / регистрация / выход / роли | ✅ **сервер** |
| Коды доступа (врач ↔ пациент) | ✅ **сервер** |
| Доступ к ДЗ (`GET /me/access`) | ✅ **сервер** |
| Товары (чтение) | ✅ **сервер** |
| Статьи и подкасты (чтение) | ✅ **сервер** |
| Админка (пользователи, контент, товары, заказы) | ✅ **сервер** |
| **Профиль (сохранение имени/фото/данных)** | ❌ локально (`App.handleUserSave`) |
| **Настройки** | ❌ локально (`App.setSettings`) |
| **История тренировок и достижения** | ❌ локально (`App.handleWorkoutComplete`, считается в `ProfileScreen`) |
| **Корзина и оформление заказа** | ❌ локально (`CheckoutScreen` — `alert`) |
| **Содержимое ДЗ / каталог упражнений** | ❌ «зашито» в `HomeScreen.jsx` |
| Медиа (видео/аудио) | ❌ статикой в `frontend/public/demo-video.mp4` |

**Это главный остаток работы (остаток Фазы 8b).**

---

## 7. Где что менять — быстрый справочник

| Задача | Файлы |
|---|---|
| Добавить экран | `App.jsx` (импорт + `case` в `renderScreen`), новый файл в `src/screens/` |
| Новый эндпоинт | новый/существующий модуль в `backend/src/*`, подключить в `app.module.ts` |
| Изменить таблицу БД | `backend/prisma/schema.prisma` → `npm run prisma:migrate` → при необходимости `seed.ts` |
| Начальные данные (товары, статьи, коды, демо-аккаунты) | `backend/prisma/seed.ts` |
| Каталог упражнений | `backend/prisma/exercises.json` (сервер) и **`HomeScreen.jsx`** (пока фронт использует свой) |
| Роли/доступы к эндпоинту | декоратор `@Roles(...)` в контроллере |
| Стили | `frontend/src/index.css` + инлайн-стили в компонентах (Tailwind почти не используется) |
| Список стран/кодов | `frontend/src/data/countries.js` |
| Переадресация `/api` в проде | `vercel.json` |
| Настройка деплоя бэкенда | `render.yaml` (blueprint) — но сервис создан вручную, настройки в панели Render |

---

## 8. Деплой и окружения

| Что | Как обновляется |
|---|---|
| **Vercel** (фронт) | **Автоматически** при push в `main` |
| **Render** (бэкенд) | Auto-Deploy = `On Commit`. **Но срабатывает только если сервис подключён к репозиторию через GitHub.** Если сервис создан по публичной ссылке — уведомления от GitHub не приходят, и нужен либо **Manual Deploy**, либо **Deploy Hook** (Settings → Deploy → Deploy Hook) |
| **Supabase** (база) | Миграции и seed применяются **во время сборки Render** (`prisma migrate deploy && npm run db:seed`) |

> **Внимание:** бесплатный проект Supabase засыпает после ~недели простоя. Тогда сборка Render падает с ошибкой
> `FATAL: (ENOTFOUND) tenant/user ... not found`. Лечится кнопкой **Restore** в панели Supabase.

**Переменные окружения бэкенда** (`backend/.env.example`): `DATABASE_URL`, `DIRECT_URL` (на Render — одинаковые, прямое подключение 5432), `JWT_*`, `FRONTEND_URL`, `S3_*` (если не задан `S3_ENDPOINT` — медиа выключено, приложение не падает).

**Демо-аккаунты** (пароль `Demo12345`): `admin@mosaic.health`, `doctor@mosaic.health`, `patient@mosaic.health`.
**Демо-коды** (для свежей базы): `ALPHA` (активирован пациентом), `BRAVO` (свободный).

---

## 9. Особенности и подводные камни

- **Порт 4000** для бэкенда (3000 занят другим приложением на машине разработчика).
- **Коды доступа** — ровно 5 английских заглавных букв, генерируются в `codes/codes.service.ts`.
- **Один код — один аккаунт**: повторная активация другим пользователем → 409.
- **Локальная и прод-база разные**: аккаунты, созданные локально, в Supabase не появятся.
- **RLS в Supabase выключен** — это нормально: доступ проверяет бэкенд, браузер в базу напрямую не ходит.
- **Русский язык** — комментарии, тексты интерфейса, сообщения об ошибках.
- Мёртвые артефакты в репозитории (`Мозаика Здоровья 2.html`, `backup_headers/`) — не трогать, не восстанавливать.

---

## 10. Журнал изменений

| Дата | Что сделано |
|---|---|
| 2026-06-27 | Монорепо (`frontend/` + `backend/`), скелет NestJS + Prisma + PostgreSQL, seed из прототипа |
| 2026-06-27 | Авторизация email+пароль, JWT, роли PATIENT/SPECIALIST/ADMIN, глобальные guard'ы |
| 2026-06-27 | Профиль, настройки, каталог упражнений, история, достижения (сервер) |
| 2026-06-27 | Хранилище медиа (S3/MinIO) + подписанные ссылки с проверкой прав |
| 2026-06-27 | Индивидуальные программы + эндпоинты панели врача |
| 2026-06-27 | Статьи/подкасты + магазин (товары, заказы) + админ-эндпоинты |
| 2026-06-29 | Фронт: вход/регистрация через сервер (AuthContext, api-клиент, прокси Vite) |
| 2026-06-30 | Деплой: Vercel + Render + Supabase; `vercel.json` переадресация `/api` |
| 2026-07-01 | Регистрация: флаги и коды стран; видео в ДЗ; «Купить» → магазин/Добавки |
| 2026-07-01 | Профиль: система достижений, пустые состояния, смена фото на странице |
| 2026-07-01 | Статьи в модалке + плеер подкаста; **убран вход по коду `0000`** |
| 2026-07-01 | **Коды доступа**: модель `AccessCode`, панель врача, активация пациентом, 5 букв |
| 2026-07-01 | **Панель администратора**: пользователи и роли, товары, статьи, подкасты, заказы |
| 2026-07-01 | Магазин и материалы переведены на данные с сервера (тексты статей и фото товаров — в базе) |
