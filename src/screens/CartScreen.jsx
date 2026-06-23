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
        <button
          className="back-btn"
          onClick={() => onNavigate("shop")}
          style={{
            border: "1px solid var(--color-border)",
            backgroundColor: "#fff",
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
          <span>Назад</span>
        </button>
        <div className="header-title-container">
          <h1 className="screen__title" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "24px", color: "var(--color-text)", letterSpacing: "-.5px", margin: 0 }}>Корзина</h1>
          <p className="screen__subtitle" style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "2px", fontWeight: 300 }}>Выбранные товары</p>
        </div>
      </header>

      {cart.length === 0 ? (
        <div className="card text-center" style={{ padding: "32px 16px", borderRadius: "24px", boxShadow: "0 4px 18px -8px rgba(20,30,40,.1)", border: "1px solid var(--color-border)", background: "#fff" }}>
          <p style={{ fontFamily: "'Manrope', sans-serif", marginBottom: "20px", fontStyle: "italic", fontSize: "14px", color: "var(--color-text-secondary)", fontWeight: 300 }}>
            Ваша корзина пуста
          </p>
          <button className="btn-save" onClick={() => onNavigate("shop")}>
            Вернуться в магазин
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Список выбранных товаров */}
          <div className="card" style={{ padding: "20px", borderRadius: "24px", boxShadow: "0 4px 18px -8px rgba(20,30,40,.1)", border: "1px solid var(--color-border)", background: "#fff" }}>
            <h2 className="card__title" style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "12px", marginBottom: "16px", fontSize: "16px", fontFamily: "'Manrope', sans-serif", fontWeight: 700 }}>Состав заказа</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {cart.map((item) => (
                <li
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "13.5px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid var(--color-border)",
                    gap: "12px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                    {/* Миниатюрная фото-заглушка */}
                    <div style={{
                      width: "44px",
                      height: "44px",
                      background: "repeating-linear-gradient(135deg, #E9EBEA, #E9EBEA 6px, #F1F3F2 6px, #F1F3F2 12px)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1BAB7C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                      <span style={{ fontWeight: "700", fontFamily: "'Manrope', sans-serif", color: "var(--color-text)", fontSize: "13.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.name}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "2px", fontWeight: 500 }}>
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
                      backgroundColor: "#ECECE9",
                      padding: "3px 8px",
                      borderRadius: "12px"
                    }}>
                      <button
                        onClick={() => onUpdateQuantity && onUpdateQuantity(item.id, item.quantity - 1)}
                        style={{
                          width: "22px",
                          height: "22px",
                          border: "none",
                          backgroundColor: "transparent",
                          fontSize: "15px",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-text)",
                          padding: 0
                        }}
                      >
                        −
                      </button>
                      <span style={{ fontSize: "12.5px", fontFamily: "'Manrope', sans-serif", fontWeight: "700", minWidth: "16px", textAlign: "center", color: "var(--color-text)" }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity && onUpdateQuantity(item.id, item.quantity + 1)}
                        style={{
                          width: "22px",
                          height: "22px",
                          border: "none",
                          backgroundColor: "transparent",
                          fontSize: "15px",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-text)",
                          padding: 0
                        }}
                      >
                        +
                      </button>
                    </div>

                    {/* Общая сумма за этот товар */}
                    <span style={{ fontWeight: "800", fontFamily: "'Manrope', sans-serif", color: "var(--color-text)", fontSize: "14px", minWidth: "65px", textAlign: "right" }}>
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
                        backgroundColor: "#ECECE9",
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
              <span style={{ fontWeight: "700", fontSize: "14px", fontFamily: "'Manrope', sans-serif" }}>Итого к оплате ({totalItems} шт.):</span>
              <span style={{ fontWeight: "800", fontSize: "18px", color: "#1BAB7C", fontFamily: "'Manrope', sans-serif" }}>
                {totalPrice} ₽
              </span>
            </div>
          </div>

          {/* Действия */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              id="btn-go-to-checkout"
              className="btn-save"
              onClick={() => onNavigate("checkout")}
            >
              Перейти к оформлению
            </button>
            <button
              id="btn-clear-cart"
              onClick={onClearCart}
              style={{
                display: "flex",
                width: "100%",
                border: "1px solid var(--color-border)",
                cursor: "pointer",
                background: "transparent",
                color: "#d93025",
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
              Очистить корзину
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
