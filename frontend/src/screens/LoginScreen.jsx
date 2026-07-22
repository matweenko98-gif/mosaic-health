import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

/**
 * LoginScreen — Экран Входа в приложение.
 * Выполнен в стиле просторного Apple-минимализма.
 */
export default function LoginScreen({ onNavigate, onLogin }) {
  const { t } = useLanguage();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = identifier.trim().toLowerCase();
    if (!trimmed) {
      setError(t("Пожалуйста, введите Email"));
      return;
    }
    if (!trimmed.includes("@") || !trimmed.includes(".")) {
      setError(t("Вход выполняется по Email"));
      return;
    }
    if (!password.trim()) {
      setError(t("Пожалуйста, введите пароль"));
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await onLogin(trimmed, password);
    } catch (err) {
      setError(err?.message || t("Не удалось войти. Проверьте данные."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="screen screen--onboarding" id="screen-login">
      <header className="screen__header text-center" style={{ marginBottom: "12px" }}>
        <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "26px", color: "var(--color-text)", letterSpacing: "-.6px", margin: 0 }}>{t("Вход")}</h1>
        <p style={{ fontSize: "13.5px", color: "var(--color-text-secondary)", marginTop: "4px", fontWeight: 300 }}>
          {t("Добро пожаловать в Мозаику Здоровья")}
        </p>
      </header>

      <div className="card" style={{ padding: "20px 24px", borderRadius: "24px", boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)", background: "#fff" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          
          {error && (
            <div className="error-message" style={{ color: "#d93025", fontSize: "13px", fontFamily: "'Manrope', sans-serif", fontWeight: 500, backgroundColor: "#fce8e6", padding: "12px 14px", borderRadius: "14px", border: "1px solid #fad2cf" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="login-id" style={{ fontSize: "12.5px", fontFamily: "'Manrope', sans-serif", fontWeight: "700", color: "var(--color-text)", paddingLeft: "4px" }}>
              {t("Email или Телефон")}
            </label>
            <input
              id="login-id"
              type="text"
              placeholder="example@mail.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="form-field__input"
              style={{
                borderRadius: "16px"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="login-password" style={{ fontSize: "12.5px", fontFamily: "'Manrope', sans-serif", fontWeight: "700", color: "var(--color-text)", paddingLeft: "4px" }}>
              {t("Пароль")}
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-field__input"
              style={{
                borderRadius: "16px"
              }}
            />
          </div>

          <button
            type="submit"
            className="btn-save"
            disabled={isSubmitting}
            style={{
              marginTop: "8px",
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? t("Вход…") : t("Войти")}
          </button>
        </form>

        <div className="text-center" style={{ marginTop: "14px" }}>
          <button
            type="button"
            onClick={() => onNavigate("register")}
            style={{
              background: "none",
              border: "none",
              color: "#1BAB7C",
              fontSize: "13px",
              cursor: "pointer",
              textDecoration: "underline",
              fontWeight: "600",
              fontFamily: "'Manrope', sans-serif"
            }}
          >
            {t("Нет аккаунта? Зарегистрироваться")}
          </button>
        </div>
      </div>
    </section>
  );
}
