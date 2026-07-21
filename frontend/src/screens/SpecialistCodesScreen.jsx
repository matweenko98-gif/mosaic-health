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
  
  // Новые состояния
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Все"); // Все, Свободные, Активные, Отозванные
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [revokeConfirmId, setRevokeConfirmId] = useState(null);
  const [shareModalData, setShareModalData] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, code }

  // Показ всплывающего уведомления
  const showToast = (message) => {
    setToast({ visible: true, message });
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast({ visible: false, message: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

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
      showToast("Код успешно создан!");
    } catch (e) {
      setError(e?.message || "Не удалось создать код");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.del(`/specialist/codes/${id}`);
      showToast("Код удален");
      await loadCodes();
    } catch (e) {
      setError(e?.message || "Не удалось удалить код");
    }
  }

  async function handleRevoke(id) {
    setError("");
    try {
      await api.post(`/specialist/codes/${id}/revoke`);
      showToast("Доступ отозван!");
      await loadCodes();
    } catch (e) {
      setError(e?.message || "Не удалось отозвать доступ");
    } finally {
      setRevokeConfirmId(null);
    }
  }

  // Копирование кода
  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      showToast("Код скопирован!");
    }).catch(() => {
      try {
        const el = document.createElement("textarea");
        el.value = code;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        showToast("Код скопирован!");
      } catch (e) {
        showToast("Не удалось скопировать");
      }
    });
  };

  const getShareText = (code) => `Ваш код доступа к тренировкам в приложении «Мозаика Здоровья»: ${code}`;

  // Отправка/Шеринг кода
  const handleShare = (code) => {
    const text = getShareText(code);
    const shareData = {
      title: "Мозаика Здоровья",
      text: text,
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      navigator.share(shareData).catch((err) => {
        if (err.name !== "AbortError") {
          setShareModalData(code);
        }
      });
    } else {
      setShareModalData(code);
    }
  };

  // Красивое форматирование даты
  const formatDate = (dateStr, fallback = "Нет занятий") => {
    if (!dateStr) return fallback;
    try {
      const d = new Date(dateStr);
      const pad = (n) => String(n).padStart(2, "0");
      return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch (e) {
      return fallback;
    }
  };

  // Поиск и фильтрация
  const filteredCodes = codes.filter((c) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    const codeMatch = c.code.toLowerCase().includes(query);
    const labelMatch = (c.label || "").toLowerCase().includes(query);
    const nameMatch = (c.activatedByName || "").toLowerCase().includes(query);
    const emailMatch = (c.activatedByEmail || "").toLowerCase().includes(query);

    return codeMatch || labelMatch || nameMatch || emailMatch;
  });

  const tabFilteredCodes = filteredCodes.filter((c) => {
    if (activeTab === "Все") return true;
    if (activeTab === "Неактивированные") return c.status === "free";
    if (activeTab === "Активные") return c.status === "activated";
    if (activeTab === "Отозванные") return c.status === "revoked";
    return true;
  });

  // Сортировка: сначала отображаются новые и активные (не-отозванные), отозванные внизу. Внутри групп — по дате создания.
  const sortedCodes = [...tabFilteredCodes].sort((a, b) => {
    const isRevokedA = a.status === "revoked";
    const isRevokedB = b.status === "revoked";
    if (isRevokedA !== isRevokedB) {
      return isRevokedA ? 1 : -1;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <section className="screen" id="screen-specialist-codes">
      <header className="screen__header" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "12px" }}>
        <button
          className="back-btn"
          onClick={() => onNavigate("role-selector")}
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
      <div className="card" style={{ padding: "16px", borderRadius: "20px", background: "#fff", boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)", marginBottom: "8px" }}>
        <label style={{ fontSize: "12.5px", fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: "var(--color-text)", display: "block", marginBottom: "6px" }}>
          Пометка (для кого код)
        </label>
        <input
          type="text"
          placeholder="например: Иван Петров, спина"
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
            <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginBottom: "4px" }}>Новый код создан:</div>
            <div style={{ fontSize: "22px", fontWeight: 800, fontFamily: "'Manrope', sans-serif", letterSpacing: "2px", color: "#007F63" }}>{lastCreated}</div>
            
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "10px" }}>
              <button
                onClick={() => handleCopy(lastCreated)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(0,127,99,0.2)",
                  background: "#fff",
                  fontSize: "12px",
                  color: "#007F63",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Скопировать
              </button>
              <button
                onClick={() => handleShare(lastCreated)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(0,127,99,0.2)",
                  background: "#fff",
                  fontSize: "12px",
                  color: "#007F63",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Поделиться
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{ color: "#d93025", fontSize: "13px", backgroundColor: "#fce8e6", padding: "10px 12px", borderRadius: "12px", border: "1px solid #fad2cf", marginBottom: "12px" }}>
          {error}
        </div>
      )}

      {/* Поиск */}
      <div style={{ position: "relative", marginTop: "8px" }}>
        <input
          type="text"
          placeholder="Поиск по пациенту, пометке или коду..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px 12px 42px",
            borderRadius: "16px",
            border: "1px solid var(--color-border)",
            backgroundColor: "#fff",
            fontSize: "14px",
            fontFamily: "var(--font-family)",
            color: "var(--color-text)",
            outline: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
            transition: "border-color 0.2s"
          }}
          onFocus={(e) => e.target.style.borderColor = "var(--color-accent)"}
          onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
        />
        <svg
          style={{ position: "absolute", left: "14px", top: "14px", color: "var(--color-text-secondary)" }}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            style={{
              position: "absolute",
              right: "14px",
              top: "12px",
              border: "none",
              background: "none",
              fontSize: "16px",
              color: "var(--color-text-secondary)",
              cursor: "pointer"
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Горизонтальные табы-фильтры */}
      <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "6px", marginBottom: "4px" }}>
        {["Все", "Неактивированные", "Активные", "Отозванные"].map((tab) => {
          const isActive = activeTab === tab;
          let count = 0;
          if (tab === "Все") count = codes.length;
          else if (tab === "Неактивированные") count = codes.filter((c) => c.status === "free").length;
          else if (tab === "Активные") count = codes.filter((c) => c.status === "activated").length;
          else if (tab === "Отозванные") count = codes.filter((c) => c.status === "revoked").length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 14px",
                borderRadius: "999px",
                border: "none",
                fontSize: "13px",
                fontFamily: "var(--font-family)",
                fontWeight: isActive ? 700 : 500,
                backgroundColor: isActive ? "var(--color-active)" : "#F0F0EE",
                color: isActive ? "#fff" : "var(--color-text-secondary)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
                boxShadow: isActive ? "0 4px 10px rgba(0, 127, 99, 0.15)" : "none"
              }}
            >
              {tab} <span style={{ opacity: 0.7, fontSize: "11px", marginLeft: "2px" }}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Список кодов */}
      {loading ? (
        <p style={{ color: "var(--color-text-secondary)", fontSize: "13px" }}>Загрузка…</p>
      ) : sortedCodes.length === 0 ? (
        <p style={{ color: "var(--color-text-secondary)", fontSize: "13px", fontWeight: 300, textAlign: "center", padding: "20px 0" }}>
          Коды не найдены.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {sortedCodes.map((c) => {
            const active = c.status === "activated";
            const revoked = c.status === "revoked";
            const free = c.status === "free";

            return (
              <div
                key={c.id}
                className="card"
                style={{
                  padding: "16px",
                  borderRadius: "20px",
                  background: "#fff",
                  border: "1px solid var(--color-border)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  opacity: revoked ? 0.75 : 1
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: 800,
                        fontFamily: "var(--font-family-title)",
                        letterSpacing: "1.5px",
                        color: free ? "var(--color-active)" : "var(--color-text)",
                        textDecoration: revoked ? "line-through" : "none"
                      }}
                    >
                      {c.code}
                    </div>
                    {c.label && (
                      <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: 500, marginTop: "2px" }}>
                        Пометка: <span style={{ color: "var(--color-text)", fontWeight: 600 }}>{c.label}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        fontFamily: "var(--font-family-title)",
                        padding: "4px 10px",
                        borderRadius: "999px",
                        background: free
                          ? "#F0F0EE"
                          : active
                          ? "rgba(27,171,124,0.12)"
                          : "rgba(217,48,37,0.1)",
                        color: free
                          ? "var(--color-text-secondary)"
                          : active
                          ? "var(--color-active)"
                          : "#d93025",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {free ? "Не активирован" : active ? "Активен" : "Отозван"}
                    </span>

                    {(free || revoked) && (
                      <button
                        onClick={() => setDeleteConfirm({ id: c.id, code: c.code })}
                        title="Удалить код"
                        style={{
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          color: "var(--color-text-secondary)",
                          fontSize: "18px",
                          lineHeight: 1,
                          padding: "2px 6px",
                          borderRadius: "50%",
                          transition: "color 0.2s, background-color 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = "#d93025";
                          e.target.style.backgroundColor = "rgba(217,48,37,0.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = "var(--color-text-secondary)";
                          e.target.style.backgroundColor = "transparent";
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {!free && (
                  <div
                    style={{
                      background: "#F9FAF9",
                      borderRadius: "14px",
                      padding: "10px 12px",
                      border: "1px solid var(--color-border)",
                      fontSize: "12.5px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px"
                    }}
                  >
                    <div style={{ fontWeight: 600, color: "var(--color-text)" }}>
                      Пациент: <span style={{ fontWeight: 700 }}>{c.activatedByName || "Зарегистрирован"}</span>
                    </div>
                    <div style={{ color: "var(--color-text-secondary)", fontSize: "11.5px" }}>
                      Email: {c.activatedByEmail}
                    </div>
                    <div style={{ color: "var(--color-text-secondary)", fontSize: "11.5px" }}>
                      Зарегистрирован: {formatDate(c.activatedByRegisteredAt, "—")}
                    </div>
                    <div style={{ height: "1px", background: "var(--color-border)", margin: "4px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text)" }}>
                      <span>Выполнено тренировок:</span>
                      <span style={{ fontWeight: 700 }}>{c.workoutCount}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text)" }}>
                      <span>Последняя активность:</span>
                      <span style={{ fontWeight: 600, color: c.lastWorkout ? "var(--color-text)" : "var(--color-text-secondary)" }}>
                        {formatDate(c.lastWorkout)}
                      </span>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <button
                    onClick={() => handleCopy(c.code)}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "8px 12px",
                      borderRadius: "12px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "#fff",
                      fontFamily: "var(--font-family)",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "var(--color-text)",
                      cursor: "pointer",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#F9FAF9"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "#fff"}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Скопировать
                  </button>

                  <button
                    onClick={() => handleShare(c.code)}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "8px 12px",
                      borderRadius: "12px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "#fff",
                      fontFamily: "var(--font-family)",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "var(--color-text)",
                      cursor: "pointer",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#F9FAF9"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "#fff"}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    Поделиться
                  </button>

                  {active && (
                    <button
                      onClick={() => setRevokeConfirmId(c.id)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "12px",
                        border: "1px solid #fad2cf",
                        backgroundColor: "#fff5f5",
                        fontFamily: "var(--font-family)",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        color: "#d93025",
                        cursor: "pointer",
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#fce8e6"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "#fff5f5"}
                    >
                      Отозвать
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Красивое Toast уведомление */}
      {toast.visible && (
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#1d2321",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: 600,
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <span style={{ color: "var(--color-accent)" }}>✓</span> {toast.message}
        </div>
      )}

      {/* Модальное окно отзыва доступа */}
      {revokeConfirmId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "20px"
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "20px",
              padding: "20px",
              width: "100%",
              maxWidth: "360px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--color-text)" }}>
              Подтвердите отзыв доступа
            </h3>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>
              Вы действительно хотите отозвать доступ к тренировкам для этого пациента? Код будет заблокирован, и пациент потеряет доступ к закрытому разделу.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
              <button
                onClick={() => setRevokeConfirmId(null)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "#fff",
                  fontFamily: "var(--font-family)",
                  fontWeight: 600,
                  fontSize: "13px",
                  color: "var(--color-text)",
                  cursor: "pointer"
                }}
              >
                Отмена
              </button>
              <button
                onClick={() => handleRevoke(revokeConfirmId)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "#d93025",
                  fontFamily: "var(--font-family)",
                  fontWeight: 600,
                  fontSize: "13px",
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                Отозвать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно шеринга */}
      {shareModalData && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "20px"
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "20px",
              padding: "20px",
              width: "100%",
              maxWidth: "360px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--color-text)" }}>
                Поделиться кодом
              </h3>
              <button
                onClick={() => setShareModalData(null)}
                style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer", color: "var(--color-text-secondary)", lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            
            <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>
              Отправьте код пациенту через мессенджеры:
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <a
                href={`https://t.me/share/url?url=&text=${encodeURIComponent(getShareText(shareModalData))}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShareModalData(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px",
                  borderRadius: "12px",
                  backgroundColor: "#229ED9",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  textAlign: "center"
                }}
              >
                Telegram
              </a>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(getShareText(shareModalData))}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShareModalData(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px",
                  borderRadius: "12px",
                  backgroundColor: "#25D366",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  textAlign: "center"
                }}
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
      {/* Всплывающее окно подтверждения удаления (Confirm Modal в стиле админ-панели) */}
      {deleteConfirm && (
        <div className="modal-overlay-admin" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-admin" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 10px 0", fontFamily: "'Manrope', sans-serif", fontSize: "16px", fontWeight: "800", color: "var(--color-text)" }}>
              Подтверждение удаления
            </h3>
            <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: "1.5", fontWeight: 300 }}>
              Вы уверены, что хотите удалить код доступа <strong>«{deleteConfirm.code}»</strong>? Это действие необратимо.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn-save"
                style={{ flex: 1, margin: 0, backgroundColor: "#d93025", boxShadow: "0 4px 12px rgba(217,48,37,.3)" }}
                onClick={() => {
                  handleDelete(deleteConfirm.id);
                  setDeleteConfirm(null);
                }}
              >
                Удалить
              </button>
              <button
                style={{
                  padding: "10px 16px",
                  borderRadius: "14px",
                  border: "1.5px solid #a6a6a1",
                  background: "#fff",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "'Manrope', sans-serif",
                  transition: "all 0.15s ease",
                  flex: 1
                }}
                onClick={() => setDeleteConfirm(null)}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modal-overlay-admin {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justifyContent: center;
          padding: 16px;
          z-index: 10000;
        }
        .modal-admin {
          background-color: #fff;
          border-radius: 24px;
          padding: 20px;
          width: 100%;
          max-width: 380px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </section>
  );
}
