import React from "react";

/**
 * CartScreen — Экран «Корзина».
 */
export default function CartScreen({ cart, onClearCart, onNavigate }) {
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="screen" id="screen-cart-detail">
      {/* Шапка с кнопкой назад */}
      <header className="screen__header header-with-back">
        <button className="back-btn" onClick={() => onNavigate("shop")}>
          ←
        </button>
        <div className="header-title-container">
          <h1 className="screen__title">Корзина</h1>
          <p className="screen__subtitle">Выбранные товары</p>
        </div>
      </header>

      {cart.length === 0 ? (
        <div className="card text-center" style={{ padding: "32px 16px" }}>
          <p className="card__text" style={{ marginBottom: "20px", fontStyle: "italic" }}>
            Ваша корзина пуста
          </p>
          <button className="btn-save" onClick={() => onNavigate("shop")}>
            Вернуться в магазин
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Список выбранных товаров */}
          <div className="card">
            <h2 className="card__title">Состав заказа</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {cart.map((item) => (
                <li
                  key={item.id}
                  style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: "500" }}>{item.name}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                      {item.price} ₽ × {item.quantity} шт.
                    </span>
                  </div>
                  <span style={{ fontWeight: "600" }}>{item.price * item.quantity} ₽</span>
                </li>
              ))}
            </ul>

            {/* Итого */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--color-border)" }}>
              <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>Итого к оплате ({totalItems} шт.):</span>
              <span style={{ fontWeight: "700", fontSize: "1.1rem", color: "var(--color-active)" }}>
                {totalPrice} ₽
              </span>
            </div>
          </div>

          {/* Действия */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              id="btn-go-to-checkout"
              className="btn-save"
              onClick={() => onNavigate("checkout")}
            >
              Перейти к оформлению
            </button>
            <button
              id="btn-clear-cart"
              className="modal__btn modal__btn--secondary"
              onClick={() => {
                onClearCart();
                alert("Корзина очищена");
              }}
            >
              Очистить корзину
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
