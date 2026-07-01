import React from "react";

/**
 * OnboardingVideoScreen — Первый экран онбординга (видео-презентация).
 */
export default function OnboardingVideoScreen({ onNavigate }) {
  return (
    <section className="screen screen--onboarding" id="screen-onboarding-video">
      <header className="screen__header text-center" style={{ margin: "12px 0 8px" }}>
        <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "26px", color: "var(--color-text)", letterSpacing: "-.6px" }}>
          Мозаика Здоровья
        </h1>
        <p style={{ fontSize: "13.5px", color: "var(--color-text-secondary)", marginTop: "4px", fontWeight: 300 }}>
          Знакомство с методикой центра
        </p>
      </header>

      <div className="card text-center" style={{ background: "#fff", borderRadius: "24px", padding: "20px 24px", boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)" }}>
        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "13.5px", lineHeight: "1.5", color: "#4a4a4a", fontWeight: 300, marginBottom: "14px" }}>
          Посмотрите краткое вводное видео о нашей уникальной системе оздоровления и
          восстановления баланса тела.
        </p>

        {/* Заглушка видеоплеера */}
        <div className="video-player-placeholder" style={{
          height: "165px",
          position: "relative",
          borderRadius: "20px",
          overflow: "hidden",
          background: "repeating-linear-gradient(135deg, #E9EBEA, #E9EBEA 11px, #F1F3F2 11px, #F1F3F2 22px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(0,127,99,.08)",
          boxShadow: "inset 0 0 20px rgba(0,0,0,0.03)",
          marginBottom: "16px"
        }}>
          <div style={{
            width: "54px",
            height: "54px",
            borderRadius: "16px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 16px -6px rgba(27,171,124,.4)"
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1BAB7C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" fill="#1BAB7C" />
            </svg>
          </div>
          <span style={{ fontSize: "11px", fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", color: "var(--color-text-secondary)", marginTop: "12px", letterSpacing: ".3px" }}>
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
        <button
          type="button"
          onClick={() => onNavigate("login")}
          style={{
            marginTop: "12px",
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid #1BAB7C",
            background: "#fff",
            color: "#1BAB7C",
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 700,
            fontSize: "15px",
            padding: "13px",
            borderRadius: "16px",
            cursor: "pointer",
            transition: "background-color 0.15s ease"
          }}
        >
          У меня уже есть аккаунт — войти
        </button>
      </div>
    </section>
  );
}
