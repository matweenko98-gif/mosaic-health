import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { ORIGINAL_EXERCISES_MAP } from "../data/originalExercises";
import { useLanguage } from "../context/LanguageContext";

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

function FormLanguageToggle({ current, onChange }) {
  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
      <button
        type="button"
        onClick={() => onChange("RU")}
        style={{
          flex: 1,
          padding: "8px 12px",
          borderRadius: "10px",
          border: current === "RU" ? "1.5px solid #1BAB7C" : "1px solid var(--color-border)",
          backgroundColor: current === "RU" ? "#1BAB7C" : "#fff",
          color: current === "RU" ? "#fff" : "var(--color-text)",
          fontWeight: 700,
          fontSize: "12px",
          fontFamily: "'Manrope', sans-serif",
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
      >
        🇷🇺 Русский (RU)
      </button>
      <button
        type="button"
        onClick={() => onChange("EN")}
        style={{
          flex: 1,
          padding: "8px 12px",
          borderRadius: "10px",
          border: current === "EN" ? "1.5px solid #1BAB7C" : "1px solid var(--color-border)",
          backgroundColor: current === "EN" ? "#1BAB7C" : "#fff",
          color: current === "EN" ? "#fff" : "var(--color-text)",
          fontWeight: 700,
          fontSize: "12px",
          fontFamily: "'Manrope', sans-serif",
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
      >
        🇬🇧 English (EN)
      </button>
    </div>
  );
}

function autoCaptureFrame(videoUrlOrDataURL, onCapture) {
  // If it's a YouTube URL, extract video ID and use its thumbnail
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const ytMatch = videoUrlOrDataURL.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    onCapture(thumbnailUrl);
    return;
  }

  // HTML5 Video frame capture
  const video = document.createElement("video");
  video.src = videoUrlOrDataURL;
  video.crossOrigin = "anonymous";
  video.muted = true;
  video.playsInline = true;
  video.currentTime = 1; // Seek to 1 second

  video.onseeked = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      onCapture(dataUrl);
    } catch (err) {
      console.warn("Canvas capture failed:", err);
    }
  };
}

function formatDuration(val) {
  if (!val) return "0 мин";
  const s = String(val).trim();
  if (s.endsWith("мин") || s.endsWith("минут") || s.endsWith("м")) return s;
  return `${s} мин`;
}

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return null;
}

function parseExercise(ex) {
  let instructions_ru = "";
  let instructions_en = "";
  let isPublished = true;
  let duration = ex.durationMin ? `${ex.durationMin} мин` : "0 мин";
  let level = "Базовый";
  let equipment = "";
  let exerciseTime = "";
  let totalTime = "";
  let coverUrl = "";
  let videoKey_ru = "";
  let videoKey_en = "";

  const original = ORIGINAL_EXERCISES_MAP[ex.id];
  let category = ex.category;
  if (original) {
    category = original.category;
    duration = original.duration || duration;
    level = original.level || level;
    equipment = original.equipment || equipment;
  }

  // Parse RU description
  try {
    if (ex.description_ru && ex.description_ru.trim().startsWith("{")) {
      const parsed = JSON.parse(ex.description_ru);
      instructions_ru = parsed.instructions ?? parsed.description ?? "";
      isPublished = parsed.isPublished !== false;
      duration = parsed.duration ?? duration;
      level = parsed.level ?? level;
      equipment = parsed.equipment ?? equipment;
      exerciseTime = parsed.duration ?? duration;
      coverUrl = parsed.coverUrl ?? "";
      videoKey_ru = parsed.videoKey ?? "";
      if (parsed.category) {
        category = parsed.category;
      }
    } else {
      instructions_ru = ex.description_ru || "";
    }
  } catch (e) {}

  // Parse EN description
  try {
    if (ex.description_en && ex.description_en.trim().startsWith("{")) {
      const parsed = JSON.parse(ex.description_en);
      instructions_en = parsed.instructions ?? parsed.description ?? "";
      if (!coverUrl && parsed.coverUrl) coverUrl = parsed.coverUrl;
      videoKey_en = parsed.videoKey ?? "";
    } else {
      instructions_en = ex.description_en || "";
    }
  } catch (e) {}

  // Fallback for legacy DB records without _ru suffix
  if (!instructions_ru && ex.description) {
    if (ex.description.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(ex.description);
        instructions_ru = parsed.instructions ?? parsed.description ?? "";
        if (parsed.isPublished !== undefined) isPublished = parsed.isPublished !== false;
        if (parsed.duration) duration = parsed.duration;
        if (parsed.level) level = parsed.level;
        if (parsed.equipment) equipment = parsed.equipment;
        if (parsed.coverUrl) coverUrl = parsed.coverUrl;
        if (parsed.videoKey) videoKey_ru = parsed.videoKey;
      } catch (e) {}
    } else {
      instructions_ru = ex.description;
    }
  }

  if (!videoKey_ru && ex.videoKey) {
    videoKey_ru = ex.videoKey;
  }

  const title_ru = ex.title_ru || ex.title || "";
  const title_en = ex.title_en || "";

  return {
    id: ex.id,
    title_ru,
    title_en,
    title: title_ru || title_en || "Без названия",
    category: category || "Гиревое дыхание",
    isIndividual: !!ex.isIndividual,
    instructions_ru,
    instructions_en,
    instructions: instructions_ru || instructions_en || "",
    duration: formatDuration(duration),
    level,
    equipment,
    exerciseTime: formatDuration(duration),
    totalTime: "",
    videoKey_ru: videoKey_ru || "",
    videoKey_en: videoKey_en || "",
    videoKey: videoKey_ru || videoKey_en || ex.videoKey || "",
    coverUrl,
    isPublished,
  };
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
const blankProduct = { name_ru: "", name_en: "", price: "", category: "Инструменты", descriptionText_ru: "", descriptionText_en: "", stock: "", unlimited: true, isPublished: true, imageKey: null };

