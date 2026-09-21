import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../api/client";

/**
 * HealthHelpersScreen — Тематический хаб «Масла и Омега-3» (Landing Hub).
 * Состоит из 3 блоков для каждого направления (Ароматерапия / Омега-3):
 * 1. Краткая информация о пользе + кнопка перехода в Магазин.
 * 2. Блок эксперта / ссылка на канал (с поддержкой RU/EN ссылок из админки).
 * 3. Блок со статьями по соответствующей категории.
 */
export default function HealthHelpersScreen({ onNavigate, onOpenShopCategory }) {
  const { t, currentLang } = useLanguage();
  const [activeTab, setActiveTab] = useState("aromatherapy"); // "aromatherapy" | "omega3"
  const [expertLinks, setExpertLinks] = useState({ aroma_ru: "", aroma_en: "", omega_ru: "", omega_en: "" });
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openArticle, setOpenArticle] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get("/settings/expert-links").catch(() => null),
      api.get("/articles").catch(() => []),
    ])
      .then(([links, arts]) => {
        if (!active) return;
        if (links) setExpertLinks(links);
        setArticles(Array.isArray(arts) ? arts : []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function handleShopClick() {
    if (onOpenShopCategory) onOpenShopCategory("Добавки");
    else onNavigate("shop");
  }

  function getTelegramLink() {
    const isRu = currentLang === "RU";
    if (activeTab === "aromatherapy") {
      return (isRu ? expertLinks.aroma_ru : expertLinks.aroma_en) || "https://t.me/mosaic_health_aroma";
    } else {
      return (isRu ? expertLinks.omega_ru : expertLinks.omega_en) || "https://t.me/mosaic_health_omega";
    }
  }

  function handleTelegramClick() {
    const link = getTelegramLink();
    if (link) {
      window.open(link, "_blank");
    } else {
      alert(t("Ссылка на Telegram эксперта не задана в настройках"));
    }
  }

  function getMaxLink() {
    if (activeTab === "aromatherapy") {
      return expertLinks.max_aroma_ru || "https://max.ru/aroma_expert";
    } else {
      return expertLinks.max_omega_ru || "https://max.ru/omega_expert";
    }
  }

  function handleMaxClick() {
    const link = getMaxLink();
    if (link) {
      window.open(link, "_blank");
    } else {
      alert(t("Ссылка на мессенджер Max не задана в настройках"));
    }
  }

  // Фильтрация статей по текущей категории хаба
  const targetCategory = activeTab === "aromatherapy" ? "Ароматерапия" : "Омега-3";
  const filteredArticles = React.useMemo(() => {
    const isRu = currentLang === "RU";
    return articles
      .filter((a) => (a.category || "Практическая кинезиология") === targetCategory)
      .filter((a) => (isRu ? !!a.title_ru : !!a.title_en))
      .map((a) => {
        const title = isRu ? a.title_ru : a.title_en;
        const rawDesc = isRu ? a.description_ru : a.description_en;
        const rawBody = isRu ? a.body_ru : a.body_en;

        let descText = rawDesc || "";
        let image = null;
        let isPublished = true;
        try {
          if (rawDesc && rawDesc.trim().startsWith("{")) {
            const parsed = JSON.parse(rawDesc);
            descText = parsed.description || parsed.text || "";
            image = parsed.image || null;
            isPublished = parsed.isPublished !== false;
          }
        } catch (e) {}

        return {
          id: a.id,
          title,
          desc: descText,
          image,
          isPublished,
          readTime: isRu ? a.readTime : (a.readTime || "").replace("мин", "min"),
          body: (rawBody || "").split("\n\n").filter(Boolean),
        };
      })
      .filter((art) => art.isPublished);
  }, [articles, currentLang, targetCategory]);

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
            borderRadius: "12px",
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
          <span>{t("Назад")}</span>
        </button>
        <div style={{ marginTop: "4px" }}>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "24px", color: "var(--color-text)", letterSpacing: "-.5px", margin: 0 }}>
            {t("Масла и Омега-3")}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "2px", fontWeight: 300 }}>
            {t("Экспертный хаб здоровья, масел и полезных добавок")}
          </p>
        </div>
      </header>

      {/* Переключатель направлений (Ароматерапия / Омега-3) */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          width: "100%",
          padding: "4px 0",
          margin: "12px 0 6px 0",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
          flexShrink: 0,
        }}
        className="no-scrollbar"
      >
        {[
          {
            id: "aromatherapy",
            label: t("Ароматерапия"),
            icon: (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            ),
          },
          {
            id: "omega3",
            label: t("Омега-3"),
            icon: (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
                <path d="m8.5 8.5 7 7" />
              </svg>
            ),
          },
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
                flex: 1,
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3-блочная структура Landing Hub */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "12px" }}>
        
        {/* БЛОК 1: Краткая информация о пользе + Кнопка быстрого перехода в Магазин */}
        <div className="card" style={{ padding: "22px", borderRadius: "20px", background: "#fff", boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "12px", backgroundColor: "rgba(0, 127, 99, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {activeTab === "aromatherapy" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007F63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007F63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
                  <path d="m8.5 8.5 7 7" />
                </svg>
              )}
            </div>
            <h3 style={{ fontFamily: "'Manrope', sans-serif", fontSize: "16.5px", fontWeight: "800", color: "var(--color-text)", margin: 0 }}>
              {activeTab === "aromatherapy" ? t("Польза эфирных масел") : t("Польза Омега-3")}
            </h3>
          </div>

          <p style={{ fontSize: "13.5px", lineHeight: "1.65", color: "#4a4a4a", margin: "0 0 16px 0", fontWeight: 400 }}>
            {activeTab === "aromatherapy"
              ? t("Эфирные масла терапевтического класса подготавливают дыхательную систему к тренировкам, улучшают экскурсию легких, способствуют глубокой концентрации и ускоряют восстановление мышц после нагрузок.")
              : t("Незаменимые Омега-3 жирные кислоты (EPA/DHA) снижают системное воспаление, укрепляют клеточные мембраны, поддерживают эластичность сосудистой стенки и ускоряют восстановление после тренировок.")}
          </p>

          <button
            onClick={handleShopClick}
            style={{
              display: "flex",
              width: "100%",
              border: "none",
              cursor: "pointer",
              background: "#007F63",
              color: "#fff",
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              padding: "13px",
              borderRadius: "16px",
              boxShadow: "0 8px 20px -6px rgba(0,127,99,.4)",
              alignItems: "center",
              gap: "8px",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span>{t("Перейти в магазин")}</span>
          </button>
        </div>

        {/* БЛОК 2: Блок эксперта / Ссылка на Telegram-канал */}
        <div
          className="card"
          style={{
            padding: "20px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #F4FAF8 0%, #E8F5F1 100%)",
            border: "1px solid rgba(0, 127, 99, 0.12)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "#007F63", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontFamily: "'Manrope', sans-serif", fontSize: "15px", fontWeight: "800", color: "var(--color-text)", margin: 0 }}>
                {t("Консультация эксперта")}
              </h3>
              <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", margin: "2px 0 0 0" }}>
                {activeTab === "aromatherapy" ? t("Вопросы по подбору и применению масел") : t("Персональный подбор дозировок Омега-3")}
              </p>
            </div>
          </div>

          <p style={{ fontSize: "13px", color: "#4a4a4a", margin: "0 0 14px 0", lineHeight: "1.5" }}>
            {t("Подписывайтесь на официальный канал эксперта, чтобы получать рекомендации, протоколы применения и задавать вопросы напрямую.")}
          </p>

          <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "4px" }}>
            <button
              onClick={handleTelegramClick}
              style={{
                display: "flex",
                flex: 1,
                border: "1px solid #007F63",
                cursor: "pointer",
                background: "#fff",
                color: "#007F63",
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700,
                fontSize: "13.5px",
                padding: "11px 8px",
                borderRadius: "14px",
                alignItems: "center",
                gap: "6px",
                justifyContent: "center",
                whiteSpace: "nowrap"
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              <span>Telegram</span>
            </button>

            {currentLang === "RU" && (
              <button
                onClick={handleMaxClick}
                style={{
                  display: "flex",
                  flex: 1,
                  border: "1px solid #007F63",
                  cursor: "pointer",
                  background: "#fff",
                  color: "#007F63",
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: "13.5px",
                  padding: "11px 8px",
                  borderRadius: "14px",
                  alignItems: "center",
                  gap: "6px",
                  justifyContent: "center",
                  whiteSpace: "nowrap"
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                <span>{t("Мессенджер Max")}</span>
              </button>
            )}
          </div>
        </div>

        {/* БЛОК 3: Блок со статьями по теме */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h3
            style={{
              fontSize: "11px",
              fontFamily: "'Manrope', sans-serif",
              fontWeight: "800",
              textTransform: "uppercase",
              letterSpacing: ".8px",
              color: "var(--color-text-secondary)",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "6px",
              margin: "8px 0 4px 0",
            }}
          >
            {t("Статьи по теме")}: {t(targetCategory)}
          </h3>

          {loading && <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{t("Загрузка…")}</p>}
          {!loading && filteredArticles.length === 0 && (
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: 300, padding: "10px 0" }}>
              {t("В этой категории пока нет опубликованных статей.")}
            </p>
          )}

          {filteredArticles.map((item) => (
            <div
              key={item.id}
              className="card card--clickable"
              onClick={() => setOpenArticle(item)}
              style={{
                padding: "16px",
                borderRadius: "20px",
                background: "#fff",
                boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "11px" }}>
                <span style={{ fontWeight: "700", fontFamily: "'Manrope', sans-serif", fontSize: "10.5px", letterSpacing: ".8px", color: "#007F63" }}>
                  {targetCategory.toUpperCase()}
                </span>
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
      </div>

      {/* Модальное окно просмотра статьи */}
      {openArticle && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: "24px", width: "100%", maxWidth: "560px", padding: "24px", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", fontFamily: "'Manrope', sans-serif", lineHeight: "1.3" }}>
                {openArticle.title}
              </h2>
              <button onClick={() => setOpenArticle(null)} style={{ border: "none", background: "none", fontSize: "24px", cursor: "pointer", color: "var(--color-text-secondary)" }}>×</button>
            </div>
            {openArticle.image && (
              <img src={openArticle.image} style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "16px", marginBottom: "14px" }} alt="" />
            )}
            <div style={{ fontSize: "14px", lineHeight: "1.7", color: "var(--color-text)" }}>
              {openArticle.body.map((p, idx) => (
                <p key={idx} style={{ marginBottom: "12px" }}>{p}</p>
              ))}
            </div>
            <button onClick={() => setOpenArticle(null)} className="btn-save" style={{ width: "100%", marginTop: "16px" }}>
              {t("Закрыть")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
