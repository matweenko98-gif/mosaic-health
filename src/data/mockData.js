// Перечень начальных данных (mockData.js)
// Источник: 03_mock_data.md

export const initialProfile = {
  age: "34",
  country: "Беларусь",
  passedRehabilitation: true, // true = Да, false = Нет
};

export const initialHistory = [
  { id: 1, date: "05.06.2026", name: "Гиревое дыхание на 7 точек", status: "Выполнено" },
  { id: 2, date: "06.06.2026", name: "Гиревое дыхание на 10 точек", status: "Выполнено" },
];

export const initialSettings = {
  workoutReminders: true,
  articleNotifications: false,
  language: "RU",
};

export const achievements = {
  daysInRow: 5,
};

export const workouts = [
  {
    id: 1,
    title: "Гиревое дыхание на 7 точек",
    description: "Видео-инструкция по методике",
  },
  {
    id: 2,
    title: "Гиревое дыхание на 10 точек",
    description: "Видео-инструкция по методике",
  },
  {
    id: 3,
    title: "Инструкция шага (3 вида)",
    description: "Перспектива расширения",
  },
];

export const methodDescription =
  "Уникальный подход на стыке прикладной кинезиологии и кинезиотерапии. " +
  "Поиск истинной причины боли с помощью мануального мышечного тестирования, " +
  "коррекция состояния с помощью мануальных, дыхательных и физиотерапевтических манипуляций. " +
  "Наша цель — вернуть вашему телу баланс, правильное движение, здоровье и долголетие.";
