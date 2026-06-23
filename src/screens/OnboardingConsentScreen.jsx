import React, { useState } from "react";

/**
 * OnboardingConsentScreen — Второй экран онбординга (согласие с методикой).
 */
export default function OnboardingConsentScreen({ onNavigate }) {
  const [agreedSafety, setAgreedSafety] = useState(false);
  const [agreedPersonal, setAgreedPersonal] = useState(false);

  const agreedAll = agreedSafety && agreedPersonal;

  return (
    <section className="screen screen--onboarding" id="screen-onboarding-consent">
      <header className="screen__header text-center" style={{ margin: "24px 0 12px" }}>
        <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "28px", color: "var(--color-text)", letterSpacing: "-.6px" }}>
          Согласие с методикой
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginTop: "4px", fontWeight: 300 }}>
          Правила безопасных тренировок
        </p>
      </header>

      <div className="card" style={{ background: "#fff", borderRadius: "24px", padding: "24px", boxShadow: "0 4px 18px -8px rgba(20,30,40,.1)", border: "1px solid var(--color-border)" }}>
        <div
          className="consent-terms"
          style={{
            maxHeight: "180px",
            overflowY: "auto",
            border: "1px solid var(--color-border)",
            padding: "16px",
            borderRadius: "16px",
            marginBottom: "20px",
            backgroundColor: "#F7F7F5",
            fontSize: "13px",
            lineHeight: "1.6",
            color: "var(--color-text-secondary)",
          }}
        >
          <p style={{ marginBottom: "8px" }}>
            Методика «Мозаика Здоровья» базируется на основах прикладной кинезиологии
            и правильной биомеханике движения.
          </p>
          <p style={{ marginBottom: "8px" }}>
            Перед началом тренировок, особенно по направлению «Гиревое дыхание»,
            убедитесь в отсутствии острых воспалительных процессов и проконсультируйтесь
            со специалистом центра.
          </p>
          <p>
            Выполняя упражнения, строго соблюдайте дозировку нагрузки и контролируйте
            дыхательный ритм во избежание гипервентиляции.
          </p>
        </div>

        {/* Первый Чекбокс */}
        <label
          className="checkbox-container"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            cursor: "pointer",
            marginBottom: "14px",
            fontSize: "13.5px",
            lineHeight: "1.4",
            color: "var(--color-text)",
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            id="checkbox-safety"
            checked={agreedSafety}
            onChange={(e) => setAgreedSafety(e.target.checked)}
            style={{ width: "18px", height: "18px", cursor: "pointer", marginTop: "2px", accentColor: "#1BAB7C" }}
          />
          <span>Я ознакомлен(а) с противопоказаниями и правилами безопасности</span>
        </label>

        {/* Второй Чекбокс */}
        <label
          className="checkbox-container"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            cursor: "pointer",
            marginBottom: "24px",
            fontSize: "13.5px",
            lineHeight: "1.4",
            color: "var(--color-text)",
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            id="checkbox-personal"
            checked={agreedPersonal}
            onChange={(e) => setAgreedPersonal(e.target.checked)}
            style={{ width: "18px", height: "18px", cursor: "pointer", marginTop: "2px", accentColor: "#1BAB7C" }}
          />
          <span>
            Обязуюсь использовать материалы методики только для личного использования
          </span>
        </label>

        {/* Действия */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            id="btn-start-usage"
            className="btn-save"
            disabled={!agreedAll}
            onClick={() => onNavigate("login")}
            style={{
              opacity: agreedAll ? 1 : 0.5,
              cursor: agreedAll ? "pointer" : "not-allowed",
              boxShadow: agreedAll ? "0 8px 20px -8px rgba(27,171,124,.6)" : "none",
              transition: "all 0.2s ease"
            }}
          >
            Начать использование
          </button>
          <button
            style={{
              display: "flex",
              width: "100%",
              border: "1px solid var(--color-border)",
              cursor: "pointer",
              background: "transparent",
              color: "var(--color-text-secondary)",
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 700,
              fontSize: "15px",
              padding: "14px",
              borderRadius: "16px",
              alignItems: "center",
              gap: "8px",
              justifyContent: "center",
              transition: "background-color 0.15s ease"
            }}
            onClick={() => onNavigate("onboarding-video")}
          >
            Назад
          </button>
        </div>
      </div>
    </section>
  );
}
