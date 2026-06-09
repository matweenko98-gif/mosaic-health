import React, { useState } from "react";
import { methodDescription } from "../data/mockData";
import WorkoutModal from "../components/WorkoutModal";

/**
 * HomeScreen — Главный экран «Мозаика Здоровья».
 *
 * Bento-сетка из карточек разного размера:
 * - Шапка с переключателем языка в верхнем правом углу
 * - Баннер (полная ширина)
 * - О методике (полная ширина)
 * - Тренировки: одна большая кнопка-карточка, открывающая выбор активностей
 * - Помощники здоровья: общая Bento-карточка (Ароматерапия + Омега-3)
 * - Материалы от создателя: контентная Bento-карточка
 * - Магазин и Наш Telegram: мини-карточки 1×1 (половина ширины)
 */
export default function HomeScreen({ settings, onSettingsChange, onWorkoutComplete, onNavigate }) {
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Группы активностей для выбора тренировки
  const breathingGroup = [
    {
      id: 1,
      title: "Гиревое дыхание на 7 точек",
      label: "На 7 точек",
      description: "Видео-инструкция по методике",
    },
    {
      id: 2,
      title: "Гиревое дыхание на 10 точек",
      label: "На 10 точек",
      description: "Видео-инструкция по методике",
    },
  ];

  const stepGroup = [
    {
      id: 3,
      title: "Шаг (Вид 1)",
      label: "Шаг (Вид 1)",
      description: "Методика шага — Вид 1 (заглушка)",
    },
    {
      id: 4,
      title: "Шаг (Вид 2)",
      label: "Шаг (Вид 2)",
      description: "Методика шага — Вид 2 (заглушка)",
    },
    {
      id: 5,
      title: "Шаг (Вид 3)",
      label: "Шаг (Вид 3)",
      description: "Методика шага — Вид 3 (заглушка)",
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
      {/* Заголовок с панелью управления */}
      <header className="screen__header header-premium">
        <div className="header-premium__left">
          <h1 className="screen__title premium-title">Мозаика Здоровья</h1>
          <p className="screen__subtitle premium-subtitle">Методика вашего баланса</p>
        </div>
        <div className="header-premium__right">
          {/* Языковой переключатель */}
          <div className="lang-tabs" id="lang-tabs">
            <button
              className={`lang-tabs__btn ${settings?.language === "RU" ? "lang-tabs__btn--active" : ""
                }`}
              onClick={() =>
                onSettingsChange?.((prev) => ({ ...prev, language: "RU" }))
              }
            >
              RU
            </button>
            <button
              className={`lang-tabs__btn ${settings?.language === "EN" ? "lang-tabs__btn--active" : ""
                }`}
              onClick={() =>
                onSettingsChange?.((prev) => ({ ...prev, language: "EN" }))
              }
            >
              EN
            </button>
          </div>

          {/* Иконка колокольчика (Уведомления) */}
          <button
            className="notification-bell-btn"
            onClick={() => alert("У вас нет новых уведомлений")}
            aria-label="Уведомления"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "6px",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              cursor: "pointer",
              transition: "background-color 0.15s ease",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--color-accent)" }}
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
        </div>
      </header>

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

        {/* 4. Помощники здоровья — Компактная строка (List Tile) */}
        <div className="bento-grid__item bento-grid__item--full" id="tile-health-helpers">
          <button
            className="list-tile"
            onClick={() => onNavigate("health-helpers")}
          >
            <div className="list-tile__icon-placeholder" style={{ backgroundColor: "#eef2ff" }}>
              <span style={{ fontSize: "1.2rem" }}>🌿</span>
            </div>
            <span className="list-tile__title">Помощники здоровья</span>
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

        {/* 5. Материалы от создателя — Компактная строка (List Tile) */}
        <div className="bento-grid__item bento-grid__item--full" id="tile-creator-materials">
          <button
            className="list-tile"
            onClick={() => onNavigate("creator-materials")}
          >
            <div className="list-tile__icon-placeholder" style={{ backgroundColor: "#f3f4f6" }}>
              <span style={{ fontSize: "1.2rem" }}>📖</span>
            </div>
            <span className="list-tile__title">Материалы от создателя</span>
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
          >
            <div className="modal__header">
              <h2 className="modal__title">Выбор активности</h2>
            </div>

            <div className="activity-section">
              <h3 className="activity-section__title">Гиревое дыхание</h3>
              <div className="activity-section__grid">
                {breathingGroup.map((item) => (
                  <button
                    key={item.id}
                    className="activity-select-btn"
                    onClick={() => handleSelectActivity(item)}
                  >
                    <span className="activity-select-btn__text">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="activity-section">
              <h3 className="activity-section__title">Методика шага</h3>
              <div className="activity-section__grid">
                {stepGroup.map((item) => (
                  <button
                    key={item.id}
                    className="activity-select-btn"
                    onClick={() => handleSelectActivity(item)}
                  >
                    <span className="activity-select-btn__text">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              className="modal__btn modal__btn--secondary"
              onClick={() => setIsSelectorOpen(false)}
              style={{ marginTop: "8px" }}
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
        />
      )}
    </section>
  );
}
