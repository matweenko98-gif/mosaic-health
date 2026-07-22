import React from "react";
import { useLanguage } from "../context/LanguageContext";

/**
 * RoleSelectorScreen — Экран выбора режима работы для сотрудников (доктор, администратор).
 * Премиальный дизайн с Bento-карточками и микро-анимациями.
 */
export default function RoleSelectorScreen({ onNavigate, role, onLogout }) {
  const { t } = useLanguage();
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
          {t("Выберите режим работы")}
        </h1>
        <p
          style={{
            fontSize: "13.5px",
            color: "var(--color-text-secondary)",
            marginTop: "4px",
            fontWeight: 300,
          }}
        >
          {t("Выберите панель управления для продолжения")}
        </p>
      </header>

      <div className="bento-grid">
        {/* Карточка 1: Панель администратора */}
        {isAdmin && (
          <div className="bento-card" onClick={() => onNavigate("admin")}>
            <span className="bento-card__badge">{t("Доступно")}</span>
            <h2 className="bento-card__title">{t("Панель админа")}</h2>
            <p className="bento-card__desc">
              {t("Управление пользователями, товарами, статьями и заказами.")}
            </p>
          </div>
        )}

        {/* Карточка 2: Панель врача */}
        {isSpecialist && (
          <div className="bento-card" onClick={() => onNavigate("specialist-codes")}>
            <span className="bento-card__badge">{t("Доступно")}</span>
            <h2 className="bento-card__title">{t("Панель врача")}</h2>
            <p className="bento-card__desc">
              {t("Генерация кодов доступа к индивидуальным тренировкам.")}
            </p>
          </div>
        )}

        {/* Карточка 3: Режим пациента */}
        {isSpecialist && (
          <div className="bento-card" onClick={() => onNavigate("home")}>
            <h2 className="bento-card__title">{t("Режим пациента")}</h2>
            <p className="bento-card__desc">
              {t("Просмотр приложения и тренировок глазами клиента.")}
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
            {t("Выйти из аккаунта")}
          </button>
        </div>
      )}
    </section>
  );
}
