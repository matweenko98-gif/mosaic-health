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
| Payments | `payments/` | **Онлайн-оплата**: абстракция `PaymentProvider` + `StripeProvider` (Дубай/Черногория) и `YookassaProvider` (Россия). Выбор через `PAYMENTS_PROVIDER`, валюта — `STORE_CURRENCY`. За флагом `PAYMENTS_ENABLED` |
| Notifications | `notifications/` | **Уведомления**: лента «колокольчика» + web-push (PWA). Глобальный модуль |
| Mail | `mail/` | Отправка писем — **пока заглушка, пишет ссылки в лог** |
| Prisma | `prisma/` | `PrismaService` — доступ к базе |

`Exercises` теперь включает **админ-CRUD упражнений** (`exercises/exercises-admin.controller.ts`).
Глобальный перехват ошибок — `common/all-exceptions.filter.ts` (подключён в `main.ts`).

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
| `GET/POST /api/specialist/codes`, `DELETE /api/specialist/codes/:id`, `POST /api/specialist/codes/:id/revoke` | врач/админ | `codes/codes.controller.ts` |
| `POST/PATCH/DELETE /api/admin/exercises` | админ | `exercises/exercises-admin.controller.ts` |
| `GET /api/me/access`, `POST /api/me/activate-code` | вошедшие | `codes/codes.controller.ts` |
| `GET /api/articles`, `/:id`, `GET /api/podcasts`, `/:id` | вошедшие | `content/content.controller.ts` |
| `POST/PATCH/DELETE /api/admin/articles`, `/api/admin/podcasts` | админ | `content/content-admin.controller.ts` |
| `GET /api/products`, `/:id`, `POST /api/orders`, `GET /api/me/orders` | вошедшие | `shop/shop.controller.ts` |
| `GET /api/admin/orders`, `PATCH /api/admin/orders/:id`, `POST/PATCH/DELETE /api/admin/products` | админ | `shop/shop-admin.controller.ts` |
| `GET /api/admin/users`, `PATCH /api/admin/users/:id/role` | админ | `admin/admin.controller.ts` |
| `GET /api/media/sign` | вошедшие (с проверкой прав) | `storage/media.controller.ts` |
| `POST /api/media/upload-url` | врач/админ | `storage/media.controller.ts` |
| `GET /api/payments/config` | все | `payments/payments.controller.ts` |
| `POST /api/payments/create`, `POST /api/payments/create-homework` | вошедшие | `payments/payments.controller.ts` |
| `POST /api/payments/webhook/stripe` \| `yookassa` | все (webhook провайдера) | `payments/payments.controller.ts` |
| `GET /api/push/vapid-public-key` | все | `notifications/notifications.controller.ts` |
| `POST /api/me/push/subscribe` \| `unsubscribe` | вошедшие | `notifications/notifications.controller.ts` |
| `GET /api/me/notifications`, `PATCH /api/me/notifications/read-all`, `PATCH /api/me/notifications/:id/read` | вошедшие | `notifications/notifications.controller.ts` |
| `GET /api/contacts` | все | `contacts/contacts.controller.ts` |
| `POST/PATCH/DELETE /api/admin/contacts` | админ | `contacts/contacts-admin.controller.ts` |

---

## 4. Модель данных

Схема: `backend/prisma/schema.prisma`. Наполнение: `backend/prisma/seed.ts` (+ `exercises.json`).

