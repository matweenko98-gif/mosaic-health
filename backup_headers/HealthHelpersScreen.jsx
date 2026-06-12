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
      <header className="screen__header header-with-back" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
          <h1 className="screen__title" style={{ fontSize: "1.2rem", fontWeight: "700", margin: 0 }}>
            Масла и Омега-3
          </h1>
          <p className="screen__subtitle" style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: "2px 0 0 0" }}>
            Рекомендации и проверенные бренды
          </p>
        </div>
      </header>

      {/* Переключатель табов на серой подложке (Segmented Control) */}
      <div className="bg-gray-100 rounded-2xl p-1.5 flex w-full gap-1.5" style={{ marginTop: "16px", marginBottom: "16px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("aromatherapy")}
          className={`flex-1 px-4 py-3.5 min-h-[48px] text-sm font-semibold rounded-xl flex items-center justify-center text-center transition-all ${activeTab === "aromatherapy"
              ? "bg-white text-gray-800 shadow-sm"
              : "text-gray-500 hover:text-gray-700 bg-transparent"
            }`}
        >
          Ароматерапия
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("omega3")}
          className={`flex-1 px-4 py-3.5 min-h-[48px] text-sm font-semibold rounded-xl flex items-center justify-center text-center transition-all ${activeTab === "omega3"
              ? "bg-white text-gray-800 shadow-sm"
              : "text-gray-500 hover:text-gray-700 bg-transparent"
            }`}
        >
          Омега-3
        </button>
      </div>

      {/* Контент таба: Ароматерапия */}
      {activeTab === "aromatherapy" && (
        <div className="flex flex-col gap-6" style={{ marginTop: "8px" }}>
          {/* Вовлекающий баннер (белая просторная карточка) */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-3" style={{ padding: "24px" }}>
            <h3 className="text-base font-bold text-gray-800">
              Почему мы используем масла в методике
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Эфирные масла терапевтического класса помогают подготовить дыхательную систему к тренировкам, улучшают экскурсию легких, способствуют глубокому фокусу и помогают быстрее восстановить мышцы после нагрузок.
            </p>
          </div>

          {/* Действия (полноценные кнопки) */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => handleBuyClick("Эфирные масла doTERRA")}
              className="w-full bg-[#222222] hover:bg-black text-white text-sm font-semibold py-3.5 px-4 min-h-[48px] rounded-xl flex items-center justify-center gap-1.5 transition-colors duration-150 shrink-0"
            >
              Купить масло
            </button>
            <button
              onClick={() => handleTelegramClick("@AromaSpecialist")}
              className="w-full bg-transparent hover:bg-gray-50 text-gray-700 text-sm font-semibold py-3.5 px-4 min-h-[48px] rounded-xl border border-gray-200 flex items-center justify-center gap-1.5 transition-colors duration-150 shrink-0"
            >
              Telegram эксперта
            </button>
          </div>
        </div>
      )}

      {/* Контент таба: Омега-3 */}
      {activeTab === "omega3" && (
        <div className="flex flex-col gap-6" style={{ marginTop: "8px" }}>
          {/* Фото-заглушка баночки Омега-3 */}
          <div className="w-full bg-gray-100 border border-dashed border-gray-300 rounded-xl h-48 flex flex-col items-center justify-center gap-2 text-gray-400 shrink-0">
            <svg
              className="w-10 h-10 opacity-60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
              <path d="M17 2H7v5h10V2z" />
            </svg>
            <span className="text-xs italic">[Фотография баночки Омега-3]</span>
          </div>

          {/* Описание пользы (белая просторная карточка) */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-3" style={{ padding: "24px" }}>
            <h3 className="text-base font-bold text-gray-800">
              Описание
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Незаменимые жирные кислоты снижают системное воспаление, ускоряют восстановление связок и поддерживают эластичность сосудистой стенки при интенсивном гиревом дыхании. Омега-3 способствует укреплению клеточных мембран, поддерживает здоровье сердечно-сосудистой системы и повышает общую выносливость организма при регулярных физических нагрузках.
            </p>
          </div>

          {/* Действия (полноценные кнопки) */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => handleBuyClick("Омега-3")}
              className="w-full bg-[#222222] hover:bg-black text-white text-sm font-semibold py-3.5 px-4 min-h-[48px] rounded-xl flex items-center justify-center gap-1.5 transition-colors duration-150 shrink-0"
            >
              Купить Омега-3
            </button>

            <button
              onClick={() => handleTelegramClick("@OmegaSpecialist")}
              className="w-full bg-transparent hover:bg-gray-50 text-gray-700 text-sm font-semibold py-3.5 px-4 min-h-[48px] rounded-xl border border-gray-200 flex items-center justify-center gap-1.5 transition-colors duration-150 shrink-0"
            >
              Telegram эксперта
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
