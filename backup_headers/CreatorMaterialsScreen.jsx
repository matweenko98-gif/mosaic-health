import React from "react";

/**
 * CreatorMaterialsScreen — Экран «Материалы от создателя».
 */
export default function CreatorMaterialsScreen({ onNavigate }) {
  const articles = [
    {
      id: 1,
      title: "Анатомия дыхания: как гиря помогает легким",
      desc: "Подробный разбор механики дыхания при кинезиотерапевтических нагрузках.",
      readTime: "5 мин",
    },
    {
      id: 2,
      title: "Почему мы хромаем: разбор паттерна шага",
      desc: "Изучение связи между тонусом мышц стопы и правильной походкой.",
      readTime: "8 мин",
    },
  ];

  function handlePlayPodcast(title) {
    alert(`Воспроизведение подкаста: "${title}"`);
  }

  return (
    <section className="screen" id="screen-creator-materials-detail">
      {/* Шапка с кнопкой назад */}
      <header className="screen__header header-with-back">
        <button className="back-btn" onClick={() => onNavigate("home")}>
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
        <div className="header-title-container">
          <h1 className="screen__title">Полезные статьи и подкасты</h1>
          <p className="screen__subtitle">Материалы от создателя</p>
        </div>
      </header>

      {/* Раздел: Статьи */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <h3 style={{ fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-secondary)", borderBottom: "1px solid var(--color-border)", paddingBottom: "4px", margin: "8px 0 4px 0" }}>
          Полезные статьи
        </h3>
        
        {articles.map((item) => (
          <div
            key={item.id}
            className="card card--clickable"
            onClick={() => alert(`Открытие статьи: "${item.title}"`)}
            style={{ padding: "14px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.72rem", color: "var(--color-text-secondary)" }}>
              <span style={{ fontWeight: "600" }}>СТАТЬЯ</span>
              <span>{item.readTime}</span>
            </div>
            <h4 style={{ fontSize: "0.92rem", fontWeight: "600", color: "var(--color-text)", margin: "0 0 6px 0" }}>
              {item.title}
            </h4>
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", margin: 0, lineHeight: "1.4" }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Раздел: Подкасты */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
        <h3 style={{ fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-secondary)", borderBottom: "1px solid var(--color-border)", paddingBottom: "4px", margin: "8px 0 4px 0" }}>
          Эксклюзивные подкасты
        </h3>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px" }}>
          {/* Кнопка Play */}
          <button
            className="podcast-play-btn"
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "var(--color-active)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => handlePlayPodcast("Эпизод 12: Восстановление спины")}
          >
            ▶
          </button>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: "0.72rem", fontWeight: "600", color: "var(--color-text-secondary)", textTransform: "uppercase", display: "block", marginBottom: "2px" }}>
              ПОДКАСТ • 24 мин
            </span>
            <h4 style={{ fontSize: "0.92rem", fontWeight: "600", color: "var(--color-text)", margin: 0 }}>
              Эпизод 12: Восстановление спины
            </h4>
            <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: "2px 0 0 0" }}>
              Основы дыхания для снижения компрессии позвоночника.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