| Таблица | Смысл |
|---|---|
| `User` | Пользователь: email, пароль (хэш), **role** (PATIENT/SPECIALIST/ADMIN), имя, телефон, возраст, страна, аватар, **homeworkPaidUntil** (оплата ДЗ) |
| `UserSettings` | Напоминания, уведомления, язык |
| `EmailToken` | Токены подтверждения email и сброса пароля |
| `Exercise` | Упражнение: **двуязычные** `title_ru/title_en`, `description_ru/description_en`, длительность, категория, `videoKey`, `isIndividual` |
| `Program` / `ProgramItem` | Индивидуальная программа врача пациенту и её упражнения (с порядком) |
| `ProgramProgress` | Прогресс прохождения программы |
| `WorkoutLog` | Запись о выполненной тренировке (история) |
| `AccessCode` | **Код доступа**: `code` (5 букв), `label`, кто создал, кто активировал (`activatedById`), когда. Можно отозвать |
| `Article` / `Podcast` | Материалы: **двуязычные** `title_ru/title_en`, `description_ru/description_en`, у статьи `body_ru/body_en` |
| `Product` / `Order` / `OrderItem` | Магазин: товар **двуязычный** (`name_ru/name_en`, `description_ru/description_en`, `imageKey`), заказ и его позиции. У `Order` — **type** (`PRODUCT` / `HOMEWORK_SUBSCRIPTION`), `currency`, `paymentProvider`, `paymentId`, `paidAt`; статусы `NEW → PENDING_PAYMENT → PAID → CONFIRMED → SHIPPED → CANCELLED` |
| `Notification` | Уведомление пользователю (лента «колокольчика»), двуязычное, поле `data` (JSON) для навигации, `readAt` |
| `PushSubscription` | Подписка браузера/устройства на web-push (`endpoint`, `p256dh`, `auth`) |
| `ContactBranch` | **Контакты и филиалы**: двуязычные `city_ru/city_en`, `address_ru/address_en`, `phone`, `whatsapp`, `workHours_ru/workHours_en`, `sortOrder` |

**Роли:** `PATIENT` (по умолчанию при регистрации), `SPECIALIST` (врач), `ADMIN`.

> **⚠️ Двуязычность (RU/EN):** контент-таблицы (Exercise, Article, Podcast, Product) хранят поля на двух языках
> (`*_ru` / `*_en`). Фронтенд выбирает язык через `useLanguage()` и показывает нужную версию.
> При добавлении контентного поля заводи обе версии.
> Часть админки прячет доп. параметры (публикация, наличие, картинка) внутри `description_*` как JSON —
> фронтенд это распаковывает (см. `ShopScreen.jsx`, `CreatorMaterialsScreen.jsx`).

---

## 5. Frontend — карта

| Файл | За что отвечает |
|---|---|
| `src/App.jsx` | **Центр**: глобальное состояние + `renderScreen()` (switch по `currentScreen`). Сюда добавлять новые экраны |
| `src/main.jsx` | Точка входа, оборачивает в `AuthProvider` |
| `src/context/AuthContext.jsx` | Сессия: `user`, `isLoggedIn`, `login`, `register`, `logout`, восстановление сессии при загрузке |
| `src/context/LanguageContext.jsx` | **Язык RU/EN**: хук `useLanguage()` → `t()` (перевод) и `currentLang` |
| `src/lib/translations.js` | Словарь переводов интерфейса (RU/EN) |
| `src/api/client.js` | Fetch-клиент: `api.get/post/patch/del`, токен в памяти, авто-refresh при 401 |
| `src/api/auth.js` | Функции входа/регистрации/выхода/восстановления сессии |
| `src/index.css` | ~1600 строк кастомных BEM-классов + CSS-переменные |
| `src/data/mockData.js` | Остатки моков (история пуста, настройки) |
| `src/data/originalExercises.js` | Исходный каталог упражнений (фронт) |
| `src/data/countries.js` | Страны с флагами и телефонными кодами |

### Экраны (`src/screens/`) и их `currentScreen`-идентификаторы

| id | Файл | Примечание |
|---|---|---|
| `role-selector` | `RoleSelectorScreen.jsx` | Экран выбора роли (bento-режим) |
| `onboarding-video` | `OnboardingVideoScreen.jsx` | Первый экран, картинка-превью + кнопка входа |
| `onboarding-consent` | `OnboardingConsentScreen.jsx` | Дисклеймер (90 дней, `localStorage.consentDate`) |
| `login` / `register` | `LoginScreen.jsx` / `RegisterScreen.jsx` | Через сервер. Регистрация: 2 шага, флаги/коды стран |
| `home` | `HomeScreen.jsx` (~2500 строк) | Каталог, **ДЗ + окно активации кода**, плеер |
| `profile` | `ProfileScreen.jsx` (~1000 строк) | Профиль, достижения, история, вход в панели |
| `health-helpers` | `HealthHelpersScreen.jsx` | Масла/Омега-3, «Купить» → магазин/Добавки |
| `creator-materials` | `CreatorMaterialsScreen.jsx` | Статьи (модалка с текстом) + подкасты (плеер) — **с сервера** |
| `shop` / `cart` / `checkout` | `ShopScreen.jsx` / `CartScreen.jsx` / `CheckoutScreen.jsx` | Товары — **с сервера**; оформление создаёт заказ на сервере и, если `PAYMENTS_ENABLED`, ведёт на оплату ЮKassa |
| `payment-result` | `PaymentResultScreen.jsx` | Возврат после оплаты (ЮKassa `return_url` → `/?screen=payment-result&order=…`), опрашивает статус заказа |
| `specialist-codes` | `SpecialistCodesScreen.jsx` | **Панель врача**: коды доступа |
| `admin` | `AdminScreen.jsx` | **Панель админа**: пользователи/товары/статьи/подкасты/заказы |

