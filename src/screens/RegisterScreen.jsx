import React, { useState } from "react";

/**
 * RegisterScreen — Экран Регистрации в приложении с двухшаговой формой.
 * Выполнен в стиле просторного Apple-минимализма.
 */
export default function RegisterScreen({ onNavigate, onRegister }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  // Поля шага 2
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [rehab, setRehab] = useState(false);
  
  const [error, setError] = useState("");

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
    if (!phone.trim()) {
      setError("Пожалуйста, введите номер телефона");
      return;
    }
    if (!password.trim() || password.length < 4) {
      setError("Пароль должен состоять минимум из 4 символов");
      return;
    }

    setError("");
    setStep(2);
  }

  function handleSubmit(e) {
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
    onRegister({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      age: age.trim(),
      country: country.trim(),
      hasRehabilitation: rehab,
    });
  }

  return (
    <section className="screen screen--onboarding" id="screen-register" style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "calc(100vh - 80px)" }}>
      <header className="screen__header text-center" style={{ marginBottom: "20px" }}>
        <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "28px", color: "var(--color-text)", letterSpacing: "-.6px", margin: 0 }}>Регистрация</h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginTop: "4px", fontWeight: 300 }}>
          Шаг {step} из 2: {step === 1 ? "Основные данные" : "Дополнительные сведения"}
        </p>
      </header>

      <div className="card" style={{ padding: "24px", borderRadius: "24px", boxShadow: "0 4px 18px -8px rgba(20,30,40,.1)", border: "1px solid var(--color-border)", background: "#fff" }}>
        <form onSubmit={step === 1 ? handleNextStep : handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          
          {error && (
            <div className="error-message" style={{ color: "#d93025", fontSize: "13px", fontFamily: "'Manrope', sans-serif", fontWeight: 500, backgroundColor: "#fce8e6", padding: "12px 14px", borderRadius: "14px", border: "1px solid #fad2cf" }}>
              {error}
            </div>
          )}

          {step === 1 ? (
            /* --- Шаг 1 --- */
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
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
                <input
                  id="reg-phone"
                  type="tel"
                  placeholder="+7 (999) 000-00-00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-field__input"
                  style={{
                    borderRadius: "16px"
                  }}
                />
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
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", animation: "slideUp 0.3s ease-out" }}>
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
                <input
                  id="reg-country"
                  type="text"
                  placeholder="Беларусь"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
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
                style={{
                  marginTop: "8px",
                }}
              >
                Зарегистрироваться
              </button>

              <button
                type="button"
                onClick={() => { setError(""); setStep(1); }}
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
                Назад
              </button>
            </div>
          )}
        </form>

        {step === 1 && (
          <div className="text-center" style={{ marginTop: "20px" }}>
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
