/**
 * Наполнение базы начальными данными.
 * Переносит каталог упражнений, товары, статьи и подкасты из прототипа,
 * а также создаёт демо-аккаунты (админ, врач, пациент).
 *
 * Запуск: npm run db:seed
 */
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

// Наполнение выполняем через прямое подключение (DIRECT_URL) — оно надёжнее для массовых
// записей и не зависит от особенностей пула соединений (pgbouncer).
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

type RawExercise = {
  id: number;
  title: string;
  description: string;
  duration: string | null;
  category: string | null;
};

function parseDuration(value: string | null): number {
  if (!value) return 0;
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? 0 : n;
}

async function seedExercises() {
  const file = path.join(__dirname, 'exercises.json');
  const list: RawExercise[] = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const ex of list) {
    await prisma.exercise.upsert({
      where: { id: ex.id },
      create: {
        id: ex.id,
        title: ex.title,
        description: ex.description ?? '',
        durationMin: parseDuration(ex.duration),
        category: ex.category ?? (ex.id >= 101 ? 'Индивидуальное' : 'Общее'),
        isIndividual: ex.id >= 101,
      },
      update: {
        title: ex.title,
        description: ex.description ?? '',
        durationMin: parseDuration(ex.duration),
        category: ex.category ?? (ex.id >= 101 ? 'Индивидуальное' : 'Общее'),
        isIndividual: ex.id >= 101,
      },
    });
  }
  console.log(`  Упражнений: ${list.length}`);
  return list;
}

async function seedProducts() {
  const products = [
    { id: 101, name: 'Чугунная гиря 8 кг', price: 3200, description: 'Оптимальный вес для дыхательной практики на 7 точек', category: 'Инструменты' },
    { id: 102, name: 'Чугунная гиря 12 кг', price: 4500, description: 'Для продвинутых тренировок гиревого дыхания на 10 точек', category: 'Инструменты' },
    { id: 103, name: 'Дыхательное масло (doTERRA)', price: 1900, description: 'Смесь эфирных масел терапевтического класса', category: 'Добавки' },
    { id: 104, name: 'Омега-3 высокой очистки', price: 2600, description: '120 капсул высокой концентрации EPA/DHA', category: 'Добавки' },
  ];
  for (const p of products) {
    await prisma.product.upsert({ where: { id: p.id }, create: p, update: p });
  }
  console.log(`  Товаров: ${products.length}`);
}

async function seedContent() {
  const articles = [
    { id: 1, title: 'Анатомия дыхания: как гиря помогает легким', description: 'Подробный разбор механики дыхания при кинезиотерапевтических нагрузках.', readTime: '5 мин', body: '' },
    { id: 2, title: 'Почему мы хромаем: разбор паттерна шага', description: 'Изучение связи между тонусом мышц стопы и правильной походкой.', readTime: '8 мин', body: '' },
  ];
  for (const a of articles) {
    await prisma.article.upsert({ where: { id: a.id }, create: a, update: a });
  }
  const podcasts = [
    { id: 1, title: 'Эпизод 12: Восстановление спины', description: 'Основы дыхания для снижения компрессии позвоночника.', durationMin: 24 },
  ];
  for (const p of podcasts) {
    await prisma.podcast.upsert({ where: { id: p.id }, create: p, update: p });
  }
  console.log(`  Статей: ${articles.length}, подкастов: ${podcasts.length}`);
}

async function seedUsers(exercises: RawExercise[]) {
  const password = await bcrypt.hash('Demo12345', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@mosaic.health' },
    create: {
      email: 'admin@mosaic.health', passwordHash: password, role: Role.ADMIN,
      name: 'Администратор', emailVerifiedAt: new Date(),
      settings: { create: {} },
    },
    update: { role: Role.ADMIN },
  });

  const specialist = await prisma.user.upsert({
    where: { email: 'doctor@mosaic.health' },
    create: {
      email: 'doctor@mosaic.health', passwordHash: password, role: Role.SPECIALIST,
      name: 'Доктор Иванов', emailVerifiedAt: new Date(),
      settings: { create: {} },
    },
    update: { role: Role.SPECIALIST },
  });

  const patient = await prisma.user.upsert({
    where: { email: 'patient@mosaic.health' },
    create: {
      email: 'patient@mosaic.health', passwordHash: password, role: Role.PATIENT,
      name: 'Пациент Петров', phone: '+375 29 000-00-00', age: '34', country: 'Беларусь',
      hasRehabilitation: true, emailVerifiedAt: new Date(),
      settings: { create: { workoutReminders: true, articleNotifications: false, language: 'RU' } },
    },
    update: {},
  });

  // Демо-история тренировок пациента (из initialHistory прототипа)
  const existingLogs = await prisma.workoutLog.count({ where: { userId: patient.id } });
  if (existingLogs === 0) {
    await prisma.workoutLog.createMany({
      data: [
        { userId: patient.id, name: 'Гиревое дыхание на 7 точек', status: 'Выполнено', completedAt: new Date('2026-06-05') },
        { userId: patient.id, name: 'Гиревое дыхание на 10 точек', status: 'Выполнено', completedAt: new Date('2026-06-06') },
      ],
    });
  }

  // Демо-программа: врач назначает пациенту 3 индивидуальных упражнения
  const individualIds = exercises.filter((e) => e.id >= 101).slice(0, 3).map((e) => e.id);
  const hasProgram = await prisma.program.findFirst({ where: { patientId: patient.id } });
  if (!hasProgram && individualIds.length > 0) {
    await prisma.program.create({
      data: {
        title: 'Индивидуальная программа',
        patientId: patient.id,
        specialistId: specialist.id,
        items: { create: individualIds.map((exerciseId, order) => ({ exerciseId, order })) },
      },
    });
  }

  // Демо-коды доступа к индивидуальным тренировкам
  const codesCount = await prisma.accessCode.count();
  if (codesCount === 0) {
    await prisma.accessCode.create({
      data: {
        code: 'ALPHA', label: 'Демо: активирован пациентом',
        specialistId: specialist.id, activatedById: patient.id, activatedAt: new Date(),
      },
    });
    await prisma.accessCode.create({
      data: { code: 'BRAVO', label: 'Демо: свободный код для теста', specialistId: specialist.id },
    });
    console.log('  Коды доступа: ALPHA (активирован patient@), BRAVO (свободный)');
  }

  console.log('  Демо-аккаунты: admin@mosaic.health, doctor@mosaic.health, patient@mosaic.health (пароль у всех: Demo12345)');
}

async function fixSequences() {
  // После вставки с явными id выравниваем счётчики автоинкремента,
  // чтобы новые записи не конфликтовали по id.
  for (const table of ['Exercise', 'Product', 'Article', 'Podcast']) {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1))`,
    );
  }
}

async function main() {
  console.log('Наполнение базы данными...');
  const exercises = await seedExercises();
  await seedProducts();
  await seedContent();
  await seedUsers(exercises);
  await fixSequences();
  console.log('Готово.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