**Навигация:** роутера нет. `currentScreen` — строка, все экраны получают `onNavigate(id)`.
Нижнее меню (`components/BottomNav.jsx`) — только на `home` и `profile`.

### Компоненты
- `components/WorkoutModal.jsx` — плеер тренировки (реальное `<video>`, если у упражнения есть `video`).
- `components/BottomNav.jsx` — нижняя навигация.
- `components/NotificationBell.jsx` — «колокольчик»: лента уведомлений с сервера + включение push.
- `components/InstallPrompt.jsx` — баннер «Установить приложение» (PWA; на iOS — подсказка).
- `src/pwa.js` — регистрация service worker'а (`public/sw.js`) и подписка на web-push.

**PWA:** `public/manifest.webmanifest`, `public/sw.js` (офлайн-оболочка + приём push), иконки `public/icon-192.png`/`icon-512.png`/`apple-touch-icon.png`. SW регистрируется только в собранной версии (`import.meta.env.PROD`).

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
| **Оформление заказа** | ✅ **сервер** (`POST /orders`); корзина — локально до оформления |
| **Онлайн-оплата (ЮKassa)** | ✅ **сервер** — код готов, за флагом `PAYMENTS_ENABLED`; «боевой» запуск — после переезда на постоянный сервер (webhook) |
| **Уведомления (лента + web-push)** | ✅ **сервер** — код готов; push шлётся при заданных VAPID-ключах |
| **Содержимое ДЗ / каталог упражнений** | ❌ «зашито» в `HomeScreen.jsx` |
| Медиа (видео/аудио) | ❌ статикой в `frontend/public/demo-video.mp4` |

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
| **Render** (бэкенд) | **ВРУЧНУЮ**: Manual Deploy → Deploy latest commit (репозиторий чужой → автодеплой не настроен) |
| **Supabase** (база) | Миграции и seed применяются **во время сборки Render** (`prisma migrate deploy && npm run db:seed`) |

**Переменные окружения бэкенда** (`backend/.env.example`): `DATABASE_URL`, `DIRECT_URL` (на Render — одинаковые, прямое подключение 5432), `JWT_*`, `FRONTEND_URL`, `S3_*` (если не задан `S3_ENDPOINT` — медиа выключено, приложение не падает), `PAYMENTS_ENABLED` (оплата; при `false` — выключена), `PAYMENTS_PROVIDER` (`stripe`/`yookassa`), `STORE_CURRENCY` (`AED`/`EUR`/`RUB`), `STRIPE_SECRET_KEY`, `YOOKASSA_*`, `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`/`VAPID_SUBJECT` (web-push; без ключей push выключен, остаётся лента).

**Демо-аккаунты** (пароль `Demo12345`): `admin@mosaic.health`, `doctor@mosaic.health`, `patient@mosaic.health`.
**Демо-коды** (для свежей базы): `ALPHA` (активирован пациентом), `BRAVO` (свободный).

---

## 9. Особенности и подводные камни

