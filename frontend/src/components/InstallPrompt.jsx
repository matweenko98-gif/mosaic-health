import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

/**
 * InstallPrompt — ненавязчивый баннер «Установить приложение».
 * На Android/десктопе использует системное событие beforeinstallprompt.
 * На iOS (события нет) показывает короткую подсказку «Поделиться → На экран Домой».
 */
export default function InstallPrompt() {
  const { t } = useLanguage();
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    // Уже установлено (запущено как приложение) — не показываем.
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
    if (standalone) return;
    // Пользователь ранее закрыл баннер — уважаем выбор.
    if (localStorage.getItem("installPromptDismissed") === "1") return;

    const isiOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

    function onBeforeInstall(e) {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // iOS не шлёт beforeinstallprompt — показываем подсказку с небольшой задержкой.
    let timer;
    if (isiOS) {
      timer = setTimeout(() => {
        setIosHint(true);
        setVisible(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      if (timer) clearTimeout(timer);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    localStorage.setItem("installPromptDismissed", "1");
  }

  async function install() {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice.catch(() => {});
    setDeferred(null);
    setVisible(false);
    localStorage.setItem("installPromptDismissed", "1");
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      style={{
        position: "fixed",
        left: "12px",
        right: "12px",
        bottom: "calc(76px + env(safe-area-inset-bottom, 0px))",
        zIndex: 1000,
        background: "#fff",
        border: "1px solid var(--color-border)",
        borderRadius: "18px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        maxWidth: "520px",
        margin: "0 auto",
      }}
    >
      <img src="/icon-192.png" alt="" width={40} height={40} style={{ borderRadius: "10px", flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "13.5px", color: "var(--color-text)" }}>
          {t("Установить приложение")}
        </div>
        <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "2px", lineHeight: 1.4 }}>
          {iosHint
            ? t("Нажмите «Поделиться» и выберите «На экран „Домой“».")
            : t("Ярлык на рабочем столе и запуск без браузера.")}
        </div>
      </div>
      {!iosHint && (
        <button
          className="btn-save"
          style={{ padding: "8px 14px", fontSize: "13px", width: "auto", whiteSpace: "nowrap" }}
          onClick={install}
        >
          {t("Установить")}
        </button>
      )}
      <button
        onClick={dismiss}
        aria-label={t("Закрыть")}
        style={{ border: "none", background: "none", cursor: "pointer", fontSize: "20px", color: "var(--color-text-secondary)", lineHeight: 1, padding: "0 2px" }}
      >
        ×
      </button>
    </div>
  );
}
