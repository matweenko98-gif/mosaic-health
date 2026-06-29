# Мозаика Здоровья

Веб-приложение (PWA) центра восстановительной медицины. Состоит из двух частей:

- **`frontend/`** — интерфейс (то, что видит пользователь). React + Vite.
- **`backend/`** — «двигатель»: хранит данные, проверяет входы, выдаёт видео/аудио. NestJS + PostgreSQL.

## Что нужно для запуска (один раз)

На компьютере должны работать две фоновые программы:
- **PostgreSQL** — база данных (склад данных).
- **MinIO** — хранилище файлов (видео/аудио).

Они уже установлены через Homebrew. Команды управления:

```bash
# База данных
brew services start postgresql@16     # запустить
brew services stop postgresql@16      # остановить

# Хранилище файлов (запускается вручную)
minio server "$HOME/.mosaic-minio/data" --address :9000 --console-address :9001
# Панель MinIO: http://localhost:9001  (логин/пароль: minioadmin / minioadmin)
```

## Запуск приложения для разработки

В двух отдельных окнах терминала:

```bash
# 1. Двигатель (backend) — http://localhost:4000/api
cd backend
npm install            # только в первый раз
npm run start:dev

# 2. Интерфейс (frontend) — http://localhost:5173
cd frontend
npm install            # только в первый раз
npm run dev
```

Проверка, что двигатель жив: открыть http://localhost:4000/api/health — должно показать `{"status":"ok"}`.

## База данных

```bash
cd backend
npm run prisma:migrate   # применить изменения структуры базы
npm run db:seed          # заполнить начальными данными
npm run prisma:studio    # визуальный просмотр данных в браузере
```

### Демо-аккаунты (после `db:seed`)

| Роль       | Email                  | Пароль     |
|------------|------------------------|------------|
| Админ      | admin@mosaic.health    | Demo12345  |
| Врач       | doctor@mosaic.health   | Demo12345  |
| Пациент    | patient@mosaic.health  | Demo12345  |
