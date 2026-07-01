import React, { useState } from "react";

/**
 * CreatorMaterialsScreen — Экран «Материалы от создателя».
 * Статьи открываются в модальном окне с полным текстом, подкаст — с плеером.
 */
export default function CreatorMaterialsScreen({ onNavigate }) {
  const articles = [
    {
      id: 1,
      title: "Анатомия дыхания: как гиря помогает легким",
      desc: "Подробный разбор механики дыхания при кинезиотерапевтических нагрузках.",
      readTime: "5 мин",
      body: [
        "Дыхание — это не просто вдох и выдох. Это работа целой системы мышц: диафрагмы, межрёберных мышц, мышц живота и даже мышц шеи. Когда мы дышим поверхностно, большая часть этой системы «спит», а грудная клетка теряет подвижность.",
        "Гиря в дыхательной практике играет роль мягкого сопротивления. Удерживая или перемещая вес по определённым точкам, вы заставляете диафрагму работать глубже, а рёбра — раскрываться полнее. Это увеличивает так называемую экскурсию лёгких — амплитуду их движения при дыхании.",
        "Почему это важно? Полноценное дыхание улучшает насыщение крови кислородом, снижает уровень стресса за счёт активации парасимпатической нервной системы и возвращает подвижность грудному отделу позвоночника, который у большинства людей зажат из-за сидячего образа жизни.",
        "Начинайте с малого веса и медленного темпа. Ваша задача — не поднять как можно больше, а почувствовать, как воздух заполняет лёгкие снизу вверх, а на выдохе тело мягко расслабляется. Регулярность важнее интенсивности: 10 минут в день дадут больше, чем час раз в неделю.",
      ],
    },
    {
      id: 2,
      title: "Почему мы хромаем: разбор паттерна шага",
      desc: "Изучение связи между тонусом мышц стопы и правильной походкой.",
      readTime: "8 мин",
      body: [
        "Правильный шаг — это сложная согласованная работа десятков мышц. Когда одна из них выключается или, наоборот, перенапрягается, страдает весь паттерн движения: появляется хромота, перекос таза, боль в пояснице и коленях.",
        "Чаще всего проблема начинается снизу — со стопы. Если мышцы стопы ослаблены, теряется амортизация, и ударная нагрузка при каждом шаге уходит вверх — в колени и позвоночник. Отсюда и знакомое многим «тянет поясницу» после долгой ходьбы.",
        "Второй ключевой элемент — ягодичные мышцы. Именно они должны включаться в момент опоры на ногу. Если они «ленятся», их работу берут на себя мышцы поясницы, которые для этого не предназначены.",
        "Восстановление правильного шага идёт снизу вверх: сначала возвращаем чувствительность и силу стопе, затем учим ягодичные включаться вовремя, и только потом отрабатываем согласованную работу рук и ног. Кинезиотерапия решает это через простые, но точные упражнения, которые вы найдёте в разделе тренировок.",
      ],
    },
  ];

  const podcast = {
    id: 1,
    title: "Эпизод 12: Восстановление спины",
    desc: "Основы дыхания для снижения компрессии позвоночника.",
    duration: "24 мин",
    media: "/demo-video.mp4",
  };

  // Что открыто в модальном окне: { type: 'article' | 'podcast', item }
  const [openItem, setOpenItem] = useState(null);

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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
            onClick={() => setOpenItem({ type: "article", item })}
            style={{ padding: "16px", borderRadius: "20px", background: "#fff", boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)", cursor: "pointer" }}
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

        <div
          className="card card--clickable"
          onClick={() => setOpenItem({ type: "podcast", item: podcast })}
          style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px", borderRadius: "20px", background: "#fff", boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)", cursor: "pointer" }}
        >
          <button
            className="podcast-play-btn"
            style={{
              width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#1BAB7C",
              color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "14px", boxShadow: "0 6px 14px -4px rgba(27,171,124,.5)", flexShrink: 0
            }}
            onClick={(e) => { e.stopPropagation(); setOpenItem({ type: "podcast", item: podcast }); }}
          >
            ▶
          </button>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: "10.5px", fontFamily: "'Manrope', sans-serif", fontWeight: "700", color: "var(--color-text-secondary)", letterSpacing: ".8px", display: "block", marginBottom: "4px" }}>
              ПОДКАСТ • {podcast.duration}
            </span>
            <h4 style={{ fontSize: "15px", fontFamily: "'Manrope', sans-serif", fontWeight: "800", color: "var(--color-text)", margin: 0, lineHeight: "1.3" }}>
              {podcast.title}
            </h4>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: "4px 0 0 0", lineHeight: "1.5", fontWeight: 300 }}>
              {podcast.desc}
            </p>
          </div>
        </div>
      </div>

      {/* Модальное окно статьи / подкаста */}
      {openItem && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setOpenItem(null); }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <button
              onClick={() => setOpenItem(null)}
              className="back-btn"
              style={{ alignSelf: "flex-start", marginBottom: "10px", border: "1.5px solid #a6a6a1", backgroundColor: "#fff", color: "var(--color-text)", fontFamily: "'Manrope', sans-serif", fontWeight: 600, borderRadius: "12px" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Закрыть</span>
            </button>

            {openItem.type === "article" ? (
              <>
                <span style={{ fontWeight: "700", fontFamily: "'Manrope', sans-serif", fontSize: "10.5px", letterSpacing: ".8px", color: "#007F63" }}>
                  СТАТЬЯ • {openItem.item.readTime}
                </span>
                <h2 style={{ margin: "8px 0 12px 0", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "20px", color: "var(--color-text)", lineHeight: "1.25" }}>
                  {openItem.item.title}
                </h2>
                {openItem.item.body.map((p, i) => (
                  <p key={i} style={{ fontSize: "14px", lineHeight: "1.65", color: "#4a4a4a", fontWeight: 300, margin: "0 0 12px 0" }}>
                    {p}
                  </p>
                ))}
              </>
            ) : (
              <>
                <span style={{ fontWeight: "700", fontFamily: "'Manrope', sans-serif", fontSize: "10.5px", letterSpacing: ".8px", color: "#007F63" }}>
                  ПОДКАСТ • {openItem.item.duration}
                </span>
                <h2 style={{ margin: "8px 0 12px 0", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "20px", color: "var(--color-text)", lineHeight: "1.25" }}>
                  {openItem.item.title}
                </h2>
                <div style={{ borderRadius: "16px", overflow: "hidden", background: "#000", marginBottom: "12px" }}>
                  <video
                    src={openItem.item.media}
                    controls
                    autoPlay
                    playsInline
                    style={{ width: "100%", height: "auto", maxHeight: "260px", display: "block", background: "#000" }}
                  />
                </div>
                <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4a4a4a", fontWeight: 300, margin: 0 }}>
                  {openItem.item.desc}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
