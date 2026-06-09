import React, { useState } from "react";
import BottomNav from "./components/BottomNav";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import OnboardingVideoScreen from "./screens/OnboardingVideoScreen";
import OnboardingConsentScreen from "./screens/OnboardingConsentScreen";
import HealthHelpersScreen from "./screens/HealthHelpersScreen";
import CreatorMaterialsScreen from "./screens/CreatorMaterialsScreen";
import ShopScreen from "./screens/ShopScreen";
import CartScreen from "./screens/CartScreen";
import CheckoutScreen from "./screens/CheckoutScreen";
import {
  initialProfile,
  initialHistory,
  initialSettings,
  achievements,
} from "./data/mockData";
import "./index.css";

/**
 * App — корневой компонент приложения «Мозаика Здоровья».
 *
 * Управляет глобальным состоянием:
 * - currentScreen: переключение между экранами (по умолчанию onboarding-video)
 * - profile, history, settings: данные пользователя
 * - cart: корзина товаров интернет-магазина
 */
export default function App() {
  // --- Навигация (по умолчанию видео-онбординг) ---
  const [currentScreen, setCurrentScreen] = useState("onboarding-video");

  // --- Данные пользователя ---
  const [profile, setProfile] = useState(initialProfile);
  const [history, setHistory] = useState(initialHistory);
  const [settings, setSettings] = useState(initialSettings);

  // --- Корзина интернет-магазина ---
  const [cart, setCart] = useState([]);

  // --- Функции для корзины ---
  function handleAddToCart(product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  function handleClearCart() {
    setCart([]);
  }

  // --- Добавление записи в историю тренировок ---
  function handleWorkoutComplete(entry) {
    setHistory((prev) => [entry, ...prev]);
  }

  // --- Рендер текущего экрана ---
  function renderScreen() {
    switch (currentScreen) {
      case "onboarding-video":
        return <OnboardingVideoScreen onNavigate={setCurrentScreen} />;
      case "onboarding-consent":
        return <OnboardingConsentScreen onNavigate={setCurrentScreen} />;
      case "health-helpers":
        return <HealthHelpersScreen onNavigate={setCurrentScreen} />;
      case "creator-materials":
        return <CreatorMaterialsScreen onNavigate={setCurrentScreen} />;
      case "shop":
        return (
          <ShopScreen
            cart={cart}
            onAddToCart={handleAddToCart}
            onNavigate={setCurrentScreen}
          />
        );
      case "cart":
        return (
          <CartScreen
            cart={cart}
            onClearCart={handleClearCart}
            onNavigate={setCurrentScreen}
          />
        );
      case "checkout":
        return (
          <CheckoutScreen
            cart={cart}
            onClearCart={handleClearCart}
            onNavigate={setCurrentScreen}
          />
        );
      case "profile":
        return (
          <ProfileScreen
            profile={profile}
            onProfileSave={setProfile}
            history={history}
            settings={settings}
            onSettingsChange={setSettings}
            achievements={achievements}
          />
        );
      case "home":
      default:
        return (
          <HomeScreen
            onWorkoutComplete={handleWorkoutComplete}
            onNavigate={setCurrentScreen}
          />
        );
    }
  }

  // Показывать нижнюю навигацию только на экранах «Главная» и «Профиль»
  const showBottomNav = currentScreen === "home" || currentScreen === "profile";

  return (
    <div className="app-wrapper">
      <div className="app-shell">
        {/* Фиксированная верхняя шапка (общая для всех экранов) */}
        <header className="app-header header-premium">
          <div className="header-premium__left">
            <h1 className="screen__title premium-title">Мозаика Здоровья</h1>
            <p className="screen__subtitle premium-subtitle">Методика вашего баланса</p>
          </div>
          <div className="header-premium__right">
            {/* Языковой переключатель */}
            <div className="lang-tabs" id="lang-tabs">
              <button
                className={`lang-tabs__btn ${
                  settings?.language === "RU" ? "lang-tabs__btn--active" : ""
                }`}
                onClick={() =>
                  setSettings((prev) => ({ ...prev, language: "RU" }))
                }
              >
                RU
              </button>
              <button
                className={`lang-tabs__btn ${
                  settings?.language === "EN" ? "lang-tabs__btn--active" : ""
                }`}
                onClick={() =>
                  setSettings((prev) => ({ ...prev, language: "EN" }))
                }
              >
                EN
              </button>
            </div>

            {/* Иконка колокольчика (Уведомления) */}
            <button
              className="notification-bell-btn"
              onClick={() => alert("У вас нет новых уведомлений")}
              aria-label="Уведомления"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "6px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                cursor: "pointer",
                transition: "background-color 0.15s ease",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "var(--color-accent)" }}
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
          </div>
        </header>

        {/* Прокручиваемая область контента */}
        <main className="app-content">{renderScreen()}</main>

        {/* Фиксированная нижняя навигация */}
        {showBottomNav && (
          <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
        )}
      </div>
    </div>
  );
}
