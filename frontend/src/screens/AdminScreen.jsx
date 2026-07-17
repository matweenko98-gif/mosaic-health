import React, { useEffect, useState } from "react";
import { api } from "../api/client";

/**
 * AdminScreen — Панель администратора.
 * Управление пользователями (роли), товарами, статьями, подкастами и заказами.
 */

const TABS = [
  { id: "users", label: "Пользователи" },
  { id: "products", label: "Товары" },
  { id: "articles", label: "Статьи" },
  { id: "podcasts", label: "Подкасты" },
  { id: "orders", label: "Заказы" },
];

const inputStyle = { borderRadius: "12px", marginBottom: "8px", width: "100%" };
const cardStyle = { padding: "14px 16px", borderRadius: "16px", background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.03)", border: "1px solid var(--color-border)" };

function SectionError({ error }) {
  if (!error) return null;
  return (
    <div style={{ color: "#d93025", fontSize: "13px", backgroundColor: "#fce8e6", padding: "10px 12px", borderRadius: "12px", border: "1px solid #fad2cf", marginBottom: "12px" }}>
      {error}
    </div>
  );
}

// ------------------------- Пользователи -------------------------
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setUsers(await api.get("/admin/users"));
    } catch (e) {
      setError(e?.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function changeRole(id, role) {
    setError("");
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      await load();
    } catch (e) {
      setError(e?.message || "Не удалось изменить роль");
    }
  }

  if (loading) return <p style={{ color: "var(--color-text-secondary)", fontSize: "13px" }}>Загрузка…</p>;
  return (
    <div>
      <SectionError error={error} />
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {users.map((u) => (
          <div key={u.id} style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: "14px", fontFamily: "'Manrope', sans-serif", color: "var(--color-text)" }}>{u.name || "Без имени"}</div>
              <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis" }}>{u.email}</div>
            </div>
            <select
              value={u.role}
              onChange={(e) => changeRole(u.id, e.target.value)}
              className="form-field__input"
              style={{ borderRadius: "10px", width: "auto", padding: "8px 10px", cursor: "pointer", backgroundColor: "#fff" }}
            >
              <option value="PATIENT">Пациент</option>
              <option value="SPECIALIST">Врач</option>
              <option value="ADMIN">Админ</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------- Товары -------------------------
const blankProduct = { name: "", price: 0, description: "", category: "Инструменты", inStock: true };
function ProductsTab() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // объект товара или null

  async function load() {
    try { setItems(await api.get("/products")); } catch (e) { setError(e?.message || "Ошибка"); }
  }
  useEffect(() => { load(); }, []);

  async function save() {
    setError("");
    const body = {
      name: editing.name,
      price: Number(editing.price) || 0,
      description: editing.description || "",
      category: editing.category || "Общее",
      inStock: !!editing.inStock,
    };
    try {
      if (editing.id) await api.patch(`/admin/products/${editing.id}`, body);
      else await api.post("/admin/products", body);
      setEditing(null);
      await load();
    } catch (e) { setError(e?.message || "Не удалось сохранить"); }
  }
  async function remove(id) {
    if (!window.confirm("Удалить товар?")) return;
    try { await api.del(`/admin/products/${id}`); await load(); } catch (e) { setError(e?.message || "Ошибка"); }
  }

  return (
    <div>
      <SectionError error={error} />
      {editing ? (
        <div style={{ ...cardStyle, marginBottom: "14px" }}>
          <input className="form-field__input" style={inputStyle} placeholder="Название" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          <input className="form-field__input" style={inputStyle} type="number" placeholder="Цена, ₽" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} />
          <input className="form-field__input" style={inputStyle} placeholder="Категория (Инструменты / Добавки)" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
          <textarea className="form-field__input" style={{ ...inputStyle, minHeight: "70px" }} placeholder="Описание" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", marginBottom: "10px" }}>
            <input type="checkbox" checked={!!editing.inStock} onChange={(e) => setEditing({ ...editing, inStock: e.target.checked })} /> В наличии
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={save} className="btn-save" style={{ flex: 1 }}>Сохранить</button>
            <button onClick={() => setEditing(null)} style={{ flex: 1, borderRadius: "12px", border: "1.5px solid #a6a6a1", background: "#fff", fontWeight: 700, cursor: "pointer" }}>Отмена</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setEditing({ ...blankProduct })} className="btn-save" style={{ marginBottom: "14px" }}>+ Добавить товар</button>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {items.map((p) => (
          <div key={p.id} style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-text)" }}>{p.name}</div>
              <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{p.price} ₽ · {p.category} · {p.inStock ? "в наличии" : "нет в наличии"}</div>
            </div>
            <button onClick={() => setEditing(p)} style={{ border: "none", background: "none", cursor: "pointer", color: "#1BAB7C", fontWeight: 700, fontSize: "13px" }}>Изм.</button>
            <button onClick={() => remove(p.id)} style={{ border: "none", background: "none", cursor: "pointer", color: "#d93025", fontSize: "18px" }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------- Статьи -------------------------
const blankArticle = { title: "", description: "", body: "", readTime: "5 мин" };
function ArticlesTab() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);

  async function load() { try { setItems(await api.get("/articles")); } catch (e) { setError(e?.message || "Ошибка"); } }
  useEffect(() => { load(); }, []);

  async function save() {
    setError("");
    const body = { title: editing.title, description: editing.description || "", body: editing.body || "", readTime: editing.readTime || "" };
    try {
      if (editing.id) await api.patch(`/admin/articles/${editing.id}`, body);
      else await api.post("/admin/articles", body);
      setEditing(null); await load();
    } catch (e) { setError(e?.message || "Не удалось сохранить"); }
  }
  async function remove(id) {
    if (!window.confirm("Удалить статью?")) return;
    try { await api.del(`/admin/articles/${id}`); await load(); } catch (e) { setError(e?.message || "Ошибка"); }
  }

  return (
    <div>
      <SectionError error={error} />
      {editing ? (
        <div style={{ ...cardStyle, marginBottom: "14px" }}>
          <input className="form-field__input" style={inputStyle} placeholder="Заголовок" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          <input className="form-field__input" style={inputStyle} placeholder="Краткое описание" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          <input className="form-field__input" style={inputStyle} placeholder="Время чтения (напр. 5 мин)" value={editing.readTime} onChange={(e) => setEditing({ ...editing, readTime: e.target.value })} />
          <textarea className="form-field__input" style={{ ...inputStyle, minHeight: "140px" }} placeholder="Текст статьи" value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={save} className="btn-save" style={{ flex: 1 }}>Сохранить</button>
            <button onClick={() => setEditing(null)} style={{ flex: 1, borderRadius: "12px", border: "1.5px solid #a6a6a1", background: "#fff", fontWeight: 700, cursor: "pointer" }}>Отмена</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setEditing({ ...blankArticle })} className="btn-save" style={{ marginBottom: "14px" }}>+ Добавить статью</button>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {items.map((a) => (
          <div key={a.id} style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-text)" }}>{a.title}</div>
              <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.description}</div>
            </div>
            <button onClick={() => setEditing(a)} style={{ border: "none", background: "none", cursor: "pointer", color: "#1BAB7C", fontWeight: 700, fontSize: "13px" }}>Изм.</button>
            <button onClick={() => remove(a.id)} style={{ border: "none", background: "none", cursor: "pointer", color: "#d93025", fontSize: "18px" }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------- Подкасты -------------------------
const blankPodcast = { title: "", description: "", durationMin: 0 };
function PodcastsTab() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);

  async function load() { try { setItems(await api.get("/podcasts")); } catch (e) { setError(e?.message || "Ошибка"); } }
  useEffect(() => { load(); }, []);

  async function save() {
    setError("");
    const body = { title: editing.title, description: editing.description || "", durationMin: Number(editing.durationMin) || 0 };
    try {
      if (editing.id) await api.patch(`/admin/podcasts/${editing.id}`, body);
      else await api.post("/admin/podcasts", body);
      setEditing(null); await load();
    } catch (e) { setError(e?.message || "Не удалось сохранить"); }
  }
  async function remove(id) {
    if (!window.confirm("Удалить подкаст?")) return;
    try { await api.del(`/admin/podcasts/${id}`); await load(); } catch (e) { setError(e?.message || "Ошибка"); }
  }

  return (
    <div>
      <SectionError error={error} />
      {editing ? (
        <div style={{ ...cardStyle, marginBottom: "14px" }}>
          <input className="form-field__input" style={inputStyle} placeholder="Название" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          <input className="form-field__input" style={inputStyle} placeholder="Описание" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          <input className="form-field__input" style={inputStyle} type="number" placeholder="Длительность, мин" value={editing.durationMin} onChange={(e) => setEditing({ ...editing, durationMin: e.target.value })} />
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={save} className="btn-save" style={{ flex: 1 }}>Сохранить</button>
            <button onClick={() => setEditing(null)} style={{ flex: 1, borderRadius: "12px", border: "1.5px solid #a6a6a1", background: "#fff", fontWeight: 700, cursor: "pointer" }}>Отмена</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setEditing({ ...blankPodcast })} className="btn-save" style={{ marginBottom: "14px" }}>+ Добавить подкаст</button>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {items.map((p) => (
          <div key={p.id} style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-text)" }}>{p.title}</div>
              <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{p.durationMin} мин</div>
            </div>
            <button onClick={() => setEditing(p)} style={{ border: "none", background: "none", cursor: "pointer", color: "#1BAB7C", fontWeight: 700, fontSize: "13px" }}>Изм.</button>
            <button onClick={() => remove(p.id)} style={{ border: "none", background: "none", cursor: "pointer", color: "#d93025", fontSize: "18px" }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------- Заказы -------------------------
const ORDER_STATUS = { NEW: "Новый", CONFIRMED: "Подтверждён", SHIPPED: "Отправлен", CANCELLED: "Отменён" };
function OrdersTab() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try { setItems(await api.get("/admin/orders")); } catch (e) { setError(e?.message || "Ошибка"); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id, status) {
    setError("");
    try { await api.patch(`/admin/orders/${id}`, { status }); await load(); } catch (e) { setError(e?.message || "Ошибка"); }
  }

  if (loading) return <p style={{ color: "var(--color-text-secondary)", fontSize: "13px" }}>Загрузка…</p>;
  return (
    <div>
      <SectionError error={error} />
      {items.length === 0 ? (
        <p style={{ color: "var(--color-text-secondary)", fontSize: "13px", fontWeight: 300 }}>Заказов пока нет.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {items.map((o) => (
            <div key={o.id} style={{ ...cardStyle }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-text)" }}>{o.recipientName} · {o.total} ₽</div>
                <select
                  value={o.status}
                  onChange={(e) => setStatus(o.id, e.target.value)}
                  className="form-field__input"
                  style={{ borderRadius: "10px", width: "auto", padding: "6px 8px", cursor: "pointer", backgroundColor: "#fff", fontSize: "12px" }}
                >
                  {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                {o.phone} · {o.address}
              </div>
              <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                {(o.items || []).map((i) => `${i.name} ×${i.quantity}`).join(", ")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------- Главный экран -------------------------
export default function AdminScreen({ onNavigate }) {
  const [tab, setTab] = useState("users");

  return (
    <section className="screen" id="screen-admin">
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
          <h1 className="screen__title" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "24px", color: "var(--color-text)", letterSpacing: "-.5px", margin: 0 }}>Панель администратора</h1>
          <p className="screen__subtitle" style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "2px", fontWeight: 300 }}>Управление приложением</p>
        </div>
      </header>

      {/* Вкладки */}
      <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "10px", marginBottom: "6px" }} className="no-scrollbar">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                whiteSpace: "nowrap",
                padding: "8px 14px",
                borderRadius: "999px",
                border: active ? "1px solid #1BAB7C" : "1px solid var(--color-border)",
                background: active ? "#1BAB7C" : "#fff",
                color: active ? "#fff" : "var(--color-text)",
                fontSize: "13px",
                fontWeight: 700,
                fontFamily: "'Manrope', sans-serif",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "users" && <UsersTab />}
      {tab === "products" && <ProductsTab />}
      {tab === "articles" && <ArticlesTab />}
      {tab === "podcasts" && <PodcastsTab />}
      {tab === "orders" && <OrdersTab />}
    </section>
  );
}
