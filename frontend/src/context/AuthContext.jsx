import React, { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

/**
 * Хранитель сессии: кто вошёл, функции входа/регистрации/выхода.
 * При запуске пытается восстановить сессию по сохранённой cookie.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authApi.restoreSession().then((u) => {
      if (active) {
        setUser(u);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  async function login(email, password) {
    const u = await authApi.login(email, password);
    setUser(u);
    return u;
  }

  async function register(payload) {
    const u = await authApi.register(payload);
    setUser(u);
    return u;
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
  }

  const value = {
    user,
    setUser,
    isLoggedIn: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth должен использоваться внутри AuthProvider");
  return ctx;
}
