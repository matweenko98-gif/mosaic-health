import React from "react";

/**
 * BottomNav — фиксированная нижняя панель навигации.
 * Переключает экраны: «Главная» и «Профиль».
 */
export default function BottomNav({ currentScreen, onNavigate }) {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Основная навигация">
      <button
        id="nav-home"
        className={`bottom-nav__btn ${currentScreen === "home" ? "bottom-nav__btn--active" : ""}`}
        onClick={() => onNavigate("home")}
        aria-current={currentScreen === "home" ? "page" : undefined}
      >
        {/* Иконка «Домик» — простой SVG wireframe */}
        <svg
          className="bottom-nav__icon"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12L12 3l9 9" />
          <path d="M5 10v9a1 1 0 001 1h3v-5h6v5h3a1 1 0 001-1v-9" />
        </svg>
        <span className="bottom-nav__label">Главная</span>
      </button>

      <button
        id="nav-profile"
        className={`bottom-nav__btn ${currentScreen === "profile" ? "bottom-nav__btn--active" : ""}`}
        onClick={() => onNavigate("profile")}
        aria-current={currentScreen === "profile" ? "page" : undefined}
      >
        {/* Иконка «Профиль» — простой SVG wireframe */}
        <svg
          className="bottom-nav__icon"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21c0-4.418-3.582-7-8-7s-8 2.582-8 7" />
        </svg>
        <span className="bottom-nav__label">Профиль</span>
      </button>
    </nav>
  );
}
