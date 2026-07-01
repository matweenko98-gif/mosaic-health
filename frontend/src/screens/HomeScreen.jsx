import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { methodDescription } from "../data/mockData";
import WorkoutModal from "../components/WorkoutModal";

/**
 * HomeScreen — Главный экран «Мозаика Здоровья».
 *
 * Bento-сетка из карточек разного размера:
 * - Баннер (полная ширина)
 * - О методике (полная ширина)
 * - Тренировки: одна большая кнопка-карточка, открывающая выбор активностей
 * - Помощники здоровья: общая Bento-карточка (Ароматерапия + Омега-3)
 * - Материалы от создателя: контентная Bento-карточка
 * - Магазин и Наш Telegram: mini-карточки 1×1 (половина ширины)
 */
export default function HomeScreen({ onWorkoutComplete, onNavigate }) {
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectorSearch, setSelectorSearch] = useState("");
  const [homeworkSearch, setHomeworkSearch] = useState("");
  const [selectedSelectorTab, setSelectedSelectorTab] = useState("Все");

  // Группы активностей для выбора тренировки с расширенными метаданными
  const breathingGroup = [
    {
      id: 1,
      title: "Гиревое дыхание на 7 точек",
      label: "На 7 точек",
      description: "Видео-инструкция по методике",
      duration: "15 мин",
      level: "Базовый",
      equipment: "С гирей",
    },
    {
      id: 2,
      title: "Гиревое дыхание на 10 точек",
      label: "На 10 точек",
      description: "Видео-инструкция по методике",
      duration: "20 мин",
      level: "Продвинутый",
      equipment: "С гирей",
    },
  ];

  const stepGroup = [
    {
      id: 3,
      title: "Шаг (Вид 1)",
      label: "Шаг (Вид 1)",
      description: "Методика шага — Вид 1 (заглушка)",
      duration: "10 мин",
      level: "Базовый",
      equipment: "Без инвентаря",
    },
    {
      id: 4,
      title: "Шаг (Вид 2)",
      label: "Шаг (Вид 2)",
      description: "Методика шага — Вид 2 (заглушка)",
      duration: "12 мин",
      level: "Средний",
      equipment: "Без инвентаря",
    },
    {
      id: 5,
      title: "Шаг (Вид 3)",
      label: "Шаг (Вид 3)",
      description: "Методика шага — Вид 3 (заглушка)",
      duration: "15 мин",
      level: "Средний",
      equipment: "Без инвентаря",
    },
  ];

  const allExercises = [
    ...breathingGroup,
    ...stepGroup,
    {
      id: 6,
      title: "Диафрагмальный релиз",
      label: "Диафрагмальный релиз",
      description: "Самомассаж диафрагмы, направленный на устранение мышечных зажимов, увеличение глубины вдоха и расслабление нервной системы.",
      duration: "10 мин",
      level: "Базовый",
      equipment: "Без инвентаря",
    },
    {
      id: 7,
      title: "Мобилизация грудного отдела",
      label: "Мобилизация грудного",
      description: "Комплекс упражнений для раскрытия плечевого пояса и грудной клетки, возвращающий подвижность ребрам.",
      duration: "12 мин",
      level: "Базовый",
      equipment: "Без инвентаря",
    },
    {
      id: 8,
      title: "Активация стопы",
      label: "Активация стопы",
      description: "Миофасциальный релиз подошвенного апоневроза с помощью теннисного или массажного мяча для восстановления амортизации стопы.",
      duration: "8 мин",
      level: "Базовый",
      equipment: "Мяч",
    },
    {
      id: 9,
      title: "Координация шага",
      label: "Координация шага",
      description: "Согласованная работа рук и ног с акцентом на перекрестный паттерн ходьбы для выравнивания осанки.",
      duration: "15 мин",
      level: "Средний",
      equipment: "Без инвентаря",
    },
    {
      id: 10,
      title: "Растяжка поясничного отдела",
      label: "Растяжка поясницы",
      description: "Декомпрессия поясничных позвонков, снятие гипертонуса с квадратных мышц поясницы после нагрузок.",
      duration: "10 мин",
      level: "Базовый",
      equipment: "Коврик",
    },
  ];

  // Реальный список тренировок для Домашнего задания
  const homeworkExercises = [
    // Категория Дыхание
    {
      id: 101,
      title: "Дыхание на 4-ках с ротацией локтей",
      label: "Дыхание на 4-ках с ротацией локтей",
      description: "Упражнение в упоре на четвереньках для мобилизации лопаток, раскрытия грудного отдела и улучшения паттерна дыхания.",
      duration: "10 мин",
      level: "Базовый",
      equipment: "Коврик",
      category: "Дыхание",
      video: "/demo-video.mp4"
    },
    {
      id: 102,
      title: "Дыхание на 4-ках с ротацией локтей, быстр вдох, медл выдох",
      label: "Дыхание на 4-ках с ротацией локтей, быстр вдох, медл выдох",
      description: "Активация парасимпатической нервной системы за счет удлиненного выдоха в сочетании с динамическим раскрытием грудной клетки.",
      duration: "8 мин",
      level: "Средний",
      equipment: "Коврик",
      category: "Дыхание",
      video: "/demo-video.mp4"
    },
    {
      id: 103,
      title: "Дыхание на 4-ках с ротацией локтей, медл вдох, быстр выдох",
      label: "Дыхание на 4-ках с ротацией локтей, медл вдох, быстр выдох",
      description: "Тонизирующая дыхательная практика для мобилизации ребер и включения вспомогательных дыхательных мышц.",
      duration: "8 мин",
      level: "Средний",
      equipment: "Коврик",
      category: "Дыхание",
      video: "/demo-video.mp4"
    },
    {
      id: 104,
      title: "Дыхание сидя на коленях",
      label: "Дыхание сидя на коленях",
      description: "Мягкое дыхательное упражнение сидя на пятках для расслабления поясницы и центрирования купола диафрагмы.",
      duration: "10 мин",
      level: "Базовый",
      equipment: "Коврик",
      category: "Дыхание"
    },
    {
      id: 105,
      title: "Дыхание сидя с поднятой прямой рукой",
      label: "Дыхание сидя с поднятой прямой рукой",
      description: "Асимметричное дыхание для направленного раскрытия и вентиляции одного из куполов легкого и растяжения межреберных мышц.",
      duration: "10 мин",
      level: "Базовый",
      equipment: "Без инвентаря",
      category: "Дыхание"
    },
    {
      id: 106,
      title: "Лежа колени в сторону",
      label: "Лежа колени в сторону",
      description: "Мягкое дыхание в ротационном положении нижней части тела для декомпрессии пояснично-крестцового отдела позвоночника.",
      duration: "12 мин",
      level: "Базовый",
      equipment: "Коврик",
      category: "Дыхание"
    },
    {
      id: 107,
      title: "Корзинка",
      label: "Корзинка",
      description: "Прогиб назад лежа на животе с захватом лодыжек для раскрытия передней фасциальной линии и глубокой вентиляции легких.",
      duration: "12 мин",
      level: "Продвинутый",
      equipment: "Коврик",
      category: "Дыхание"
    },

    // Категория Упражнение
    {
      id: 108,
      title: "Полумостик",
      label: "Полумостик",
      description: "Активация задней поверхности бедер и большой ягодичной мышцы с одновременным вытяжением передней линии бедра.",
      duration: "10 мин",
      level: "Базовый",
      equipment: "Коврик",
      category: "Упражнение"
    },
    {
      id: 109,
      title: "Пресс: колени к груди",
      label: "Пресс: колени к груди",
      description: "Укрепление прямой и поперечной мышц живота в щадящем для поясничного отдела позвоночника режиме за счет подъема ног.",
      duration: "12 мин",
      level: "Средний",
      equipment: "Коврик",
      category: "Упражнение"
    },
    {
      id: 110,
      title: "Отжимание с колен",
      label: "Отжимание с колен",
      description: "Укрепление мышц груди, передней дельты и трицепса с сохранением стабильного нейтрального положения позвоночника.",
      duration: "12 мин",
      level: "Базовый",
      equipment: "Коврик",
      category: "Упражнение"
    },
    {
      id: 111,
      title: "Бицепс бедра лежа",
      label: "Бицепс бедра лежа",
      description: "Изолированное сгибание голени лежа на животе для улучшения тонуса двуглавой мышцы бедра и стабилизации коленного сустава.",
      duration: "10 мин",
      level: "Базовый",
      equipment: "Без инвентаря",
      category: "Упражнение"
    },
    {
      id: 112,
      title: "Колени к себе лежа: по 1й и 2мя ногами",
      label: "Колени к себе лежа: по 1й и 2мя ногами",
      description: "Мягкое поочередное и совместное подтягивание коленей к животу для разгрузки поясницы и расслабления связок крестца.",
      duration: "10 мин",
      level: "Базовый",
      equipment: "Коврик",
      category: "Упражнение"
    },
    {
      id: 113,
      title: "Приседания \"в рюмочку\"",
      label: "Приседания \"в рюмочку\"",
      description: "Приседания с узкой постановкой стоп и широким разведением коленей для тренировки глубокого седа и мобилизации голеностопа.",
      duration: "12 мин",
      level: "Средний",
      equipment: "Без инвентаря",
      category: "Упражнение"
    },
    {
      id: 114,
      title: "Кошечка - собачка на прямых руках",
      label: "Кошечка - собачка на прямых руках",
      description: "Классическая волнообразная мобилизация позвоночника во флексии и экстензии из упора на четвереньках на прямых руках.",
      duration: "8 мин",
      level: "Базовый",
      equipment: "Коврик",
      category: "Упражнение"
    },
    {
      id: 115,
      title: "Собака - на 4ках грудь к полу",
      label: "Собака - на 4ках грудь к полу",
      description: "Мягкое вытяжение плечевых суставов и верхнегрудного отдела позвоночника из упора на коленях грудью к полу.",
      duration: "10 мин",
      level: "Базовый",
      equipment: "Коврик",
      category: "Упражнение"
    },
    {
      id: 116,
      title: "Кошечка - собачка на локтях",
      label: "Кошечка - собачка на локтях",
      description: "Мобилизация пояснично-крестцового и нижнегрудного отделов позвоночника с выключением из работы плечевого пояса.",
      duration: "8 мин",
      level: "Базовый",
      equipment: "Коврик",
      category: "Упражнение"
    },
    {
      id: 117,
      title: "Икры стоя - прямо и под углами",
      label: "Икры стоя - прямо и под углами",
      description: "Подъемы на носки с различным разворотом стоп для проработки всех пучков икроножной мышцы и стимуляции венозного возврата.",
      duration: "12 мин",
      level: "Базовый",
      equipment: "Стена",
      category: "Упражнение"
    },
    {
      id: 118,
      title: "Икры в позе \"Собаки\"",
      label: "Икры в позе \"Собаки\"",
      description: "Поочередное опускание пяток к коврику из положения собаки мордой вниз для вытяжения ахиллова сухожилия и икроножных мышц.",
      duration: "10 мин",
      level: "Средний",
      equipment: "Коврик",
      category: "Упражнение"
    },

    // Категория Расслабление
    {
      id: 119,
      title: "Растяжка ЗПБ стоя: ладони на стопах, поочереди выпрямлять ноги",
      label: "Растяжка ЗПБ стоя: ладони на стопах, поочереди выпрямлять ноги",
      description: "Глубокое динамическое растяжение мышц задней поверхности бедер и подколенных сухожилий в наклоне корпуса вперед.",
      duration: "12 мин",
      level: "Средний",
      equipment: "Без инвентаря",
      category: "Расслабление"
    },
    {
      id: 120,
      title: "Скрут стоя, рука наверх",
      label: "Скрут стоя, рука наверх",
      description: "Мягкая ротация грудного отдела из наклона с вытяжением руки вертикально вверх для снятия блоков и зажимов позвоночника.",
      duration: "10 мин",
      level: "Средний",
      equipment: "Без инвентаря",
      category: "Расслабление"
    },
    {
      id: 121,
      title: "Раскачка: колено внутрь по 1 ноге",
      label: "Раскачка: колено внутрь по 1 ноге",
      description: "Мягкое вращение бедренной кости внутрь в положении лежа на спине для мобилизации суставной капсулы тазобедренного сустава.",
      duration: "8 мин",
      level: "Базовый",
      equipment: "Коврик",
      category: "Расслабление"
    },
    {
      id: 122,
      title: "Раскачка: в стороны колени вместе",
      label: "Раскачка: в стороны колени вместе",
      description: "Мягкие наклоны согнутых коленей вправо и влево лежа на спине для релиза мышц поясничного отдела и крестца.",
      duration: "8 мин",
      level: "Базовый",
      equipment: "Коврик",
      category: "Расслабление"
    },
    {
      id: 123,
      title: "Колено к себе лежа на расслабление НЧС",
      label: "Колено к себе лежа на расслабление НЧС",
      description: "Подтягивание колена руками к противоположному плечу для релиза грушевидной мышцы и улучшения подвижности крестцово-подвздошного сочленения.",
      duration: "10 мин",
      level: "Базовый",
      equipment: "Коврик",
      category: "Расслабление"
    },
    {
      id: 124,
      title: "Раскачка: вперед-назад",
      label: "Раскачка: вперед-назад",
      description: "Перекаты на округлом позвоночнике вперед и назад для массажа околопозвоночных мышц и улучшения сегментарной мобильности.",
      duration: "8 мин",
      level: "Базовый",
      equipment: "Коврик",
      category: "Расслабление"
    },
    {
      id: 125,
      title: "Колени к груди - развести в бабочку - свести (круг в ТЗБ)",
      label: "Колени к груди - развести в бабочку - свести (круг в ТЗБ)",
      description: "Круговые вращения бедер вовнутрь из положения лежа на спине для улучшения скольжения головки бедренной кости.",
      duration: "10 мин",
      level: "Базовый",
      equipment: "Коврик",
      category: "Расслабление"
    },
    {
      id: 126,
      title: "Колени развести в бабочку - свести к животу - вниз (круг в ТЗБ)",
      label: "Колени развести в бабочку - свести к животу - вниз (круг в ТЗБ)",
      description: "Круговые вращения бедер наружу лежа на спине для расслабления тазового дна и паховых связок.",
      duration: "10 мин",
      level: "Базовый",
      equipment: "Коврик",
      category: "Расслабление"
    },
    {
      id: 127,
      title: "Растягивающий шаг",
      label: "Растягивающий шаг",
      description: "Широкие выпады с удержанием таза в нейтральном положении для растяжения подвздошно-поясничной мышцы передней ноги.",
      duration: "12 мин",
      level: "Средний",
      equipment: "Без инвентаря",
      category: "Расслабление"
    },
    {
      id: 128,
      title: "Растяжка лестничная мышца сидя",
      label: "Растяжка лестничная мышца сидя",
      description: "Деликатное вытяжение передней и боковой поверхностей шеи сидя на стуле с фиксацией противоположного плеча.",
      duration: "8 мин",
      level: "Базовый",
      equipment: "Стул",
      category: "Расслабление"
    },
    {
      id: 129,
      title: "Раскачка: Крокодил стопы",
      label: "Раскачка: Крокодил стопы",
      description: "Комплексная волнообразная скрутка позвоночного столба лежа, запускаемая от движения стоп, для релиза глубоких ротаторов.",
      duration: "10 мин",
      level: "Базовый",
      equipment: "Коврик",
      category: "Расслабление"
    },
    {
      id: 130,
      title: "Раскачка: согнутые колени на ширине плеч, вместе в стороны",
      label: "Раскачка: согнутые колени на ширине плеч, вместе в стороны",
      description: "Наклоны коленей вовнутрь и в стороны в широком положении стоп лежа на спине для релиза таза и поясницы.",
      duration: "10 мин",
      level: "Базовый",
      equipment: "Коврик",
      category: "Расслабление"
    },
    {
      id: 131,
      title: "Раскачка: по 1 ноге колено внутрь и наружу",
      label: "Раскачка: по 1 ноге колено внутрь и наружу",
      description: "Поочередное изолированное отведение и приведение бедра лежа на спине для выравнивания тонуса ротаторов бедра.",
      duration: "8 мин",
      level: "Базовый",
      equipment: "Коврик",
      category: "Расслабление"
    },
    {
      id: 132,
      title: "Растяжка грудных - прямая рука о стену",
      label: "Растяжка грудных - прямая рука о стену",
      description: "Мягкое раскрытие плечевого пояса и растяжение большой грудной мышцы за счет разворота корпуса от стены.",
      duration: "10 мин",
      level: "Базовый",
      equipment: "Стена",
      category: "Расслабление"
    },
    {
      id: 133,
      title: "Растяжка ягодичной сидя",
      label: "Растяжка ягодичной сидя",
      description: "Растяжение большой, средней ягодичной и грушевидной мышц сидя на стуле с укладыванием голени на бедро другой ноги.",
      duration: "10 мин",
      level: "Базовый",
      equipment: "Стул",
      category: "Расслабление"
    },
    {
      id: 134,
      title: "Растяжка верхняя трапеция сидя, ШВЗ",
      label: "Растяжка верхняя трапеция сидя, ШВЗ",
      description: "Деликатное растяжение верхней части трапеции и мышцы, поднимающей лопатку, сидя на стуле с наклоном головы вперед и вбок.",
      duration: "8 мин",
      level: "Базовый",
      equipment: "Без инвентаря",
      category: "Расслабление"
    },
    {
      id: 135,
      title: "Самомассаж фитнес-роллом отводящих, ТФЛ",
      label: "Самомассаж фитнес-роллом отводящих, ТФЛ",
      description: "Миофасциальный релиз напрягателя широкой фасции бедра и отводящих мышц с помощью прокатки на фитнес-ролле.",
      duration: "12 мин",
      level: "Средний",
      equipment: "Фитнес-ролл",
      category: "Расслабление"
    },
    {
      id: 136,
      title: "Самомассаж фитнес-роллом приводящих",
      label: "Самомассаж фитнес-роллом приводящих",
      description: "Миофасциальный самомассаж внутренней поверхности бедра на фитнес-ролле для улучшения эластичности приводящей группы мышц.",
      duration: "12 мин",
      level: "Средний",
      equipment: "Фитнес-ролл",
      category: "Расслабление"
    },
    {
      id: 137,
      title: "Самомассаж фитнес-роллом ЗПБ",
      label: "Самомассаж фитнес-роллом ЗПБ",
      description: "Прокатка задней поверхности бедра на массажном ролле для устранения мышечных триггеров и спазмов.",
      duration: "12 мин",
      level: "Базовый",
      equipment: "Фитнес-ролл",
      category: "Расслабление"
    },
    {
      id: 138,
      title: "Самомассаж фитнес-роллом икры",
      label: "Самомассаж фитнес-роллом икры",
      description: "Миофасциальный релиз камбаловидной и икроножной мышц на фитнес-ролле для снятия зажимов и усталости в голенях.",
      duration: "10 мин",
      level: "Базовый",
      equipment: "Фитнес-ролл",
      category: "Расслабление"
    },
    {
      id: 139,
      title: "Самомассаж фитнес-роллом ППБ",
      label: "Самомассаж фитнес-роллом ППБ",
      description: "Миофасциальный самомассаж передней поверхности бедра (квадрицепса) на фитнес-ролле для разгрузки коленных суставов.",
      duration: "12 мин",
      level: "Средний",
      equipment: "Фитнес-ролл",
      category: "Расслабление"
    },

    // Категория Ходьба
    {
      id: 140,
      title: "Ходьба классика",
      label: "Ходьба классика",
      description: "Тренировка правильного распределения веса и амортизации стопы во время классической ходьбы на месте.",
      duration: "15 мин",
      level: "Базовый",
      equipment: "Без инвентаря",
      category: "Ходьба"
    },
    {
      id: 141,
      title: "Ходьба со скрутом",
      label: "Ходьба со скрутом",
      description: "Ходьба на месте с контролируемым противовращением плечевого пояса и таза для мобилизации позвоночника.",
      duration: "15 мин",
      level: "Средний",
      equipment: "Без инвентаря",
      category: "Ходьба"
    },
    {
      id: 142,
      title: "Ходьба на месте колено к плечу",
      label: "Ходьба на месте колено к плечу",
      description: "Активная ходьба на месте с высоким подъемом бедра по диагонали к противоположному плечу для тренировки баланса.",
      duration: "12 мин",
      level: "Средний",
      equipment: "Без инвентаря",
      category: "Ходьба"
    },
    {
      id: 143,
      title: "Ходьба на месте, руки вперед, локти назад",
      label: "Ходьба на месте, руки вперед, локти назад",
      description: "Ходьба на месте с синхронной горизонтальной тягой рук для активации ромбовидных и трапециевидных мышц.",
      duration: "12 мин",
      level: "Базовый",
      equipment: "Без инвентаря",
      category: "Ходьба"
    },
    {
      id: 144,
      title: "Ходьба на месте, руки прямые вверх",
      label: "Ходьба на месте, руки прямые вверх",
      description: "Ходьба на месте с поднятыми прямыми руками для укрепления мышц-разгибателей спины и улучшения осанки.",
      duration: "10 мин",
      level: "Средний",
      equipment: "Без инвентаря",
      category: "Ходьба"
    },
    {
      id: 145,
      title: "Ходьба 2-10 пятка к носочку",
      label: "Ходьба 2-10 пятка к носочку",
      description: "Ходьба по прямой линии стык в стык для тренировки мозжечка, координации и глубоких мышц-стабилизаторов.",
      duration: "12 мин",
      level: "Средний",
      equipment: "Без инвентаря",
      category: "Ходьба"
    },
    {
      id: 146,
      title: "Ходьба 2-10 с ротацией корпуса",
      label: "Ходьба 2-10 с ротацией корпуса",
      description: "Балансирующая ходьба пятка к носку с поворотом корпуса в сторону передней ноги для продвинутого контроля равновесия.",
      duration: "15 мин",
      level: "Продвинутый",
      equipment: "Без инвентаря",
      category: "Ходьба"
    },
    {
      id: 147,
      title: "Ходьба на стопу",
      label: "Ходьба на стопу",
      description: "Специальная ходьба с акцентом на проработку свода стопы и трех точек опоры для исправления паттернов шага.",
      duration: "12 мин",
      level: "Базовый",
      equipment: "Без инвентаря",
      category: "Ходьба"
    },
    {
      id: 148,
      title: "Ходьба длинный шаг, ладони вместе перед собой",
      label: "Ходьба длинный шаг, ладони вместе перед собой",
      description: "Ходьба длинными выпадами с вытянутыми перед собой руками для раскрытия тазобедренных суставов и вытяжения позвоночника.",
      duration: "15 мин",
      level: "Средний",
      equipment: "Без инвентаря",
      category: "Ходьба"
    }
  ];

  // Состояние активного таба для домашних тренировок
  const [selectedHomeworkTab, setSelectedHomeworkTab] = useState("Все");

  // Доступ к индивидуальным тренировкам открывается кодом от врача (проверяется на сервере).
  const [hasAccess, setHasAccess] = useState(false);
  const isHomeworkUnlocked = hasAccess;

  useEffect(() => {
    let active = true;
    api
      .get("/me/access")
      .then((r) => {
        if (active) setHasAccess(!!r?.hasAccess);
      })
      .catch(() => {
        if (active) setHasAccess(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Окно активации кода доступа
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeSubmitting, setCodeSubmitting] = useState(false);

  async function handleActivateCode() {
    const code = codeInput.trim();
    if (!code) {
      setCodeError("Введите код от врача");
      return;
    }
    setCodeError("");
    setCodeSubmitting(true);
    try {
      await api.post("/me/activate-code", { code });
      setHasAccess(true);
      setIsCodeModalOpen(false);
      setCodeInput("");
      setToast({ visible: true, message: "Доступ открыт!", type: "success" });
      setIsSelectorOpen(false);
      setIsEditingComplex(customPlaylist.length === 0);
      setIsHomeworkModalOpen(true);
    } catch (err) {
      setCodeError(err?.message || "Не удалось активировать код");
    } finally {
      setCodeSubmitting(false);
    }
  }

  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast({ visible: false, message: "", type: "success" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  // Выбранный плейлист (массив ID) с автосохранением в localStorage
  const [customPlaylist, setCustomPlaylist] = useState(() => {
    try {
      const saved = localStorage.getItem("customPlaylist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("customPlaylist", JSON.stringify(customPlaylist));
  }, [customPlaylist]);


  // Перемещение упражнений (drag-and-drop & стрелочки)
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newPlaylist = [...customPlaylist];
    const temp = newPlaylist[index];
    newPlaylist[index] = newPlaylist[index - 1];
    newPlaylist[index - 1] = temp;
    setCustomPlaylist(newPlaylist);
  };

  const handleMoveDown = (index) => {
    if (index === customPlaylist.length - 1) return;
    const newPlaylist = [...customPlaylist];
    const temp = newPlaylist[index];
    newPlaylist[index] = newPlaylist[index + 1];
    newPlaylist[index + 1] = temp;
    setCustomPlaylist(newPlaylist);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", index.toString());
    }
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newPlaylist = [...customPlaylist];
    const itemToMove = newPlaylist[draggedIndex];
    newPlaylist.splice(draggedIndex, 1);
    newPlaylist.splice(targetIndex, 0, itemToMove);
    setCustomPlaylist(newPlaylist);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Состояние видимости выделенного модального окна Домашнего задания
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
  const [isEditingComplex, setIsEditingComplex] = useState(false);

  useEffect(() => {
    if (!isSelectorOpen) {
      setSelectorSearch("");
      setSelectedSelectorTab("Все");
    }
  }, [isSelectorOpen]);

  useEffect(() => {
    if (!isHomeworkModalOpen) {
      setHomeworkSearch("");
      setSelectedHomeworkTab("Все");
    }
  }, [isHomeworkModalOpen]);

  // Состояния сохраненной сессии
  const [savedHomeworkQueue, setSavedHomeworkQueue] = useState(() => {
    try {
      const q = localStorage.getItem("savedHomeworkQueue");
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  });

  const [savedHomeworkIndex, setSavedHomeworkIndex] = useState(() => {
    const idx = localStorage.getItem("savedHomeworkIndex");
    return idx ? parseInt(idx, 10) : -1;
  });

  // Состояния для активного плеера
  const [playlistQueue, setPlaylistQueue] = useState([]);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(-1);

  // Автосохранение прогресса ДЗ
  useEffect(() => {
    if (playlistQueue.length > 0 && playlistQueue[0].id >= 101) {
      localStorage.setItem("savedHomeworkQueue", JSON.stringify(playlistQueue));
      localStorage.setItem("savedHomeworkIndex", String(currentPlaylistIndex));
      setSavedHomeworkQueue(playlistQueue);
      setSavedHomeworkIndex(currentPlaylistIndex);
    }
  }, [playlistQueue, currentPlaylistIndex]);

  function clearSavedHomework() {
    localStorage.removeItem("savedHomeworkQueue");
    localStorage.removeItem("savedHomeworkIndex");
    setSavedHomeworkQueue([]);
    setSavedHomeworkIndex(-1);
  }

  function handlePlaceholderClick() {
    setToast({ visible: true, message: "Раздел находится в разработке", type: "info" });
  }

  function handleSelectActivity(activity) {
    setSelectedWorkout(activity);
    setIsSelectorOpen(false);
  }

  function handleHomeworkClick() {
    if (isHomeworkUnlocked) {
      setIsSelectorOpen(false);
      setIsEditingComplex(customPlaylist.length === 0);
      setIsHomeworkModalOpen(true);
    } else {
      // Доступа нет — предлагаем ввести код от врача.
      setCodeInput("");
      setCodeError("");
      setIsCodeModalOpen(true);
    }
  }

  function handleTogglePlaylistItem(id) {
    if (customPlaylist.includes(id)) {
      setCustomPlaylist(customPlaylist.filter((item) => item !== id));
    } else {
      setCustomPlaylist([...customPlaylist, id]);
    }
  }

  function handlePlayerClose() {
    const isHomework = (playlistQueue.length > 0 && playlistQueue[0].id >= 101) || (selectedWorkout && selectedWorkout.id >= 101);
    setSelectedWorkout(null);
    setCurrentPlaylistIndex(-1);
    setPlaylistQueue([]);
    if (isHomework) {
      setIsEditingComplex(false);
      setIsHomeworkModalOpen(true);
    } else {
      setIsSelectorOpen(true);
    }
  }

  function handlePlayerBackToList() {
    const isHomework = playlistQueue.length > 0 && playlistQueue[0].id >= 101;
    setSelectedWorkout(null);
    setCurrentPlaylistIndex(-1);
    setPlaylistQueue([]);
    if (isHomework) {
      setIsEditingComplex(false);
      setIsHomeworkModalOpen(true);
    } else {
      setIsSelectorOpen(true);
    }
  }

  function handlePlayerWorkoutComplete(completedItem) {
    onWorkoutComplete(completedItem);

    // Если это домашнее задание, закрываем плеер (так как логируется сессия целиком)
    const isHomework = playlistQueue.length > 0 && playlistQueue[0].id >= 101;
    if (isHomework) {
      setSelectedWorkout(null);
      setCurrentPlaylistIndex(-1);
      setPlaylistQueue([]);
      // Если завершено полностью (дошли до последнего индекса), сбрасываем сохраненную сессию
      if (currentPlaylistIndex === playlistQueue.length - 1) {
        clearSavedHomework();
      }
      setIsEditingComplex(false);
      setIsHomeworkModalOpen(true);
      return;
    }

    if (currentPlaylistIndex >= 0 && currentPlaylistIndex < playlistQueue.length - 1) {
      const nextIndex = currentPlaylistIndex + 1;
      setCurrentPlaylistIndex(nextIndex);
      setSelectedWorkout(playlistQueue[nextIndex]);
    } else {
      setSelectedWorkout(null);
      setCurrentPlaylistIndex(-1);
      setPlaylistQueue([]);
      setIsSelectorOpen(true);
    }
  }

  const filteredBreathingGroup = breathingGroup.filter((item) =>
    item.label.toLowerCase().includes(selectorSearch.toLowerCase()) ||
    item.title.toLowerCase().includes(selectorSearch.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(selectorSearch.toLowerCase()))
  );

  const filteredStepGroup = stepGroup.filter((item) =>
    item.label.toLowerCase().includes(selectorSearch.toLowerCase()) ||
    item.title.toLowerCase().includes(selectorSearch.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(selectorSearch.toLowerCase()))
  );

  return (
    <section className="screen" id="screen-home">
      {/* === Bento-сетка === */}
      <div className="bento-grid" style={{ gap: "16px" }}>
        {/* 1. Баннер — полная ширина */}
        <div className="bento-grid__item bento-grid__item--full" style={{ position: "relative", height: "316px", borderRadius: "24px", overflow: "hidden", boxShadow: "0 12px 32px -8px rgba(27,171,124,.32)" }}>
          {/* Main banner image */}
          <img
            src="/banner_home.jpg"
            alt="Верните телу баланс и движение"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
          {/* brand gradient wash + bottom scrim */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg, rgba(0,148,184,.42), rgba(27,171,124,.30) 40%, rgba(235,96,116,.0) 70%), linear-gradient(to top, rgba(0,46,36,.86) 2%, rgba(0,46,36,.30) 38%, rgba(0,46,36,0) 62%)" }}></div>
          {/* content */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyParagraph: "flex-end", justifySelf: "stretch", justifyContent: "flex-end", gap: "13px", padding: "22px" }}>
            <span style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: "34px", lineHeight: 1.1, color: "#fff", letterSpacing: "-.6px", textShadow: "0 2px 14px rgba(0,30,22,.5)", maxWidth: "320px" }}>Верните телу<br />баланс и движение</span>
            <button onClick={() => setIsSelectorOpen(true)} style={{ display: "flex", border: "none", cursor: "pointer", alignItems: "center", gap: "8px", alignSelf: "flex-start", backgroundColor: "#fff", padding: "11px 18px", borderRadius: "999px", boxShadow: "0 8px 20px -6px rgba(0,30,22,.5)" }}>
              <span style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: "13px", color: "#007F63" }}>Начать тренировку</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#007F63" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
            </button>
          </div>
        </div>

        {/* 2. О методике — полная ширина */}
        <section className="bento-grid__item bento-grid__item--full" style={{ minHeight: "240px", display: "flex", flexDirection: "column", justifyContent: "center", background: "#fff", borderRadius: "20px", padding: "24px 20px", boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#1BAB7C" }}></span>
            <h2 style={{ margin: 0, fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: "20px", color: "#1d2321" }}>О методике</h2>
          </div>
          <p style={{ margin: "14px 0 0", fontSize: "15px", lineHeight: 1.68, color: "#4a4a4a", fontWeight: 300 }}>{methodDescription}</p>
          <div style={{ display: "flex", gap: "8px", marginTop: "18px", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: "11.5px", color: "#007F63", background: "rgba(0,127,99,.1)", padding: "6px 12px", borderRadius: "999px" }}>Кинезиология</span>
            <span style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: "11.5px", color: "#0094B8", background: "rgba(0,148,184,.1)", padding: "6px 12px", borderRadius: "999px" }}>Кинезиотерапия</span>
            <span style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: "11.5px", color: "#EB6074", background: "rgba(235,96,116,.1)", padding: "6px 12px", borderRadius: "999px" }}>Долголетие</span>
          </div>
        </section>

        {/* 3. Тренировки — Главный Hero-баннер */}
        <section className="bento-grid__item bento-grid__item--full">
          <h2 style={{ margin: "0 2px 12px", fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: "22px", color: "#1d2321", letterSpacing: "-.4px" }}>Тренировки</h2>
          <div
            onClick={() => setIsSelectorOpen(true)}
            style={{ position: "relative", height: "182px", borderRadius: "22px", overflow: "hidden", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", cursor: "pointer", justifyContent: "center", boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)" }}
          >
            <div style={{ width: "54px", height: "54px", borderRadius: "16px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px -6px rgba(27,171,124,.4)" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1BAB7C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"></path><path d="m21 21-1-1"></path><path d="m3 3 1 1"></path><path d="m18 22 4-4"></path><path d="m2 6 4-4"></path><path d="m3 10 7-7"></path><path d="m14 21 7-7"></path></svg>
            </div>
            <span style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: "12.5px", color: "#6E6E6E", letterSpacing: ".3px" }}>Процесс тренировки</span>
          </div>
          <button
            onClick={() => setIsSelectorOpen(true)}
            style={{ marginTop: "13px", width: "100%", border: "none", cursor: "pointer", background: "#1BAB7C", color: "#fff", fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: "15px", padding: "15px", borderRadius: "16px", boxShadow: "0 8px 20px -8px rgba(27,171,124,.6)", display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}
          >
            Выбрать тренировку
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
          </button>
        </section>

        {/* 4. Домашние задания */}
        <section className="bento-grid__item bento-grid__item--full">
          <div
            onClick={handleHomeworkClick}
            className="homework-bento-card"
            style={{
              position: "relative",
              background: "#fff",
              borderRadius: "20px",
              padding: "18px 18px 0",
              boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)",
              overflow: "hidden",
              cursor: "pointer"
            }}
          >
            <div
              style={{ position: "absolute", top: "16px", right: "16px", width: "38px", height: "38px", borderRadius: "11px", background: "rgba(0,127,99,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {isHomeworkUnlocked ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007F63" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007F63" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              )}
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: "10px", letterSpacing: ".8px", color: "#007F63", background: "rgba(0,127,99,.1)", padding: "5px 11px", borderRadius: "999px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#007F63" }}></span>ПЕРСОНАЛЬНАЯ ПРОГРАММА
            </span>
            <h3 style={{ margin: "13px 0 0", fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: "19px", color: "#1d2321", letterSpacing: "-.3px" }}>Домашние задания</h3>
            <p style={{ margin: "9px 0 0", fontSize: "13px", lineHeight: "1.6", color: "#6E6E6E", fontWeight: 300, maxWidth: "255px" }}>Для тех, кто проходит реабилитацию в центре.</p>
            <div
              style={{ marginTop: "16px", borderTop: "1px solid rgba(0,127,99,.12)", padding: "14px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <span style={{ display: "flex", gap: "9px", fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: "13.5px", color: "#007F63", alignItems: "center" }}>
                {isHomeworkUnlocked ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007F63" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>
                    Открыть программу
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007F63" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    Открывается по коду
                  </>
                )}
              </span>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#007F63" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
            </div>
          </div>
        </section>

        {/* 5. Масла и Омега-3 */}
        <div className="bento-grid__item bento-grid__item--full">
          <button
            className="list-tile"
            onClick={() => onNavigate("health-helpers")}
            style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "14px", background: "#fff", borderRadius: "18px", padding: "15px 16px", boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)", transition: "transform .18s ease, box-shadow .18s ease" }}
          >
            <div style={{ width: "46px", height: "46px", flex: "none", borderRadius: "13px", background: "rgba(0,148,184,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#0094B8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: "15px", color: "#1d2321" }}>Масла и Омега-3</div>
              <div style={{ fontSize: "11.5px", color: "#6E6E6E", marginTop: "2px", fontWeight: 300 }}>Нутрицевтики для здоровья тела</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0094B8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
          </button>
        </div>

        {/* 6. Статьи и подкасты */}
        <div className="bento-grid__item bento-grid__item--full">
          <button
            className="list-tile"
            onClick={() => onNavigate("creator-materials")}
            style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "14px", background: "#fff", borderRadius: "18px", padding: "15px 16px", boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)", transition: "transform .18s ease, box-shadow .18s ease" }}
          >
            <div style={{ width: "46px", height: "46px", flex: "none", borderRadius: "13px", background: "rgba(0,127,99,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#007F63" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: "15px", color: "#1d2321" }}>Статьи и подкасты</div>
              <div style={{ fontSize: "11.5px", color: "#6E6E6E", marginTop: "2px", fontWeight: 300 }}>Знания о теле и движении</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007F63" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
          </button>
        </div>

        {/* 7. Магазин & Наш Telegram */}
        <section className="bento-grid__item bento-grid__item--full" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "0" }}>
          <button
            className="mini-card"
            onClick={() => onNavigate("shop")}
            style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: "10px", background: "#fff", borderRadius: "18px", padding: "15px 14px", boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)", transition: "transform .18s ease, box-shadow .18s ease" }}
          >
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(235,96,116,.12)", display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "flex-start" }}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#EB6074" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            </div>
            <div style={{ textAlign: "left", width: "100%" }}>
              <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: "13.5px", color: "#1d2321" }}>Магазин</div>
              <div style={{ fontSize: "11px", color: "#6E6E6E", marginTop: "1px", fontWeight: 300 }}>Купить гирю</div>
            </div>
          </button>

          <button
            className="mini-card"
            onClick={handlePlaceholderClick}
            style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: "10px", background: "#fff", borderRadius: "18px", padding: "15px 14px", boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)", transition: "transform .18s ease, box-shadow .18s ease" }}
          >
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(0,148,184,.12)", display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "flex-start" }}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#0094B8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>
            </div>
            <div style={{ textAlign: "left", width: "100%" }}>
              <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: "13.5px", color: "#1d2321" }}>Наш Telegram</div>
              <div style={{ fontSize: "11px", color: "#6E6E6E", marginTop: "1px", fontWeight: 300 }}>Сообщество</div>
            </div>
          </button>
        </section>
      </div>

      {/* === Модальное окно выбора активности (подменю) === */}
      {isSelectorOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsSelectorOpen(false);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal modal--selector"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "calc(100% - 24px)", maxWidth: "440px", maxHeight: "90vh", overflowY: "auto", padding: "20px 0" }}
          >
            <div className="modal__header" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "12px", marginBottom: "8px", padding: "0 20px" }}>
              <button className="back-btn" onClick={(e) => {
                e.stopPropagation();
                setIsSelectorOpen(false);
              }}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                <span>Назад</span>
              </button>
              <h2 className="modal__title" style={{ margin: 0, fontSize: "1.4rem", fontWeight: "800", color: "var(--color-text)" }}>
                Выбор тренировки
              </h2>
            </div>

            {/* Поле поиска по названию тренировок */}
            <div style={{ padding: "0 20px 10px 20px" }}>
              <div style={{ position: "relative", width: "100%" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", pointerEvents: "none" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Поиск тренировки..."
                  value={selectorSearch}
                  onChange={(e) => setSelectorSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 34px",
                    borderRadius: "10px",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.85rem",
                    fontFamily: "'Manrope', sans-serif",
                    outline: "none",
                    backgroundColor: "#fff",
                    color: "var(--color-text)"
                  }}
                />
                {selectorSearch && (
                  <button
                    onClick={() => setSelectorSearch("")}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-text-secondary)",
                      opacity: 0.7
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Вкладки категорий общих тренировок в формате карточек с иконками */}
            <div
              style={{
                margin: "4px 20px 12px 20px",
                display: "flex",
                gap: "10px",
                overflowX: "auto",
                width: "calc(100% - 40px)",
                padding: "4px 0",
                msOverflowStyle: "none",
                scrollbarWidth: "none",
                flexShrink: 0
              }}
              className="no-scrollbar"
            >
              {[
                {
                  id: "Все", label: "Все", icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  )
                },
                {
                  id: "Дыхание", label: "Дыхание", icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
                    </svg>
                  )
                },
                {
                  id: "Шаг", label: "Шаг", icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="13" cy="4" r="2" />
                      <path d="M13 18l-3-5-1-4-2 2v6" />
                      <path d="M6 20h3l1-4" />
                      <path d="M17 20l-1-4-3-1" />
                    </svg>
                  )
                }
              ].map((tab) => {
                const isActive = selectedSelectorTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedSelectorTab(tab.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 16px",
                      borderRadius: "14px",
                      fontSize: "13px",
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: "700",
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: isActive ? "var(--color-accent)" : "var(--color-border)",
                      backgroundColor: isActive ? "rgba(27, 171, 124, 0.08)" : "#fff",
                      color: isActive ? "var(--color-active)" : "var(--color-text-secondary)",
                      boxShadow: isActive ? "0 4px 12px rgba(27, 171, 124, 0.12)" : "0 2px 6px rgba(0,0,0,0.02)",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease",
                      flexShrink: 0,
                      flex: 1
                    }}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Группа: Гиревое дыхание */}
            {(selectedSelectorTab === "Все" || selectedSelectorTab === "Дыхание") && (
              <div className="activity-section" style={{ padding: "0 20px" }}>
                <h3 className="activity-section__title">Гиревое дыхание</h3>
                <div className="activity-section__grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                  {filteredBreathingGroup.length === 0 ? (
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", fontStyle: "italic", padding: "4px 0", gridColumn: "span 2" }}>Ничего не найдено</span>
                  ) : (
                    filteredBreathingGroup.map((item) => (
                      <button
                        key={item.id}
                        className="workout-card-btn"
                        onClick={() => handleSelectActivity(item)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "stretch",
                          width: "100%",
                          padding: "10px",
                          backgroundColor: "#fff",
                          border: "none",
                          borderRadius: "18px",
                          cursor: "pointer",
                          textAlign: "left",
                          boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {/* Large photo placeholder (video preview) */}
                        <div
                          style={{
                            position: "relative",
                            width: "100%",
                            height: "100px",
                            backgroundColor: "rgba(27, 171, 124, 0.08)",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            background: "repeating-linear-gradient(135deg, #E9EBEA, #E9EBEA 11px, #F1F3F2 11px, #F1F3F2 22px)",
                            border: "1px solid rgba(27, 171, 124, 0.06)"
                          }}
                        >
                          <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            backdropFilter: "blur(4px)"
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1BAB7C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="5 3 19 12 5 21 5 3" fill="#1BAB7C" />
                            </svg>
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "10px" }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "var(--color-text)", fontFamily: "'Manrope', sans-serif" }}>
                            {item.label}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", fontSize: "0.65rem", color: "#007F63", background: "rgba(0,127,99,0.06)", padding: "3px 6px", borderRadius: "6px", fontWeight: "600" }}>
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                              {item.duration}
                            </span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", fontSize: "0.65rem", color: "#0094B8", background: "rgba(0,148,184,0.06)", padding: "3px 6px", borderRadius: "6px", fontWeight: "600" }}>
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                              {item.level}
                            </span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", fontSize: "0.65rem", color: "#EB6074", background: "rgba(235,96,116,0.06)", padding: "3px 6px", borderRadius: "6px", fontWeight: "600" }}>
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                              {item.equipment}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Группа: Методика шага */}
            {(selectedSelectorTab === "Все" || selectedSelectorTab === "Шаг") && (
              <div className="activity-section" style={{ marginTop: selectedSelectorTab === "Все" ? "14px" : "0px", padding: "0 20px" }}>
                <h3 className="activity-section__title">Методика шага</h3>
                <div className="activity-section__grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                  {filteredStepGroup.length === 0 ? (
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", fontStyle: "italic", padding: "4px 0", gridColumn: "span 2" }}>Ничего не найдено</span>
                  ) : (
                    filteredStepGroup.map((item) => (
                      <button
                        key={item.id}
                        className="workout-card-btn"
                        onClick={() => handleSelectActivity(item)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "stretch",
                          width: "100%",
                          padding: "10px",
                          backgroundColor: "#fff",
                          border: "none",
                          borderRadius: "18px",
                          cursor: "pointer",
                          textAlign: "left",
                          boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {/* Large photo placeholder (video preview) */}
                        <div
                          style={{
                            position: "relative",
                            width: "100%",
                            height: "100px",
                            backgroundColor: "rgba(0, 148, 184, 0.08)",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            background: "repeating-linear-gradient(135deg, #E9ECEF, #E9ECEF 11px, #F1F3F5 11px, #F1F3F5 22px)",
                            border: "1px solid rgba(0, 148, 184, 0.06)"
                          }}
                        >
                          <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            backdropFilter: "blur(4px)"
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0094B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="5 3 19 12 5 21 5 3" fill="#0094B8" />
                            </svg>
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "10px" }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "var(--color-text)", fontFamily: "'Manrope', sans-serif" }}>
                            {item.label}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", fontSize: "0.65rem", color: "#007F63", background: "rgba(0,127,99,0.06)", padding: "3px 6px", borderRadius: "6px", fontWeight: "600" }}>
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                              {item.duration}
                            </span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", fontSize: "0.65rem", color: "#0094B8", background: "rgba(0,148,184,0.06)", padding: "3px 6px", borderRadius: "6px", fontWeight: "600" }}>
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                              {item.level}
                            </span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", fontSize: "0.65rem", color: "#EB6074", background: "rgba(235,96,116,0.06)", padding: "3px 6px", borderRadius: "6px", fontWeight: "600" }}>
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                              {item.equipment}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Кнопка перехода к домашним тренировкам */}
            <div style={{ marginTop: "20px", borderTop: "1px solid var(--color-border)", padding: "16px 20px 0 20px" }}>
              <button
                className="workout-card-btn"
                onClick={handleHomeworkClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  width: "100%",
                  padding: "16px",
                  backgroundColor: "#fff",
                  borderRadius: "14px",
                  cursor: "pointer",
                  textAlign: "left",
                  boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(0, 127, 99, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007F63" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: "800", color: "#007F63" }}>
                    Домашние тренировки
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                    Индивидуальная программа реабилитации
                  </span>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007F63" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </div>

          </div>
        </div>
      )}


      {/* === Модальное окно активации кода доступа === */}
      {isCodeModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setIsCodeModalOpen(false); }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "380px" }}>
            <h2 style={{ margin: "0 0 6px 0", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "18px", color: "var(--color-text)" }}>
              Код доступа
            </h2>
            <p style={{ margin: "0 0 14px 0", fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: 300, lineHeight: 1.5 }}>
              Введите код, который вам дал врач, чтобы открыть индивидуальные тренировки.
            </p>

            {codeError && (
              <div style={{ color: "#d93025", fontSize: "13px", fontFamily: "'Manrope', sans-serif", fontWeight: 500, backgroundColor: "#fce8e6", padding: "10px 12px", borderRadius: "12px", border: "1px solid #fad2cf", marginBottom: "12px" }}>
                {codeError}
              </div>
            )}

            <input
              type="text"
              placeholder="Например: ABCDE"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 5))}
              onKeyDown={(e) => { if (e.key === "Enter") handleActivateCode(); }}
              className="form-field__input"
              autoFocus
              maxLength={5}
              style={{ borderRadius: "14px", textAlign: "center", letterSpacing: "4px", fontWeight: 700, fontSize: "20px", marginBottom: "14px" }}
            />

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setIsCodeModalOpen(false)}
                style={{ flex: 1, padding: "12px", borderRadius: "14px", border: "1.5px solid #a6a6a1", background: "#fff", color: "var(--color-text)", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
              >
                Отмена
              </button>
              <button
                onClick={handleActivateCode}
                disabled={codeSubmitting}
                style={{ flex: 1.4, padding: "12px", borderRadius: "14px", border: "none", background: "#1BAB7C", color: "#fff", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "14px", cursor: "pointer", opacity: codeSubmitting ? 0.7 : 1 }}
              >
                {codeSubmitting ? "Проверка…" : "Активировать"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === Выделенное модальное окно «Домашнее задание» === */}
      {isHomeworkModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsHomeworkModalOpen(false);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal modal--homework"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "calc(100% - 24px)",
              maxWidth: "440px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              padding: "20px 0 0 0",
              overflow: "hidden",
              gap: 0
            }}
          >
            {/* Шапка модального окна */}
            <div className="modal__header" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "12px", marginBottom: "8px", padding: "0 20px" }}>
              <button className="back-btn" onClick={(e) => {
                e.stopPropagation();
                if (isEditingComplex && customPlaylist.length > 0) {
                  setIsEditingComplex(false);
                } else {
                  setIsHomeworkModalOpen(false);
                }
              }}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                <span>Назад</span>
              </button>
              <h2 className="modal__title" style={{ margin: 0, fontSize: "1.4rem", fontWeight: "800", color: "var(--color-text)" }}>
                {customPlaylist.length > 0 && !isEditingComplex ? "Мой комплекс" : "Домашнее задание"}
              </h2>
            </div>

            {/* Режим 1: Просмотр собранного комплекса (Summary View) */}
            {customPlaylist.length > 0 && !isEditingComplex ? (
              <>
                {/* Прокручиваемое содержимое со списком выбранных упражнений */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "0 20px 20px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    msOverflowStyle: "none",
                    scrollbarWidth: "none"
                  }}
                >
                  <div style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", lineHeight: "1.4" }}>
                    Сохраненная программа упражнений для ваших ежедневных занятий:
                  </div>

                  {/* Прогресс-виджет (показывается только при наличии незавершённой тренировки) */}
                  {savedHomeworkQueue.length > 0 && savedHomeworkIndex >= 0 && (
                    <div style={{
                      backgroundColor: "var(--color-surface)",
                      border: "1.5px solid var(--color-active)",
                      borderRadius: "14px",
                      padding: "14px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px"
                    }}>
                      {/* Заголовок виджета */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--color-active)" }}>
                            Незавершённая тренировка
                          </span>
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", fontWeight: "600" }}>
                          {savedHomeworkIndex} из {savedHomeworkQueue.length}
                        </span>
                      </div>

                      {/* Шаги-кружки */}
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                        {savedHomeworkQueue.map((_, stepIdx) => (
                          <div key={stepIdx} style={{ display: "flex", alignItems: "center" }}>
                            <div style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: stepIdx < savedHomeworkIndex
                                ? "#16a34a"
                                : stepIdx === savedHomeworkIndex
                                  ? "var(--color-active)"
                                  : "var(--color-border)",
                              flexShrink: 0,
                              transition: "all 0.2s ease"
                            }}>
                              {stepIdx < savedHomeworkIndex ? (
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              ) : stepIdx === savedHomeworkIndex ? (
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff" stroke="none">
                                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                              ) : (
                                <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--color-text-secondary)" }}>
                                  {stepIdx + 1}
                                </span>
                              )}
                            </div>
                            {stepIdx < savedHomeworkQueue.length - 1 && (
                              <div style={{
                                width: "16px",
                                height: "2px",
                                backgroundColor: stepIdx < savedHomeworkIndex ? "#16a34a" : "var(--color-border)",
                                margin: "0 2px",
                                transition: "background-color 0.2s ease"
                              }} />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Прогресс-бар */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div style={{
                          height: "6px",
                          backgroundColor: "var(--color-border)",
                          borderRadius: "3px",
                          overflow: "hidden"
                        }}>
                          <div style={{
                            height: "100%",
                            width: `${(savedHomeworkIndex / savedHomeworkQueue.length) * 100}%`,
                            backgroundColor: "var(--color-active)",
                            borderRadius: "3px",
                            transition: "width 0.4s ease"
                          }} />
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                          Выполнено {Math.round((savedHomeworkIndex / savedHomeworkQueue.length) * 100)}%
                        </span>
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {customPlaylist
                      .map((id) => homeworkExercises.find((ex) => ex.id === id))
                      .filter(Boolean)
                      .map((item, idx) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => {
                            if (e.target.closest('button')) {
                              e.preventDefault();
                              return;
                            }
                            handleDragStart(e, idx);
                          }}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDragEnd={handleDragEnd}
                          onDrop={(e) => handleDrop(e, idx)}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "stretch",
                            width: "100%",
                            padding: "12px",
                            backgroundColor: dragOverIndex === idx 
                              ? "rgba(27, 171, 124, 0.05)" 
                              : "#fff",
                            border: dragOverIndex === idx 
                              ? "1.5px dashed var(--color-active)" 
                              : "none",
                            borderRadius: "18px",
                            textAlign: "left",
                            gap: "10px",
                            opacity: draggedIndex === idx ? 0.4 : 1,
                            boxShadow: dragOverIndex === idx ? "none" : "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)",
                            transition: "all 0.15s ease",
                            cursor: draggedIndex === idx ? "grabbing" : "default"
                          }}
                        >
                          {/* Top Row: drag handle, index + move buttons */}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {/* Drag Handle */}
                              <div 
                                style={{ 
                                  cursor: "grab", 
                                  padding: "4px 2px", 
                                  display: "flex", 
                                  alignItems: "center", 
                                  color: "var(--color-text-secondary)",
                                  opacity: 0.6
                                }}
                                title="Перетащить упражнение"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="9" cy="5" r="1.5" />
                                  <circle cx="9" cy="12" r="1.5" />
                                  <circle cx="9" cy="19" r="1.5" />
                                  <circle cx="15" cy="5" r="1.5" />
                                  <circle cx="15" cy="12" r="1.5" />
                                  <circle cx="15" cy="19" r="1.5" />
                                </svg>
                              </div>

                              <span style={{
                                display: "flex", alignItems: "center", justifyContent: "center",
                                minWidth: "22px", height: "22px", borderRadius: "50%",
                                backgroundColor: "var(--color-active)", color: "#fff",
                                fontSize: "0.75rem", fontWeight: "700", flexShrink: 0
                              }}>
                                {idx + 1}
                              </span>
                            </div>

                            {/* Up/Down buttons */}
                            <div style={{ display: "flex", gap: "4px" }}>
                              <button
                                onClick={() => handleMoveUp(idx)}
                                disabled={idx === 0}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: idx === 0 ? "var(--color-border)" : "var(--color-text-secondary)",
                                  cursor: idx === 0 ? "not-allowed" : "pointer",
                                  padding: "4px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: "4px",
                                  backgroundColor: idx === 0 ? "transparent" : "rgba(0,0,0,0.03)",
                                  transition: "all 0.2s ease"
                                }}
                                title="Переместить вверх"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="18 15 12 9 6 15"></polyline>
                                </svg>
                              </button>
                              <button
                                onClick={() => handleMoveDown(idx)}
                                disabled={idx === customPlaylist.length - 1}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: idx === customPlaylist.length - 1 ? "var(--color-border)" : "var(--color-text-secondary)",
                                  cursor: idx === customPlaylist.length - 1 ? "not-allowed" : "pointer",
                                  padding: "4px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: "4px",
                                  backgroundColor: idx === customPlaylist.length - 1 ? "transparent" : "rgba(0,0,0,0.03)",
                                  transition: "all 0.2s ease"
                                }}
                                title="Переместить вниз"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Large photo placeholder (video preview) */}
                          <div
                            style={{
                              position: "relative",
                              width: "100%",
                              height: "120px",
                              backgroundColor: item.category === "Дыхание" ? "rgba(27, 171, 124, 0.08)" : item.category === "Упражнение" ? "rgba(0, 148, 184, 0.08)" : item.category === "Расслабление" ? "rgba(235, 96, 116, 0.08)" : "rgba(0, 148, 184, 0.08)",
                              borderRadius: "12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                              background: item.category === "Дыхание" 
                                ? "repeating-linear-gradient(135deg, #E9EBEA, #E9EBEA 11px, #F1F3F2 11px, #F1F3F2 22px)"
                                : item.category === "Упражнение"
                                  ? "repeating-linear-gradient(135deg, #E9ECEF, #E9ECEF 11px, #F1F3F5 11px, #F1F3F5 22px)"
                                  : "repeating-linear-gradient(135deg, #F9EBEB, #F9EBEB 11px, #FDF1F1 11px, #FDF1F1 22px)",
                              border: item.category === "Дыхание" 
                                ? "1px solid rgba(0, 127, 99, 0.06)" 
                                : item.category === "Упражнение"
                                  ? "1px solid rgba(0, 148, 184, 0.06)"
                                  : "1px solid rgba(235, 96, 116, 0.06)"
                            }}
                          >
                            <div style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              backgroundColor: "rgba(255, 255, 255, 0.9)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                              backdropFilter: "blur(4px)"
                            }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={item.category === "Дыхание" ? "#1BAB7C" : item.category === "Упражнение" ? "#0094B8" : item.category === "Расслабление" ? "#EB6074" : "#0094B8"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="5 3 19 12 5 21 5 3" fill={item.category === "Дыхание" ? "#1BAB7C" : item.category === "Упражнение" ? "#0094B8" : item.category === "Расслабление" ? "#EB6074" : "#0094B8"} />
                              </svg>
                            </div>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--color-text)", fontFamily: "'Manrope', sans-serif" }}>
                              {item.title}
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "0.72rem", color: "#007F63", background: "rgba(0,127,99,0.06)", padding: "4px 8px", borderRadius: "8px", fontWeight: "600" }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                {item.duration}
                              </span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "0.72rem", color: "#0094B8", background: "rgba(0,148,184,0.06)", padding: "4px 8px", borderRadius: "8px", fontWeight: "600" }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                {item.level}
                              </span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "0.72rem", color: "#EB6074", background: "rgba(235,96,116,0.06)", padding: "4px 8px", borderRadius: "8px", fontWeight: "600" }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                                {item.equipment}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Липкий подвал для управления собранным комплексом */}
                <div
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
                    boxShadow: "0 -4px 12px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                  }}
                >
                  {/* Главная кнопка — Продолжить (если есть прогресс) или Начать комплекс */}
                  {savedHomeworkQueue.length > 0 && savedHomeworkIndex >= 0 ? (
                    <button
                      onClick={() => {
                        setPlaylistQueue(savedHomeworkQueue);
                        setCurrentPlaylistIndex(savedHomeworkIndex);
                        setSelectedWorkout(savedHomeworkQueue[savedHomeworkIndex]);
                        setIsHomeworkModalOpen(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "14px",
                        backgroundColor: "var(--color-active)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        fontSize: "0.95rem",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      Продолжить ({savedHomeworkIndex} из {savedHomeworkQueue.length})
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const selectedWorkouts = customPlaylist
                          .map((id) => homeworkExercises.find((ex) => ex.id === id))
                          .filter(Boolean);
                        setPlaylistQueue(selectedWorkouts);
                        setCurrentPlaylistIndex(0);
                        setSelectedWorkout(selectedWorkouts[0]);
                        setIsHomeworkModalOpen(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "14px",
                        backgroundColor: "var(--color-active)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        fontSize: "0.95rem",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      Начать комплекс ({customPlaylist.length})
                    </button>
                  )}

                  {/* Вторичные кнопки: Редактировать и Сбросить */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setIsEditingComplex(true)}
                      style={{
                        flex: 1,
                        padding: "11px 8px",
                        backgroundColor: "transparent",
                        color: "var(--color-text)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-sm)",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontSize: "0.82rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px"
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                      Редактировать
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Сбросить весь комплекс и прогресс?")) {
                          setCustomPlaylist([]);
                          clearSavedHomework();
                          setIsEditingComplex(true);
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "11px 8px",
                        backgroundColor: "transparent",
                        color: "#ef4444",
                        border: "1px solid #fca5a5",
                        borderRadius: "var(--radius-sm)",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontSize: "0.82rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px"
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4h6v2"></path></svg>
                      Сбросить
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Режим 2: Редактирование списка упражнений (Editor View) */
              <>
                {/* Поиск по названию упражнения */}
                <div style={{ margin: "4px 20px 8px 20px" }}>
                  <div style={{ position: "relative", width: "100%" }}>
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", pointerEvents: "none" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Поиск упражнения..."
                      value={homeworkSearch}
                      onChange={(e) => setHomeworkSearch(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px 10px 34px",
                        borderRadius: "12px",
                        border: "1px solid var(--color-border)",
                        fontSize: "0.85rem",
                        fontFamily: "'Manrope', sans-serif",
                        outline: "none",
                        backgroundColor: "#fff",
                        color: "var(--color-text)"
                      }}
                    />
                    {homeworkSearch && (
                      <button
                        onClick={() => setHomeworkSearch("")}
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-text-secondary)",
                          opacity: 0.7
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Вкладки категорий домашних тренировок в формате карточек с иконками */}
                <div
                  style={{
                    margin: "4px 20px 12px 20px",
                    display: "flex",
                    gap: "10px",
                    overflowX: "auto",
                    width: "calc(100% - 40px)",
                    padding: "4px 0",
                    msOverflowStyle: "none",
                    scrollbarWidth: "none",
                    flexShrink: 0
                  }}
                  className="no-scrollbar"
                >
                  {[
                    {
                      id: "Все", label: "Все", icon: (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                        </svg>
                      )
                    },
                    {
                      id: "Дыхание", label: "Дыхание", icon: (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
                        </svg>
                      )
                    },
                    {
                      id: "Упражнение", label: "Упражнения", icon: (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2" />
                          <path d="M6 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2" />
                          <path d="M6 12h12" />
                          <path d="M6.5 4.5v15" />
                          <path d="M17.5 4.5v15" />
                        </svg>
                      )
                    },
                    {
                      id: "Расслабление", label: "Расслабление", icon: (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                        </svg>
                      )
                    },
                    {
                      id: "Ходьба", label: "Ходьба", icon: (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="13" cy="4" r="2" />
                          <path d="M13 18l-3-5-1-4-2 2v6" />
                          <path d="M6 20h3l1-4" />
                          <path d="M17 20l-1-4-3-1" />
                        </svg>
                      )
                    }
                  ].map((tab) => {
                    const isActive = selectedHomeworkTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSelectedHomeworkTab(tab.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "10px 16px",
                          borderRadius: "14px",
                          fontSize: "13px",
                          fontFamily: "'Manrope', sans-serif",
                          fontWeight: "700",
                          cursor: "pointer",
                          border: "1px solid",
                          borderColor: isActive ? "var(--color-accent)" : "var(--color-border)",
                          backgroundColor: isActive ? "rgba(27, 171, 124, 0.08)" : "#fff",
                          color: isActive ? "var(--color-active)" : "var(--color-text-secondary)",
                          boxShadow: isActive ? "0 4px 12px rgba(27, 171, 124, 0.12)" : "0 2px 6px rgba(0,0,0,0.02)",
                          whiteSpace: "nowrap",
                          transition: "all 0.2s ease",
                          flexShrink: 0,
                          flex: 1
                        }}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Прокручиваемое содержимое со списком 48 упражнений */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "0 20px 20px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    msOverflowStyle: "none",
                    scrollbarWidth: "none"
                  }}
                >

                  {/* Описание */}
                  <div style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", marginBottom: "4px", lineHeight: "1.4" }}>
                    Выберите индивидуальные упражнения в нужном вам порядке для составления плейлиста тренировки:
                  </div>

                  {/* Список тренировок с галочками/порядковыми номерами */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                    {homeworkExercises
                      .filter((item) => selectedHomeworkTab === "Все" || item.category === selectedHomeworkTab)
                      .filter((item) =>
                        item.title.toLowerCase().includes(homeworkSearch.toLowerCase()) ||
                        (item.description && item.description.toLowerCase().includes(homeworkSearch.toLowerCase()))
                      )
                      .map((item, idx) => {
                        const playlistIndex = customPlaylist.indexOf(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              if (customPlaylist.includes(item.id)) {
                                setCustomPlaylist(customPlaylist.filter((id) => id !== item.id));
                              } else {
                                setCustomPlaylist([...customPlaylist, item.id]);
                              }
                            }}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "stretch",
                              width: "100%",
                              padding: "10px",
                              backgroundColor: "#fff",
                              border: "none",
                              borderRadius: "18px",
                              cursor: "pointer",
                              textAlign: "left",
                              boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)",
                              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                              gap: "10px"
                            }}
                            className="workout-card-btn"
                          >
                            {/* Top Row: list index & selection indicator */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                              <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-text-secondary)" }}>
                                {idx + 1}.
                              </span>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                {playlistIndex >= 0 ? (
                                  <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "22px",
                                    height: "22px",
                                    borderRadius: "50%",
                                    backgroundColor: "var(--color-active)",
                                    color: "#fff",
                                    fontSize: "0.75rem",
                                    fontWeight: "700"
                                  }}>
                                    {playlistIndex + 1}
                                  </div>
                                ) : (
                                  <div style={{
                                    width: "22px",
                                    height: "22px",
                                    borderRadius: "50%",
                                    border: "2px solid var(--color-border)",
                                    backgroundColor: "transparent"
                                  }} />
                                )}
                              </div>
                            </div>

                            {/* Middle Row: Large photo preview placeholder */}
                            <div
                              style={{
                                position: "relative",
                                width: "100%",
                                height: "100px",
                                backgroundColor: item.category === "Дыхание" ? "rgba(27, 171, 124, 0.08)" : item.category === "Упражнение" ? "rgba(0, 148, 184, 0.08)" : item.category === "Расслабление" ? "rgba(235, 96, 116, 0.08)" : "rgba(0, 148, 184, 0.08)",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                                background: item.category === "Дыхание" 
                                  ? "repeating-linear-gradient(135deg, #E9EBEA, #E9EBEA 11px, #F1F3F2 11px, #F1F3F2 22px)"
                                  : item.category === "Упражнение"
                                    ? "repeating-linear-gradient(135deg, #E9ECEF, #E9ECEF 11px, #F1F3F5 11px, #F1F3F5 22px)"
                                    : "repeating-linear-gradient(135deg, #F9EBEB, #F9EBEB 11px, #FDF1F1 11px, #FDF1F1 22px)",
                                border: item.category === "Дыхание" 
                                  ? "1px solid rgba(0, 127, 99, 0.06)" 
                                  : item.category === "Упражнение"
                                    ? "1px solid rgba(0, 148, 184, 0.06)"
                                    : "1px solid rgba(235, 96, 116, 0.06)"
                              }}
                            >
                              <div style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                backdropFilter: "blur(4px)"
                              }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={item.category === "Дыхание" ? "#1BAB7C" : item.category === "Упражнение" ? "#0094B8" : item.category === "Расслабление" ? "#EB6074" : "#0094B8"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="5 3 19 12 5 21 5 3" fill={item.category === "Дыхание" ? "#1BAB7C" : item.category === "Упражнение" ? "#0094B8" : item.category === "Расслабление" ? "#EB6074" : "#0094B8"} />
                                </svg>
                              </div>
                            </div>

                            {/* Bottom Row: title and badges */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
                              <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "var(--color-text)", fontFamily: "'Manrope', sans-serif" }}>
                                {item.title}
                              </span>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", fontSize: "0.65rem", color: "#007F63", background: "rgba(0,127,99,0.06)", padding: "3px 6px", borderRadius: "6px", fontWeight: "600" }}>
                                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                  {item.duration}
                                </span>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", fontSize: "0.65rem", color: "#0094B8", background: "rgba(0,148,184,0.06)", padding: "3px 6px", borderRadius: "6px", fontWeight: "600" }}>
                                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                  {item.level}
                                </span>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", fontSize: "0.65rem", color: "#EB6074", background: "rgba(235,96,116,0.06)", padding: "3px 6px", borderRadius: "6px", fontWeight: "600" }}>
                                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                                  {item.equipment}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Подвал с кнопками сохранения и начала тренировки */}
                <div
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
                    boxShadow: "0 -4px 12px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}
                >
                  <button
                    onClick={() => {
                      const selectedWorkouts = customPlaylist
                        .map((id) => homeworkExercises.find((ex) => ex.id === id))
                        .filter(Boolean);
                      setPlaylistQueue(selectedWorkouts);
                      setCurrentPlaylistIndex(0);
                      setSelectedWorkout(selectedWorkouts[0]);
                      setIsHomeworkModalOpen(false);
                    }}
                    disabled={customPlaylist.length === 0}
                    style={{
                      width: "100%",
                      padding: "14px",
                      backgroundColor: customPlaylist.length > 0 ? "var(--color-active)" : "var(--color-bg)",
                      color: customPlaylist.length > 0 ? "#fff" : "var(--color-text-secondary)",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      fontWeight: "600",
                      cursor: customPlaylist.length > 0 ? "pointer" : "not-allowed",
                      opacity: customPlaylist.length > 0 ? 1 : 0.6,
                      transition: "all 0.2s ease"
                    }}
                  >
                    Начать тренировку ({customPlaylist.length})
                  </button>

                  {customPlaylist.length > 0 && (
                    <button
                      onClick={() => {
                        setIsEditingComplex(false);
                        setToast({ visible: true, message: "Комплекс сохранен!", type: "success" });
                      }}
                      style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: "transparent",
                        color: "var(--color-active)",
                        border: "1px solid var(--color-active)",
                        borderRadius: "var(--radius-sm)",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        transition: "all 0.2s ease"
                      }}
                    >
                      Сохранить комплекс
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* === Модальное окно тренировки === */}
      {selectedWorkout && (
        <WorkoutModal
          workout={selectedWorkout}
          onClose={handlePlayerClose}
          onComplete={handlePlayerWorkoutComplete}
          onBackToList={handlePlayerBackToList}
          playlist={playlistQueue}
          currentIndex={currentPlaylistIndex}
          onIndexChange={(idx) => {
            if (idx >= 0 && idx < playlistQueue.length) {
              setCurrentPlaylistIndex(idx);
              setSelectedWorkout(playlistQueue[idx]);
            }
          }}
        />
      )}

      {/* Тост-уведомление внизу экрана */}
      {toast.visible && (
        <div style={{
          position: "fixed",
          bottom: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          border: toast.type === "error" ? "1px solid #fca5a5" : "1px solid var(--color-border)",
          borderRadius: "14px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          zIndex: 2000,
          width: "calc(100% - 32px)",
          maxWidth: "360px",
          animation: "fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          <span style={{ fontSize: "1.1rem" }}>
            {toast.type === "success" ? "🔓" : toast.type === "error" ? "❌" : "ℹ️"}
          </span>
          <span style={{ fontSize: "0.82rem", fontWeight: "600", color: toast.type === "error" ? "#dc2626" : "var(--color-text)" }}>
            {toast.message}
          </span>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </section>
  );
}