function ProductsTab({ showToast, setDeleteConfirm }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [formLang, setFormLang] = useState("RU");

  // Состояния для управления категориями
  const [customCategories, setCustomCategories] = useState([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [renamingCategory, setRenamingCategory] = useState(null);
  const [renamedValue, setRenamedValue] = useState("");

  // Фильтры
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  async function load() {
    try {
      const list = await api.get("/products");
      const parsedList = (Array.isArray(list) ? list : []).map((p) => {
        let descriptionText_ru = "";
        let descriptionText_en = "";
        let stock = "";
        let unlimited = true;
        let isPublished = true;

        try {
          if (p.description_ru && p.description_ru.trim().startsWith("{")) {
            const parsed = JSON.parse(p.description_ru);
            descriptionText_ru = parsed.text ?? parsed.description ?? "";
            stock = parsed.stock ?? "";
            unlimited = parsed.unlimited !== false;
            isPublished = parsed.isPublished !== false;
          } else {
            descriptionText_ru = p.description_ru || "";
          }
        } catch (e) {}

        try {
          if (p.description_en && p.description_en.trim().startsWith("{")) {
            const parsed = JSON.parse(p.description_en);
            descriptionText_en = parsed.text ?? parsed.description ?? "";
          } else {
            descriptionText_en = p.description_en || "";
          }
        } catch (e) {}

        // Fallback for legacy DB records
        if (!descriptionText_ru && p.description) {
          if (p.description.trim().startsWith("{")) {
            try {
              const parsed = JSON.parse(p.description);
              descriptionText_ru = parsed.text ?? parsed.description ?? "";
              stock = parsed.stock ?? "";
              unlimited = parsed.unlimited !== false;
              isPublished = parsed.isPublished !== false;
            } catch (e) {}
          } else {
            descriptionText_ru = p.description;
          }
        }

        const name_ru = p.name_ru || p.name || "";
        const name_en = p.name_en || "";

        return {
          ...p,
          name_ru,
          name_en,
          name: name_ru || name_en || "Без названия",
          descriptionText_ru,
          descriptionText_en,
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
      const itemsToUpdate = items.filter(item => item.category === oldName);
      for (const item of itemsToUpdate) {
        const descriptionJson_ru = JSON.stringify({
          text: item.descriptionText_ru || "",
          stock: item.unlimited ? null : Number(item.stock) || 0,
          unlimited: !!item.unlimited,
          isPublished: !!item.isPublished,
        });
        const descriptionJson_en = JSON.stringify({
          text: item.descriptionText_en || "",
          stock: item.unlimited ? null : Number(item.stock) || 0,
          unlimited: !!item.unlimited,
          isPublished: !!item.isPublished,
        });
        const body = {
          name_ru: item.name_ru,
          name_en: item.name_en,
          price: item.price,
          description_ru: descriptionJson_ru,
          description_en: descriptionJson_en,
          category: trimmed,
          imageKey: item.imageKey,
          inStock: item.inStock
        };
        await api.patch(`/admin/products/${item.id}`, body);
      }

      const updatedCustom = customCategories.map(c => c === oldName ? trimmed : c);
      setCustomCategories(updatedCustom);

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
      const itemsToUpdate = items.filter(item => item.category === catName);
      for (const item of itemsToUpdate) {
        const descriptionJson_ru = JSON.stringify({
          text: item.descriptionText_ru || "",
          stock: item.unlimited ? null : Number(item.stock) || 0,
          unlimited: !!item.unlimited,
          isPublished: !!item.isPublished,
        });
        const descriptionJson_en = JSON.stringify({
          text: item.descriptionText_en || "",
          stock: item.unlimited ? null : Number(item.stock) || 0,
          unlimited: !!item.unlimited,
          isPublished: !!item.isPublished,
        });
        const body = {
          name_ru: item.name_ru,
          name_en: item.name_en,
          price: item.price,
          description_ru: descriptionJson_ru,
          description_en: descriptionJson_en,
          category: "Общее",
          imageKey: item.imageKey,
          inStock: item.inStock
        };
        await api.patch(`/admin/products/${item.id}`, body);
      }

      const updatedCustom = customCategories.filter(c => c !== catName);
      setCustomCategories(updatedCustom);

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
    const hasNameRu = !!(editing.name_ru || "").trim();
    const hasPrice = editing.price !== "" && Number(editing.price) >= 0;
    const hasDescRu = !!(editing.descriptionText_ru || "").trim();
    const hasImage = !!editing.imageKey;

    if (!isPublishedVal) {
      if (!hasNameRu && !hasPrice && !hasDescRu && !hasImage) {
        setError("Заполните хотя бы одно поле на русском языке (Название, Цена, Описание или Фото), чтобы сохранить черновик");
        return;
      }
    } else {
      if (!hasNameRu) {
        setError("Пожалуйста, заполните Название товара (RU) для публикации");
        return;
      }
      if (editing.price === "" || Number(editing.price) < 0) {
        setError("Укажите корректную Цену товара для публикации");
        return;
      }
    }

    const descriptionJson_ru = JSON.stringify({
      text: editing.descriptionText_ru || "",
      stock: editing.unlimited ? null : Number(editing.stock) || 0,
      unlimited: !!editing.unlimited,
      isPublished: !!isPublishedVal,
    });

    const descriptionJson_en = JSON.stringify({
      text: editing.descriptionText_en || "",
      stock: editing.unlimited ? null : Number(editing.stock) || 0,
      unlimited: !!editing.unlimited,
      isPublished: !!isPublishedVal,
    });

    const body = {
      name_ru: (editing.name_ru || "").trim() || "Без названия",
      name_en: (editing.name_en || "").trim() || "",
      price: Number(editing.price) || 0,
      description_ru: descriptionJson_ru,
      description_en: descriptionJson_en,
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

  // Дублирование (клонирование) товара
  async function doDuplicateProduct(item) {
    setError("");
    try {
      const descriptionJson_ru = JSON.stringify({
        text: item.descriptionText_ru || "",
        stock: item.unlimited ? null : Number(item.stock) || 0,
        unlimited: !!item.unlimited,
        isPublished: false, // Всегда черновик
      });

      const descriptionJson_en = JSON.stringify({
        text: item.descriptionText_en || "",
        stock: item.unlimited ? null : Number(item.stock) || 0,
        unlimited: !!item.unlimited,
        isPublished: false,
      });

      const body = {
        name_ru: `${item.name_ru || item.name} (Копия)`,
        name_en: item.name_en ? `${item.name_en} (Copy)` : "",
        price: Number(item.price) || 0,
        description_ru: descriptionJson_ru,
        description_en: descriptionJson_en,
        category: item.category || "Инструменты",
        imageKey: item.imageKey || null,
        inStock: item.unlimited ? true : (Number(item.stock) > 0),
      };

      await api.post("/admin/products", body);
      showToast(`Создана копия товара: "${item.name_ru || item.name} (Копия)"`);
      await load();
    } catch (e) {
      setError("Не удалось дублировать товар: " + (e?.message || "Ошибка"));
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
        (p.name_ru || "").toLowerCase().includes(term) ||
        (p.name_en || "").toLowerCase().includes(term) ||
        (p.descriptionText_ru || "").toLowerCase().includes(term) ||
        (p.descriptionText_en || "").toLowerCase().includes(term)
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

          <FormLanguageToggle current={formLang} onChange={setFormLang} />

          {formLang === "RU" ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={labelStyle}>Название товара (RU)</label>
                <input
                  className="form-field__input"
                  style={inputStyle}
                  placeholder="Введите название на русском..."
                  value={editing.name_ru || ""}
                  onChange={(e) => setEditing({ ...editing, name_ru: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={labelStyle}>Описание товара (RU)</label>
                <textarea
                  className="form-field__input"
                  style={textareaStyle}
                  placeholder="Подробно расскажите о товаре на русском..."
                  value={editing.descriptionText_ru || ""}
                  onChange={(e) => setEditing({ ...editing, descriptionText_ru: e.target.value })}
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={labelStyle}>Название товара (EN)</label>
                <input
                  className="form-field__input"
                  style={inputStyle}
                  placeholder="Enter title in English..."
                  value={editing.name_en || ""}
                  onChange={(e) => setEditing({ ...editing, name_en: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={labelStyle}>Описание товара (EN)</label>
                <textarea
                  className="form-field__input"
                  style={textareaStyle}
                  placeholder="Enter detailed description in English..."
                  value={editing.descriptionText_en || ""}
                  onChange={(e) => setEditing({ ...editing, descriptionText_en: e.target.value })}
                />
              </div>
            </>
          )}

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
              <div key={p.id} style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "10px", padding: "12px 14px" }}>
                {/* Верхняя строка карточки */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "10px", border: "1px solid var(--color-border)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#FAF9F6", flexShrink: 0 }}>
                      {p.imageKey ? (
                        <img src={p.imageKey} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                      ) : (
                        <span style={{ fontSize: "16px" }}>📦</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.name_ru || p.name_en || p.name || "Без названия"}
                      </div>
                      {p.name_en && p.name_ru && (
                        <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          EN: {p.name_en}
                        </div>
                      )}
                      <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                        {p.price} ₽ · {p.category} · {p.unlimited ? "склад ∞" : `остаток: ${p.stock}`}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                        Добавлено: {formatDate(p.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  {!p.isPublished && (
                    <span style={{ fontSize: "9.5px", fontWeight: "700", padding: "2px 6px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "4px", color: "var(--color-text-secondary)", flexShrink: 0 }}>
                      Черновик
                    </span>
                  )}
                </div>

                {/* Нижняя строка (Разделитель и Действия) */}
                <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "8px", display: "flex", justifyContent: "flex-end", gap: "14px", alignItems: "center" }}>
                  <button
                    onClick={() => doDuplicateProduct(p)}
                    title="Дублировать"
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: "#0094B8",
                      fontWeight: "600",
                      fontSize: "11.5px",
                      padding: 0
                    }}
                  >
                    📄 Клонировать
                  </button>
                  <button
                    onClick={() => setEditing(p)}
                    title="Редактировать"
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: "#1BAB7C",
                      fontWeight: "600",
                      fontSize: "11.5px",
                      padding: 0
                    }}
                  >
                    ✏️ Редактировать
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ name: p.name_ru || p.name_en || p.name || "Без названия", type: "product", action: () => doRemove(p.id) })}
                    title="Удалить"
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: "#ef4444",
                      padding: "2px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4h6v2"></path></svg>
                  </button>
                </div>
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
const blankArticle = { title_ru: "", title_en: "", descriptionText_ru: "", descriptionText_en: "", body_ru: "", body_en: "", readTime: "5 мин", isPublished: true, image: null };

function ArticlesTab({ showToast, setDeleteConfirm }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [formLang, setFormLang] = useState("RU");

  // Фильтры
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  async function load() {
    try {
      const list = await api.get("/articles");
      const parsedList = (Array.isArray(list) ? list : []).map((a) => {
        let descriptionText_ru = "";
        let descriptionText_en = "";
        let image = null;
        let isPublished = true;
        
        try {
          if (a.description_ru && a.description_ru.trim().startsWith("{")) {
            const parsed = JSON.parse(a.description_ru);
            descriptionText_ru = parsed.description || parsed.text || "";
            image = parsed.image || null;
            isPublished = parsed.isPublished !== false;
          } else {
            descriptionText_ru = a.description_ru || "";
          }
        } catch (e) {}

        try {
          if (a.description_en && a.description_en.trim().startsWith("{")) {
            const parsed = JSON.parse(a.description_en);
            descriptionText_en = parsed.description || parsed.text || "";
          } else {
            descriptionText_en = a.description_en || "";
          }
        } catch (e) {}

        return {
          ...a,
          descriptionText_ru,
          descriptionText_en,
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
    const hasTitleRu = !!(editing.title_ru || "").trim();
    const hasDescRu = !!(editing.descriptionText_ru || "").trim();
    const hasBodyRu = !!(editing.body_ru || "").trim();
    const hasImage = !!editing.image;

    if (!isPublishedVal) {
      // Для черновика хотя бы одно поле на русском должно быть заполнено
      if (!hasTitleRu && !hasDescRu && !hasBodyRu && !hasImage) {
        setError("Заполните хотя бы одно поле на русском языке (Заголовок, Описание, Текст или Обложка), чтобы сохранить черновик");
        return;
      }
    } else {
      // Для публикации заголовок (RU) обязателен
      if (!hasTitleRu) {
        setError("Пожалуйста, заполните Заголовок статьи (RU) для публикации");
        return;
      }
    }

    const descriptionJson_ru = JSON.stringify({
      description: editing.descriptionText_ru || "",
      image: editing.image,
      isPublished: !!isPublishedVal,
    });

    const descriptionJson_en = JSON.stringify({
      description: editing.descriptionText_en || "",
      image: editing.image,
      isPublished: !!isPublishedVal,
    });

    const body = {
      title_ru: (editing.title_ru || "").trim() || "Без названия",
      title_en: (editing.title_en || "").trim() || "",
      description_ru: descriptionJson_ru,
      description_en: descriptionJson_en,
      body_ru: editing.body_ru || "",
      body_en: editing.body_en || "",
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

  // Дублирование (клонирование) статьи
  async function doDuplicateArticle(item) {
    setError("");
    try {
      const descriptionJson_ru = JSON.stringify({
        description: item.descriptionText_ru || "",
        image: item.image,
        isPublished: false, // Всегда черновик
      });

      const descriptionJson_en = JSON.stringify({
        description: item.descriptionText_en || "",
        image: item.image,
        isPublished: false, // Всегда черновик
      });

      const body = {
        title_ru: `${item.title_ru} (Копия)`,
        title_en: item.title_en ? `${item.title_en} (Copy)` : "",
        description_ru: descriptionJson_ru,
        description_en: descriptionJson_en,
        body_ru: item.body_ru || "",
        body_en: item.body_en || "",
        readTime: item.readTime || "5 мин",
      };

      await api.post("/admin/articles", body);
      showToast(`Создана копия статьи: "${item.title_ru} (Копия)"`);
      await load();
    } catch (e) {
      setError("Не удалось дублировать статью: " + (e?.message || "Ошибка"));
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
        (a.title_ru || "").toLowerCase().includes(term) ||
        (a.title_en || "").toLowerCase().includes(term) ||
        (a.descriptionText_ru || "").toLowerCase().includes(term) ||
        (a.descriptionText_en || "").toLowerCase().includes(term) ||
        (a.body_ru || "").toLowerCase().includes(term) ||
        (a.body_en || "").toLowerCase().includes(term)
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

          <FormLanguageToggle current={formLang} onChange={setFormLang} />

          {formLang === "RU" ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={labelStyle}>Заголовок статьи (RU)</label>
                <input
                  className="form-field__input"
                  style={inputStyle}
                  placeholder="Введите заголовок на русском..."
                  value={editing.title_ru || ""}
                  onChange={(e) => setEditing({ ...editing, title_ru: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={labelStyle}>Краткое описание (RU)</label>
                <textarea
                  className="form-field__input"
                  style={textareaStyle}
                  placeholder="Кратко расскажите о статье на русском..."
                  value={editing.descriptionText_ru || ""}
                  onChange={(e) => setEditing({ ...editing, descriptionText_ru: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={labelStyle}>Полный текст статьи (RU)</label>
                <textarea
                  className="form-field__input"
                  style={{ ...textareaStyle, minHeight: "150px" }}
                  placeholder="Введите текст статьи на русском..."
                  value={editing.body_ru || ""}
                  onChange={(e) => setEditing({ ...editing, body_ru: e.target.value })}
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={labelStyle}>Заголовок статьи (EN)</label>
                <input
                  className="form-field__input"
                  style={inputStyle}
                  placeholder="Enter title in English..."
                  value={editing.title_en || ""}
                  onChange={(e) => setEditing({ ...editing, title_en: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={labelStyle}>Краткое описание (EN)</label>
                <textarea
                  className="form-field__input"
                  style={textareaStyle}
                  placeholder="Briefly describe the article in English..."
                  value={editing.descriptionText_en || ""}
                  onChange={(e) => setEditing({ ...editing, descriptionText_en: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={labelStyle}>Полный текст статьи (EN)</label>
                <textarea
                  className="form-field__input"
                  style={{ ...textareaStyle, minHeight: "150px" }}
                  placeholder="Enter article text in English..."
                  value={editing.body_en || ""}
                  onChange={(e) => setEditing({ ...editing, body_en: e.target.value })}
                />
              </div>
            </>
          )}

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

      {/* Список статей */}
      {!editing && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
            <input
              type="text"
              placeholder="Поиск по заголовку, описанию..."
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
              <div key={a.id} style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "10px", padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "10px", border: "1px solid var(--color-border)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#FAF9F6", flexShrink: 0 }}>
                      {a.image ? (
                        <img src={a.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                      ) : (
                        <span style={{ fontSize: "16px" }}>📄</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.title_ru || a.title_en || "Без названия"}
                      </div>
                      {a.title_en && a.title_ru && (
                        <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          EN: {a.title_en}
                        </div>
                      )}
                      <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                        {a.readTime} · Добавлено: {formatDate(a.publishedAt)}
                      </div>
                    </div>
                  </div>
                  
                  {!a.isPublished && (
                    <span style={{ fontSize: "9.5px", fontWeight: "700", padding: "2px 6px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "4px", color: "var(--color-text-secondary)", flexShrink: 0 }}>
                      Черновик
                    </span>
                  )}
                </div>

                <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "8px", display: "flex", justifyContent: "flex-end", gap: "14px", alignItems: "center" }}>
                  <button
                    onClick={() => doDuplicateArticle(a)}
                    title="Дублировать"
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: "#0094B8",
                      fontWeight: "600",
                      fontSize: "11.5px",
                      padding: 0
                    }}
                  >
                    📄 Клонировать
                  </button>
                  <button
                    onClick={() => setEditing(a)}
                    title="Редактировать"
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: "#1BAB7C",
                      fontWeight: "600",
                      fontSize: "11.5px",
                      padding: 0
                    }}
                  >
                    ✏️ Редактировать
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ name: a.title_ru || a.title_en || "Без названия", type: "article", action: () => doRemove(a.id) })}
                    title="Удалить"
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: "#ef4444",
                      padding: "2px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4h6v2"></path></svg>
                  </button>
                </div>
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
const blankPodcast = { title_ru: "", title_en: "", descriptionText_ru: "", descriptionText_en: "", durationMin: "", isVideo: false, isPublished: true, mediaUrl: "" };

function PodcastsTab({ showToast, setDeleteConfirm }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [formLang, setFormLang] = useState("RU");

  // Фильтры
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  async function load() {
    try {
      const list = await api.get("/podcasts");
      const parsedList = (Array.isArray(list) ? list : []).map((p) => {
        let descriptionText_ru = "";
        let descriptionText_en = "";
        let isVideo = false;
        let isPublished = true;
        let mediaUrl = p.audioKey || "";
        
        try {
          if (p.description_ru && p.description_ru.trim().startsWith("{")) {
            const parsed = JSON.parse(p.description_ru);
            descriptionText_ru = parsed.description || parsed.text || "";
            isVideo = !!parsed.isVideo;
            isPublished = parsed.isPublished !== false;
            mediaUrl = parsed.mediaUrl || p.audioKey || "";
          } else {
            descriptionText_ru = p.description_ru || "";
          }
        } catch (e) {}

        try {
          if (p.description_en && p.description_en.trim().startsWith("{")) {
            const parsed = JSON.parse(p.description_en);
            descriptionText_en = parsed.description || parsed.text || "";
          } else {
            descriptionText_en = p.description_en || "";
          }
        } catch (e) {}

        return {
          ...p,
          descriptionText_ru,
          descriptionText_en,
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
    const hasTitleRu = !!(editing.title_ru || "").trim();
    const hasDescRu = !!(editing.descriptionText_ru || "").trim();
    const hasDuration = editing.durationMin !== "" && Number(editing.durationMin) > 0;
    const hasMedia = !!(editing.mediaUrl || "").trim();

    if (!isPublishedVal) {
      // Для черновика хотя бы одно поле на русском должно быть заполнено
      if (!hasTitleRu && !hasDescRu && !hasDuration && !hasMedia) {
        setError("Заполните хотя бы одно поле на русском языке (Название, Описание, Длительность или Медиафайл), чтобы сохранить черновик");
        return;
      }
    } else {
      // Для публикации название (RU) и длительность обязательны
      if (!hasTitleRu) {
        setError("Пожалуйста, заполните Название записи (RU) для публикации");
        return;
      }
      if (editing.durationMin === "" || Number(editing.durationMin) <= 0) {
        setError("Укажите корректную Длительность контента для публикации");
        return;
      }
    }

    const descriptionJson_ru = JSON.stringify({
      description: editing.descriptionText_ru || "",
      isVideo: !!editing.isVideo,
      isPublished: !!isPublishedVal,
      mediaUrl: editing.mediaUrl || "",
    });

    const descriptionJson_en = JSON.stringify({
      description: editing.descriptionText_en || "",
      isVideo: !!editing.isVideo,
      isPublished: !!isPublishedVal,
      mediaUrl: editing.mediaUrl || "",
    });

    const body = {
      title_ru: (editing.title_ru || "").trim() || "Без названия",
      title_en: (editing.title_en || "").trim() || "",
      description_ru: descriptionJson_ru,
      description_en: descriptionJson_en,
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

  // Дублирование (клонирование) подкаста
  async function doDuplicatePodcast(item) {
    setError("");
    try {
      const descriptionJson_ru = JSON.stringify({
        description: item.descriptionText_ru || "",
        isVideo: !!item.isVideo,
        isPublished: false, // Всегда черновик
        mediaUrl: item.mediaUrl || "",
      });

      const descriptionJson_en = JSON.stringify({
        description: item.descriptionText_en || "",
        isVideo: !!item.isVideo,
        isPublished: false, // Всегда черновик
        mediaUrl: item.mediaUrl || "",
      });

      const body = {
        title_ru: `${item.title_ru} (Копия)`,
        title_en: item.title_en ? `${item.title_en} (Copy)` : "",
        description_ru: descriptionJson_ru,
        description_en: descriptionJson_en,
        durationMin: Number(item.durationMin) || 0,
        audioKey: item.mediaUrl || null,
      };

      await api.post("/admin/podcasts", body);
      showToast(`Создана копия медиазаписи: "${item.title_ru} (Копия)"`);
      await load();
    } catch (e) {
      setError("Не удалось дублировать медиазапись: " + (e?.message || "Ошибка"));
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
        (p.title_ru || "").toLowerCase().includes(term) ||
        (p.title_en || "").toLowerCase().includes(term) ||
        (p.descriptionText_ru || "").toLowerCase().includes(term) ||
        (p.descriptionText_en || "").toLowerCase().includes(term)
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
            {editing.id ? "Редактирование медиазаписи" : "Добавление медиазаписи"}
          </h3>

          <FormLanguageToggle current={formLang} onChange={setFormLang} />

          {formLang === "RU" ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={labelStyle}>Название записи (RU)</label>
                <input
                  className="form-field__input"
                  style={inputStyle}
                  placeholder="Введите название на русском..."
                  value={editing.title_ru || ""}
                  onChange={(e) => setEditing({ ...editing, title_ru: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={labelStyle}>Описание (RU)</label>
                <textarea
                  className="form-field__input"
                  style={textareaStyle}
                  placeholder="Краткое описание на русском..."
                  value={editing.descriptionText_ru || ""}
                  onChange={(e) => setEditing({ ...editing, descriptionText_ru: e.target.value })}
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={labelStyle}>Название записи (EN)</label>
                <input
                  className="form-field__input"
                  style={inputStyle}
                  placeholder="Enter title in English..."
                  value={editing.title_en || ""}
                  onChange={(e) => setEditing({ ...editing, title_en: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={labelStyle}>Описание (EN)</label>
                <textarea
                  className="form-field__input"
                  style={textareaStyle}
                  placeholder="Enter description in English..."
                  value={editing.descriptionText_en || ""}
                  onChange={(e) => setEditing({ ...editing, descriptionText_en: e.target.value })}
                />
              </div>
            </>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <label style={labelStyle}>Длительность (минут)</label>
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
              <div key={p.id} style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "10px", padding: "12px 14px" }}>
                {/* Upper row */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: "20px", flexShrink: 0 }}>
                      {p.isVideo ? "🎥" : "🎧"}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.title_ru || p.title_en || "Без названия"}
                      </div>
                      {p.title_en && p.title_ru && (
                        <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          EN: {p.title_en}
                        </div>
                      )}
                      <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                        {p.durationMin} мин · {p.isVideo ? "Видео" : "Аудио"}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                        Добавлено: {formatDate(p.publishedAt)}
                      </div>
                    </div>
                  </div>
                  
                  {!p.isPublished && (
                    <span style={{ fontSize: "9.5px", fontWeight: "700", padding: "2px 6px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "4px", color: "var(--color-text-secondary)", flexShrink: 0 }}>
                      Черновик
                    </span>
                  )}
                </div>

                {/* Lower row / Actions bar */}
                <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "8px", display: "flex", justifyContent: "flex-end", gap: "14px", alignItems: "center" }}>
                  <button
                    onClick={() => doDuplicatePodcast(p)}
                    title="Дублировать"
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: "#0094B8",
                      fontWeight: "600",
                      fontSize: "11.5px",
                      padding: 0
                    }}
                  >
                    📄 Клонировать
                  </button>
                  <button
                    onClick={() => setEditing(p)}
                    title="Редактировать"
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: "#1BAB7C",
                      fontWeight: "600",
                      fontSize: "11.5px",
                      padding: 0
                    }}
                  >
                    ✏️ Редактировать
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ name: p.title_ru || p.title_en || "Без названия", type: "podcast", action: () => doRemove(p.id) })}
                    title="Удалить"
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: "#ef4444",
                      padding: "2px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4h6v2"></path></svg>
                  </button>
                </div>
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

// ------------------------- Раздел: ТРЕНИРОВКИ -------------------------
const blankWorkout = {
  title_ru: "",
  title_en: "",
  category: "Гиревое дыхание",
  isIndividual: false,
  instructions_ru: "",
  instructions_en: "",
  duration: "",
  level: "Базовый",
  equipment: "",
  exerciseTime: "",
  totalTime: "",
  videoKey: "",
  coverUrl: "",
  isPublished: true,
};

function WorkoutsTab({ showToast, setDeleteConfirm }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [subTab, setSubTab] = useState("shared"); // 'shared' | 'homework'
  const [formLang, setFormLang] = useState("RU");

  // Категории
  const [customCategories, setCustomCategories] = useState([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [renamingCategory, setRenamingCategory] = useState(null);
  const [renamedValue, setRenamedValue] = useState("");

  // Фильтры
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'published' | 'draft'
  const [sortOrder, setSortOrder] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState("all");

  async function load() {
    try {
      // Загружаем и каталог, и индивидуальные
      const [catalog, individual] = await Promise.all([
        api.get("/exercises"),
        api.get("/exercises/individual"),
      ]);
      const list = [
        ...catalog.map(e => ({ ...e, isIndividual: false })),
        ...individual.map(e => ({ ...e, isIndividual: true })),
      ];
      const parsedList = list.map(parseExercise);
      setItems(parsedList);
    } catch (e) {
      setError(e?.message || "Ошибка загрузки тренировок");
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Переименование категории
  async function renameCategory(oldName, newName) {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) {
      setRenamingCategory(null);
      return;
    }
    try {
      const itemsToUpdate = items.filter(item => item.category === oldName);
      for (const item of itemsToUpdate) {
        const descriptionJson_ru = JSON.stringify({
          instructions: item.instructions_ru || "",
          isPublished: !!item.isPublished,
          duration: item.duration || "",
          level: item.level,
          equipment: item.equipment,
          exerciseTime: item.duration || "",
          totalTime: "",
          coverUrl: item.coverUrl,
        });
        const descriptionJson_en = JSON.stringify({
          instructions: item.instructions_en || "",
          isPublished: !!item.isPublished,
          duration: item.duration || "",
          level: item.level,
          equipment: item.equipment,
          exerciseTime: item.duration || "",
          totalTime: "",
          coverUrl: item.coverUrl,
        });
        const body = {
          title_ru: item.title_ru,
          title_en: item.title_en,
          category: trimmed,
          isIndividual: item.isIndividual,
          description_ru: descriptionJson_ru,
          description_en: descriptionJson_en,
          videoKey: item.videoKey || null,
          duration: item.duration || "",
        };
        await api.patch(`/admin/exercises/${item.id}`, body);
      }
      const updatedCustom = customCategories.map(c => c === oldName ? trimmed : c);
      setCustomCategories(updatedCustom);
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

  // Удаление категории
  async function deleteCategory(catName) {
    const isDefault = ["Гиревое дыхание", "Методика шага", "Дыхание", "Упражнения", "Расслабление", "Ходьба"].includes(catName);
    if (isDefault) {
      alert("Нельзя удалить базовую категорию");
      return;
    }
    if (!window.confirm(`Вы уверены, что хотите удалить категорию "${catName}"? Все тренировки из неё будут перемещены в категорию "Гиревое дыхание".`)) {
      return;
    }
    try {
      const itemsToUpdate = items.filter(item => item.category === catName);
      for (const item of itemsToUpdate) {
        const descriptionJson_ru = JSON.stringify({
          instructions: item.instructions_ru || "",
          isPublished: !!item.isPublished,
          duration: item.duration || "",
          level: item.level,
          equipment: item.equipment,
          exerciseTime: item.duration || "",
          totalTime: "",
          coverUrl: item.coverUrl,
        });
        const descriptionJson_en = JSON.stringify({
          instructions: item.instructions_en || "",
          isPublished: !!item.isPublished,
          duration: item.duration || "",
          level: item.level,
          equipment: item.equipment,
          exerciseTime: item.duration || "",
          totalTime: "",
          coverUrl: item.coverUrl,
        });
        const body = {
          title_ru: item.title_ru,
          title_en: item.title_en,
          category: "Гиревое дыхание",
          isIndividual: item.isIndividual,
          description_ru: descriptionJson_ru,
          description_en: descriptionJson_en,
          videoKey: item.videoKey || null,
          duration: item.duration || "",
        };
        await api.patch(`/admin/exercises/${item.id}`, body);
      }
      const updatedCustom = customCategories.filter(c => c !== catName);
      setCustomCategories(updatedCustom);
      if (editing && editing.category === catName) {
        setEditing({ ...editing, category: "Гиревое дыхание" });
      }
      showToast(`Категория "${catName}" удалена`);
      await load();
    } catch (e) {
      setError("Не удалось удалить категорию: " + (e?.message || "Ошибка"));
    }
  }

  // Сохранение тренировки
  async function saveWithPublish(isPublishedVal) {
    setError("");
    const hasTitleRu = !!(editing.title_ru || "").trim();
    const hasTitleEn = !!(editing.title_en || "").trim();

    if (!hasTitleRu && !hasTitleEn) {
      setError("Пожалуйста, укажите Название тренировки (на русском или английском)");
      return;
    }

    const descriptionJson_ru = JSON.stringify({
      instructions: editing.instructions_ru || "",
      isPublished: !!isPublishedVal,
      duration: editing.duration || "",
      level: editing.level || "Базовый",
      equipment: editing.equipment || "",
      exerciseTime: editing.duration || "",
      totalTime: "",
      coverUrl: editing.coverUrl || "",
      videoKey: editing.videoKey_ru || "",
    });

    const descriptionJson_en = JSON.stringify({
      instructions: editing.instructions_en || "",
      isPublished: !!isPublishedVal,
      duration: editing.duration || "",
      level: editing.level || "Базовый",
      equipment: editing.equipment || "",
      exerciseTime: editing.duration || "",
      totalTime: "",
      coverUrl: editing.coverUrl || "",
      videoKey: editing.videoKey_en || "",
    });

    const rootVideo = editing.videoKey_ru || editing.videoKey_en || editing.videoKey || null;

    const body = {
      title_ru: (editing.title_ru || "").trim() || (editing.title_en || "").trim() || "Without Title",
      title_en: (editing.title_en || "").trim() || (editing.title_ru || "").trim() || "",
      category: editing.category || "Гиревое дыхание",
      isIndividual: !!editing.isIndividual,
      description_ru: descriptionJson_ru,
      description_en: descriptionJson_en,
      videoKey: rootVideo,
      duration: editing.duration || "",
    };

    try {
      if (editing.id) {
        await api.patch(`/admin/exercises/${editing.id}`, body);
        showToast(isPublishedVal ? "Тренировка опубликована" : "Тренировка сохранена в черновики");
      } else {
        await api.post("/admin/exercises", body);
        showToast(isPublishedVal ? "Новая тренировка опубликована" : "Тренировка добавлена в черновики");
      }
      setEditing(null);
      await load();
    } catch (e) {
      setError(e?.message || "Не удалось сохранить тренировку");
    }
  }

  // Дублирование (клонирование) тренировки
  async function doDuplicate(item) {
    setError("");
    try {
      const descriptionJson_ru = JSON.stringify({
        instructions: item.instructions_ru || "",
        isPublished: false,
        duration: item.duration || "",
        level: item.level || "Базовый",
        equipment: item.equipment || "",
        exerciseTime: item.duration || "",
        totalTime: "",
        coverUrl: item.coverUrl || "",
        videoKey: item.videoKey_ru || item.videoKey || "",
      });

      const descriptionJson_en = JSON.stringify({
        instructions: item.instructions_en || "",
        isPublished: false,
        duration: item.duration || "",
        level: item.level || "Базовый",
        equipment: item.equipment || "",
        exerciseTime: item.duration || "",
        totalTime: "",
        coverUrl: item.coverUrl || "",
        videoKey: item.videoKey_en || "",
      });

      const body = {
        title_ru: `${item.title_ru || item.title_en} (Копия)`,
        title_en: item.title_en ? `${item.title_en} (Copy)` : "",
        category: item.category || "Гиревое дыхание",
        isIndividual: !!item.isIndividual,
        description_ru: descriptionJson_ru,
        description_en: descriptionJson_en,
        videoKey: item.videoKey_ru || item.videoKey_en || item.videoKey || null,
        duration: item.duration || "",
      };

      await api.post("/admin/exercises", body);
      showToast(`Создана копия тренировки: "${item.title_ru || item.title_en} (Копия)"`);
      await load();
    } catch (e) {
      setError("Не удалось дублировать тренировку: " + (e?.message || "Ошибка"));
    }
  }

  // Загрузка видео-файла (RU)
  function handleVideoUploadRU(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setEditing(prev => {
        const next = { ...prev, videoKey_ru: dataUrl, videoKey: dataUrl };
        autoCaptureFrame(dataUrl, (capturedCover) => {
          setEditing(p => (p.videoKey_ru === dataUrl || p.videoKey === dataUrl) && !p.coverUrl ? { ...p, coverUrl: capturedCover } : p);
        });
        return next;
      });
    };
    reader.readAsDataURL(file);
  }

  // Вставка ссылки на видео (RU)
  function handleVideoUrlChangeRU(url) {
    setEditing(prev => {
      const next = { ...prev, videoKey_ru: url, videoKey: url || prev.videoKey_en };
      if (url.trim()) {
        autoCaptureFrame(url, (capturedCover) => {
          setEditing(p => (p.videoKey_ru === url || p.videoKey === url) && !p.coverUrl ? { ...p, coverUrl: capturedCover } : p);
        });
      }
      return next;
    });
  }

  // Загрузка видео-файла (EN)
  function handleVideoUploadEN(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setEditing(prev => {
        const next = { ...prev, videoKey_en: dataUrl, videoKey: prev.videoKey_ru || dataUrl };
        autoCaptureFrame(dataUrl, (capturedCover) => {
          setEditing(p => (p.videoKey_en === dataUrl || p.videoKey === dataUrl) && !p.coverUrl ? { ...p, coverUrl: capturedCover } : p);
        });
        return next;
      });
    };
    reader.readAsDataURL(file);
  }

  // Вставка ссылки на видео (EN)
  function handleVideoUrlChangeEN(url) {
    setEditing(prev => {
      const next = { ...prev, videoKey_en: url, videoKey: prev.videoKey_ru || url };
      if (url.trim()) {
        autoCaptureFrame(url, (capturedCover) => {
          setEditing(p => (p.videoKey_en === url || p.videoKey === url) && !p.coverUrl ? { ...p, coverUrl: capturedCover } : p);
        });
      }
      return next;
    });
  }

  // Ручная загрузка обложки
  function handleCoverUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditing({ ...editing, coverUrl: reader.result });
    };
    reader.readAsDataURL(file);
  }

  // Удаление упражнения
  function doRemove(id) {
    api.del(`/admin/exercises/${id}`)
      .then(() => {
        showToast("Тренировка удалена");
        load();
      })
      .catch((e) => setError(e?.message || "Ошибка при удалении"));
  }

  const dynamicCategoryList = Array.from(
    new Set([
      ...items
        .filter(item => subTab === "shared" ? !item.isIndividual : item.isIndividual)
        .filter(item => !item.isIndividual ? ![6, 7, 8, 9, 10].includes(item.id) : true)
        .map(item => item.category)
        .filter(Boolean),
      ...customCategories
    ])
  );

  // Фильтруем список на основе подтаба (isIndividual)
  const filtered = items
    .filter(item => subTab === "shared" ? !item.isIndividual : item.isIndividual)
    .filter(item => !item.isIndividual ? ![6, 7, 8, 9, 10].includes(item.id) : true)
    .filter(item => {
      if (categoryFilter === "all") return true;
      return item.category === categoryFilter;
    })
    .filter(item => {
      const term = search.toLowerCase();
      return (
        (item.title_ru || "").toLowerCase().includes(term) ||
        (item.title_en || "").toLowerCase().includes(term) ||
        (item.instructions_ru || "").toLowerCase().includes(term) ||
        (item.instructions_en || "").toLowerCase().includes(term) ||
        (item.category || "").toLowerCase().includes(term)
      );
    })
    .filter(item => {
      if (statusFilter === "published") return item.isPublished;
      if (statusFilter === "draft") return !item.isPublished;
      return true;
    })
    .sort((a, b) => {
      return sortOrder === "newest" ? b.id - a.id : a.id - b.id;
    });

  return (
    <div>
      <SectionError error={error} />

      {/* Переключатель вкладок «Общие тренировки» / «Домашние задания» */}
      {!editing && (
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px", borderBottom: "1.5px solid var(--color-border)", paddingBottom: "10px" }}>
          <button
            onClick={() => {
              setSubTab("shared");
              setCategoryFilter("all");
            }}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              padding: "8px",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "'Manrope', sans-serif",
              color: subTab === "shared" ? "#1BAB7C" : "var(--color-text-secondary)",
              borderBottom: subTab === "shared" ? "3px solid #1BAB7C" : "3px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Общие тренировки
          </button>
          <button
            onClick={() => {
              setSubTab("homework");
              setCategoryFilter("all");
            }}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              padding: "8px",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "'Manrope', sans-serif",
              color: subTab === "homework" ? "#1BAB7C" : "var(--color-text-secondary)",
              borderBottom: subTab === "homework" ? "3px solid #1BAB7C" : "3px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Домашние задания
          </button>
        </div>
      )}

      {editing ? (
        <div style={{ ...cardStyle, marginBottom: "14px" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", fontFamily: "'Manrope', sans-serif" }}>
            {editing.id ? "Редактирование тренировки" : "Добавление тренировки"}
          </h3>

          {/* Тип тренировки */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <label style={labelStyle}>Тип тренировки</label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <button
                type="button"
                onClick={() => setEditing({ ...editing, isIndividual: false })}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "12px",
                  border: !editing.isIndividual ? "1.5px solid #1BAB7C" : "1.5px solid var(--color-border)",
                  background: !editing.isIndividual ? "rgba(27, 171, 124, 0.05)" : "#fff",
                  color: !editing.isIndividual ? "#1BAB7C" : "var(--color-text)",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "'Manrope', sans-serif",
                }}
              >
                Общая тренировка
              </button>
              <button
                type="button"
                onClick={() => setEditing({ ...editing, isIndividual: true })}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "12px",
                  border: editing.isIndividual ? "1.5px solid #1BAB7C" : "1.5px solid var(--color-border)",
                  background: editing.isIndividual ? "rgba(27, 171, 124, 0.05)" : "#fff",
                  color: editing.isIndividual ? "#1BAB7C" : "var(--color-text)",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "'Manrope', sans-serif",
                }}
              >
                Домашнее задание
              </button>
            </div>
          </div>

          <FormLanguageToggle current={formLang} onChange={setFormLang} />

          {formLang === "RU" ? (
            <>
              {/* Название */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={labelStyle}>Название (RU)</label>
                <input
                  className="form-field__input"
                  style={inputStyle}
                  placeholder="Например: Гиревое дыхание на 7 точек..."
                  value={editing.title_ru || ""}
                  onChange={(e) => setEditing({ ...editing, title_ru: e.target.value })}
                />
              </div>

              {/* О методике */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={labelStyle}>О методике (описание и инструкции на русском)</label>
                <textarea
                  className="form-field__input"
                  style={{ ...textareaStyle, minHeight: "90px" }}
                  placeholder="Введите подробное описание и инструкции к упражнению на русском..."
                  value={editing.instructions_ru || ""}
                  onChange={(e) => setEditing({ ...editing, instructions_ru: e.target.value })}
                />
              </div>

              {/* Видеозапись на русском */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "14px" }}>
                <label style={labelStyle}>Видеозапись (Русский)</label>
                <input
                  className="form-field__input"
                  style={{ ...inputStyle, marginBottom: "8px" }}
                  placeholder="Вставьте ссылку на видео для RU версии (YouTube / Rutube / CDN)..."
                  value={(editing.videoKey_ru || "").startsWith("data:") ? "" : (editing.videoKey_ru || "")}
                  onChange={(e) => handleVideoUrlChangeRU(e.target.value)}
                />
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    type="button"
                    style={buttonSecondaryStyle}
                    onClick={() => document.getElementById("workout-video-upload-ru").click()}
                  >
                    {editing.videoKey_ru ? "Заменить видеофайл RU (MP4)" : "Загрузить видеофайл RU (MP4)"}
                  </button>
                  {editing.videoKey_ru && (
                    <button
                      type="button"
                      style={{ ...buttonSecondaryStyle, color: "#d93025", borderColor: "#fca5a5" }}
                      onClick={() => setEditing({ ...editing, videoKey_ru: "", videoKey: editing.videoKey_en || "" })}
                    >
                      Удалить видео RU
                    </button>
                  )}
                  <input
                    id="workout-video-upload-ru"
                    type="file"
                    accept="video/mp4"
                    onChange={handleVideoUploadRU}
                    style={{ display: "none" }}
                  />
                </div>
                {editing.videoKey_ru && (
                  <p style={{ ...tipStyle, color: "#1BAB7C", marginBottom: "6px" }}>
                    ✓ Видео RU привязано ({(editing.videoKey_ru || "").startsWith("data:") ? "загруженный файл MP4" : "внешняя ссылка"})
                  </p>
                )}
                {editing.videoKey_ru && (() => {
                  const youtubeUrl = getYouTubeEmbedUrl(editing.videoKey_ru);
                  return (
                    <div style={{ marginTop: "8px", border: "1px solid var(--color-border)", borderRadius: "14px", padding: "10px", backgroundColor: "#f9f9f9" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-secondary)", display: "block", marginBottom: "6px" }}>
                        Предпросмотр видео (RU):
                      </span>
                      {youtubeUrl ? (
                        <iframe
                          width="100%"
                          height="160"
                          src={youtubeUrl}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ borderRadius: "8px", backgroundColor: "#000" }}
                        />
                      ) : (
                        <video
                          src={editing.videoKey_ru}
                          controls
                          playsInline
                          style={{ width: "100%", maxHeight: "160px", borderRadius: "8px", backgroundColor: "#000" }}
                        />
                      )}
                    </div>
                  );
                })()}
              </div>
            </>
          ) : (
            <>
              {/* Название */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={labelStyle}>Название (EN)</label>
                <input
                  className="form-field__input"
                  style={inputStyle}
                  placeholder="E.g. Kettlebell breathing on 7 points..."
                  value={editing.title_en || ""}
                  onChange={(e) => setEditing({ ...editing, title_en: e.target.value })}
                />
              </div>

              {/* О методике */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={labelStyle}>О методике (описание и инструкции на английском)</label>
                <textarea
                  className="form-field__input"
                  style={{ ...textareaStyle, minHeight: "90px" }}
                  placeholder="Enter detailed description and instructions in English..."
                  value={editing.instructions_en || ""}
                  onChange={(e) => setEditing({ ...editing, instructions_en: e.target.value })}
                />
              </div>

              {/* Видеозапись на английском */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "14px" }}>
                <label style={labelStyle}>Видеозапись (English)</label>
                <input
                  className="form-field__input"
                  style={{ ...inputStyle, marginBottom: "8px" }}
                  placeholder="Enter video link for EN version (YouTube / Rutube / CDN)..."
                  value={(editing.videoKey_en || "").startsWith("data:") ? "" : (editing.videoKey_en || "")}
                  onChange={(e) => handleVideoUrlChangeEN(e.target.value)}
                />
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    type="button"
                    style={buttonSecondaryStyle}
                    onClick={() => document.getElementById("workout-video-upload-en").click()}
                  >
                    {editing.videoKey_en ? "Replace EN video file (MP4)" : "Upload EN video file (MP4)"}
                  </button>
                  {editing.videoKey_en && (
                    <button
                      type="button"
                      style={{ ...buttonSecondaryStyle, color: "#d93025", borderColor: "#fca5a5" }}
                      onClick={() => setEditing({ ...editing, videoKey_en: "", videoKey: editing.videoKey_ru || "" })}
                    >
                      Delete EN video
                    </button>
                  )}
                  <input
                    id="workout-video-upload-en"
                    type="file"
                    accept="video/mp4"
                    onChange={handleVideoUploadEN}
                    style={{ display: "none" }}
                  />
                </div>
                {editing.videoKey_en && (
                  <p style={{ ...tipStyle, color: "#1BAB7C", marginBottom: "6px" }}>
                    ✓ English video attached ({(editing.videoKey_en || "").startsWith("data:") ? "Uploaded MP4 file" : "External URL"})
                  </p>
                )}
                {editing.videoKey_en && (() => {
                  const youtubeUrl = getYouTubeEmbedUrl(editing.videoKey_en);
                  return (
                    <div style={{ marginTop: "8px", border: "1px solid var(--color-border)", borderRadius: "14px", padding: "10px", backgroundColor: "#f9f9f9" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-secondary)", display: "block", marginBottom: "6px" }}>
                        Video preview (EN):
                      </span>
                      {youtubeUrl ? (
                        <iframe
                          width="100%"
                          height="160"
                          src={youtubeUrl}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ borderRadius: "8px", backgroundColor: "#000" }}
                        />
                      ) : (
                        <video
                          src={editing.videoKey_en}
                          controls
                          playsInline
                          style={{ width: "100%", maxHeight: "160px", borderRadius: "8px", backgroundColor: "#000" }}
                        />
                      )}
                    </div>
                  );
                })()}
              </div>
            </>
          )}

          {/* Категория */}
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
                + Добавить/Редактировать категории
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

          {/* Теги для общих тренировок */}
          {!editing.isIndividual ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Время упражнения (минут)</label>
                  <input
                    type="number"
                    className="form-field__input"
                    style={inputStyle}
                    placeholder="Например: 10"
                    value={editing.duration}
                    onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Уровень сложности (тег)</label>
                  <select
                    style={selectStyle}
                    value={editing.level}
                    onChange={(e) => setEditing({ ...editing, level: e.target.value })}
                  >
                    <option value="Базовый">Базовый</option>
                    <option value="Средний">Средний</option>
                    <option value="Продвинутый">Продвинутый</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <label style={labelStyle}>Инвентарь (тег)</label>
                <input
                  className="form-field__input"
                  style={inputStyle}
                  placeholder="Например: С гирей, Коврик"
                  value={editing.equipment}
                  onChange={(e) => setEditing({ ...editing, equipment: e.target.value })}
                />
              </div>
            </div>
          ) : (
            // Параметры для домашних заданий
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Время упражнения (минут)</label>
                  <input
                    type="number"
                    className="form-field__input"
                    style={inputStyle}
                    placeholder="Например: 10"
                    value={editing.duration}
                    onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Сложность (тег)</label>
                  <select
                    style={selectStyle}
                    value={editing.level}
                    onChange={(e) => setEditing({ ...editing, level: e.target.value })}
                  >
                    <option value="Базовый">Базовый</option>
                    <option value="Средний">Средний</option>
                    <option value="Продвинутый">Продвинутый</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Инвентарь (тег)</label>
                  <input
                    className="form-field__input"
                    style={inputStyle}
                    placeholder="Например: Коврик"
                    value={editing.equipment}
                    onChange={(e) => setEditing({ ...editing, equipment: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Обложка / Превью */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "14px" }}>
            <label style={labelStyle}>Обложка / Превью</label>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "120px",
                  height: "75px",
                  borderRadius: "14px",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  backgroundColor: "#F7F7F5",
                }}
              >
                {editing.coverUrl ? (
                  <img src={editing.coverUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Превью" />
                ) : (
                  <span style={{ fontSize: "10px", color: "var(--color-text-secondary)", textAlign: "center" }}>Без обложки</span>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <button
                  type="button"
                  style={buttonSecondaryStyle}
                  onClick={() => document.getElementById("workout-cover-upload").click()}
                >
                  Заменить обложку
                </button>
                <input
                  id="workout-cover-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  style={{ display: "none" }}
                />
                <p style={tipStyle}>Авто-генерация при добавлении видео</p>
              </div>
            </div>
          </div>

          {/* Кнопки сохранения */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => saveWithPublish(true)} className="btn-save" style={{ flex: 1, margin: 0 }}>Сохранить и опубликовать</button>
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
        <button onClick={() => setEditing({ ...blankWorkout, isIndividual: subTab === "homework" })} className="btn-save" style={{ marginBottom: "14px" }}>
          + Добавить {subTab === "shared" ? "тренировку" : "упражнение"}
        </button>
      )}

      {/* Модалка категорий */}
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
            
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "16px" }}>
              <label style={labelStyle}>Новая категория</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  className="form-field__input"
                  style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                  placeholder="Название..."
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

            <label style={labelStyle}>Список категорий</label>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }} className="no-scrollbar">
              {dynamicCategoryList.map((cat) => {
                const isDefault = ["Гиревое дыхание", "Методика шага", "Дыхание", "Упражнения", "Расслабление", "Ходьба"].includes(cat);
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

      {/* Список тренировок и фильтры */}
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
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ ...selectStyle, flex: 1, marginBottom: 0 }}
              >
                <option value="all">Все категории</option>
                {dynamicCategoryList.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
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

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {(() => {
              const activeCategoriesInList = categoryFilter === "all"
                ? Array.from(new Set(filtered.map(item => item.category || "Без категории")))
                : [categoryFilter];

              let shownAny = false;

              const renderList = activeCategoriesInList.map((cat) => {
                const catItems = filtered.filter(item => (item.category || "Без категории") === cat);
                if (catItems.length === 0) return null;
                shownAny = true;
                return (
                  <div key={cat} style={{ marginBottom: "10px" }}>
                    <h4 style={{ margin: "6px 0 10px 0", fontSize: "13px", fontWeight: "800", color: "#1BAB7C", fontFamily: "'Manrope', sans-serif", borderBottom: "1px dashed var(--color-border)", paddingBottom: "4px" }}>
                      {cat}
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {catItems.map((item, idx) => (
                        <div key={item.id} style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "10px", padding: "12px 14px" }}>
                          {/* Верхняя строка карточки */}
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                              <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-text-secondary)", minWidth: "18px" }}>
                                {idx + 1}.
                              </span>
                              <div style={{ width: "40px", height: "40px", borderRadius: "8px", border: "1px solid var(--color-border)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#FAF9F6", flexShrink: 0 }}>
                                {item.videoKey ? (
                                  <video
                                    src={`${item.videoKey}#t=1`}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    preload="metadata"
                                    playsInline
                                    muted
                                  />
                                ) : item.coverUrl ? (
                                  <img src={item.coverUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                                ) : (
                                  <span style={{ fontSize: "14px" }}>🏃</span>
                                )}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {item.title}
                                </div>
                                <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "1px" }}>
                                  {item.isIndividual ? `ДЗ (${item.exerciseTime || "—"})` : `Общая (${item.duration || "—"})`}
                                </div>
                              </div>
                            </div>
                            
                            {!item.isPublished && (
                              <span style={{ fontSize: "9.5px", fontWeight: "700", padding: "2px 6px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "4px", color: "var(--color-text-secondary)", flexShrink: 0 }}>
                                Черновик
                              </span>
                            )}
                          </div>

                          {/* Нижняя строка (Разделитель и Действия) */}
                          <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "8px", display: "flex", justifyContent: "flex-end", gap: "14px", alignItems: "center" }}>
                            <button
                              onClick={() => doDuplicate(item)}
                              title="Дублировать"
                              style={{
                                border: "none",
                                background: "none",
                                cursor: "pointer",
                                color: "#0094B8",
                                fontWeight: "600",
                                fontSize: "11.5px",
                                padding: 0
                              }}
                            >
                              📄 Клонировать
                            </button>
                            <button
                              onClick={() => setEditing(item)}
                              title="Редактировать"
                              style={{
                                border: "none",
                                background: "none",
                                cursor: "pointer",
                                color: "#1BAB7C",
                                fontWeight: "600",
                                fontSize: "11.5px",
                                padding: 0
                              }}
                            >
                              ✏️ Редактировать
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ name: item.title, type: "exercise", action: () => doRemove(item.id) })}
                              title="Удалить"
                              style={{
                                border: "none",
                                background: "none",
                                cursor: "pointer",
                                color: "#ef4444",
                                padding: "2px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4h6v2"></path></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              });

              if (!shownAny) {
                return (
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "13px", fontStyle: "italic", textAlign: "center", padding: "10px" }}>Тренировки не найдены</p>
                );
              }
              return renderList;
            })()}
          </div>
        </>
      )}
    </div>
  );
}

// ------------------------- ГЛАВНЫЙ ЭКРАН -------------------------
const TABS = [
  { id: "users", labelKey: "Пользователи", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
  { id: "workouts", labelKey: "Тренировки", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M13 6h3a2 2 0 0 1 2 2v7" /><path d="M11 18H8a2 2 0 0 1-2-2V9" /></svg> },
  { id: "products", labelKey: "Товары", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg> },
  { id: "articles", labelKey: "Статьи", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg> },
  { id: "podcasts", labelKey: "Подкасты", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" /></svg> },
  { id: "orders", labelKey: "Заказы", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg> },
];

export default function AdminScreen({ onNavigate }) {
  const { language, t } = useLanguage();
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
          <span>{t("Назад")}</span>
        </button>
        <div className="header-title-container">
          <h1 className="screen__title" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "24px", color: "var(--color-text)", letterSpacing: "-.5px", margin: 0 }}>{t("Панель админа")}</h1>
          <p className="screen__subtitle" style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "2px", fontWeight: 300 }}>{t("Управление приложением")}</p>
        </div>
      </header>

      {/* Вкладки */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }} className="no-scrollbar">
        {TABS.map((tItem) => {
          const active = tab === tItem.id;
          return (
            <button
              key={tItem.id}
              onClick={() => setTab(tItem.id)}
              style={{
                display: "flex",
                alignItems: "center",
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
              {tItem.icon}
              <span>{t(tItem.labelKey)}</span>
            </button>
          );
        })}
      </div>

      {tab === "users" && <UsersTab showToast={showToast} />}
      {tab === "workouts" && <WorkoutsTab showToast={showToast} setDeleteConfirm={setDeleteConfirm} />}
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
              {t("Подтверждение удаления")}
            </h3>
            <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: "1.5", fontWeight: 300 }}>
              {language === "EN"
                ? `Are you sure you want to delete ${deleteConfirm.type === "product" ? "product" : deleteConfirm.type === "article" ? "article" : deleteConfirm.type === "exercise" ? "workout" : "media file"}`
                : `Вы уверены, что хотите удалить ${deleteConfirm.type === "product" ? "товар" : deleteConfirm.type === "article" ? "статью" : deleteConfirm.type === "exercise" ? "тренировку" : "медиафайл"}`} <strong>«{deleteConfirm.name}»</strong>? {language === "EN" ? "This action cannot be undone." : "Это действие необратимо."}
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
                {t("Удалить")}
              </button>
              <button
                style={{ ...buttonSecondaryStyle, flex: 1 }}
                onClick={() => setDeleteConfirm(null)}
              >
                {t("Отмена")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
