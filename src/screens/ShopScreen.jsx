import React from "react";

/**
 * ShopScreen — Экран «Магазин».
 */
export default function ShopScreen({ cart, onAddToCart, onNavigate }) {
  const products = [
    { id: 101, name: "Чугунная гиря 8 кг", price: 3200, desc: "Оптимальный вес для дыхательной практики на 7 точек" },
    { id: 102, name: "Чугунная гиря 12 кг", price: 4500, desc: "Для продвинутых тренировок гиревого дыхания на 10 точек" },
    { id: 103, name: "Дыхательное масло (doTERRA)", price: 1900, desc: "Смесь эфирных масел терапевтического класса" },
    { id: 104, name: "Омега-3 высокой очистки", price: 2600, desc: "120 капсул высокой концентрации EPA/DHA" },
  ];

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="screen" id="screen-shop-detail">
      {/* Шапка с кнопкой назад и корзиной */}
      <header className="screen__header header-with-back" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button className="back-btn" onClick={() => onNavigate("home")}>
            ←
          </button>
          <div className="header-title-container">
            <h1 className="screen__title">Магазин</h1>
            <p className="screen__subtitle">Инструменты и добавки</p>
          </div>
        </div>

        {/* Ссылка в корзину */}
        <button
          id="btn-go-to-cart"
          className="cart-badge-btn"
          onClick={() => onNavigate("cart")}
          style={{ position: "relative", padding: "8px 12px", border: "1px solid var(--color-border)", borderRadius: "6px", backgroundColor: "#fff", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600" }}
        >
          🛒 Корзина {cartCount > 0 && <span className="cart-badge-btn__count">{cartCount}</span>}
        </button>
      </header>

      {/* Список товаров */}
      <div className="products-list" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {products.map((prod) => (
          <div key={prod.id} className="card product-card" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div>
              <h3 className="product-card__title" style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--color-text)", margin: 0 }}>
                {prod.name}
              </h3>
              <p className="product-card__desc" style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: "4px 0 0 0" }}>
                {prod.desc}
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #eee", paddingTop: "8px", marginTop: "4px" }}>
              <span className="product-card__price" style={{ fontSize: "1rem", fontWeight: "700", color: "var(--color-active)" }}>
                {prod.price} ₽
              </span>
              <button
                className="activity-select-btn"
                style={{ width: "auto", padding: "6px 16px", margin: 0 }}
                onClick={() => {
                  onAddToCart(prod);
                  // Небольшая визуальная подсказка
                  alert(`Товар "${prod.name}" добавлен в корзину`);
                }}
              >
                В корзину
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
