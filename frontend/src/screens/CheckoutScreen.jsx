import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

/**
 * CheckoutScreen — Экран «Оформление заказа».
 */
export default function CheckoutScreen({ cart, onClearCart, onNavigate }) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function handleOrderSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert(t("Пожалуйста, заполните все поля формы"));
      return;
    }

    alert(
      t("Заказ успешно оформлен!") + `\n${t("Итого")}: ${totalPrice} ₽\n${t("Наш специалист свяжется с вами для подтверждения доставки.")}`
    );
    onClearCart();
    onNavigate("home");
  }

  return (
    <section className="screen" id="screen-checkout-detail">
      {/* Шапка с кнопкой назад */}
      <header className="screen__header" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "12px" }}>
        <button
          className="back-btn"
          onClick={() => onNavigate("cart")}
          style={{
            border: "1.5px solid #a6a6a1",
            backgroundColor: "#fff",
            color: "var(--color-text)",
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 600,
            borderRadius: "12px"
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>{t("Назад")}</span>
        </button>
        <div className="header-title-container">
          <h1 className="screen__title" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "24px", color: "var(--color-text)", letterSpacing: "-.5px", margin: 0 }}>{t("Оформление заказа")}</h1>
          <p className="screen__subtitle" style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "2px", fontWeight: 300 }}>{t("Заполнение данных доставки")}</p>
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Форма доставки */}
        <form onSubmit={handleOrderSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "20px", borderRadius: "24px", boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)", background: "#fff" }}>
          <h2 className="card__title" style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "12px", marginBottom: "16px", fontSize: "16px", fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}>{t("Данные получателя")}</h2>

          <div className="form-field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="checkout-name" style={{ fontSize: "12.5px", fontFamily: "'Manrope', sans-serif", fontWeight: "700", color: "var(--color-text)", paddingLeft: "4px" }}>
              {t("ФИО")}
            </label>
            <input
              id="checkout-name"
              className="form-field__input"
              type="text"
              placeholder={t("Иванов Иван Иванович")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ borderRadius: "16px" }}
              required
            />
          </div>

          <div className="form-field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="checkout-phone" style={{ fontSize: "12.5px", fontFamily: "'Manrope', sans-serif", fontWeight: "700", color: "var(--color-text)", paddingLeft: "4px" }}>
              {t("Телефон")}
            </label>
            <input
              id="checkout-phone"
              className="form-field__input"
              type="tel"
              placeholder="+7 (999) 999-99-99"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ borderRadius: "16px" }}
              required
            />
          </div>

          <div className="form-field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="checkout-address" style={{ fontSize: "12.5px", fontFamily: "'Manrope', sans-serif", fontWeight: "700", color: "var(--color-text)", paddingLeft: "4px" }}>
              {t("Адрес доставки")}
            </label>
            <textarea
              id="checkout-address"
              className="form-field__input"
              style={{ minHeight: "80px", resize: "vertical", borderRadius: "16px" }}
              placeholder={t("Город, улица, дом, квартира")}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          {/* Итоговый суммарь */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--color-border)", paddingTop: "14px", marginTop: "4px" }}>
            <span style={{ fontWeight: "700", fontSize: "14px", fontFamily: "'Manrope', sans-serif" }}>{t("Сумма к оплате")}: </span>
            <span style={{ fontWeight: "800", fontSize: "18px", color: "#1BAB7C", fontFamily: "'Manrope', sans-serif" }}>{totalPrice} ₽</span>
          </div>

          <button
            id="btn-confirm-order"
            type="submit"
            className="btn-save"
            style={{ marginTop: "12px" }}
          >
            {t("Подтвердить заказ")}
          </button>
        </form>
      </div>
    </section>
  );
}
