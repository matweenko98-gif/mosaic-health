import React, { useState } from "react";

/**
 * CheckoutScreen — Экран «Оформление заказа».
 */
export default function CheckoutScreen({ cart, onClearCart, onNavigate }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function handleOrderSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert("Пожалуйста, заполните все поля формы");
      return;
    }

    alert(
      `Заказ успешно оформлен!\nИтоговая сумма: ${totalPrice} ₽\nНаш специалист свяжется с вами для подтверждения доставки.`
    );
    onClearCart();
    onNavigate("home");
  }

  return (
    <section className="screen" id="screen-checkout-detail">
      {/* Шапка с кнопкой назад */}
      <header className="screen__header header-with-back">
        <button className="back-btn" onClick={() => onNavigate("cart")}>
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
          <span>Назад</span>
        </button>
        <div className="header-title-container">
          <h1 className="screen__title">Оформление заказа</h1>
          <p className="screen__subtitle">Заполнение данных доставки</p>
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Форма доставки */}
        <form onSubmit={handleOrderSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h2 className="card__title">Данные получателя</h2>

          <div className="form-field">
            <label className="form-field__label" htmlFor="checkout-name">
              ФИО
            </label>
            <input
              id="checkout-name"
              className="form-field__input"
              type="text"
              placeholder="Иванов Иван Иванович"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="checkout-phone">
              Телефон
            </label>
            <input
              id="checkout-phone"
              className="form-field__input"
              type="tel"
              placeholder="+7 (999) 999-99-99"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="checkout-address">
              Адрес доставки
            </label>
            <textarea
              id="checkout-address"
              className="form-field__input"
              style={{ minHeight: "80px", resize: "vertical" }}
              placeholder="Город, улица, дом, квартира"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          {/* Итоговый суммарь */}
          <div style={{ borderTop: "1px solid #eee", paddingTop: "12px", marginTop: "4px", fontSize: "0.9rem" }}>
            <span style={{ fontWeight: "600" }}>Сумма к оплате: </span>
            <span style={{ fontWeight: "700", float: "right", color: "var(--color-active)" }}>{totalPrice} ₽</span>
          </div>

          <button
            id="btn-confirm-order"
            type="submit"
            className="btn-save"
            style={{ marginTop: "12px" }}
          >
            Подтвердить заказ
          </button>
        </form>
      </div>
    </section>
  );
}
