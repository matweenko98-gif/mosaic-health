import React, { useEffect, useState } from "react";
import { api } from "../api/client";

/**
 * SpecialistCodesScreen — Панель врача: коды доступа к индивидуальным тренировкам.
 * Врач создаёт коды, называет их пациентам; здесь видно, кто какой код активировал.
 */
export default function SpecialistCodesScreen({ onNavigate }) {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [lastCreated, setLastCreated] = useState(null);
  const [error, setError] = useState("");

  async function loadCodes() {
    try {
      const list = await api.get("/specialist/codes");
      setCodes(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.message || "Не удалось загрузить коды");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCodes();
  }, []);

  async function handleAddCode() {
    setCreating(true);
    setError("");
    try {
      const created = await api.post("/specialist/codes", { label: newLabel.trim() });
      setLastCreated(created.code);
      setNewLabel("");
      await loadCodes();
    } catch (e) {
      setError(e?.message || "Не удалось создать код");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.del(`/specialist/codes/${id}`);
      await loadCodes();
    } catch (e) {
      setError(e?.message || "Не удалось удалить код");
    }
  }

  return (
    <section className="screen" id="screen-specialist-codes">
      <header className="screen__header" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "12px" }}>
        <button
          className="back-btn"
          onClick={() => onNavigate("profile")}
          style={{ border: "1px solid var(--color-border)", backgroundColor: "#fff", fontFamily: "'Manrope', sans-serif", fontWeight: 600, borderRadius: "12px" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Назад</span>
        </button>
        <div className="header-title-container">
          <h1 className="screen__title" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "24px", color: "var(--color-text)", letterSpacing: "-.5px", margin: 0 }}>Панель врача</h1>
          <p className="screen__subtitle" style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "2px", fontWeight: 300 }}>Коды доступа к индивидуальным тренировкам</p>
        </div>
      </header>

      {/* Создание кода */}
      <div className="card" style={{ padding: "16px", borderRadius: "20px", background: "#fff", boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)", marginBottom: "16px" }}>
        <label style={{ fontSize: "12.5px", fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: "var(--color-text)", display: "block", marginBottom: "6px" }}>
          Пометка (для кого код) — необязательно
        </label>
        <input
          type="text"
          placeholder="Например: Иван, восстановление спины"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className="form-field__input"
          style={{ borderRadius: "14px", marginBottom: "12px" }}
        />
        <button
          onClick={handleAddCode}
          disabled={creating}
          className="btn-save"
          style={{ opacity: creating ? 0.7 : 1 }}
        >
          {creating ? "Создание…" : "+ Добавить код"}
        </button>

        {lastCreated && (
          <div style={{ marginTop: "14px", padding: "14px", borderRadius: "14px", background: "rgba(27,171,124,0.08)", border: "1px solid rgba(27,171,124,0.3)", textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginBottom: "4px" }}>Новый код — назовите его пациенту:</div>
            <div style={{ fontSize: "22px", fontWeight: 800, fontFamily: "'Manrope', sans-serif", letterSpacing: "2px", color: "#007F63" }}>{lastCreated}</div>
          </div>
        )}
      </div>

      {error && (
        <div style={{ color: "#d93025", fontSize: "13px", backgroundColor: "#fce8e6", padding: "10px 12px", borderRadius: "12px", border: "1px solid #fad2cf", marginBottom: "12px" }}>
          {error}
        </div>
      )}

      {/* Список кодов */}
      <h3 style={{ fontSize: "11px", fontFamily: "'Manrope', sans-serif", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".8px", color: "var(--color-text-secondary)", borderBottom: "1px solid var(--color-border)", paddingBottom: "6px", margin: "8px 0" }}>
        Мои коды ({codes.length})
      </h3>

      {loading ? (
        <p style={{ color: "var(--color-text-secondary)", fontSize: "13px" }}>Загрузка…</p>
      ) : codes.length === 0 ? (
        <p style={{ color: "var(--color-text-secondary)", fontSize: "13px", fontWeight: 300 }}>Пока нет кодов. Создайте первый выше.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {codes.map((c) => {
            const active = c.status === "activated";
            return (
              <div key={c.id} className="card" style={{ padding: "14px 16px", borderRadius: "16px", background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.03)", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "17px", fontWeight: 800, fontFamily: "'Manrope', sans-serif", letterSpacing: "1px", color: "var(--color-text)" }}>{c.code}</div>
                  {c.label && <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "2px" }}>{c.label}</div>}
                  <div style={{ fontSize: "12px", marginTop: "6px", color: active ? "#007F63" : "var(--color-text-secondary)", fontWeight: active ? 600 : 300 }}>
                    {active
                      ? `Активирован: ${c.activatedByName || "—"} (${c.activatedByEmail})`
                      : "Свободен — ещё не активирован"}
                  </div>
                </div>
                <span style={{ fontSize: "11px", fontWeight: 700, fontFamily: "'Manrope', sans-serif", padding: "5px 10px", borderRadius: "999px", background: active ? "rgba(27,171,124,0.12)" : "#F0F0EE", color: active ? "#007F63" : "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                  {active ? "Активен" : "Свободен"}
                </span>
                {!active && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    title="Удалить код"
                    style={{ border: "none", background: "none", cursor: "pointer", color: "#d93025", fontSize: "18px", lineHeight: 1, padding: "4px" }}
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
