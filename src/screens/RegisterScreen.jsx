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
        <h1 className="screen__title" style={{ fontSize: "1.8rem", fontWeight: "700", letterSpacing: "-0.03em" }}>Регистрация</h1>
        <p className="screen__subtitle" style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>
          Шаг {step} из 2: {step === 1 ? "Основные данные" : "Дополнительные сведения"}
        </p>
      </header>

      <div className="card" style={{ padding: "24px", borderRadius: "18px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid var(--color-border)" }}>
        <form onSubmit={step === 1 ? handleNextStep : handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          
          {error && (
            <div className="error-message" style={{ color: "#d93025", fontSize: "0.85rem", backgroundColor: "#fce8e6", padding: "10px 12px", borderRadius: "10px", border: "1px solid #fad2cf" }}>
              {error}
            </div>
          )}

          {step === 1 ? (
            /* --- Шаг 1 --- */
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label htmlFor="reg-name" style={{ fontSize: "0.82rem", fontWeight: "600", color: "var(--color-text)", paddingLeft: "4px" }}>
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
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.95rem",
                    transition: "all 0.2s ease-in-out",
                    backgroundColor: "var(--color-bg)",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label htmlFor="reg-email" style={{ fontSize: "0.82rem", fontWeight: "600", color: "var(--color-text)", paddingLeft: "4px" }}>
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
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.95rem",
                    transition: "all 0.2s ease-in-out",
                    backgroundColor: "var(--color-bg)",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label htmlFor="reg-phone" style={{ fontSize: "0.82rem", fontWeight: "600", color: "var(--color-text)", paddingLeft: "4px" }}>
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
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.95rem",
                    transition: "all 0.2s ease-in-out",
                    backgroundColor: "var(--color-bg)",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label htmlFor="reg-password" style={{ fontSize: "0.82rem", fontWeight: "600", color: "var(--color-text)", paddingLeft: "4px" }}>
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
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.95rem",
                    transition: "all 0.2s ease-in-out",
                    backgroundColor: "var(--color-bg)",
                    outline: "none"
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn-save"
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  marginTop: "8px",
                  cursor: "pointer"
                }}
              >
                Далее
              </button>
            </div>
          ) : (
            /* --- Шаг 2 (плавное появление) --- */
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", animation: "slideUp 0.3s ease-out" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label htmlFor="reg-age" style={{ fontSize: "0.82rem", fontWeight: "600", color: "var(--color-text)", paddingLeft: "4px" }}>
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
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.95rem",
                    transition: "all 0.2s ease-in-out",
                    backgroundColor: "var(--color-bg)",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label htmlFor="reg-country" style={{ fontSize: "0.82rem", fontWeight: "600", color: "var(--color-text)", paddingLeft: "4px" }}>
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
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.95rem",
                    transition: "all 0.2s ease-in-out",
                    backgroundColor: "var(--color-bg)",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 4px", borderBottom: "1px solid #ececec", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                  Проходили реабилитацию в центре?
                </span>
                <button
                  type="button"
                  className={`toggle ${rehab ? "toggle--on" : ""}`}
                  onClick={() => setRehab(!rehab)}
                  role="switch"
                  aria-checked={rehab}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  <span className="toggle__track" style={{
                    position: "relative",
                    width: "44px",
                    height: "24px",
                    backgroundColor: rehab ? "var(--color-accent)" : "#ccc",
                    borderRadius: "12px",
                    transition: "background-color 0.25s ease"
                  }}>
                    <span className="toggle__thumb" style={{
                      position: "absolute",
                      top: "2px",
                      left: "2px",
                      width: "20px",
                      height: "20px",
                      backgroundColor: "#fff",
                      borderRadius: "50%",
                      transition: "transform 0.25s ease",
                      transform: rehab ? "translateX(20px)" : "translateX(0)",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.15)"
                    }} />
                  </span>
                  <span className="toggle__label" style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", minWidth: "28px" }}>
                    {rehab ? "Да" : "Нет"}
                  </span>
                </button>
              </div>

              <button
                type="submit"
                className="btn-save"
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  marginTop: "8px",
                  cursor: "pointer"
                }}
              >
                Зарегистрироваться
              </button>

              <button
                type="button"
                onClick={() => { setError(""); setStep(1); }}
                className="modal__btn modal__btn--secondary"
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "center"
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
                color: "var(--color-accent)",
                fontSize: "0.85rem",
                cursor: "pointer",
                textDecoration: "underline",
                fontWeight: "500"
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
