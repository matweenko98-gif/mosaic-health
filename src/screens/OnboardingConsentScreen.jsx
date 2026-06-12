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
      <header className="screen__header text-center">
        <h1 className="screen__title">Согласие с методикой</h1>
        <p className="screen__subtitle">Правила безопасных тренировок</p>
      </header>

      <div className="card">
        <div
          className="consent-terms"
          style={{
            maxHeight: "180px",
            overflowY: "auto",
            border: "1px solid var(--color-border)",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "16px",
            backgroundColor: "#fafafa",
            fontSize: "0.82rem",
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
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            marginBottom: "12px",
            fontSize: "0.88rem",
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            id="checkbox-safety"
            checked={agreedSafety}
            onChange={(e) => setAgreedSafety(e.target.checked)}
            style={{ width: "18px", height: "18px", cursor: "pointer" }}
          />
          <span>Я ознакомлен(а) с противопоказаниями и правилами безопасности</span>
        </label>

        {/* Второй Чекбокс */}
        <label
          className="checkbox-container"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            marginBottom: "20px",
            fontSize: "0.88rem",
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            id="checkbox-personal"
            checked={agreedPersonal}
            onChange={(e) => setAgreedPersonal(e.target.checked)}
            style={{ width: "18px", height: "18px", cursor: "pointer" }}
          />
          <span>
            Обязуюсь использовать материалы методики только для личного использования
          </span>
        </label>

        {/* Действия */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            id="btn-start-usage"
            className="btn-save"
            disabled={!agreedAll}
            onClick={() => onNavigate("login")}
            style={{
              opacity: agreedAll ? 1 : 0.5,
              cursor: agreedAll ? "pointer" : "not-allowed",
            }}
          >
            Начать использование
          </button>
          <button
            className="modal__btn modal__btn--secondary"
            onClick={() => onNavigate("onboarding-video")}
          >
            Назад
          </button>
        </div>
      </div>
    </section>
  );
}
