import React from "react";

/**
 * BottomNav — фиксированная нижняя панель навигации.
 * Переключает экраны: «Главная» и «Профиль».
 */
export default function BottomNav({ currentScreen, onNavigate }) {
  const isHome = currentScreen === "home";
  const isProfile = currentScreen === "profile";

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Основная навигация">
      <div className="bottom-nav__container">
        {/* Главная */}
        <button
          id="nav-home"
          className={`bottom-nav__btn ${isHome ? "bottom-nav__btn--active" : ""}`}
          onClick={() => onNavigate("home")}
          aria-current={isHome ? "page" : undefined}
        >
          <svg
            className="bottom-nav__icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isHome ? "rgba(255,255,255,.22)" : "none"}
            stroke={isHome ? "#fff" : "#8a8f8d"}
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 9.5 9-7 9 7V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <path d="M9 22V13a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v9" />
          </svg>
          {isHome && <span className="bottom-nav__label">Главная</span>}
        </button>

        {/* Профиль */}
        <button
          id="nav-profile"
          className={`bottom-nav__btn ${isProfile ? "bottom-nav__btn--active" : ""}`}
          onClick={() => onNavigate("profile")}
          aria-current={isProfile ? "page" : undefined}
        >
          <svg
            className="bottom-nav__icon"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isProfile ? "#fff" : "#8a8f8d"}
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M5.5 21a7 7 0 0 1 13 0" />
          </svg>
          {isProfile && <span className="bottom-nav__label">Профиль</span>}
        </button>
      </div>
    </nav>
  );
}
