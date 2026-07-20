import React from "react";

/**
 * RoleSelectorScreen — Экран выбора режима работы для сотрудников (доктор, администратор).
 * Премиальный дизайн с Bento-карточками и микро-анимациями.
 */
export default function RoleSelectorScreen({ onNavigate, role, onLogout }) {
  const roleUpper = (role || "").toUpperCase();
  const isAdmin = roleUpper === "ADMIN";
  const isSpecialist = roleUpper === "SPECIALIST" || roleUpper === "ADMIN";

  return (
    <section className="screen screen--onboarding" id="screen-role-selector">
      <header className="screen__header text-center" style={{ margin: "12px 0 8px" }}>
        <h1
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 800,
            fontSize: "26px",
            color: "var(--color-text)",
            letterSpacing: "-.6px",
            margin: 0,
          }}
        >
          Выберите режим работы
        </h1>
        <p
          style={{
            fontSize: "13.5px",
            color: "var(--color-text-secondary)",
            marginTop: "4px",
            fontWeight: 300,
          }}
        >
          Выберите панель управления для продолжения
        </p>
      </header>

      <div className="bento-grid">
        {/* Карточка 1: Панель администратора */}
        {isAdmin && (
          <div className="bento-card" onClick={() => onNavigate("admin")}>
            <span className="bento-card__badge">Доступно</span>
            <span className="bento-card__icon" role="img" aria-label="admin">
              ⚙️
            </span>
            <h2 className="bento-card__title">Панель администратора</h2>
            <p className="bento-card__desc">
              Управление пользователями, товарами, статьями и заказами.
            </p>
          </div>
        )}

        {/* Карточка 2: Панель врача */}
        {isSpecialist && (
          <div className="bento-card" onClick={() => onNavigate("specialist-codes")}>
            <span className="bento-card__badge">Доступно</span>
            <span className="bento-card__icon" role="img" aria-label="doctor">
              🩺
            </span>
            <h2 className="bento-card__title">Панель врача</h2>
            <p className="bento-card__desc">
              Генерация кодов доступа к индивидуальным тренировкам.
            </p>
          </div>
        )}

        {/* Карточка 3: Режим пациента */}
        {isSpecialist && (
          <div className="bento-card" onClick={() => onNavigate("home")}>
            <span className="bento-card__icon" role="img" aria-label="patient">
              👤
            </span>
            <h2 className="bento-card__title">Режим пациента</h2>
            <p className="bento-card__desc">
              Просмотр приложения и тренировок глазами клиента.
            </p>
          </div>
        )}
      </div>

      {/* Кнопка Выхода */}
      {onLogout && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
          <button
            onClick={onLogout}
            style={{
              background: "none",
              border: "none",
              color: "#d93025",
              fontSize: "0.9rem",
              fontWeight: "500",
              cursor: "pointer",
              textDecoration: "underline",
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            Выйти из аккаунта
          </button>
        </div>
      )}
    </section>
  );
}
