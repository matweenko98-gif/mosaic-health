import React from "react";

/**
 * CartScreen — Экран «Корзина».
 */
export default function CartScreen({ cart, onClearCart, onUpdateQuantity, onRemoveItem, onNavigate }) {
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="screen" id="screen-cart-detail">
      {/* Шапка с кнопкой назад */}
      <header className="screen__header" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "12px" }}>
        <button className="back-btn" onClick={() => onNavigate("shop")}>
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
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {cart.map((item) => (
                <li
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "0.88rem",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #f0f0f0",
                    gap: "12px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                    {/* Миниатюрная фото-заглушка */}
                    <div style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#f9fafb",
                      border: "1px solid var(--color-border)",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                      <span style={{ fontWeight: "600", color: "var(--color-text)", fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.name}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                        {item.price} ₽
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                    {/* Кнопки регулирования количества */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      backgroundColor: "#f3f4f6",
                      padding: "2px 6px",
                      borderRadius: "8px"
                    }}>
                      <button
                        onClick={() => onUpdateQuantity && onUpdateQuantity(item.id, item.quantity - 1)}
                        style={{
                          width: "22px",
                          height: "22px",
                          border: "none",
                          backgroundColor: "transparent",
                          fontSize: "1rem",
                          fontWeight: "500",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-text-secondary)",
                          padding: 0
                        }}
                      >
                        −
                      </button>
                      <span style={{ fontSize: "0.82rem", fontWeight: "600", minWidth: "16px", textAlign: "center" }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity && onUpdateQuantity(item.id, item.quantity + 1)}
                        style={{
                          width: "22px",
                          height: "22px",
                          border: "none",
                          backgroundColor: "transparent",
                          fontSize: "1rem",
                          fontWeight: "500",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-text-secondary)",
                          padding: 0
                        }}
                      >
                        +
                      </button>
                    </div>

                    {/* Общая сумма за этот товар */}
                    <span style={{ fontWeight: "700", color: "var(--color-text)", fontSize: "0.88rem", minWidth: "60px", textAlign: "right" }}>
                      {item.price * item.quantity} ₽
                    </span>

                    {/* Крестик удаления */}
                    <button
                      onClick={() => onRemoveItem && onRemoveItem(item.id)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: "6px",
                        cursor: "pointer",
                        color: "var(--color-text-secondary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        backgroundColor: "#f3f4f6",
                        transition: "all 0.2s ease"
                      }}
                      className="cart-remove-btn"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
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
              onClick={onClearCart}
            >
              Очистить корзину
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
