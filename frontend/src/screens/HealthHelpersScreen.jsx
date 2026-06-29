import React, { useState } from "react";

/**
 * HealthHelpersScreen — Экран «Масла и Омега-3».
 */
export default function HealthHelpersScreen({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("aromatherapy"); // "aromatherapy" | "omega3"

  function handleBuyClick(item) {
    alert(`Покупка "${item}" находится в разработке`);
  }

  function handleTelegramClick(expert) {
    alert(`Переход в Telegram-канал эксперта (${expert})`);
  }

  return (
    <section className="screen" id="screen-health-helpers-detail">
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
        <div style={{ marginTop: "4px" }}>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "24px", color: "var(--color-text)", letterSpacing: "-.5px", margin: 0 }}>
            Масла и Омега-3
          </h1>
          <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "2px", fontWeight: 300 }}>
            Рекомендации и проверенные бренды
          </p>
        </div>
      </header>

      {/* Переключатель табов на карточках */}
      <div style={{
        display: "flex",
        gap: "10px",
        overflowX: "auto",
        width: "100%",
        padding: "4px 0",
        margin: "12px 0 6px 0",
        msOverflowStyle: "none",
        scrollbarWidth: "none",
        flexShrink: 0
      }} className="no-scrollbar">
        {[
          { id: "aromatherapy", label: "Ароматерапия", icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
          )},
          { id: "omega3", label: "Омега-3", icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>
            </svg>
          )}
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                borderRadius: "14px",
                fontSize: "13px",
                fontFamily: "'Manrope', sans-serif",
                fontWeight: "700",
                cursor: "pointer",
                border: "1px solid",
                borderColor: isActive ? "var(--color-accent)" : "var(--color-border)",
                backgroundColor: isActive ? "rgba(27, 171, 124, 0.08)" : "#fff",
                color: isActive ? "var(--color-active)" : "var(--color-text-secondary)",
                boxShadow: isActive ? "0 4px 12px rgba(27, 171, 124, 0.12)" : "0 2px 6px rgba(0,0,0,0.02)",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
                flexShrink: 0,
                flex: 1
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Контент таба: Ароматерапия */}
      {activeTab === "aromatherapy" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Фото-заглушка Ароматерапия */}
          <div style={{
            width: "100%",
            borderRadius: "20px",
            height: "192px",
            position: "relative",
            overflow: "hidden",
            background: "repeating-linear-gradient(135deg, #E9EBEA, #E9EBEA 11px, #F1F3F2 11px, #F1F3F2 22px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(0,127,99,.08)",
            boxShadow: "inset 0 0 20px rgba(0,0,0,0.03)",
            gap: "10px"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 14px -6px rgba(27,171,124,.35)"
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1BAB7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <span style={{ fontSize: "11px", fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", color: "var(--color-text-secondary)", letterSpacing: ".3px" }}>
              [Фотография эфирных масел doTERRA]
            </span>
          </div>

          {/* Вовлекающий баннер (белая просторная карточка) */}
          <div className="card" style={{ padding: "24px", borderRadius: "20px", background: "#fff", boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)" }}>
            <h3 style={{ fontFamily: "'Manrope', sans-serif", fontSize: "16px", fontWeight: "800", color: "var(--color-text)", margin: "0 0 10px 0" }}>
              Почему мы используем масла в методике
            </h3>
            <p style={{ fontSize: "13.5px", lineHeight: "1.68", color: "#4a4a4a", margin: 0, fontWeight: 300 }}>
              Эфирные масла терапевтического класса помогают подготовить дыхательную систему к тренировкам, улучшают экскурсию легких, способствуют глубокому фокусу и помогают быстрее восстановить мышцы после нагрузок.
            </p>
          </div>

          {/* Действия (полноценные кнопки) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={() => handleBuyClick("Эфирные масла doTERRA")}
              style={{
                display: "flex",
                width: "100%",
                border: "none",
                cursor: "pointer",
                background: "#1BAB7C",
                color: "#fff",
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700,
                fontSize: "15px",
                padding: "14px",
                borderRadius: "16px",
                boxShadow: "0 8px 20px -8px rgba(27,171,124,.6)",
                alignItems: "center",
                gap: "8px",
                justifyContent: "center",
                transition: "background-color 0.15s ease"
              }}
            >
              Купить масло
            </button>
            <button
              onClick={() => handleTelegramClick("@AromaSpecialist")}
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
            >
              Telegram эксперта
            </button>
          </div>
        </div>
      )}

      {/* Контент таба: Омега-3 */}
      {activeTab === "omega3" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Фото-заглушка баночки Омега-3 */}
          <div style={{
            width: "100%",
            borderRadius: "20px",
            height: "192px",
            position: "relative",
            overflow: "hidden",
            background: "repeating-linear-gradient(135deg, #E9EBEA, #E9EBEA 11px, #F1F3F2 11px, #F1F3F2 22px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(0,127,99,.08)",
            boxShadow: "inset 0 0 20px rgba(0,0,0,0.03)",
            gap: "10px"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 14px -6px rgba(27,171,124,.35)"
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1BAB7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
                <path d="M17 2H7v5h10V2z" />
              </svg>
            </div>
            <span style={{ fontSize: "11px", fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", color: "var(--color-text-secondary)", letterSpacing: ".3px" }}>
              [Фотография баночки Омега-3]
            </span>
          </div>

          {/* Описание пользы (белая просторная карточка) */}
          <div className="card" style={{ padding: "24px", borderRadius: "20px", background: "#fff", boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)" }}>
            <h3 style={{ fontFamily: "'Manrope', sans-serif", fontSize: "16px", fontWeight: "800", color: "var(--color-text)", margin: "0 0 10px 0" }}>
              Описание
            </h3>
            <p style={{ fontSize: "13.5px", lineHeight: "1.68", color: "#4a4a4a", margin: 0, fontWeight: 300 }}>
              Незаменимые жирные кислоты снижают системное воспаление, ускоряют восстановление связок и поддерживают эластичность сосудистой стенки при интенсивном гиревом дыхании. Омега-3 способствует укреплению клеточных мембран, поддерживает здоровье сердечно-сосудистой системы и повышает общую выносливость организма при регулярных физических нагрузках.
            </p>
          </div>

          {/* Действия (полноценные кнопки) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={() => handleBuyClick("Омега-3")}
              style={{
                display: "flex",
                width: "100%",
                border: "none",
                cursor: "pointer",
                background: "#1BAB7C",
                color: "#fff",
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700,
                fontSize: "15px",
                padding: "14px",
                borderRadius: "16px",
                boxShadow: "0 8px 20px -8px rgba(27,171,124,.6)",
                alignItems: "center",
                gap: "8px",
                justifyContent: "center",
                transition: "background-color 0.15s ease"
              }}
            >
              Купить Омега-3
            </button>

            <button
              onClick={() => handleTelegramClick("@OmegaSpecialist")}
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
            >
              Telegram эксперта
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
