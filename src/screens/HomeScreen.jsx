import React, { useState } from "react";
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

  function handlePlaceholderClick() {
    alert("Раздел находится в разработке");
  }

  function handleSelectActivity(activity) {
    setSelectedWorkout(activity);
    setIsSelectorOpen(false);
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
          onClick={() => setIsSelectorOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal modal--selector"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "400px" }}
          >
            <div className="modal__header">
              <h2 className="modal__title">Выбор активности</h2>
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

            <button
              className="modal__btn modal__btn--secondary"
              onClick={() => setIsSelectorOpen(false)}
              style={{ marginTop: "16px" }}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* === Модальное окно тренировки === */}
      {selectedWorkout && (
        <WorkoutModal
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
          onComplete={onWorkoutComplete}
          onBackToList={() => {
            setSelectedWorkout(null);
            setIsSelectorOpen(true);
          }}
        />
      )}
    </section>
  );
}