- **Порт 4000** для бэкенда (3000 занят другим приложением на машине разработчика).
- **Коды доступа** — ровно 5 английских заглавных букв, генерируются в `codes/codes.service.ts`.
- **Один код — один аккаунт**: повторная активация другим пользователем → 409.
- **Локальная и прод-база разные**: аккаунты, созданные локально, в Supabase не появятся.
- **RLS в Supabase выключен** — это нормально: доступ проверяет бэкенд, браузер в базу напрямую не ходит.
- **Оплата за флагом `PAYMENTS_ENABLED`**: пока `false` — `CheckoutScreen` оформляет заказ по старой схеме («специалист свяжется»). Webhook требует постоянно включённого сервера — «боевой» запуск после переезда с бесплатного хостinga на VPS.
- **Две кассы, не заменяют друг друга**: Stripe (юрлицо ОАЭ) обслуживает Дубай/Черногорию, но **не проводит российские карты** (санкции) → для России отдельная касса ЮKassa (ООО). Активный провайдер задаётся `PAYMENTS_PROVIDER`; статус платежа всегда перепроверяется запросом к API провайдера (телу webhook не доверяем).
- **Web-push и «установка» на iOS**: push на iPhone работает только после добавления приложения на экран «Домой». Ключи VAPID генерируются `npx web-push generate-vapid-keys`; при их отсутствии остаётся лента «колокольчика».
- **Локальная база разработчика была на старой схеме** (до двуязычности). После правок оплаты синхронизация: `npx prisma db push --force-reset && npm run db:seed` (сбросит демо-данные локально).
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
| 2026-07-01 | Документация: `ARCHITECTURE.md` (карта проекта) + автодеплой Render через Deploy Hook |
| 2026-07-20 | *(второй разработчик)* Экран выбора роли (bento), рефакторинг админки, категории и черновики |
| 2026-07-20 | *(второй разработчик)* Коды: активация при регистрации и в профиле, отзыв кода, дата регистрации пациента |
| 2026-07-21 | *(второй разработчик)* Админ-управление тренировками, конструктор плейлистов, дублирование, превью-плеер |
| 2026-07-22 | *(второй разработчик)* **Двуязычность RU/EN** на всех экранах, модалках и в админке (поля `*_ru`/`*_en`) |
| 2026-07-24 | *(второй разработчик)* Глобальный перехват ошибок; сборка Render через `prisma db push` |
| 2026-07-24 | Правила для ИИ (`AGENTS.md`, `.ai-rules`, `.cursorrules`, Copilot) + напоминание обновлять карту (GitHub Action) |
| 2026-07-27 | **Онлайн-оплата (ЮKassa)**: модуль `payments/` (абстракция `PaymentProvider` + webhook), поля оплаты в `Order`, статусы `PENDING_PAYMENT`/`PAID`, `CheckoutScreen` создаёт заказ на сервере + экран `payment-result`, статус оплаты в админке. За флагом `PAYMENTS_ENABLED` |
| 2026-07-27 | **Уведомления**: модуль `notifications/` (лента + web-push), модели `Notification`/`PushSubscription`, «колокольчик» с сервера, уведомления о новой программе и оплате заказа |
| 2026-07-27 | **PWA**: `manifest.webmanifest`, service worker (`public/sw.js`), иконки, баннер «Установить приложение» — установка ярлыком на рабочий стол |
| 2026-08-10 | **Stripe (Дубай-first)**: `StripeProvider` (Checkout Session) рядом с ЮKassa, выбор через `PAYMENTS_PROVIDER`, мультивалюта `STORE_CURRENCY` (AED/EUR/RUB), webhook `/payments/webhook/stripe`, валюта в `/payments/config` и на checkout. Стратегия: сначала Дубай+Черногория (Stripe/ОАЭ), Россия (ЮKassa) — позже |
| 2026-08-24 | *(второй разработчик)* **Коды доступа, PhoneInput с флагами, YouTube плеер, Категории и Max**: Врач-создатель на карточках кодов, селектор флагов стран в `PhoneInput`, YouTube/Rutube <iframe> embed, полная свобода категорий в админке, посадочный хаб масел с кнопкой Мессенджер Max (RU) |
| 2026-08-24 | *(второй разработчик)* **Блок контактов центра на главном экране**: карточки 5 филиалов (Владикавказ, Сочи, Новокузнецк, Черногория, Дубай) с кликабельными номерами телефонов и переходом в WhatsApp |
| 2026-08-24 | *(второй разработчик)* **Платный 2-этапный доступ к Домашним заданиям**: ДЗ закрыто под 2 условия (1. Оплата подписки `POST /api/payments/create-homework` + 2. Ввод 5-буквенного ключа от врача). Статьи, подкасты, масла и каталог тренировок — в открытом доступе |
| 2026-08-28 | *(второй разработчик)* **Вкладка «Контакты» в админке и динамические филиалы**: модель `ContactBranch`, модуль `contacts/` (`GET /api/contacts`, `POST/PATCH/DELETE /api/admin/contacts`), управление филиалами в админке и динамическая отрисовка на главном экране |
| 2026-08-28 | **Слияние Stripe с работой второго разработчика** + исправления авто-ревью: отмена/истечение Stripe-сессии возвращает заказ в NEW, webhook Stripe реагирует только на `checkout.session.*`, согласована валюта на checkout, чек 54-ФЗ только для рублёвых заказов |
