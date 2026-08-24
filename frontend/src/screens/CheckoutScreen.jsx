import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import PhoneInput from "../components/PhoneInput";
import { api } from "../api/client";

/**
 * CheckoutScreen — Экран «Оформление заказа».
 * Создаёт заказ на сервере и, если включена онлайн-оплата, отправляет на оплату.
 */
export default function CheckoutScreen({ cart, onClearCart, onNavigate }) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [dialCode, setDialCode] = useState("+375");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);

  const phone = `${dialCode} ${phoneNumber.trim()}`.trim();

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Узнаём у сервера, включена ли онлайн-оплата (от этого зависит текст кнопки и поток).
  useEffect(() => {
    let active = true;
    api
      .get("/payments/config")
      .then((cfg) => {
        if (active) setPaymentsEnabled(!!cfg?.enabled);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  async function handleOrderSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError(t("Пожалуйста, заполните все поля формы"));
      return;
    }
    if (cart.length === 0) {
      setError(t("Корзина пуста"));
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      // 1. Создаём заказ на сервере (цены и итог считаются на сервере).
      const order = await api.post("/orders", {
        recipientName: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
      });

      // 2. Если оплата включена — инициируем платёж и уходим на страницу оплаты.
      if (paymentsEnabled) {
        const pay = await api.post("/payments/create", { orderId: order.id });
        onClearCart();
        if (pay?.confirmationUrl) {
          window.location.href = pay.confirmationUrl;
          return;
        }
      }

      // 3. Оплата выключена — заказ оформлен, специалист свяжется (прежняя схема).
      onClearCart();
      alert(
        t("Заказ успешно оформлен!") +
          `\n${t("Итого")}: ${totalPrice} ₽\n${t("Наш специалист свяжется с вами для подтверждения доставки.")}`
      );
      onNavigate("home");
    } catch (err) {
      setError(err?.message || t("Не удалось оформить заказ. Попробуйте ещё раз."));
      setSubmitting(false);
    }
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
            <PhoneInput
              id="checkout-phone"
              dialCode={dialCode}
              onDialCodeChange={setDialCode}
              phoneNumber={phoneNumber}
              onPhoneNumberChange={setPhoneNumber}
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

          {error && (
            <p
              role="alert"
              style={{ color: "#EB6074", fontSize: "13px", fontFamily: "'Manrope', sans-serif", fontWeight: 600, margin: "2px 0 0" }}
            >
              {error}
            </p>
          )}

          <button
            id="btn-confirm-order"
            type="submit"
            className="btn-save"
            style={{ marginTop: "12px", opacity: submitting ? 0.6 : 1 }}
            disabled={submitting}
          >
            {submitting
              ? t("Обработка…")
              : paymentsEnabled
                ? t("Перейти к оплате")
                : t("Подтвердить заказ")}
          </button>
        </form>
      </div>
    </section>
  );
}
