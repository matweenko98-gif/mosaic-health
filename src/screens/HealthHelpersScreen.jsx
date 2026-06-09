import React from "react";

/**
 * HealthHelpersScreen — Экран «Помощники здоровья».
 */
export default function HealthHelpersScreen({ onNavigate }) {
  function handleBuyClick(item) {
    alert(`Покупка "${item}" находится в разработке`);
  }

  function handleTelegramClick(expert) {
    alert(`Переход в Telegram-канал эксперта (${expert})`);
  }

  return (
    <section className="screen" id="screen-health-helpers-detail">
      {/* Шапка с кнопкой назад */}
      <header className="screen__header header-with-back">
        <button className="back-btn" onClick={() => onNavigate("home")}>
          ←
        </button>
        <div className="header-title-container">
          <h1 className="screen__title">Помощники здоровья</h1>
          <p className="screen__subtitle">Рекомендации и проверенные бренды</p>
        </div>
      </header>

      {/* Ароматерапия */}
      <div className="card">
        <h2 className="card__title">Ароматерапия (доверяем doTERRA)</h2>
        <p className="card__text" style={{ marginBottom: "16px" }}>
          Эфирные масла терапевтического класса CPTG помогают подготовить дыхательную систему
          к тренировкам, улучшают насыщение крови кислородом и снимают мышечное напряжение.
        </p>
        <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
          <button
            className="activity-select-btn"
            style={{ flex: 1, textAlign: "center", margin: 0, padding: "8px 12px" }}
            onClick={() => handleBuyClick("Эфирные масла doTERRA")}
          >
            Купить
          </button>
          <button
            className="activity-select-btn"
            style={{ flex: 1, textAlign: "center", margin: 0, padding: "8px 12px" }}
            onClick={() => handleTelegramClick("@AromaSpecialist")}
          >
            Telegram эксперта
          </button>
        </div>
      </div>

      {/* Омега-3 */}
      <div className="card">
        <h2 className="card__title">Омега-3</h2>
        <p className="card__text" style={{ marginBottom: "16px" }}>
          Незаменимые жирные кислоты снижают системное воспаление, ускоряют восстановление связок
          и поддерживают эластичность сосудистой стенки при интенсивном гиревом дыхании.
        </p>
        <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
          <button
            className="activity-select-btn"
            style={{ flex: 1, textAlign: "center", margin: 0, padding: "8px 12px" }}
            onClick={() => handleBuyClick("Омега-3")}
          >
            Купить
          </button>
          <button
            className="activity-select-btn"
            style={{ flex: 1, textAlign: "center", margin: 0, padding: "8px 12px" }}
            onClick={() => handleTelegramClick("@OmegaSpecialist")}
          >
            Telegram эксперта
          </button>
        </div>
      </div>
    </section>
  );
}
