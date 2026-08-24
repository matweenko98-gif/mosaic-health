import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useLanguage } from "../context/LanguageContext";

/**
 * Вспомогательная функция конвертации внешних видеоссылок (YouTube, Rutube) в embed-формат.
 */
export function getYoutubeEmbedUrl(urlStr) {
  if (!urlStr || typeof urlStr !== "string") return null;
  const str = urlStr.trim();
  
  if (str.includes("youtube.com/embed/")) {
    return str;
  }
  
  const watchMatch = str.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([^&]+)/i);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1&rel=0`;
  }
  
  const shortMatch = str.match(/youtu\.be\/([^?&]+)/i);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&rel=0`;
  }

  const shortsMatch = str.match(/youtube\.com\/shorts\/([^?&]+)/i);
  if (shortsMatch && shortsMatch[1]) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}?autoplay=1&rel=0`;
  }

  const rutubeMatch = str.match(/rutube\.ru\/video\/([^/]+)/i);
  if (rutubeMatch && rutubeMatch[1]) {
    return `https://rutube.ru/play/embed/${rutubeMatch[1]}`;
  }

  return null;
}

/**
 * CreatorMaterialsScreen — Экран «Материалы от создателя».
 * Статьи и подкасты загружаются с сервера (управляются в админке).
 * Статьи открываются в модальном окне с полным текстом, подкаст — с плеером.
 */
export default function CreatorMaterialsScreen({ onNavigate }) {
  const { t, currentLang } = useLanguage();
  const [rawArticles, setRawArticles] = useState([]);
  const [rawPodcasts, setRawPodcasts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mainTab, setMainTab] = useState("articles"); // "articles" | "podcasts"
  const [activeCategory, setActiveCategory] = useState("Все");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get("/articles").catch(() => []),
      api.get("/podcasts").catch(() => []),
      api.get("/article-categories").catch(() => []),
    ])
      .then(([arts, pods, cats]) => {
        if (!active) return;
        setRawArticles(Array.isArray(arts) ? arts : []);
        setRawPodcasts(Array.isArray(pods) ? pods : []);
        setCategories(Array.isArray(cats) ? cats : []);
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
          category: a.category || "Практическая кинезиология",
          isPublished,
          readTime: isRu ? a.readTime : (a.readTime || "").replace("мин", "min"),
          body: (rawBody || "").split("\n\n").filter(Boolean),
        };
      })
      .filter((art) => art.isPublished)
      .filter((art) => activeCategory === "Все" || art.category === activeCategory);
  }, [rawArticles, currentLang, activeCategory]);

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

      {/* Переключатель табов: Статьи / Подкасты */}
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
            id: "articles",
            label: t("Статьи"),
            icon: (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            ),
          },
          {
            id: "podcasts",
            label: t("Подкасты"),
            icon: (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            ),
          },
        ].map((tab) => {
          const isActive = mainTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMainTab(tab.id)}
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

      {/* Раздел: Статьи */}
      {mainTab === "articles" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
          {/* Табы категорий статей */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              paddingBottom: "6px",
              marginBottom: "6px",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
            className="no-scrollbar"
          >
            {Array.from(
              new Set([
                "Все",
                "Практическая кинезиология",
                "Ароматерапия",
                "Омега-3",
                "Наши помощники",
                ...categories.map((c) => (currentLang === "RU" ? c.name_ru : c.name_en || c.name_ru)),
              ])
            ).map((catName) => {
              const isActive = activeCategory === catName;
              return (
                <button
                  key={catName}
                  type="button"
                  onClick={() => setActiveCategory(catName)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "999px",
                    border: "none",
                    fontSize: "12.5px",
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: isActive ? 700 : 500,
                    backgroundColor: isActive ? "#007F63" : "#F0F0EE",
                    color: isActive ? "#fff" : "var(--color-text-secondary)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                    boxShadow: isActive ? "0 4px 10px rgba(0, 127, 99, 0.15)" : "none",
                  }}
                >
                  {t(catName)}
                </button>
              );
            })}
          </div>

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
      )}

      {/* Раздел: Подкасты */}
      {mainTab === "podcasts" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
          {loading && (
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>{t("Загрузка…")}</p>
          )}
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
      )}

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
                {(() => {
                  const youtubeEmbed = getYoutubeEmbedUrl(openItem.item.media);
                  const isVideoContent = openItem.item.isVideo || !!youtubeEmbed;

                  return (
                    <>
                      <span style={{ fontWeight: "700", fontFamily: "'Manrope', sans-serif", fontSize: "10.5px", letterSpacing: ".8px", color: "#007F63" }}>
                        {isVideoContent ? t("ВИДЕОРОЛИК") : t("ПОДКАСТ")} • {openItem.item.duration}
                      </span>
                      <h2 style={{ margin: "8px 0 12px 0", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "20px", color: "var(--color-text)", lineHeight: "1.25" }}>
                        {openItem.item.title}
                      </h2>

                      <div style={{ borderRadius: "16px", overflow: "hidden", background: "#000", marginBottom: "16px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                        {youtubeEmbed ? (
                          <iframe
                            src={youtubeEmbed}
                            title={openItem.item.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            style={{ width: "100%", height: "260px", border: "none", display: "block", background: "#000" }}
                          />
                        ) : isVideoContent ? (
                          <video
                            src={openItem.item.media}
                            controls
                            autoPlay
                            playsInline
                            style={{ width: "100%", height: "auto", maxHeight: "260px", display: "block", background: "#000" }}
                          />
                        ) : (
                          <div style={{ padding: "20px", background: "linear-gradient(135deg, #F4FAF8 0%, #E8F5F1 100%)", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                            <div style={{ fontSize: "36px" }}>🎧</div>
                            <audio
                              src={openItem.item.media}
                              controls
                              autoPlay
                              style={{ width: "100%" }}
                            />
                          </div>
                        )}
                      </div>

                      <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4a4a4a", fontWeight: 300, margin: 0 }}>
                        {openItem.item.desc}
                      </p>
                    </>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
