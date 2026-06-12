import React, { useState, useEffect } from "react";

/**
 * ShopScreen — Экран «Магазин».
 */
export default function ShopScreen({ cart, onAddToCart, onNavigate }) {
  const products = [
    { id: 101, name: "Чугунная гиря 8 кг", price: 3200, desc: "Оптимальный вес для дыхательной практики на 7 точек", category: "Инструменты" },
    { id: 102, name: "Чугунная гиря 12 кг", price: 4500, desc: "Для продвинутых тренировок гиревого дыхания на 10 точек", category: "Инструменты" },
    { id: 103, name: "Дыхательное масло (doTERRA)", price: 1900, desc: "Смесь эфирных масел терапевтического класса", category: "Добавки" },
    { id: 104, name: "Омега-3 высокой очистки", price: 2600, desc: "120 капсул высокой концентрации EPA/DHA", category: "Добавки" },
  ];

  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [toast, setToast] = useState({ visible: false, message: "" });

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast({ visible: false, message: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = selectedCategory === "Все"
    ? products
    : products.filter(prod => prod.category === selectedCategory);

  function handleAddProductToCart(prod) {
    onAddToCart(prod);
    setToast({ visible: true, message: `Товар "${prod.name}" добавлен в корзину` });
  }

  return (
    <section className="screen" id="screen-shop-detail">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Шапка с кнопкой назад и корзиной */}
      <header className="screen__header" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <button className="back-btn" onClick={() => onNavigate("home")}>
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

          {/* Ссылка в корзину */}
          <button
            id="btn-go-to-cart"
            className="cart-badge-btn"
            onClick={() => onNavigate("cart")}
            style={{ position: "relative", padding: "8px 12px", border: "1px solid var(--color-border)", borderRadius: "6px", backgroundColor: "#fff", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600" }}
          >
            🛒 Корзина {cartCount > 0 && <span className="cart-badge-btn__count">{cartCount}</span>}
          </button>
        </div>

        <div className="header-title-container">
          <h1 className="screen__title">Магазин</h1>
          <p className="screen__subtitle">Инструменты и добавки</p>
        </div>
      </header>

      {/* Горизонтальная прокручиваемая лента категорий */}
      <div style={{
        display: "flex",
        gap: "8px",
        overflowX: "auto",
        paddingBottom: "8px",
        marginBottom: "8px"
      }} className="no-scrollbar">
        {["Все", "Инструменты", "Добавки"].map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: "600",
                cursor: "pointer",
                backgroundColor: isActive ? "var(--color-active)" : "#f3f4f6",
                color: isActive ? "#fff" : "var(--color-text-secondary)",
                border: "none",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease"
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Список товаров (2 в ряд) */}
      <div className="products-list grid grid-cols-2 gap-3">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="card product-card"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "12px 12px 20px 12px",
              height: "100%",
              margin: 0
            }}
          >
            <div>
              {/* Квадратный блок-заглушка для фото */}
              <div className="w-full aspect-square bg-gray-50 rounded-xl mb-3 flex items-center justify-center border border-gray-100">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <h3 className="product-card__title" style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--color-text)", margin: 0, lineHeight: "1.2" }}>
                {prod.name}
              </h3>
              <p className="product-card__desc" style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)", margin: "4px 0 0 0", lineHeight: "1.3" }}>
                {prod.desc}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid #eee", paddingTop: "8px", marginTop: "8px" }}>
              <span className="product-card__price" style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--color-text)" }}>
                {prod.price} ₽
              </span>
              <button
                className="activity-select-btn"
                style={{ width: "100%", padding: "8px", margin: 0, fontSize: "0.78rem" }}
                onClick={() => handleAddProductToCart(prod)}
              >
                В корзину
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Apple-style Toast уведомление */}
      {toast.visible && (
        <div style={{
          position: "fixed",
          bottom: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          border: "1px solid var(--color-border)",
          borderRadius: "14px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          zIndex: 1000,
          width: "calc(100% - 32px)",
          maxWidth: "360px",
          animation: "fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          <span style={{ fontSize: "1.1rem" }}>🛒</span>
          <span style={{ fontSize: "0.82rem", fontWeight: "600", color: "var(--color-text)" }}>
            {toast.message}
          </span>
        </div>
      )}
    </section>
  );
}
