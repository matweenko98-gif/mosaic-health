import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { useLanguage } from "../context/LanguageContext";

/**
 * ShopScreen — Экран «Магазин». Товары загружаются с сервера (управляются в админке).
 */
export default function ShopScreen({ cart, onAddToCart, onNavigate, initialCategory = "Все", onConsumeCategory }) {
  const { t, currentLang } = useLanguage();
  const [rawProducts, setRawProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get("/products")
      .then((list) => {
        if (!active) return;
        setRawProducts(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (active) setRawProducts([]);
      })
      .finally(() => {
        if (active) setProductsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const products = React.useMemo(() => {
    const isRu = currentLang === "RU";
    return rawProducts
      .filter((p) => isRu ? !!p.name_ru : !!p.name_en)
      .map((p) => {
        const name = isRu ? p.name_ru : p.name_en;
        const rawDesc = isRu ? p.description_ru : p.description_en;
        let descText = rawDesc || "";
        let isPublished = true;
        let stock = null;
        let unlimited = true;
        try {
          if (rawDesc && rawDesc.trim().startsWith("{")) {
            const parsed = JSON.parse(rawDesc);
            descText = parsed.text ?? parsed.description ?? "";
            isPublished = parsed.isPublished !== false;
            stock = parsed.stock ?? null;
            unlimited = parsed.unlimited !== false;
          }
        } catch (e) {
          // fallback plain text
        }
        return {
          id: p.id,
          name,
          price: p.price,
          desc: descText,
          category: p.category,
          image: p.imageKey || null,
          isPublished,
          stock,
          unlimited,
        };
      })
      .filter((prod) => prod.isPublished);
  }, [rawProducts, currentLang]);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "Все");
  const [shopSearch, setShopSearch] = useState("");
  const [toast, setToast] = useState({ visible: false, message: "" });

  // Категория «использована» при открытии — сбрасываем в App, чтобы следующий заход был обычным.
  useEffect(() => {
    if (onConsumeCategory) onConsumeCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setToast({
      visible: true,
      message: t('Товар "{name}" добавлен в корзину').replace("{name}", prod.name)
    });
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
            <span>{t("Назад")}</span>
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
            <span>🛒 {t("Корзина")}</span>
            {cartCount > 0 && <span className="cart-badge-btn__count">{cartCount}</span>}
          </button>
        </div>

        <div className="header-title-container">
          <h1 className="screen__title" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "24px", color: "var(--color-text)", letterSpacing: "-.5px", margin: 0 }}>{t("Магазин")}</h1>
          <p className="screen__subtitle" style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "2px", fontWeight: 300 }}>{t("Инструменты и добавки")}</p>
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
        {(() => {
          const customCats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
          const dynamicCategories = [
            "Все",
            "Инструменты",
            "Добавки",
            ...customCats.filter((c) => c !== "Инструменты" && c !== "Добавки" && c !== "Общее"),
          ];

          const getCategoryIcon = (catId) => {
            if (catId === "Все") {
              return (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              );
            }
            if (catId === "Инструменты") {
              return (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2" />
                  <path d="M6 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2" />
                  <path d="M6 12h12" />
                  <path d="M6.5 4.5v15" />
                  <path d="M17.5 4.5v15" />
                </svg>
              );
            }
            if (catId === "Добавки") {
              return (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
                  <path d="m8.5 8.5 7 7" />
                </svg>
              );
            }
            return <span style={{ fontSize: "14px", lineHeight: 1 }}>📦</span>;
          };

          return dynamicCategories.map((catId) => {
            const isActive = selectedCategory === catId;
            return (
              <button
                key={catId}
                type="button"
                onClick={() => setSelectedCategory(catId)}
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
                  flexShrink: 0
                }}
              >
                {getCategoryIcon(catId)}
                <span>{t(catId)}</span>
              </button>
            );
          });
        })()}
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
          placeholder={t("Поиск товаров...")}
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
        {productsLoading ? (
          <div style={{ gridColumn: "span 2", textAlign: "center", padding: "40px 20px", color: "var(--color-text-secondary)", fontSize: "14px" }}>
            {t("Загрузка товаров…")}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ gridColumn: "span 2", textAlign: "center", padding: "40px 20px", color: "var(--color-text-secondary)", fontSize: "14px", fontStyle: "italic" }}>
            {t("Ничего не найдено")}
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
              {/* Фото товара (или заглушка, если фото нет) */}
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
                background: prod.image
                  ? "#F5F6F5"
                  : "repeating-linear-gradient(135deg, #E9EBEA, #E9EBEA 11px, #F1F3F2 11px, #F1F3F2 22px)",
                border: "1px solid rgba(0,127,99,.06)",
                boxShadow: "inset 0 0 12px rgba(0,0,0,0.02)"
              }}>
                {prod.image ? (
                  <img
                    src={prod.image}
                    alt={prod.name}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1BAB7C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                )}
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
                {t("В корзину")}
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
