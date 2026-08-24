import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../api/client";

/**
 * PaymentResultScreen — экран возврата после оплаты (ЮKassa присылает сюда по return_url).
 * Подтягивает заказ и показывает статус. Оплата подтверждается webhook'ом с задержкой —
 * поэтому несколько раз опрашиваем сервер, пока статус не станет «оплачено».
 */
export default function PaymentResultScreen({ orderId, onNavigate }) {
  const { t } = useLanguage();
  // status: "loading" | "paid" | "pending" | "error"
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    let tries = 0;
    const MAX_TRIES = 6;

    async function check() {
      try {
        const orders = await api.get("/me/orders");
        const order = Array.isArray(orders)
          ? orders.find((o) => o.id === orderId) || orders[0]
          : null;
        if (!active) return;

        if (order && order.status === "PAID") {
          setStatus("paid");
          return;
        }
        tries += 1;
        if (tries >= MAX_TRIES) {
          setStatus("pending");
          return;
        }
        setTimeout(check, 2500);
      } catch {
        if (!active) return;
        tries += 1;
        if (tries >= MAX_TRIES) {
          setStatus("error");
          return;
        }
        setTimeout(check, 2500);
      }
    }

    check();
    return () => {
      active = false;
    };
  }, [orderId]);

  const views = {
    loading: {
      icon: "⏳",
      color: "#6E6E6E",
      title: t("Проверяем оплату…"),
      text: t("Это займёт несколько секунд."),
    },
    paid: {
      icon: "✓",
      color: "#1BAB7C",
      title: t("Оплата прошла успешно"),
      text: t("Спасибо! Мы свяжемся с вами для подтверждения доставки."),
    },
    pending: {
      icon: "⏳",
      color: "#E0A100",
      title: t("Оплата обрабатывается"),
      text: t("Подтверждение платежа может занять некоторое время. Статус заказа появится в профиле."),
    },
    error: {
      icon: "!",
      color: "#EB6074",
      title: t("Не удалось проверить оплату"),
      text: t("Проверьте статус заказа в профиле чуть позже."),
    },
  };
  const view = views[status];

  return (
    <section className="screen" id="screen-payment-result">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: "18px",
          padding: "40px 20px",
          minHeight: "60vh",
        }}
      >
        <div
          style={{
            width: "88px",
            height: "88px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
            color: view.color,
            background: `${view.color}14`,
            border: `2px solid ${view.color}40`,
          }}
        >
          {view.icon}
        </div>

        <h1
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 800,
            fontSize: "22px",
            color: "var(--color-text)",
            margin: 0,
            letterSpacing: "-.5px",
          }}
        >
          {view.title}
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "var(--color-text-secondary)",
            maxWidth: "320px",
            margin: 0,
            lineHeight: 1.5,
            fontWeight: 300,
          }}
        >
          {view.text}
        </p>

        {status !== "loading" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "280px", marginTop: "8px" }}>
            <button className="btn-save" onClick={() => onNavigate("profile")}>
              {t("Мои заказы")}
            </button>
            <button
              onClick={() => onNavigate("home")}
              style={{
                border: "1.5px solid #a6a6a1",
                backgroundColor: "#fff",
                color: "var(--color-text)",
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 600,
                borderRadius: "12px",
                padding: "12px",
                cursor: "pointer",
              }}
            >
              {t("На главную")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
