import React, { useState, useEffect, useRef } from "react";
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
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import {
  initialHistory,
  initialSettings,
  achievements,
} from "./data/mockData";
import { useAuth } from "./context/AuthContext";
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
  const mainContentRef = useRef(null);

  // --- Сессия (вход) приходит из общего хранителя AuthContext ---
  const { user: authUser, isLoggedIn, loading: authLoading, login, register, logout } = useAuth();

  // --- Навигация. Стартовый экран определяется после проверки сессии. ---
  const [currentScreen, setCurrentScreen] = useState(null);

  // Когда статус входа определён — выбираем первый экран
  useEffect(() => {
    if (authLoading || currentScreen !== null) return;
    if (isLoggedIn) {
      const consentDateStr = localStorage.getItem("consentDate");
      let needConsent = !consentDateStr;
      if (consentDateStr) {
        const daysDiff = (Date.now() - new Date(consentDateStr).getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 90) needConsent = true;
      }
      setCurrentScreen(needConsent ? "onboarding-consent" : "home");
    } else {
      setCurrentScreen("onboarding-video");
    }
  }, [authLoading, isLoggedIn, currentScreen]);

  // Сброс скролла при смене экранов
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [currentScreen]);

  // --- Данные профиля для экранов (берём из сессии, дополняем значениями по умолчанию) ---
  const [user, setUser] = useState({
    name: "", email: "", phone: "", age: "34", country: "Беларусь",
    hasRehabilitation: true, avatar: null,
  });

  // Подтягиваем профиль вошедшего пользователя
  useEffect(() => {
    if (authUser) {
      setUser((prev) => ({
        ...prev,
        name: authUser.name ?? prev.name,
        email: authUser.email ?? prev.email,
        phone: authUser.phone ?? prev.phone,
        age: authUser.age || prev.age,
        country: authUser.country || prev.country,
        hasRehabilitation: authUser.hasRehabilitation ?? prev.hasRehabilitation,
      }));
    }
  }, [authUser]);

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

  function handleUpdateCartQuantity(productId, newQty) {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: newQty } : item))
    );
  }

  function handleRemoveFromCart(productId) {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }

  function handleClearCart() {
    setCart([]);
  }

  // --- Добавление записи в историю тренировок ---
  function handleWorkoutComplete(entry) {
    setHistory((prev) => [entry, ...prev]);
  }

  // --- Обработчики входа и регистрации (через сервер) ---
  // Возвращают промис, чтобы экраны входа/регистрации могли показать ошибку.
  async function handleLogin(email, password) {
    await login(email, password);
    setCurrentScreen("home");
  }

  async function handleRegister(userData) {
    await register(userData);
    setCurrentScreen("home");
  }

  function handleUserSave(updatedUser) {
    // На этом этапе профиль сохраняется локально; подключение к серверу — в следующем шаге.
    setUser(updatedUser);
  }

  async function handleLogout() {
    await logout();
    setUser({
      name: "", email: "", phone: "", age: "34", country: "Беларусь",
      hasRehabilitation: true, avatar: null,
    });
    setCurrentScreen("onboarding-video");
  }

  // --- Рендер текущего экрана ---
  function renderScreen() {
    switch (currentScreen) {
      case "onboarding-video":
        return <OnboardingVideoScreen onNavigate={setCurrentScreen} />;
      case "onboarding-consent":
        return (
          <OnboardingConsentScreen
            onNavigate={(next) => {
              if (next === "login" || next === "home") {
                const nowStr = new Date().toISOString();
                localStorage.setItem("consentDate", nowStr);
                if (isLoggedIn) {
                  setCurrentScreen("home");
                } else {
                  setCurrentScreen("login");
                }
              } else {
                setCurrentScreen(next);
              }
            }}
          />
        );
      case "login":
        return <LoginScreen onNavigate={setCurrentScreen} onLogin={handleLogin} />;
      case "register":
        return <RegisterScreen onNavigate={setCurrentScreen} onRegister={handleRegister} />;
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
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveFromCart}
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
            user={user}
            onUserSave={handleUserSave}
            onLogout={handleLogout}
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

  // Пока проверяется сессия — показываем заставку загрузки
  if (authLoading || currentScreen === null) {
    return (
      <div className="app-wrapper">
        <div
          className="app-shell"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}
        >
          <span style={{ fontFamily: "'Manrope', sans-serif", color: "#6E6E6E", fontSize: "14px" }}>
            Загрузка…
          </span>
        </div>
      </div>
    );
  }

  // Показывать нижнюю навигацию только на экранах «Главная» и «Профиль»
  const showBottomNav = currentScreen === "home" || currentScreen === "profile";

  // Экраны, где контент центрируется по высоте (100dvh)
  const isOnboardingScreen = [
    "onboarding-video",
    "onboarding-consent",
    "login",
    "register",
  ].includes(currentScreen);

  return (
    <div className="app-wrapper">
      <div className="app-shell">
        {/* Фиксированная верхняя шапка (общая для всех экранов) */}
        <header className="app-header header-premium">
          <div className="header-premium__left" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "11px", minWidth: 0 }}>
            {!(currentScreen === "onboarding-video" || currentScreen === "onboarding-consent" || currentScreen === "login" || currentScreen === "register") && (
              <>
                <img
                  src="/logo_mozaika.svg"
                  alt="Логотип Мозаика Здоровья"
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    objectFit: "contain",
                    flexShrink: 0
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.15", minWidth: 0 }}>
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: "800", fontSize: "15px", color: "#1d2321", letterSpacing: "-.3px", whiteSpace: "nowrap" }}>Мозаика Здоровья</span>
                  <span style={{ fontSize: "10px", color: "#6E6E6E", marginTop: "2px", whiteSpace: "nowrap" }}>Методика вашего баланса</span>
                </div>
              </>
            )}
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
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1d2321"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <span style={{ position: "absolute", margin: "-16px 0 0 16px", width: "7px", height: "7px", background: "#EB6074", borderRadius: "50%", border: "1.5px solid #fff" }}></span>
            </button>
          </div>
        </header>

        {/* Прокручиваемая область контента */}
        <main ref={mainContentRef} className={`app-content${isOnboardingScreen ? " app-content--centered" : ""}`}>{renderScreen()}</main>

        {/* Фиксированная нижняя навигация */}
        {showBottomNav && (
          <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
        )}
      </div>
    </div>
  );
}
