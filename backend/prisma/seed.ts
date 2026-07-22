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
    const isSpecialDemo = [1, 2, 3].includes(ex.id);
    const title_en = ex.id === 1 ? "Kettlebell breathing (7 points)" : ex.id === 2 ? "Kettlebell breathing (10 points)" : ex.id === 3 ? "Step (Type 1)" : "";
    const description_en = ex.id === 1 
      ? JSON.stringify({ instructions: "Video instruction on the breathing technique", isPublished: true, duration: "15 min", level: "Basic", equipment: "Kettlebell 8kg", coverUrl: "" })
      : ex.id === 2 
      ? JSON.stringify({ instructions: "Video instruction on the breathing technique", isPublished: true, duration: "20 min", level: "Advanced", equipment: "Kettlebell 12kg", coverUrl: "" })
      : ex.id === 3
      ? JSON.stringify({ instructions: "Walking technique - Type 1 (stub description)", isPublished: true, duration: "10 min", level: "Basic", equipment: "None", coverUrl: "" })
      : "";

    const desc_ru_parsed = ex.description ?? '';
    const description_ru = JSON.stringify({
      instructions: desc_ru_parsed,
      isPublished: true,
      duration: ex.duration || "10 мин",
      level: ex.id === 2 ? "Продвинутый" : "Базовый",
      equipment: ex.id === 1 ? "Гиря 8 кг" : ex.id === 2 ? "Гиря 12 кг" : "Без инвентаря",
      coverUrl: ""
    });

    await prisma.exercise.upsert({
      where: { id: ex.id },
      create: {
        id: ex.id,
        title_ru: ex.title,
        title_en: title_en,
        description_ru: description_ru,
        description_en: description_en,
        durationMin: parseDuration(ex.duration),
        category: ex.category ?? (ex.id >= 101 ? 'Индивидуальное' : 'Общее'),
        isIndividual: ex.id >= 101,
      },
      update: {
        title_ru: ex.title,
        title_en: title_en,
        description_ru: description_ru,
        description_en: description_en,
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
    {
      id: 101,
      name_ru: 'Чугунная гиря 8 кг',
      name_en: 'Cast Iron Kettlebell 8 kg',
      price: 3200,
      description_ru: JSON.stringify({ text: 'Оптимальный вес для дыхательной практики на 7 точек', stock: null, unlimited: true, isPublished: true }),
      description_en: JSON.stringify({ text: 'Optimal weight for 7-point breathing practice', stock: null, unlimited: true, isPublished: true }),
      category: 'Инструменты',
      imageKey: '/kettlebell-8.jpg'
    },
    {
      id: 102,
      name_ru: 'Чугунная гиря 12 кг',
      name_en: 'Cast Iron Kettlebell 12 kg',
      price: 4500,
      description_ru: JSON.stringify({ text: 'Для продвинутых тренировок гиревого дыхания на 10 точек', stock: null, unlimited: true, isPublished: true }),
      description_en: JSON.stringify({ text: 'For advanced 10-point kettlebell breathing workouts', stock: null, unlimited: true, isPublished: true }),
      category: 'Инструменты',
      imageKey: '/kettlebell-12.jpg'
    },
    {
      id: 103,
      name_ru: 'Дыхательное масло (doTERRA)',
      name_en: 'Breathing Oil (doTERRA)',
      price: 1900,
      description_ru: JSON.stringify({ text: 'Смесь эфирных масел терапевтического класса для легкого дыхания', stock: null, unlimited: true, isPublished: true }),
      description_en: JSON.stringify({ text: 'Therapeutic grade essential oil blend for easy breathing', stock: null, unlimited: true, isPublished: true }),
      category: 'Добавки'
    },
    {
      id: 104,
      name_ru: 'Омега-3 высокой очистки',
      name_en: 'Highly Purified Omega-3',
      price: 2600,
      description_ru: JSON.stringify({ text: '120 капсул высокой концентрации EPA/DHA для сердца и мозга', stock: null, unlimited: true, isPublished: true }),
      description_en: JSON.stringify({ text: '120 highly concentrated EPA/DHA capsules for heart and brain', stock: null, unlimited: true, isPublished: true }),
      category: 'Добавки'
    },
  ];
  for (const p of products) {
    await prisma.product.upsert({ where: { id: p.id }, create: p, update: p });
  }
  console.log(`  Товаров: ${products.length}`);
}

async function seedContent() {
  const articles = [
    {
      id: 1,
      title_ru: 'Анатомия дыхания: как гиря помогает легким',
      title_en: 'Anatomy of Breathing: How a Kettlebell Helps the Lungs',
      description_ru: JSON.stringify({ description: 'Подробный разбор механики дыхания при кинезиотерапевтических нагрузках.', image: null, isPublished: true }),
      description_en: JSON.stringify({ description: 'A detailed breakdown of breathing mechanics under kinesiotherapeutic loads.', image: null, isPublished: true }),
      readTime: '5 мин',
      body_ru: [
        'Дыхание — это не просто вдох и выдох. Это работа целой системы мышц: диафрагмы, межрёберных мышц, мышц живота и даже мышц шеи. Когда мы дышим поверхностно, большая часть этой системы «спит», а грудная клетка теряет подвижность.',
        'Гиря в дыхательной практике играет роль мягкого сопротивления. Удерживая или перемещая вес по определённым точкам, вы заставляете диафрагму работать глубже, а рёбра — раскрываться полнее. Это увеличивает так называемую экскурсию лёгких — амплитуду их движения при дыхании.',
        'Почему это важно? Полноценное дыхание улучшает насыщение крови кислородом, снижает уровень стресса за счёт активации парасимпатической нервной системы и возвращает подвижность грудному отделу позвоночника, который у большинства людей зажат из-за сидячего образа жизни.',
        'Начинайте с малого веса и медленного темпа. Ваша задача — не поднять как можно больше, а почувствовать, как воздух заполняет лёгкие снизу вверх, а на выдохе тело мягко расслабляется. Регулярность важнее интенсивности: 10 минут в день дадут больше, чем час раз в неделю.',
      ].join('\n\n'),
      body_en: [
        'Breathing is not just inhalation and exhalation. It is the work of a whole system of muscles: the diaphragm, intercostal muscles, abdominal muscles, and even neck muscles. When we breathe shallowly, most of this system "sleeps", and the chest loses mobility.',
        'The kettlebell in breathing practice acts as a soft resistance. By holding or moving weight along certain points, you force the diaphragm to work deeper and the ribs to open more fully. This increases the so-called lung excursion—the amplitude of their movement during breathing.',
        'Why is this important? Full breathing improves blood oxygenation, reduces stress levels by activating the parasympathetic nervous system, and restores mobility to the thoracic spine, which is stiff in most people due to a sedentary lifestyle.',
        'Start with light weight and slow pace. Your goal is not to lift as much as possible, but to feel how the air fills the lungs from the bottom up, and on the exhale the body gently relaxes. Consistency is more important than intensity: 10 minutes a day will yield more than an hour once a week.',
      ].join('\n\n'),
    },
    {
      id: 2,
      title_ru: 'Почему мы хромаем: разбор паттерна шага',
      title_en: 'Why We Limp: Analysis of the Walking Pattern',
      description_ru: JSON.stringify({ description: 'Изучение связи между тонусом мышц стопы и правильной походкой.', image: null, isPublished: true }),
      description_en: JSON.stringify({ description: 'Studying the connection between foot muscle tone and correct gait.', image: null, isPublished: true }),
      readTime: '8 мин',
      body_ru: [
        'Правильный шаг — это сложная согласованная работа десятков мышц. Когда одна из них выключается или, наоборот, перенапрягается, страдает весь паттерн движения: появляется хромота, перекос таза, боль в пояснице и коленях.',
        'Чаще всего проблема начинается снизу — со стопы. Если мышцы стопы ослаблены, теряется амортизация, и ударная нагрузка при каждом шаге уходит вверх — в колени и позвоночник. Отсюда и знакомое многим «тянет поясницу» после долгой ходьбы.',
        'Второй ключевой элемент — ягодичные мышцы. Именно они должны включаться в момент опоры на ногу. Если они «ленятся», их работу берут на себя мышцы поясницы, которые для этого не предназначены.',
        'Восстановление правильного шага идёт снизу вверх: сначала возвращаем чувствительность и силу стопе, затем учим ягодичные включаться вовремя, и только потом отрабатываем согласованную работу рук и ног. Кинезиотерапия решает это через простые, но точные упражнения, которые вы найдёте в разделе тренировок.',
      ].join('\n\n'),
      body_en: [
        'A proper step is a complex coordinated work of dozens of muscles. When one of them turns off or, conversely, overstretches, the entire movement pattern suffers: limping, pelvic tilt, lower back pain, and knee pain appear.',
        'Most often, the problem starts from below - with the foot. If the foot muscles are weakened, shock absorption is lost, and the impact load with each step goes up - into the knees and spine. Hence the familiar "pulling lower back" after walking for a long time.',
        'The second key element is the gluteal muscles. It is they that should turn on at the moment of support on the leg. If they are "lazy", their work is taken over by the muscles of the lower back, which are not intended for this.',
        'Restoring the correct step goes from the bottom up: first, we restore sensitivity and strength to the foot, then we teach the gluteal muscles to turn on in time, and only then we work out the coordinated work of hands and feet. Kinesiotherapy solves this through simple but precise exercises that you will find in the workouts section.',
      ].join('\n\n'),
    },
  ];
  for (const a of articles) {
    await prisma.article.upsert({ where: { id: a.id }, create: a, update: a });
  }
  const podcasts = [
    {
      id: 1,
      title_ru: 'Эпизод 12: Восстановление спины',
      title_en: 'Episode 12: Back Recovery',
      description_ru: JSON.stringify({ description: 'Основы дыхания для снижения компрессии позвоночника.', isVideo: false, isPublished: true }),
      description_en: JSON.stringify({ description: 'Basics of breathing to reduce spinal compression.', isVideo: false, isPublished: true }),
      durationMin: 24,
      audioKey: null
    },
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
