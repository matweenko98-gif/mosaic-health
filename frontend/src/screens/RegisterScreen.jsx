import React, { useState } from "react";
import { countries } from "../data/countries";

/**
 * RegisterScreen — Экран Регистрации в приложении с двухшаговой формой.
 * Выполнен в стиле просторного Apple-минимализма.
 */
export default function RegisterScreen({ onNavigate, onRegister }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dialCode, setDialCode] = useState("+375"); // код страны (Беларусь по умолчанию)
  const [phoneNumber, setPhoneNumber] = useState(""); // номер без кода
  const [password, setPassword] = useState("");

  // Поля шага 2
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("Беларусь");
  const [rehab, setRehab] = useState(false);
  const [code, setCode] = useState("");
  
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleNextStep(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Пожалуйста, введите ваше имя");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Пожалуйста, введите корректный Email");
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.replace(/\D/g, "").length < 5) {
      setError("Пожалуйста, введите корректный номер телефона");
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError("Пароль должен состоять минимум из 6 символов");
      return;
    }

    setError("");
    setStep(2);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!age.trim()) {
      setError("Пожалуйста, укажите ваш возраст");
      return;
    }
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      setError("Пожалуйста, укажите корректный возраст (от 1 до 120 лет)");
      return;
    }
    if (!country.trim()) {
      setError("Пожалуйста, укажите вашу страну");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await onRegister({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: `${dialCode} ${phoneNumber.trim()}`,
        age: age.trim(),
        country: country.trim(),
        hasRehabilitation: rehab,
        password,
        code: code.trim(),
      });
    } catch (err) {
      setError(err?.message || "Не удалось зарегистрироваться");
      setStep(1);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="screen screen--onboarding" id="screen-register">
      <header className="screen__header text-center" style={{ marginBottom: "12px" }}>
        <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "26px", color: "var(--color-text)", letterSpacing: "-.6px", margin: 0 }}>Регистрация</h1>
        <p style={{ fontSize: "13.5px", color: "var(--color-text-secondary)", marginTop: "4px", fontWeight: 300 }}>
          Шаг {step} из 2: {step === 1 ? "Основные данные" : "Дополнительные сведения"}
        </p>
      </header>

      <div className="card" style={{ padding: "20px 24px", borderRadius: "24px", boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)", background: "#fff" }}>
        <form onSubmit={step === 1 ? handleNextStep : handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
          
          {error && (
            <div className="error-message" style={{ color: "#d93025", fontSize: "13px", fontFamily: "'Manrope', sans-serif", fontWeight: 500, backgroundColor: "#fce8e6", padding: "12px 14px", borderRadius: "14px", border: "1px solid #fad2cf" }}>
              {error}
            </div>
          )}

          {step === 1 ? (
            /* --- Шаг 1 --- */
            <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label htmlFor="reg-name" style={{ fontSize: "12.5px", fontFamily: "'Manrope', sans-serif", fontWeight: "700", color: "var(--color-text)", paddingLeft: "4px" }}>
                  Имя
                </label>
                <input
                  id="reg-name"
                  type="text"
                  placeholder="Иван Иванов"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-field__input"
                  style={{
                    borderRadius: "16px"
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label htmlFor="reg-email" style={{ fontSize: "12.5px", fontFamily: "'Manrope', sans-serif", fontWeight: "700", color: "var(--color-text)", paddingLeft: "4px" }}>
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-field__input"
                  style={{
                    borderRadius: "16px"
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label htmlFor="reg-phone" style={{ fontSize: "12.5px", fontFamily: "'Manrope', sans-serif", fontWeight: "700", color: "var(--color-text)", paddingLeft: "4px" }}>
                  Телефон
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <select
                    aria-label="Код страны"
                    value={dialCode}
                    onChange={(e) => setDialCode(e.target.value)}
                    className="form-field__input"
                    style={{
                      borderRadius: "16px",
                      cursor: "pointer",
                      backgroundColor: "#fff",
                      paddingRight: "36px",
                      appearance: "none",
                      WebkitAppearance: "none",
                      backgroundImage:
                        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236E6E6E' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 14px center",
                    }}
                  >
                    {countries.map((c, i) => (
                      <option key={`${c.dialCode}-${i}`} value={c.dialCode}>
                        {c.flag} {c.name} ({c.dialCode})
                      </option>
                    ))}
                  </select>
                  <input
                    id="reg-phone"
                    type="tel"
                    placeholder="(29) 000-00-00"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="form-field__input"
                    style={{
                      borderRadius: "16px",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label htmlFor="reg-password" style={{ fontSize: "12.5px", fontFamily: "'Manrope', sans-serif", fontWeight: "700", color: "var(--color-text)", paddingLeft: "4px" }}>
                  Пароль
                </label>
                <input
                  id="reg-password"
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
                style={{
                  marginTop: "8px"
                }}
              >
                Далее
              </button>
            </div>
          ) : (
            /* --- Шаг 2 (плавное появление) --- */
            <div style={{ display: "flex", flexDirection: "column", gap: "11px", animation: "slideUp 0.3s ease-out" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label htmlFor="reg-age" style={{ fontSize: "12.5px", fontFamily: "'Manrope', sans-serif", fontWeight: "700", color: "var(--color-text)", paddingLeft: "4px" }}>
                  Возраст
                </label>
                <input
                  id="reg-age"
                  type="number"
                  placeholder="34"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="form-field__input"
                  style={{
                    borderRadius: "16px"
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label htmlFor="reg-country" style={{ fontSize: "12.5px", fontFamily: "'Manrope', sans-serif", fontWeight: "700", color: "var(--color-text)", paddingLeft: "4px" }}>
                  Страна
                </label>
                <select
                  id="reg-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="form-field__input"
                  style={{
                    borderRadius: "16px",
                    cursor: "pointer",
                    backgroundColor: "#fff",
                    paddingRight: "36px",
                    appearance: "none",
                    WebkitAppearance: "none",
                    backgroundImage:
                      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236E6E6E' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 14px center",
                  }}
                >
                  {countries.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label htmlFor="reg-code" style={{ fontSize: "12.5px", fontFamily: "'Manrope', sans-serif", fontWeight: "700", color: "var(--color-text)", paddingLeft: "4px" }}>
                  Код доступа от врача (необязательно)
                </label>
                <input
                  id="reg-code"
                  type="text"
                  placeholder="например: ABCDE"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="form-field__input"
                  style={{
                    borderRadius: "16px"
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 4px", borderBottom: "1px solid #ececec", marginBottom: "8px" }}>
                <span style={{ fontSize: "13.5px", fontFamily: "'Manrope', sans-serif", fontWeight: "700", color: "var(--color-text)" }}>
                  Проходили реабилитацию в центре?
                </span>
                <button
                  type="button"
                  className={`toggle ${rehab ? "toggle--on" : ""}`}
                  onClick={() => setRehab(!rehab)}
                  role="switch"
                  aria-checked={rehab}
                >
                  <span className="toggle__track">
                    <span className="toggle__thumb" />
                  </span>
                  <span className="toggle__label">
                    {rehab ? "Да" : "Нет"}
                  </span>
                </button>
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
                {isSubmitting ? "Регистрация…" : "Зарегистрироваться"}
              </button>

              <button
                type="button"
                onClick={() => { setError(""); setStep(1); }}
                style={{
                  display: "flex",
                  width: "100%",
                  border: "1.5px solid #a6a6a1",
                  cursor: "pointer",
                  background: "transparent",
                  color: "var(--color-text)",
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
                Назад
              </button>
            </div>
          )}
        </form>

        {step === 1 && (
          <div className="text-center" style={{ marginTop: "14px" }}>
            <button
              type="button"
              onClick={() => onNavigate("login")}
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
              Уже есть аккаунт? Войти
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
