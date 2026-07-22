import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useLanguage } from "../context/LanguageContext";

/**
 * CreatorMaterialsScreen — Экран «Материалы от создателя».
 * Статьи и подкасты загружаются с сервера (управляются в админке).
 * Статьи открываются в модальном окне с полным текстом, подкаст — с плеером.
 */
export default function CreatorMaterialsScreen({ onNavigate }) {
  const { t, currentLang } = useLanguage();
  const [rawArticles, setRawArticles] = useState([]);
  const [rawPodcasts, setRawPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get("/articles").catch(() => []),
      api.get("/podcasts").catch(() => []),
    ])
      .then(([arts, pods]) => {
        if (!active) return;
        setRawArticles(Array.isArray(arts) ? arts : []);
        setRawPodcasts(Array.isArray(pods) ? pods : []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const articles = React.useMemo(() => {
    const isRu = currentLang === "RU";
    return rawArticles
      .filter((a) => isRu ? !!a.title_ru : !!a.title_en)
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
        } catch (e) {
          // fallback plain text
        }
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
  }, [rawArticles, currentLang]);

  const podcasts = React.useMemo(() => {
    const isRu = currentLang === "RU";
    return rawPodcasts
      .filter((p) => isRu ? !!p.title_ru : !!p.title_en)
      .map((p) => {
        const title = isRu ? p.title_ru : p.title_en;
        const rawDesc = isRu ? p.description_ru : p.description_en;

        let descText = rawDesc || "";
        let isVideo = false;
        let isPublished = true;
        let mediaUrl = p.audioKey || "";
        try {
          if (rawDesc && rawDesc.trim().startsWith("{")) {
            const parsed = JSON.parse(rawDesc);
            descText = parsed.description || parsed.text || "";
            isVideo = !!parsed.isVideo;
            isPublished = parsed.isPublished !== false;
            mediaUrl = parsed.mediaUrl || p.audioKey || "";
          }
        } catch (e) {
          // fallback plain text
        }
        return {
          id: p.id,
          title,
          desc: descText,
          isVideo,
          isPublished,
          duration: isRu ? `${p.durationMin} мин` : `${p.durationMin} min`,
          media: mediaUrl || "/demo-video.mp4",
        };
      })
      .filter((pod) => pod.isPublished);
  }, [rawPodcasts, currentLang]);

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
          <span>{t("Назад")}</span>
        </button>
        <div className="header-title-container">
          <h1 className="screen__title" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "24px", color: "var(--color-text)", letterSpacing: "-.5px", margin: 0 }}>{t("Полезные материалы")}</h1>
          <p className="screen__subtitle" style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "2px", fontWeight: 300 }}>{t("Статьи и подкасты от создателя")}</p>
        </div>
      </header>

      {/* Раздел: Статьи */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <h3 style={{ fontSize: "11px", fontFamily: "'Manrope', sans-serif", fontWeight: "800", textTransform: "uppercase", letterSpacing: ".8px", color: "var(--color-text-secondary)", borderBottom: "1px solid var(--color-border)", paddingBottom: "6px", margin: "16px 0 8px 0" }}>
          {t("Полезные статьи")}
        </h3>

        {loading && (
          <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{t("Загрузка…")}</p>
        )}
        {!loading && articles.length === 0 && (
          <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: 300 }}>{t("Статей пока нет.")}</p>
        )}

        {articles.map((item) => (
          <div
            key={item.id}
            className="card card--clickable"
            onClick={() => setOpenItem({ type: "article", item })}
            style={{ padding: "16px", borderRadius: "20px", background: "#fff", boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)", cursor: "pointer" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "11px" }}>
              <span style={{ fontWeight: "700", fontFamily: "'Manrope', sans-serif", fontSize: "10.5px", letterSpacing: ".8px", color: "#007F63" }}>{t("СТАТЬЯ")}</span>
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
          {t("Эксклюзивные подкасты")}
        </h3>

        {!loading && podcasts.length === 0 && (
          <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: 300 }}>{t("Подкастов пока нет.")}</p>
        )}

        {podcasts.map((podcast) => (
          <div
            key={podcast.id}
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
                {podcast.isVideo ? t("ВИДЕОРОЛИК") : t("ПОДКАСТ")} • {podcast.duration}
              </span>
              <h4 style={{ fontSize: "15px", fontFamily: "'Manrope', sans-serif", fontWeight: "800", color: "var(--color-text)", margin: 0, lineHeight: "1.3" }}>
                {podcast.title}
              </h4>
              <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: "4px 0 0 0", lineHeight: "1.5", fontWeight: 300 }}>
                {podcast.desc}
              </p>
            </div>
          </div>
        ))}
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
              <span>{t("Закрыть")}</span>
            </button>

            {openItem.type === "article" ? (
              <>
                <span style={{ fontWeight: "700", fontFamily: "'Manrope', sans-serif", fontSize: "10.5px", letterSpacing: ".8px", color: "#007F63" }}>
                  {t("СТАТЬЯ")} • {openItem.item.readTime}
                </span>
                <h2 style={{ margin: "8px 0 12px 0", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "20px", color: "var(--color-text)", lineHeight: "1.25" }}>
                  {openItem.item.title}
                </h2>
                {openItem.item.image && (
                  <img
                    src={openItem.item.image}
                    alt={openItem.item.title}
                    style={{ width: "100%", height: "auto", maxHeight: "240px", borderRadius: "16px", objectFit: "cover", marginBottom: "16px" }}
                  />
                )}
                {openItem.item.body.map((p, i) => (
                  <p key={i} style={{ fontSize: "14px", lineHeight: "1.65", color: "#4a4a4a", fontWeight: 300, margin: "0 0 12px 0" }}>
                    {p}
                  </p>
                ))}
              </>
            ) : (
              <>
                <span style={{ fontWeight: "700", fontFamily: "'Manrope', sans-serif", fontSize: "10.5px", letterSpacing: ".8px", color: "#007F63" }}>
                  {openItem.item.isVideo ? t("ВИДЕОРОЛИК") : t("ПОДКАСТ")} • {openItem.item.duration}
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
