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
      <header className="screen__header" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "12px" }}>
        <button
          className="back-btn"
          onClick={() => onNavigate("home")}
          style={{
            border: "1px solid var(--color-border)",
            backgroundColor: "#fff",
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 600,
            borderRadius: "12px"
          }}
        >
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
          <h1 className="screen__title" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "24px", color: "var(--color-text)", letterSpacing: "-.5px", margin: 0 }}>Полезные материалы</h1>
          <p className="screen__subtitle" style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "2px", fontWeight: 300 }}>Статьи и подкасты от создателя</p>
        </div>
      </header>

      {/* Раздел: Статьи */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <h3 style={{ fontSize: "11px", fontFamily: "'Manrope', sans-serif", fontWeight: "800", textTransform: "uppercase", letterSpacing: ".8px", color: "var(--color-text-secondary)", borderBottom: "1px solid var(--color-border)", paddingBottom: "6px", margin: "16px 0 8px 0" }}>
          Полезные статьи
        </h3>
        
        {articles.map((item) => (
          <div
            key={item.id}
            className="card card--clickable"
            onClick={() => alert(`Открытие статьи: "${item.title}"`)}
            style={{ padding: "16px", borderRadius: "20px", background: "#fff", border: "1px solid var(--color-border)", boxShadow: "0 4px 18px -8px rgba(20,30,40,.1)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "11px" }}>
              <span style={{ fontWeight: "700", fontFamily: "'Manrope', sans-serif", fontSize: "10.5px", letterSpacing: ".8px", color: "#007F63" }}>СТАТЬЯ</span>
              <span style={{ color: "var(--color-text-secondary)", fontWeight: 300 }}>{item.readTime}</span>
            </div>
            <h4 style={{ fontSize: "15px", fontFamily: "'Manrope', sans-serif", fontWeight: "800", color: "var(--color-text)", margin: "0 0 6px 0", lineHeight: "1.3" }}>
              {item.title}
            </h4>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: 0, lineHeight: "1.5", fontWeight: 300 }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Раздел: Подкасты */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
        <h3 style={{ fontSize: "11px", fontFamily: "'Manrope', sans-serif", fontWeight: "800", textTransform: "uppercase", letterSpacing: ".8px", color: "var(--color-text-secondary)", borderBottom: "1px solid var(--color-border)", paddingBottom: "6px", margin: "16px 0 8px 0" }}>
          Эксклюзивные подкасты
        </h3>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px", borderRadius: "20px", background: "#fff", border: "1px solid var(--color-border)", boxShadow: "0 4px 18px -8px rgba(20,30,40,.1)" }}>
          {/* Кнопка Play */}
          <button
            className="podcast-play-btn"
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "#1BAB7C",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              boxShadow: "0 6px 14px -4px rgba(27,171,124,.5)",
              transition: "background-color 0.15s ease",
              flexShrink: 0
            }}
            onClick={() => handlePlayPodcast("Эпизод 12: Восстановление спины")}
          >
            ▶
          </button>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: "10.5px", fontFamily: "'Manrope', sans-serif", fontWeight: "700", color: "var(--color-text-secondary)", letterSpacing: ".8px", display: "block", marginBottom: "4px" }}>
              ПОДКАСТ • 24 мин
            </span>
            <h4 style={{ fontSize: "15px", fontFamily: "'Manrope', sans-serif", fontWeight: "800", color: "var(--color-text)", margin: 0, lineHeight: "1.3" }}>
              Эпизод 12: Восстановление спины
            </h4>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: "4px 0 0 0", lineHeight: "1.5", fontWeight: 300 }}>
              Основы дыхания для снижения компрессии позвоночника.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
