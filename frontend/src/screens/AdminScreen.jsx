import React, { useEffect, useState } from "react";
import { api } from "../api/client";

// Вспомогательные стили в стиле Apple-минимализма нашего приложения
const labelStyle = {
  display: "block",
  fontSize: "12.5px",
  fontFamily: "'Manrope', sans-serif",
  fontWeight: "700",
  color: "var(--color-text)",
  marginBottom: "5px",
  paddingLeft: "2px",
};

const cardStyle = {
  padding: "16px",
  borderRadius: "20px",
  background: "#fff",
  boxShadow: "0 12px 40px rgba(0, 127, 99, 0.04), 0 10px 30px rgba(0, 0, 0, 0.03)",
  border: "1px solid var(--color-border)",
  position: "relative",
  overflow: "hidden",
};

const inputStyle = {
  borderRadius: "14px",
  marginBottom: "12px",
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--color-border)",
  fontSize: "13px",
  fontFamily: "'Manrope', sans-serif",
  outline: "none",
  backgroundColor: "#fff",
};

const selectStyle = {
  borderRadius: "14px",
  marginBottom: "12px",
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--color-border)",
  fontSize: "13px",
  fontFamily: "'Manrope', sans-serif",
  outline: "none",
  backgroundColor: "#fff",
  cursor: "pointer",
};

const textareaStyle = {
  borderRadius: "14px",
  marginBottom: "12px",
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--color-border)",
  fontSize: "13px",
  fontFamily: "'Manrope', sans-serif",
  outline: "none",
  minHeight: "75px",
  resize: "vertical",
  backgroundColor: "#fff",
};

const buttonSecondaryStyle = {
  padding: "10px 16px",
  borderRadius: "14px",
  border: "1.5px solid #a6a6a1",
  background: "#fff",
  fontWeight: "700",
  fontSize: "13px",
  cursor: "pointer",
  fontFamily: "'Manrope', sans-serif",
  transition: "all 0.15s ease",
};

const tipStyle = {
  fontSize: "11px",
  color: "var(--color-text-secondary)",
  marginTop: "4px",
  fontWeight: 300,
  lineHeight: "1.3",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function SectionError({ error }) {
  if (!error) return null;
  return (
    <div
      style={{
        color: "#d93025",
        fontSize: "13px",
        backgroundColor: "#fce8e6",
        padding: "10px 12px",
        borderRadius: "12px",
        border: "1px solid #fad2cf",
        marginBottom: "12px",
      }}
    >
      {error}
    </div>
  );
}

// ------------------------- Раздел: ПОЛЬЗОВАТЕЛИ -------------------------
function UsersTab({ showToast }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Фильтры и поиск
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("newest");

  async function load() {
    try {
      setUsers(await api.get("/admin/users"));
    } catch (e) {
      setError(e?.message || "Ошибка загрузки пользователей");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function changeRole(id, role) {
    setError("");
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      showToast("Роль пользователя успешно изменена");
      await load();
    } catch (e) {
      setError(e?.message || "Не удалось изменить роль");
    }
  }

  const filtered = users
    .filter((u) => {
      const term = search.toLowerCase();
      return (
        (u.name || "").toLowerCase().includes(term) ||
        (u.email || "").toLowerCase().includes(term) ||
        (u.phone || "").toLowerCase().includes(term)
      );
    })
    .filter((u) => {
      if (roleFilter === "ALL") return true;
      return u.role === roleFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  if (loading) return <p style={{ color: "var(--color-text-secondary)", fontSize: "13px" }}>Загрузка…</p>;

  return (
    <div>
      <SectionError error={error} />

      {/* Панель фильтров */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
        <input
          type="text"
          placeholder="Поиск по имени, email, телефону..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, marginBottom: 0 }}
        />
        <div style={{ display: "flex", gap: "8px" }}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ ...selectStyle, flex: 1, marginBottom: 0 }}
          >
            <option value="ALL">Все роли</option>
            <option value="PATIENT">Пациенты</option>
            <option value="SPECIALIST">Врачи</option>
            <option value="ADMIN">Админы</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{ ...selectStyle, flex: 1, marginBottom: 0 }}
          >
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.map((u) => (
          <div key={u.id} style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-text)" }}>
                {u.name || "Без имени"}
              </div>
              <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                {u.email} {u.phone ? `· ${u.phone}` : ""}
              </div>
              <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                Добавлен: {formatDate(u.createdAt)}
              </div>
            </div>
            <select
              value={u.role}
              onChange={(e) => changeRole(u.id, e.target.value)}
              className="form-field__input"
              style={{ borderRadius: "10px", width: "auto", padding: "6px 8px", cursor: "pointer", backgroundColor: "#fff", border: "1px solid var(--color-border)", fontSize: "13px" }}
            >
              <option value="PATIENT">Пациент</option>
              <option value="SPECIALIST">Врач</option>
              <option value="ADMIN">Админ</option>
            </select>
          </div>
        ))}
        {filtered.length === 0 && (
          <p style={{ color: "var(--color-text-secondary)", fontSize: "13px", fontStyle: "italic", textAlign: "center", padding: "10px" }}>Ничего не найдено</p>
        )}
      </div>
    </div>
  );
}

