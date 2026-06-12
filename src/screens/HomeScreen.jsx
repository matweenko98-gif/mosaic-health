import React, { useState, useEffect } from "react";
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

  // 8 новых упражнений для Домашнего задания
  const homeworkExercises = [
    {
      id: 101,
      title: "МФР стопы теннисным мячом",
      label: "МФР стопы",
      description: "Миофасциальный релиз подошвенной поверхности стопы с помощью теннисного мяча для улучшения чувствительности и снятия напряжения.",
      duration: "10 мин",
      level: "Базовый",
      equipment: "Теннисный мяч",
    },
    {
      id: 102,
      title: "Декомпрессия поясницы в полуприседе",
      label: "Декомпрессия поясницы",
      description: "Упражнение для мягкого вытяжения поясничного отдела позвоночника за счет осевого разгружения под действием силы тяжести.",
      duration: "12 мин",
      level: "Базовый",
      equipment: "Без инвентаря",
    },
    {
      id: 103,
      title: "Диафрагмальное дыхание с валиком",
      label: "Дыхание с валиком",
      description: "Дыхательная практика в положении лежа на спине с валиком под грудным отделом для раскрытия ребер и мобилизации диафрагмы.",
      duration: "15 мин",
      level: "Базовый",
      equipment: "Валик / полотенце",
    },
    {
      id: 104,
      title: "Активация глубоких сгибателей шеи",
      label: "Активация сгибателей шеи",
      description: "Мягкие кивательные движения лежа на спине для включения глубокой мускулатуры шеи и коррекции положения головы (текстовой шеи).",
      duration: "8 мин",
      level: "Базовый",
      equipment: "Без инвентаря",
    },
    {
      id: 105,
      title: "Коактивация ягодичных мышц при шаге",
      label: "Коактивация ягодиц при шаге",
      description: "Изолированное обучение правильной координации толчковой ноги в фазе заднего толчка шага с акцентом на большую ягодичную мышцу.",
      duration: "15 мин",
      level: "Средний",
      equipment: "Без инвентаря",
    },
    {
      id: 106,
      title: "Мобилизация ТБС в положении Z-седа",
      label: "Мобилизация ТБС в Z-седе",
      description: "Вращение бедра внутрь и наружу из положения Z-седа для восстановления мобильности тазобедренных суставов и снятия блоков в тазу.",
      duration: "12 мин",
      level: "Средний",
      equipment: "Коврик",
    },
    {
      id: 107,
      title: "Косая стабилизация корпуса",
      label: "Косая стабилизация",
      description: "Упражнение на боку для тренировки косых систем (передней и задней), связывающих плечевой пояс и противоположную тазовую кость.",
      duration: "15 мин",
      level: "Продвинутый",
      equipment: "Коврик",
    },
    {
      id: 108,
      title: "Динамический релиз грудных мышц",
      label: "Релиз грудных мышц",
      description: "Динамическая растяжка и ручной самомассаж малой и большой грудных мышц для раскрытия плеч и устранения сутулости.",
      duration: "10 мин",
      level: "Базовый",
      equipment: "Без инвентаря",
    },
  ];

  // Состояния для Домашнего задания
  const [isHomeworkUnlocked, setIsHomeworkUnlocked] = useState(
    () => localStorage.getItem("homeworkUnlocked") === "true"
  );
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  
  // Выбранный плейлист (массив ID)
  const [customPlaylist, setCustomPlaylist] = useState([]);

  // Состояние видимости выделенного модального окна Домашнего задания
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);

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
    alert("Раздел находится в разработке");
  }

  function handleSelectActivity(activity) {
    setSelectedWorkout(activity);
    setIsSelectorOpen(false);
  }

  function handleHomeworkClick() {
    if (isHomeworkUnlocked) {
      setIsSelectorOpen(false);
      setIsHomeworkModalOpen(true);
    } else {
      setIsPinModalOpen(true);
      setPinInput("");
      setPinError("");
    }
  }

  function handleVerifyPin() {
    if (pinInput === "0000") {
      localStorage.setItem("homeworkUnlocked", "true");
      setIsHomeworkUnlocked(true);
      setIsPinModalOpen(false);
      setPinInput("");
      setPinError("");
      setIsSelectorOpen(false);
      setIsHomeworkModalOpen(true);
      alert("Доступ открыт!");
    } else {
      setPinError("Неверный код доступа");
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
    setSelectedWorkout(null);
    setCurrentPlaylistIndex(-1);
    setPlaylistQueue([]);
  }

  function handlePlayerBackToList() {
    const isHomework = playlistQueue.length > 0 && playlistQueue[0].id >= 101;
    setSelectedWorkout(null);
    setCurrentPlaylistIndex(-1);
    setPlaylistQueue([]);
    if (isHomework) {
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
    }
  }

  return (
    <section className="screen" id="screen-home">
      {/* === Bento-сетка === */}
      <div className="bento-grid">
        {/* 1. Баннер — полная ширина */}
        <div className="bento-grid__item bento-grid__item--full" id="card-banner">
          <div className="banner-placeholder">
            <span className="banner-placeholder__text">
              [Заглушка Баннера Мозаика Здоровья]
            </span>
          </div>
        </div>

        {/* 2. О методике — полная ширина */}
        <div className="bento-grid__item bento-grid__item--full" id="card-method">
          <div className="card">
            <h2 className="card__title">О методике</h2>
            <p className="card__text">{methodDescription}</p>
          </div>
        </div>

        {/* 3. Тренировки — Главный Hero-баннер */}
        <div className="bento-grid__item bento-grid__item--full" id="card-workouts">
          <div className="card hero-workout-card">
            <h2 className="hero-workout-card__title">Тренировки</h2>

            {/* Фото-заглушка: Процесс тренировки */}
            <div
              className="hero-workout-card__photo-placeholder"
              onClick={() => setIsSelectorOpen(true)}
              style={{ cursor: "pointer" }}
            >
              <span className="hero-workout-card__photo-text">
                [ Фото-заглушка: Процесс тренировки ]
              </span>
            </div>

            {/* Главная кнопка выбора */}
            <button
              id="btn-workouts-hero-select"
              className="btn-save hero-workout-card__btn"
              onClick={() => setIsSelectorOpen(true)}
              style={{ marginTop: "12px", width: "100%" }}
            >
              Выбрать тренировку
            </button>
          </div>
        </div>

        {/* 4. Масла и Омега-3 — Компактная строка (List Tile) */}
        <div
          className="bento-grid__item bento-grid__item--full"
          id="tile-health-helpers"
        >
          <button
            className="list-tile"
            onClick={() => onNavigate("health-helpers")}
          >
            <div
              className="list-tile__icon-placeholder"
              style={{ backgroundColor: "#eef2ff" }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z" />
              </svg>
            </div>
            <span className="list-tile__title">Масла и Омега-3</span>
            <div className="list-tile__chevron">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>
        </div>

        {/* 5. Статьи и подкасты — Компактная строка (List Tile) */}
        <div
          className="bento-grid__item bento-grid__item--full"
          id="tile-creator-materials"
        >
          <button
            className="list-tile"
            onClick={() => onNavigate("creator-materials")}
          >
            <div
              className="list-tile__icon-placeholder"
              style={{ backgroundColor: "#f3f4f6" }}
            >
              <span style={{ fontSize: "1.2rem" }}>📖</span>
            </div>
            <span className="list-tile__title">Статьи и подкасты</span>
            <div className="list-tile__chevron">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>
        </div>

        {/* 6. Магазин — Bento-карточка, половина ширины */}
        <div className="bento-grid__item bento-grid__item--half" id="card-mini-shop">
          <button className="mini-card" onClick={() => onNavigate("shop")}>
            <span className="mini-card__label">Магазин</span>
            <span className="mini-card__sublabel">Купить гирю</span>
          </button>
        </div>

        {/* 7. Наш Telegram — Bento-карточка, половина ширины */}
        <div
          className="bento-grid__item bento-grid__item--half"
          id="card-mini-telegram"
        >
          <button className="mini-card" onClick={handlePlaceholderClick}>
            <span className="mini-card__label">Наш Telegram</span>
            <span className="mini-card__sublabel">Сообщество</span>
          </button>
        </div>
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
            style={{ maxWidth: "400px", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className="modal__header" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "12px", marginBottom: "8px" }}>
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
                Выбор активности
              </h2>
            </div>

            {/* Группа: Гиревое дыхание */}
            <div className="activity-section">
              <h3 className="activity-section__title">Гиревое дыхание</h3>
              <div className="activity-section__grid" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {breathingGroup.map((item) => (
                  <button
                    key={item.id}
                    className="workout-card-btn"
                    onClick={() => handleSelectActivity(item)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      width: "100%",
                      padding: "10px",
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background-color 0.15s ease, border-color 0.15s ease",
                    }}
                  >
                    <div
                      className="workout-card-btn__img"
                      style={{
                        flexShrink: 0,
                        width: "48px",
                        height: "48px",
                        backgroundColor: "#f3f4f6",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#6b7280"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                    </div>

                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-text)" }}>
                        {item.label}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "0.72rem", color: "#6b7280" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                          {item.duration}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "0.72rem", color: "#6b7280" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                          {item.level}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "0.72rem", color: "#6b7280" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                          {item.equipment}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Группа: Методика шага */}
            <div className="activity-section" style={{ marginTop: "14px" }}>
              <h3 className="activity-section__title">Методика шага</h3>
              <div className="activity-section__grid" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {stepGroup.map((item) => (
                  <button
                    key={item.id}
                    className="workout-card-btn"
                    onClick={() => handleSelectActivity(item)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      width: "100%",
                      padding: "10px",
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background-color 0.15s ease, border-color 0.15s ease",
                    }}
                  >
                    <div
                      className="workout-card-btn__img"
                      style={{
                        flexShrink: 0,
                        width: "48px",
                        height: "48px",
                        backgroundColor: "#f3f4f6",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#6b7280"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 22v-4h18v4H3zM21 14V4H3v10h18zM12 9H9v2h3V9zm0 0h3v2h-3V9z" />
                      </svg>
                    </div>

                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-text)" }}>
                        {item.label}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "0.72rem", color: "#6b7280" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                          {item.duration}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "0.72rem", color: "#6b7280" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                          {item.level}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "0.72rem", color: "#6b7280" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                          {item.equipment}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Группа: Персональная программа */}
            <div className="activity-section" style={{ marginTop: "14px" }}>
              <h3 className="activity-section__title">Персональная программа</h3>
              
              <button
                className="workout-card-btn"
                onClick={handleHomeworkClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "16px",
                  backgroundColor: "var(--color-surface)",
                  border: isHomeworkUnlocked ? "1px solid var(--color-border)" : "1px dashed var(--color-border)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--color-text)" }}>
                    Домашнее задание
                  </span>
                  <span style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)" }}>
                    Индивидуальный план от вашего специалиста
                  </span>
                </div>
                <div style={{ color: isHomeworkUnlocked ? "var(--color-active)" : "var(--color-text-secondary)", opacity: isHomeworkUnlocked ? 0.9 : 0.6 }}>
                  {isHomeworkUnlocked ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  )}
                </div>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* === Модальное окно ввода PIN-кода === */}
      {isPinModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsPinModalOpen(false);
              setPinError("");
              setPinInput("");
            }
          }}
          style={{ zIndex: 300 }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "340px", padding: "24px" }}
          >
            <h3 className="modal__title" style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "8px" }}>
              Доступ к домашнему заданию
            </h3>
            <p className="modal__desc" style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "16px", lineHeight: "1.4" }}>
              Введите персональный код доступа, выданный специалистом центра.
            </p>

            <div className="form-field" style={{ marginBottom: "16px" }}>
              <input
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={4}
                placeholder="Код"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError("");
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "1.1rem",
                  textAlign: "center",
                  letterSpacing: "8px",
                  fontWeight: "600",
                  outline: "none"
                }}
              />
              {pinError && (
                <span style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "4px", display: "block", textAlign: "center" }}>
                  {pinError}
                </span>
              )}
            </div>

            <div className="modal__actions" style={{ display: "flex", gap: "10px", flexDirection: "row" }}>
              <button
                className="modal__btn modal__btn--secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPinModalOpen(false);
                  setPinError("");
                  setPinInput("");
                }}
                style={{ flex: 1, padding: "10px" }}
              >
                Отмена
              </button>
              <button
                className="modal__btn modal__btn--primary"
                onClick={handleVerifyPin}
                style={{ flex: 1, padding: "10px" }}
              >
                Подтвердить
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
              setIsSelectorOpen(true);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal modal--homework"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "400px", maxHeight: "90vh", overflowY: "auto" }}
          >
            {/* Шапка модального окна */}
            <div className="modal__header" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "12px", marginBottom: "8px" }}>
              <button className="back-btn" onClick={(e) => {
                e.stopPropagation();
                setIsHomeworkModalOpen(false);
                setIsSelectorOpen(true);
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
                Домашнее задание
              </h2>
            </div>

            {/* Баннер незавершенной тренировки */}
            {savedHomeworkQueue.length > 0 && savedHomeworkIndex >= 0 && (
              <div style={{
                backgroundColor: "var(--color-active-light, #eff6ff)",
                border: "1px solid var(--color-active-border, #bfdbfe)",
                borderRadius: "12px",
                padding: "12px 14px",
                marginBottom: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}>
                <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-active, #2563eb)" }}>
                  У вас есть незавершенная тренировка!
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)" }}>
                  Прогресс: выполнено {savedHomeworkIndex} из {savedHomeworkQueue.length}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => {
                      setPlaylistQueue(savedHomeworkQueue);
                      setCurrentPlaylistIndex(savedHomeworkIndex);
                      setSelectedWorkout(savedHomeworkQueue[savedHomeworkIndex]);
                      setIsHomeworkModalOpen(false);
                    }}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      backgroundColor: "var(--color-active)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "0.78rem",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Продолжить
                  </button>
                  <button
                    onClick={clearSavedHomework}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "transparent",
                      color: "var(--color-text-secondary)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      fontSize: "0.78rem",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Сбросить
                  </button>
                </div>
              </div>
            )}

            {/* Описание */}
            <div style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", marginBottom: "12px", lineHeight: "1.4" }}>
              Выберите индивидуальные упражнения в нужном вам порядке для составления плейлиста тренировки:
            </div>

            {/* Список тренировок с галочками/порядковыми номерами */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {homeworkExercises.map((item, idx) => {
                const playlistIndex = customPlaylist.indexOf(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (customPlaylist.includes(item.id)) {
                        setCustomPlaylist(customPlaylist.filter((id) => id !== item.id));
                      } else {
                        setCustomPlaylist([...customPlaylist, item.id]);
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "12px",
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background-color 0.15s ease, border-color 0.15s ease",
                      gap: "10px"
                    }}
                    className="workout-card-btn"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-text-secondary)", minWidth: "18px" }}>
                        {idx + 1}.
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-text)" }}>
                          {item.title}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)" }}>
                          {item.duration} • {item.level} • {item.equipment}
                        </span>
                      </div>
                    </div>

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
                  </button>
                );
              })}

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
                  marginTop: "8px",
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
            </div>
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
    </section>
  );
}
