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
  const [shopSearch, setShopSearch] = useState("");
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

  const filteredProducts = products
    .filter(prod => selectedCategory === "Все" ? true : prod.category === selectedCategory)
    .filter(prod => {
      const term = shopSearch.toLowerCase();
      return prod.name.toLowerCase().includes(term) || (prod.desc && prod.desc.toLowerCase().includes(term));
    });

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
          <button
            className="back-btn"
            onClick={() => onNavigate("home")}
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
            <span>Назад</span>
          </button>

          {/* Ссылка в корзину */}
          <button
            id="btn-go-to-cart"
            className="cart-badge-btn"
            onClick={() => onNavigate("cart")}
            style={{
              position: "relative",
              padding: "0 14px",
              height: "34px",
              border: "1.5px solid #a6a6a1",
              borderRadius: "12px",
              backgroundColor: "#fff",
              cursor: "pointer",
              fontSize: "12px",
              fontFamily: "'Manrope', sans-serif",
              fontWeight: "700",
              color: "var(--color-text)",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span>🛒 Корзина</span>
            {cartCount > 0 && <span className="cart-badge-btn__count">{cartCount}</span>}
          </button>
        </div>

        <div className="header-title-container">
          <h1 className="screen__title" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "24px", color: "var(--color-text)", letterSpacing: "-.5px", margin: 0 }}>Магазин</h1>
          <p className="screen__subtitle" style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "2px", fontWeight: 300 }}>Инструменты и добавки</p>
        </div>
      </header>

      {/* Горизонтальная прокручиваемая лента категорий */}
      <div style={{
        display: "flex",
        gap: "10px",
        overflowX: "auto",
        width: "100%",
        padding: "4px 0",
        margin: "12px 0 16px 0",
        msOverflowStyle: "none",
        scrollbarWidth: "none",
        flexShrink: 0
      }} className="no-scrollbar">
        {[
          { id: "Все", label: "Все", icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          )},
          { id: "Инструменты", label: "Инструменты", icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2" />
              <path d="M6 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2" />
              <path d="M6 12h12" />
              <path d="M6.5 4.5v15" />
              <path d="M17.5 4.5v15" />
            </svg>
          )},
          { id: "Добавки", label: "Добавки", icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
              <path d="m8.5 8.5 7 7" />
            </svg>
          )}
        ].map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                borderRadius: "14px",
                fontSize: "13px",
                fontFamily: "'Manrope', sans-serif",
                fontWeight: "700",
                cursor: "pointer",
                border: "1px solid",
                borderColor: isActive ? "var(--color-accent)" : "var(--color-border)",
                backgroundColor: isActive ? "rgba(27, 171, 124, 0.08)" : "#fff",
                color: isActive ? "var(--color-active)" : "var(--color-text-secondary)",
                boxShadow: isActive ? "0 4px 12px rgba(27, 171, 124, 0.12)" : "0 2px 6px rgba(0,0,0,0.02)",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
                flexShrink: 0,
                flex: 1
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Поиск по названию товаров */}
      <div style={{ position: "relative", marginBottom: "16px" }}>
        <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", pointerEvents: "none" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>
        <input
          type="text"
          placeholder="Поиск товаров..."
          value={shopSearch}
          onChange={(e) => setShopSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "11px 14px 11px 38px",
            borderRadius: "14px",
            border: "1px solid var(--color-border)",
            fontSize: "13px",
            fontFamily: "'Manrope', sans-serif",
            outline: "none",
            backgroundColor: "var(--color-bg)",
            color: "var(--color-text)",
            transition: "border-color 0.15s ease"
          }}
        />
        {shopSearch && (
          <button
            onClick={() => setShopSearch("")}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-secondary)",
              opacity: 0.7
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      {/* Список товаров (2 в ряд) */}
      <div className="products-list grid grid-cols-2 gap-3">
        {filteredProducts.length === 0 ? (
          <div style={{ gridColumn: "span 2", textAlign: "center", padding: "40px 20px", color: "var(--color-text-secondary)", fontSize: "14px", fontStyle: "italic" }}>
            Ничего не найдено
          </div>
        ) : (
          filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="card product-card"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "14px",
              height: "100%",
              margin: 0,
              borderRadius: "20px",
              background: "#fff",
              boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)"
            }}
          >
            <div>
              {/* Квадратный блок-заглушка для фото */}
              <div style={{
                position: "relative",
                width: "100%",
                aspectRatio: "1/1",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "16px",
                overflow: "hidden",
                background: "repeating-linear-gradient(135deg, #E9EBEA, #E9EBEA 11px, #F1F3F2 11px, #F1F3F2 22px)",
                border: "1px solid rgba(0,127,99,.06)",
                boxShadow: "inset 0 0 12px rgba(0,0,0,0.02)"
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1BAB7C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <h3 style={{ fontSize: "14px", fontFamily: "'Manrope', sans-serif", fontWeight: "700", color: "var(--color-text)", margin: 0, lineHeight: "1.2" }}>
                {prod.name}
              </h3>
              <p style={{ fontSize: "11px", color: "var(--color-text-secondary)", margin: "4px 0 0 0", lineHeight: "1.35", fontWeight: 300 }}>
                {prod.desc}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid var(--color-border)", paddingTop: "10px", marginTop: "10px" }}>
              <span style={{ fontSize: "15px", fontFamily: "'Manrope', sans-serif", fontWeight: "800", color: "var(--color-text)" }}>
                {prod.price} ₽
              </span>
              <button
                style={{
                  width: "100%",
                  border: "none",
                  cursor: "pointer",
                  background: "#1BAB7C",
                  color: "#fff",
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: "12px",
                  padding: "10px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px -4px rgba(27,171,124,.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background-color 0.15s ease"
                }}
                onClick={() => handleAddProductToCart(prod)}
              >
                В корзину
              </button>
            </div>
          </div>
        )))}
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
          borderRadius: "16px",
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
          <span style={{ fontSize: "12px", fontFamily: "'Manrope', sans-serif", fontWeight: "700", color: "var(--color-text)" }}>
            {toast.message}
          </span>
        </div>
      )}
    </section>
  );
}