// ------------------------- Раздел: ТОВАРЫ -------------------------
const blankProduct = { name: "", price: "", category: "Инструменты", descriptionText: "", stock: "", unlimited: true, isPublished: true, imageKey: null };

function ProductsTab({ showToast, setDeleteConfirm }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // объект или null

  // Состояния для управления категориями
  const [customCategories, setCustomCategories] = useState([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [renamingCategory, setRenamingCategory] = useState(null); // название переименовываемой категории
  const [renamedValue, setRenamedValue] = useState("");

  // Фильтры
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  async function load() {
    try {
      const list = await api.get("/products");
      // Парсим JSON описание
      const parsedList = (Array.isArray(list) ? list : []).map((p) => {
        let descriptionText = p.description || "";
        let stock = "";
        let unlimited = true;
        let isPublished = true;
        try {
          if (p.description && p.description.trim().startsWith("{")) {
            const parsed = JSON.parse(p.description);
            descriptionText = parsed.text ?? parsed.description ?? "";
            stock = parsed.stock ?? "";
            unlimited = parsed.unlimited !== false;
            isPublished = parsed.isPublished !== false;
          }
        } catch (e) {}
        return {
          ...p,
          descriptionText,
          stock,
          unlimited,
          isPublished,
        };
      });
      setItems(parsedList);
    } catch (e) {
      setError(e?.message || "Ошибка загрузки товаров");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function renameCategory(oldName, newName) {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) {
      setRenamingCategory(null);
      return;
    }

    try {
      // Ищем все товары с этой категорией и обновляем на бэкенде
      const itemsToUpdate = items.filter(item => item.category === oldName);
      for (const item of itemsToUpdate) {
        const descriptionJson = JSON.stringify({
          text: item.descriptionText,
          stock: item.unlimited ? null : Number(item.stock) || 0,
          unlimited: !!item.unlimited,
          isPublished: !!item.isPublished,
        });
        const body = {
          name: item.name,
          price: item.price,
          description: descriptionJson,
          category: trimmed,
          imageKey: item.imageKey,
          inStock: item.inStock
        };
        await api.patch(`/admin/products/${item.id}`, body);
      }

      // Обновляем список кастомных категорий
      const updatedCustom = customCategories.map(c => c === oldName ? trimmed : c);
      setCustomCategories(updatedCustom);

      // Если сейчас редактируется товар с этой категорией - обновляем
      if (editing && editing.category === oldName) {
        setEditing({ ...editing, category: trimmed });
      }

      showToast(`Категория переименована в "${trimmed}"`);
      setRenamingCategory(null);
      await load();
    } catch (e) {
      setError("Не удалось переименовать категорию: " + (e?.message || "Ошибка"));
    }
  }

  async function deleteCategory(catName) {
    if (catName === "Общее" || catName === "Инструменты" || catName === "Добавки") {
      alert("Нельзя удалить стандартную категорию");
      return;
    }
    if (!window.confirm(`Вы уверены, что хотите удалить категорию "${catName}"? Все товары из неё будут перемещены в категорию "Общее".`)) {
      return;
    }

    try {
      // Ищем все товары с этой категорией и обновляем на бэкенде в "Общее"
      const itemsToUpdate = items.filter(item => item.category === catName);
      for (const item of itemsToUpdate) {
        const descriptionJson = JSON.stringify({
          text: item.descriptionText,
          stock: item.unlimited ? null : Number(item.stock) || 0,
          unlimited: !!item.unlimited,
          isPublished: !!item.isPublished,
        });
        const body = {
          name: item.name,
          price: item.price,
          description: descriptionJson,
          category: "Общее",
          imageKey: item.imageKey,
          inStock: item.inStock
        };
        await api.patch(`/admin/products/${item.id}`, body);
      }

      // Удаляем из списка кастомных категорий
      const updatedCustom = customCategories.filter(c => c !== catName);
      setCustomCategories(updatedCustom);

      // Если сейчас редактируется товар с этой категорией - переносим в "Общее"
      if (editing && editing.category === catName) {
        setEditing({ ...editing, category: "Общее" });
      }

      showToast(`Категория "${catName}" удалена`);
      await load();
    } catch (e) {
      setError("Не удалось удалить категорию: " + (e?.message || "Ошибка"));
    }
  }

  async function saveWithPublish(isPublishedVal) {
    setError("");
    const hasName = !!(editing.name || "").trim();
    const hasPrice = editing.price !== "" && Number(editing.price) >= 0;
    const hasDesc = !!(editing.descriptionText || "").trim();
    const hasImage = !!editing.imageKey;

    if (!isPublishedVal) {
      // Для сохранения в черновики должно быть заполнено хотя бы одно поле
      if (!hasName && !hasPrice && !hasDesc && !hasImage) {
        setError("Заполните хотя бы одно поле (Название, Цена, Описание или Фото), чтобы сохранить черновик");
        return;
      }
    } else {
      // Для публикации название и цена обязательны
      if (!hasName) {
        setError("Пожалуйста, заполните Название товара для публикации");
        return;
      }
      if (editing.price === "" || Number(editing.price) < 0) {
        setError("Укажите корректную Цену товара для публикации");
        return;
      }
    }

    // Сохраняем расширенные метаданные в поле description в виде JSON
    const descriptionJson = JSON.stringify({
      text: editing.descriptionText || "",
      stock: editing.unlimited ? null : Number(editing.stock) || 0,
      unlimited: !!editing.unlimited,
      isPublished: !!isPublishedVal,
    });

    const body = {
      name: (editing.name || "").trim() || "Без названия",
      price: Number(editing.price) || 0,
      description: descriptionJson,
      category: editing.category || "Инструменты",
      imageKey: editing.imageKey || null,
      inStock: editing.unlimited ? true : (Number(editing.stock) > 0),
    };

    try {
      if (editing.id) {
        await api.patch(`/admin/products/${editing.id}`, body);
        showToast(isPublishedVal ? "Товар опубликован" : "Товар сохранен в черновики");
      } else {
        await api.post("/admin/products", body);
        showToast(isPublishedVal ? "Новый товар опубликован" : "Товар добавлен в черновики");
      }
      setEditing(null);
      await load();
    } catch (e) {
      setError(e?.message || "Не удалось сохранить товар");
    }
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditing({ ...editing, imageKey: reader.result });
    };
    reader.readAsDataURL(file);
  }

  function doRemove(id) {
    api.del(`/admin/products/${id}`)
      .then(() => {
        showToast("Товар удален");
        load();
      })
      .catch((e) => setError(e?.message || "Ошибка при удалении"));
  }

  const filtered = items
    .filter((p) => {
      const term = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(term) ||
        (p.descriptionText || "").toLowerCase().includes(term)
      );
    })
    .filter((p) => {
      if (statusFilter === "published") return p.isPublished;
      if (statusFilter === "draft") return !p.isPublished;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  const dynamicCategoryList = Array.from(
    new Set(["Инструменты", "Добавки", "Общее", ...items.map((i) => i.category).filter(Boolean), ...customCategories])
  );

  return (
    <div>
      <SectionError error={error} />

      {editing ? (
        <div style={{ ...cardStyle, marginBottom: "14px" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", fontFamily: "'Manrope', sans-serif" }}>
            {editing.id ? "Редактирование товара" : "Добавление товара"}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <label style={labelStyle}>Название товара</label>
            <input
              className="form-field__input"
              style={inputStyle}
              placeholder="Введите название..."
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <label style={labelStyle}>Цена (₽)</label>
            <input
              className="form-field__input"
              style={inputStyle}
              type="number"
              min="0"
              placeholder="Введите цену в рублях..."
              value={editing.price}
              onChange={(e) => setEditing({ ...editing, price: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={labelStyle}>Категория</label>
              <button
                type="button"
                onClick={() => setShowCategoryManager(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#1BAB7C",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontFamily: "'Manrope', sans-serif",
                  textDecoration: "underline",
                  padding: 0,
                  marginBottom: "4px"
                }}
              >
                📁 Управление категориями
              </button>
            </div>
            <select
              style={selectStyle}
              value={editing.category}
              onChange={(e) => setEditing({ ...editing, category: e.target.value })}
            >
              {dynamicCategoryList.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <label style={labelStyle}>Описание товара</label>
            <textarea
              className="form-field__input"
              style={textareaStyle}
              placeholder="Подробно расскажите о товаре..."
              value={editing.descriptionText}
              onChange={(e) => setEditing({ ...editing, descriptionText: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "12px" }}>
            <label style={labelStyle}>Количество на складе</label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                className="form-field__input"
                style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                type="number"
                min="0"
                disabled={editing.unlimited}
                placeholder="Количество на складе..."
                value={editing.unlimited ? "" : editing.stock}
                onChange={(e) => setEditing({ ...editing, stock: e.target.value })}
              />
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer", userSelect: "none" }}>
                <input
                  type="checkbox"
                  checked={editing.unlimited}
                  onChange={(e) => setEditing({ ...editing, unlimited: e.target.checked })}
                />
                Не ограничено
              </label>
            </div>
          </div>

          {/* Фото товара */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "14px" }}>
            <label style={labelStyle}>Изображение товара</label>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "14px",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  backgroundColor: "#F7F7F5",
                }}
              >
                {editing.imageKey ? (
                  <img src={editing.imageKey} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Превью" />
                ) : (
                  <span style={{ fontSize: "10px", color: "var(--color-text-secondary)", textAlign: "center" }}>Нет фото</span>
                )}
              </div>
              <button
                type="button"
                style={buttonSecondaryStyle}
                onClick={() => document.getElementById("product-photo-upload").click()}
              >
                {editing.imageKey ? "Заменить фото" : "Загрузить фото"}
              </button>
              <input
                id="product-photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
            </div>
            <p style={tipStyle}>Рекомендуемый размер: 800×800px (квадрат, 1:1, форматы PNG/JPG)</p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => saveWithPublish(true)} className="btn-save" style={{ flex: 1, margin: 0 }}>Сохранить</button>
            <button onClick={() => setEditing(null)} style={{ ...buttonSecondaryStyle, flex: 1 }}>Отмена</button>
          </div>

          <div style={{ textAlign: "center", marginTop: "12px" }}>
            <button
              type="button"
              onClick={() => saveWithPublish(false)}
              style={{
                background: "none",
                border: "none",
                color: "#007F63",
                textDecoration: "underline",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "'Manrope', sans-serif"
              }}
            >
              Сохранить в черновики
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setEditing({ ...blankProduct })} className="btn-save" style={{ marginBottom: "14px" }}>+ Добавить товар</button>
      )}

      {/* Модальное окно управления категориями */}
      {showCategoryManager && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            zIndex: 11000,
          }}
          onClick={() => setShowCategoryManager(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "24px",
              padding: "20px",
              width: "100%",
              maxWidth: "380px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              maxHeight: "80vh"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 14px 0", fontFamily: "'Manrope', sans-serif", fontSize: "16px", fontWeight: "800" }}>
              Управление категориями
            </h3>
            
            {/* Добавление новой */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "16px" }}>
              <label style={labelStyle}>Новая категория</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  className="form-field__input"
                  style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                  placeholder="Название категории..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-save"
                  style={{ margin: 0, padding: "0 16px", width: "auto" }}
                  onClick={() => {
                    const trimmed = newCategoryName.trim();
                    if (trimmed) {
                      if (!customCategories.includes(trimmed)) {
                        setCustomCategories([...customCategories, trimmed]);
                      }
                      if (editing) {
                        setEditing({ ...editing, category: trimmed });
                      }
                      setNewCategoryName("");
                      showToast(`Категория "${trimmed}" добавлена`);
                    }
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Список */}
            <label style={labelStyle}>Список категорий</label>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }} className="no-scrollbar">
              {dynamicCategoryList.map((cat) => {
                const isDefault = cat === "Инструменты" || cat === "Добавки" || cat === "Общее";
                const isRenaming = renamingCategory === cat;
                return (
                  <div key={cat} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: "12px", border: "1px solid var(--color-border)", backgroundColor: "#faf9f6" }}>
                    {isRenaming ? (
                      <div style={{ display: "flex", gap: "6px", width: "100%" }}>
                        <input
                          className="form-field__input"
                          style={{ ...inputStyle, marginBottom: 0, flex: 1, padding: "4px 8px", borderRadius: "8px", height: "30px" }}
                          value={renamedValue}
                          onChange={(e) => setRenamedValue(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => renameCategory(cat, renamedValue)}
                          style={{ border: "none", background: "none", cursor: "pointer", fontSize: "14px" }}
                        >
                          💾
                        </button>
                        <button
                          type="button"
                          onClick={() => setRenamingCategory(null)}
                          style={{ border: "none", background: "none", cursor: "pointer", fontSize: "14px" }}
                        >
                          ❌
                        </button>
                      </div>
                    ) : (
                      <>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text)" }}>
                          {cat} {isDefault && <span style={{ fontSize: "10px", color: "var(--color-text-secondary)", fontWeight: 300 }}>(станд.)</span>}
                        </span>
                        {!isDefault && (
                          <div style={{ display: "flex", gap: "12px" }}>
                            <button
                              type="button"
                              onClick={() => {
                                setRenamingCategory(cat);
                                setRenamedValue(cat);
                              }}
                              style={{ border: "none", background: "none", cursor: "pointer", fontSize: "13px", color: "#1BAB7C" }}
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteCategory(cat)}
                              style={{ border: "none", background: "none", cursor: "pointer", fontSize: "13px", color: "#d93025" }}
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              style={{ ...buttonSecondaryStyle, width: "100%" }}
              onClick={() => setShowCategoryManager(false)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Панель фильтров списка */}
      {!editing && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
            <input
              type="text"
              placeholder="Поиск по названию или описанию..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, marginBottom: 0 }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ ...selectStyle, flex: 1, marginBottom: 0 }}
              >
                <option value="all">Все статусы</option>
                <option value="published">Опубликованные</option>
                <option value="draft">Черновики</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={{ ...selectStyle, flex: 1, marginBottom: 0 }}
              >
                <option value="newest">Сначала новые</option>
                <option value="oldest">Сначала старые</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map((p) => (
              <div key={p.id} style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "10px", border: "1px solid var(--color-border)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#FAF9F6", flexShrink: 0 }}>
                  {p.imageKey ? (
                    <img src={p.imageKey} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                  ) : (
                    <span style={{ fontSize: "16px" }}>📦</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-text)", display: "flex", alignItems: "center", gap: "6px" }}>
                    {p.name}
                    {!p.isPublished && (
                      <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 5px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "4px", color: "var(--color-text-secondary)" }}>Черновик</span>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                    {p.price} ₽ · {p.category} · {p.unlimited ? "склад ∞" : `остаток: ${p.stock}`}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                    Добавлено: {formatDate(p.createdAt)}
                  </div>
                </div>
                <button onClick={() => setEditing(p)} style={{ border: "none", background: "none", cursor: "pointer", color: "#1BAB7C", fontWeight: 700, fontSize: "13px" }}>Изм.</button>
                <button onClick={() => setDeleteConfirm({ name: p.name, type: "product", action: () => doRemove(p.id) })} style={{ border: "none", background: "none", cursor: "pointer", color: "#d93025", fontSize: "18px", padding: "4px" }}>×</button>
              </div>
            ))}
            {filtered.length === 0 && (
              <p style={{ color: "var(--color-text-secondary)", fontSize: "13px", fontStyle: "italic", textAlign: "center", padding: "10px" }}>Товары не найдены</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ------------------------- Раздел: СТАТЬИ -------------------------
const blankArticle = { title: "", descriptionText: "", body: "", readTime: "5 мин", isPublished: true, image: null };

function ArticlesTab({ showToast, setDeleteConfirm }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);

  // Фильтры
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  async function load() {
    try {
      const list = await api.get("/articles");
      const parsedList = (Array.isArray(list) ? list : []).map((a) => {
        let descriptionText = a.description || "";
        let image = null;
        let isPublished = true;
        try {
          if (a.description && a.description.trim().startsWith("{")) {
            const parsed = JSON.parse(a.description);
            descriptionText = parsed.description || parsed.text || "";
            image = parsed.image || null;
            isPublished = parsed.isPublished !== false;
          }
        } catch (e) {}
        return {
          ...a,
          descriptionText,
          image,
          isPublished,
        };
      });
      setItems(parsedList);
    } catch (e) {
      setError(e?.message || "Ошибка загрузки статей");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveWithPublish(isPublishedVal) {
    setError("");
    const hasTitle = !!(editing.title || "").trim();
    const hasDesc = !!(editing.descriptionText || "").trim();
    const hasBody = !!(editing.body || "").trim();
    const hasImage = !!editing.image;

    if (!isPublishedVal) {
      // Для черновика хотя бы одно поле должно быть заполнено
      if (!hasTitle && !hasDesc && !hasBody && !hasImage) {
        setError("Заполните хотя бы одно поле (Заголовок, Описание, Текст или Обложка), чтобы сохранить черновик");
        return;
      }
    } else {
      // Для публикации заголовок обязателен
      if (!hasTitle) {
        setError("Пожалуйста, заполните Заголовок статьи для публикации");
        return;
      }
    }

    const descriptionJson = JSON.stringify({
      description: editing.descriptionText || "",
      image: editing.image,
      isPublished: !!isPublishedVal,
    });

    const body = {
      title: (editing.title || "").trim() || "Без названия",
      description: descriptionJson,
      body: editing.body || "",
      readTime: editing.readTime || "5 мин",
    };

    try {
      if (editing.id) {
        await api.patch(`/admin/articles/${editing.id}`, body);
        showToast(isPublishedVal ? "Статья опубликована" : "Статья сохранена в черновики");
      } else {
        await api.post("/admin/articles", body);
        showToast(isPublishedVal ? "Новая статья опубликована" : "Статья добавлена в черновики");
      }
      setEditing(null);
      await load();
    } catch (e) {
      setError(e?.message || "Не удалось сохранить статью");
    }
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditing({ ...editing, image: reader.result });
    };
    reader.readAsDataURL(file);
  }

  function doRemove(id) {
    api.del(`/admin/articles/${id}`)
      .then(() => {
        showToast("Статья удалена");
        load();
      })
      .catch((e) => setError(e?.message || "Ошибка при удалении"));
  }

  const filtered = items
    .filter((a) => {
      const term = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(term) ||
        (a.descriptionText || "").toLowerCase().includes(term)
      );
    })
    .filter((a) => {
      if (statusFilter === "published") return a.isPublished;
      if (statusFilter === "draft") return !a.isPublished;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt || 0).getTime();
      const dateB = new Date(b.publishedAt || 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div>
      <SectionError error={error} />

      {editing ? (
        <div style={{ ...cardStyle, marginBottom: "14px" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", fontFamily: "'Manrope', sans-serif" }}>
            {editing.id ? "Редактирование статьи" : "Добавление статьи"}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <label style={labelStyle}>Заголовок статьи</label>
            <input
              className="form-field__input"
              style={inputStyle}
              placeholder="Введите заголовок..."
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <label style={labelStyle}>Краткое описание (для карточки-превью)</label>
            <textarea
              className="form-field__input"
              style={textareaStyle}
              placeholder="Кратко расскажите, о чём эта статья..."
              value={editing.descriptionText}
              onChange={(e) => setEditing({ ...editing, descriptionText: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <label style={labelStyle}>Время чтения (например: 5 мин)</label>
            <input
              className="form-field__input"
              style={inputStyle}
              placeholder="5 мин"
              value={editing.readTime}
              onChange={(e) => setEditing({ ...editing, readTime: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <label style={labelStyle}>Полный текст статьи</label>
            <textarea
              className="form-field__input"
              style={{ ...textareaStyle, minHeight: "150px" }}
              placeholder="Введите текст статьи..."
              value={editing.body}
              onChange={(e) => setEditing({ ...editing, body: e.target.value })}
            />
          </div>

          {/* Загрузка обложки */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "14px" }}>
            <label style={labelStyle}>Обложка статьи</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div
                style={{
                  width: "100%",
                  height: "120px",
                  borderRadius: "14px",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  backgroundColor: "#F7F7F5",
                }}
              >
                {editing.image ? (
                  <img src={editing.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Обложка" />
                ) : (
                  <span style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>Нет изображения</span>
                )}
              </div>
              <button
                type="button"
                style={{ ...buttonSecondaryStyle, alignSelf: "flex-start" }}
                onClick={() => document.getElementById("article-image-upload").click()}
              >
                {editing.image ? "Заменить обложку" : "Загрузить обложку"}
              </button>
              <input
                id="article-image-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
            </div>
            <p style={tipStyle}>Рекомендуемый размер: 1200×630px (горизонтальный формат 16:9)</p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => saveWithPublish(true)} className="btn-save" style={{ flex: 1, margin: 0 }}>Сохранить</button>
            <button onClick={() => setEditing(null)} style={{ ...buttonSecondaryStyle, flex: 1 }}>Отмена</button>
          </div>

          <div style={{ textAlign: "center", marginTop: "12px" }}>
            <button
              type="button"
              onClick={() => saveWithPublish(false)}
              style={{
                background: "none",
                border: "none",
                color: "#007F63",
                textDecoration: "underline",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "'Manrope', sans-serif"
              }}
            >
              Сохранить в черновики
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setEditing({ ...blankArticle })} className="btn-save" style={{ marginBottom: "14px" }}>+ Добавить статью</button>
      )}

      {/* Панель фильтров списка */}
      {!editing && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
            <input
              type="text"
              placeholder="Поиск по названию или тексту..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, marginBottom: 0 }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ ...selectStyle, flex: 1, marginBottom: 0 }}
              >
                <option value="all">Все статусы</option>
                <option value="published">Опубликованные</option>
                <option value="draft">Черновики</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={{ ...selectStyle, flex: 1, marginBottom: 0 }}
              >
                <option value="newest">Сначала новые</option>
                <option value="oldest">Сначала старые</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map((a) => (
              <div key={a.id} style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "10px", border: "1px solid var(--color-border)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#FAF9F6", flexShrink: 0 }}>
                  {a.image ? (
                    <img src={a.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                  ) : (
                    <span style={{ fontSize: "16px" }}>📄</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-text)", display: "flex", alignItems: "center", gap: "6px" }}>
                    {a.title}
                    {!a.isPublished && (
                      <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 5px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "4px", color: "var(--color-text-secondary)" }}>Черновик</span>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                    {a.readTime}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                    Добавлено: {formatDate(a.publishedAt)}
                  </div>
                </div>
                <button onClick={() => setEditing(a)} style={{ border: "none", background: "none", cursor: "pointer", color: "#1BAB7C", fontWeight: 700, fontSize: "13px" }}>Изм.</button>
                <button onClick={() => setDeleteConfirm({ name: a.title, type: "article", action: () => doRemove(a.id) })} style={{ border: "none", background: "none", cursor: "pointer", color: "#d93025", fontSize: "18px", padding: "4px" }}>×</button>
              </div>
            ))}
            {filtered.length === 0 && (
              <p style={{ color: "var(--color-text-secondary)", fontSize: "13px", fontStyle: "italic", textAlign: "center", padding: "10px" }}>Статьи не найдены</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ------------------------- Раздел: ПОДКАСТЫ И ВИДЕО -------------------------
const blankPodcast = { title: "", descriptionText: "", durationMin: "", isVideo: false, isPublished: true, mediaUrl: "" };

function PodcastsTab({ showToast, setDeleteConfirm }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);

  // Фильтры
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  async function load() {
    try {
      const list = await api.get("/podcasts");
      const parsedList = (Array.isArray(list) ? list : []).map((p) => {
        let descriptionText = p.description || "";
        let isVideo = false;
        let isPublished = true;
        let mediaUrl = p.audioKey || "";
        try {
          if (p.description && p.description.trim().startsWith("{")) {
            const parsed = JSON.parse(p.description);
            descriptionText = parsed.description || parsed.text || "";
            isVideo = !!parsed.isVideo;
            isPublished = parsed.isPublished !== false;
            mediaUrl = parsed.mediaUrl || p.audioKey || "";
          }
        } catch (e) {}
        return {
          ...p,
          descriptionText,
          isVideo,
          isPublished,
          mediaUrl,
        };
      });
      setItems(parsedList);
    } catch (e) {
      setError(e?.message || "Ошибка загрузки контента");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveWithPublish(isPublishedVal) {
    setError("");
    const hasTitle = !!(editing.title || "").trim();
    const hasDesc = !!(editing.descriptionText || "").trim();
    const hasDuration = editing.durationMin !== "" && Number(editing.durationMin) > 0;
    const hasMedia = !!(editing.mediaUrl || "").trim();

    if (!isPublishedVal) {
      // Для черновика хотя бы одно поле должно быть заполнено
      if (!hasTitle && !hasDesc && !hasDuration && !hasMedia) {
        setError("Заполните хотя бы одно поле (Название, Описание, Длительность или Медиафайл), чтобы сохранить черновик");
        return;
      }
    } else {
      // Для публикации название и длительность обязательны
      if (!hasTitle) {
        setError("Пожалуйста, заполните Название записи для публикации");
        return;
      }
      if (editing.durationMin === "" || Number(editing.durationMin) <= 0) {
        setError("Укажите корректную Длительность контента для публикации");
        return;
      }
    }

    const descriptionJson = JSON.stringify({
      description: editing.descriptionText || "",
      isVideo: !!editing.isVideo,
      isPublished: !!isPublishedVal,
      mediaUrl: editing.mediaUrl || "",
    });

    const body = {
      title: (editing.title || "").trim() || "Без названия",
      description: descriptionJson,
      durationMin: Number(editing.durationMin) || 0,
      audioKey: editing.mediaUrl || null,
    };

    try {
      if (editing.id) {
        await api.patch(`/admin/podcasts/${editing.id}`, body);
        showToast(isPublishedVal ? "Медиазапись опубликована" : "Медиазапись сохранена в черновики");
      } else {
        await api.post("/admin/podcasts", body);
        showToast(isPublishedVal ? "Новая медиазапись опубликована" : "Медиазапись добавлена в черновики");
      }
      setEditing(null);
      await load();
    } catch (e) {
      setError(e?.message || "Не удалось сохранить медиазапись");
    }
  }

  function doRemove(id) {
    api.del(`/admin/podcasts/${id}`)
      .then(() => {
        showToast("Медиазапись удалена");
        load();
      })
      .catch((e) => setError(e?.message || "Ошибка при удалении"));
  }

  const filtered = items
    .filter((p) => {
      const term = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(term) ||
        (p.descriptionText || "").toLowerCase().includes(term)
      );
    })
    .filter((p) => {
      if (statusFilter === "published") return p.isPublished;
      if (statusFilter === "draft") return !p.isPublished;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt || 0).getTime();
      const dateB = new Date(b.publishedAt || 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div>
      <SectionError error={error} />

      {editing ? (
        <div style={{ ...cardStyle, marginBottom: "14px" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", fontFamily: "'Manrope', sans-serif" }}>
            {editing.id ? "Редактирование записи" : "Добавление записи"}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <label style={labelStyle}>Название записи</label>
            <input
              className="form-field__input"
              style={inputStyle}
              placeholder="Введите название..."
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <label style={labelStyle}>Описание</label>
            <textarea
              className="form-field__input"
              style={textareaStyle}
              placeholder="Краткое описание медиафайла..."
              value={editing.descriptionText}
              onChange={(e) => setEditing({ ...editing, descriptionText: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <label style={labelStyle}>Длительность (мин)</label>
            <input
              className="form-field__input"
              style={inputStyle}
              type="number"
              min="1"
              placeholder="Например: 24"
              value={editing.durationMin}
              onChange={(e) => setEditing({ ...editing, durationMin: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <label style={labelStyle}>Ссылка на медиафайл (аудио/видео)</label>
            <input
              className="form-field__input"
              style={inputStyle}
              placeholder="Вставьте URL на MP3/MP4, YouTube, Vimeo или Rutube..."
              value={editing.mediaUrl}
              onChange={(e) => setEditing({ ...editing, mediaUrl: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "12px" }}>
            <label style={labelStyle}>Тип контента</label>
            <select
              style={selectStyle}
              value={editing.isVideo ? "video" : "audio"}
              onChange={(e) => setEditing({ ...editing, isVideo: e.target.value === "video" })}
            >
              <option value="audio">🎧 Аудиоподкаст</option>
              <option value="video">🎥 Видеоролик</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => saveWithPublish(true)} className="btn-save" style={{ flex: 1, margin: 0 }}>Сохранить</button>
            <button onClick={() => setEditing(null)} style={{ ...buttonSecondaryStyle, flex: 1 }}>Отмена</button>
          </div>

          <div style={{ textAlign: "center", marginTop: "12px" }}>
            <button
              type="button"
              onClick={() => saveWithPublish(false)}
              style={{
                background: "none",
                border: "none",
                color: "#007F63",
                textDecoration: "underline",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "'Manrope', sans-serif"
              }}
            >
              Сохранить в черновики
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setEditing({ ...blankPodcast })} className="btn-save" style={{ marginBottom: "14px" }}>+ Добавить запись</button>
      )}

      {/* Панель фильтров списка */}
      {!editing && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
            <input
              type="text"
              placeholder="Поиск по названию или описанию..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, marginBottom: 0 }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ ...selectStyle, flex: 1, marginBottom: 0 }}
              >
                <option value="all">Все статусы</option>
                <option value="published">Опубликованные</option>
                <option value="draft">Черновики</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={{ ...selectStyle, flex: 1, marginBottom: 0 }}
              >
                <option value="newest">Сначала новые</option>
                <option value="oldest">Сначала старые</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map((p) => (
              <div key={p.id} style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "20px", flexShrink: 0 }}>
                  {p.isVideo ? "🎥" : "🎧"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-text)", display: "flex", alignItems: "center", gap: "6px" }}>
                    {p.title}
                    {!p.isPublished && (
                      <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 5px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "4px", color: "var(--color-text-secondary)" }}>Черновик</span>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                    {p.durationMin} мин
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                    Добавлено: {formatDate(p.publishedAt)}
                  </div>
                </div>
                <button onClick={() => setEditing(p)} style={{ border: "none", background: "none", cursor: "pointer", color: "#1BAB7C", fontWeight: 700, fontSize: "13px" }}>Изм.</button>
                <button onClick={() => setDeleteConfirm({ name: p.title, type: "podcast", action: () => doRemove(p.id) })} style={{ border: "none", background: "none", cursor: "pointer", color: "#d93025", fontSize: "18px", padding: "4px" }}>×</button>
              </div>
            ))}
            {filtered.length === 0 && (
              <p style={{ color: "var(--color-text-secondary)", fontSize: "13px", fontStyle: "italic", textAlign: "center", padding: "10px" }}>Записи не найдены</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ------------------------- Раздел: ЗАКАЗЫ -------------------------
const ORDER_STATUS = { NEW: "Новый", CONFIRMED: "Подтверждён", SHIPPED: "Отправлен", CANCELLED: "Отменён" };

function OrdersTab({ showToast }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setItems(await api.get("/admin/orders"));
    } catch (e) {
      setError(e?.message || "Ошибка загрузки заказов");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id, status) {
    setError("");
    try {
      await api.patch(`/admin/orders/${id}`, { status });
      showToast("Статус заказа обновлен");
      await load();
    } catch (e) {
      setError(e?.message || "Ошибка обновления статуса заказа");
    }
  }

  if (loading) return <p style={{ color: "var(--color-text-secondary)", fontSize: "13px" }}>Загрузка…</p>;

  return (
    <div>
      <SectionError error={error} />
      {items.length === 0 ? (
        <p style={{ color: "var(--color-text-secondary)", fontSize: "13px", fontWeight: 300, textAlign: "center", padding: "20px" }}>Заказов пока нет.</p>
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
                  style={{ borderRadius: "10px", width: "auto", padding: "6px 8px", cursor: "pointer", backgroundColor: "#fff", border: "1px solid var(--color-border)", fontSize: "12px", marginBottom: 0 }}
                >
                  {Object.entries(ORDER_STATUS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                {o.phone} · {o.address}
              </div>
              <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                {(o.items || []).map((i) => `${i.name} ×${i.quantity}`).join(", ")}
              </div>
              <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "6px", borderTop: "1px dashed var(--color-border)", paddingTop: "6px" }}>
                Создан: {formatDate(o.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------- ГЛАВНЫЙ ЭКРАН -------------------------
const TABS = [
  { id: "users", label: "Пользователи" },
  { id: "products", label: "Товары" },
  { id: "articles", label: "Статьи" },
  { id: "podcasts", label: "Подкасты" },
  { id: "orders", label: "Заказы" },
];

export default function AdminScreen({ onNavigate }) {
  const [tab, setTab] = useState("users");

  // Глобальные всплывающие UX элементы
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { name, type, action }

  const showToast = (message) => {
    setToast({ visible: true, message });
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast({ visible: false, message: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  return (
    <section className="screen" id="screen-admin">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .admin-toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #e6f7ed;
          border: 1px solid #b7ebc6;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 9999;
          width: calc(100% - 32px);
          max-width: 360px;
          animation: fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .modal-overlay-admin {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
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

      {tab === "users" && <UsersTab showToast={showToast} />}
      {tab === "products" && <ProductsTab showToast={showToast} setDeleteConfirm={setDeleteConfirm} />}
      {tab === "articles" && <ArticlesTab showToast={showToast} setDeleteConfirm={setDeleteConfirm} />}
      {tab === "podcasts" && <PodcastsTab showToast={showToast} setDeleteConfirm={setDeleteConfirm} />}
      {tab === "orders" && <OrdersTab showToast={showToast} />}

      {/* Мягкое Apple-style Toast уведомление */}
      {toast.visible && (
        <div className="admin-toast">
          <span style={{ fontSize: "16px" }}>✅</span>
          <span style={{ fontSize: "13px", fontFamily: "'Manrope', sans-serif", fontWeight: "700", color: "#1e4620" }}>
            {toast.message}
          </span>
        </div>
      )}

      {/* Всплывающее окно подтверждения удаления (Confirm Modal) */}
      {deleteConfirm && (
        <div className="modal-overlay-admin" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-admin" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 10px 0", fontFamily: "'Manrope', sans-serif", fontSize: "16px", fontWeight: "800", color: "var(--color-text)" }}>
              Подтверждение удаления
            </h3>
            <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: "1.5", fontWeight: 300 }}>
              Вы уверены, что хотите удалить {deleteConfirm.type === "product" ? "товар" : deleteConfirm.type === "article" ? "статью" : "медиафайл"} <strong>«{deleteConfirm.name}»</strong>? Это действие необратимо.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn-save"
                style={{ flex: 1, margin: 0, backgroundColor: "#d93025", boxShadow: "0 4px 12px rgba(217,48,37,.3)" }}
                onClick={() => {
                  deleteConfirm.action();
                  setDeleteConfirm(null);
                }}
              >
                Удалить
              </button>
              <button
                style={{ ...buttonSecondaryStyle, flex: 1 }}
                onClick={() => setDeleteConfirm(null)}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
