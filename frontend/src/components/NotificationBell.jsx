import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../api/client";
import { getPushState, subscribeToPush } from "../pwa";

/**
 * NotificationBell — «колокольчик» в шапке: лента уведомлений с сервера
 * и предложение включить push-уведомления (PWA).
 */
export default function NotificationBell({ isLoggedIn, onNavigate }) {
  const { t, currentLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [push, setPush] = useState({ supported: false, subscribed: false });

  const unread = items.filter((n) => !n.readAt).length;
  const isEN = currentLang === "EN";

  useEffect(() => {
    if (!isLoggedIn) {
      setItems([]);
      return;
    }
    load();
    getPushState().then(setPush).catch(() => {});
  }, [isLoggedIn]);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get("/me/notifications");
      setItems(Array.isArray(data) ? data : []);
    } catch {
      /* молча — колокольчик не критичен */
    } finally {
      setLoading(false);
    }
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && isLoggedIn) load();
  }

  async function markAll() {
    await api.patch("/me/notifications/read-all").catch(() => {});
    setItems((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: new Date().toISOString() })));
  }

  function onItem(n) {
    if (!n.readAt) api.patch(`/me/notifications/${n.id}/read`).catch(() => {});
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, readAt: x.readAt || new Date().toISOString() } : x)));
    setOpen(false);
    const screen = n.data?.screen;
    if (screen && onNavigate) onNavigate(screen);
  }

  async function enablePush() {
    const ok = await subscribeToPush();
    setPush(await getPushState().catch(() => push));
    if (!ok) {
      alert(t("Не удалось включить уведомления. Установите приложение и разрешите уведомления в системе."));
    }
  }

  const title = (n) => (isEN ? n.title_en || n.title_ru : n.title_ru);
  const body = (n) => (isEN ? n.body_en || n.body_ru : n.body_ru);
  const when = (n) => {
    try {
      return new Date(n.createdAt).toLocaleDateString(isEN ? "en-GB" : "ru-RU", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button className="notification-bell-btn" onClick={toggle} aria-label={t("Уведомления")}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#1d2321" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread > 0 && (
          <span style={{ position: "absolute", margin: "-16px 0 0 16px", width: "7px", height: "7px", background: "#EB6074", borderRadius: "50%", border: "1.5px solid #fff" }} />
        )}
      </button>

      {open && (
        <>
          {/* Клик мимо панели — закрыть */}
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 1200 }} />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: "300px",
              maxWidth: "80vw",
              maxHeight: "60vh",
              overflowY: "auto",
              background: "#fff",
              border: "1px solid var(--color-border)",
              borderRadius: "16px",
              boxShadow: "0 16px 48px rgba(0,0,0,0.16)",
              zIndex: 1300,
              padding: "8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px" }}>
              <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "14px" }}>{t("Уведомления")}</span>
              {unread > 0 && (
                <button onClick={markAll} style={{ border: "none", background: "none", cursor: "pointer", color: "#1BAB7C", fontSize: "12px", fontWeight: 700 }}>
                  {t("Прочитать все")}
                </button>
              )}
            </div>

            {/* Предложение включить push */}
            {push.supported && !push.subscribed && (
              <button
                onClick={enablePush}
                style={{ width: "100%", textAlign: "left", border: "1px solid #cdeee1", background: "#f2fbf7", borderRadius: "12px", padding: "10px 12px", margin: "4px 0 8px", cursor: "pointer", fontSize: "12.5px", color: "#0f6f52", fontWeight: 600 }}
              >
                🔔 {t("Включить уведомления на телефон")}
              </button>
            )}

            {loading ? (
              <p style={{ color: "var(--color-text-secondary)", fontSize: "13px", textAlign: "center", padding: "16px" }}>{t("Загрузка…")}</p>
            ) : items.length === 0 ? (
              <p style={{ color: "var(--color-text-secondary)", fontSize: "13px", textAlign: "center", padding: "20px 12px", fontWeight: 300 }}>
                {t("Пока нет уведомлений")}
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => onItem(n)}
                    style={{
                      textAlign: "left",
                      border: "none",
                      borderRadius: "12px",
                      padding: "10px 12px",
                      cursor: "pointer",
                      background: n.readAt ? "transparent" : "#f2fbf7",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {!n.readAt && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1BAB7C", flexShrink: 0 }} />}
                      <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "13px", color: "var(--color-text)" }}>{title(n)}</span>
                    </div>
                    {body(n) && (
                      <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "3px", lineHeight: 1.4 }}>{body(n)}</div>
                    )}
                    <div style={{ fontSize: "10.5px", color: "var(--color-text-secondary)", marginTop: "4px", opacity: 0.8 }}>{when(n)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
