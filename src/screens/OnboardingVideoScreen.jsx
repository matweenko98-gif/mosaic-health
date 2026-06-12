import React from "react";

/**
 * OnboardingVideoScreen — Первый экран онбординга (видео-презентация).
 */
export default function OnboardingVideoScreen({ onNavigate }) {
  return (
    <section className="screen screen--onboarding" id="screen-onboarding-video">
      <header className="screen__header text-center">
        <h1 className="screen__title">Мозаика Здоровья</h1>
        <p className="screen__subtitle">Знакомство с методикой центра</p>
      </header>

      <div className="card text-center">
        <p className="card__text" style={{ marginBottom: "16px" }}>
          Посмотрите краткое вводное видео о нашей уникальной системе оздоровления и
          восстановления баланса тела.
        </p>

        {/* Заглушка видеоплеера */}
        <div className="video-player-placeholder" style={{ marginBottom: "24px" }}>
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.6 }}
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="10,8 16,12 10,16" />
          </svg>
          <span className="video-player-placeholder__label" style={{ marginTop: "8px", fontStyle: "italic", fontSize: "0.8rem" }}>
            [Презентационный ролик — Заглушка]
          </span>
        </div>

        <button
          id="btn-onboarding-video-next"
          className="btn-save"
          onClick={() => onNavigate("onboarding-consent")}
        >
          Далее
        </button>
        <div style={{ marginTop: "12px", textAlign: "center" }}>
          <button
            type="button"
            onClick={() => onNavigate("login")}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-text-secondary)",
              fontSize: "0.85rem",
              cursor: "pointer",
              textDecoration: "underline",
              fontWeight: "500",
            }}
          >
            Уже есть аккаунт? Войти
          </button>
        </div>
      </div>
    </section>
  );
}
