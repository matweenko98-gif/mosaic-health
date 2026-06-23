import React, { useState, useEffect } from "react";

/**
 * ProfileScreen — Экран «Профиль / Личный кабинет».
 */
export default function ProfileScreen({
  user = { name: "", email: "", phone: "", age: "", country: "", hasRehabilitation: false, avatar: null },
  onUserSave,
  onLogout,
  history,
  settings,
  onSettingsChange,
  achievements,
}) {
  const [activeTab, setActiveTab] = useState("main"); // "main" | "activity"
  const [isEditing, setIsEditing] = useState(false);

  // Локальные состояния для полей формы редактирования
  const [formName, setFormName] = useState(user.name || "");
  const [formEmail, setFormEmail] = useState(user.email || "");
  const [formPhone, setFormPhone] = useState(user.phone || "");
  const [formAge, setFormAge] = useState(user.age || "");
  const [formCountry, setFormCountry] = useState(user.country || "");
  const [formRehab, setFormRehab] = useState(!!user.hasRehabilitation);
  const [formAvatar, setFormAvatar] = useState(user.avatar || null);
  const [saveMessage, setSaveMessage] = useState("");

  // Состояния для календаря активности
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [selectedFilterDate, setSelectedFilterDate] = useState(null);

  const monthsRu = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const tempFirstDay = new Date(year, month, 1).getDay();
  const firstDayIndex = tempFirstDay === 0 ? 6 : tempFirstDay - 1;

  function handlePrevMonth() {
    setCalendarDate(new Date(year, month - 1, 1));
  }

  function handleNextMonth() {
    setCalendarDate(new Date(year, month + 1, 1));
  }

  function handleDayClick(day) {
    const formattedDay = String(day).padStart(2, "0");
    const formattedMonth = String(month + 1).padStart(2, "0");
    const dateStr = `${formattedDay}.${formattedMonth}.${year}`;

    if (selectedFilterDate === dateStr) {
      setSelectedFilterDate(null);
    } else {
      setSelectedFilterDate(dateStr);
    }
  }

  // Синхронизация формы при изменении внешнего пользователя
  useEffect(() => {
    setFormName(user.name || "");
    setFormEmail(user.email || "");
    setFormPhone(user.phone || "");
    setFormAge(user.age || "");
    setFormCountry(user.country || "");
    setFormRehab(!!user.hasRehabilitation);
    setFormAvatar(user.avatar || null);
  }, [user]);

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSaveProfile() {
    if (onUserSave) {
      onUserSave({
        name: formName,
        email: formEmail,
        phone: formPhone,
        age: formAge,
        country: formCountry,
        hasRehabilitation: formRehab,
        avatar: formAvatar,
      });
    }
    setSaveMessage("Данные успешно сохранены");
    setTimeout(() => setSaveMessage(""), 3000);
    setIsEditing(false);
  }

  function handleCancelProfile() {
    // Сбросить к сохраненным значениям
    setFormName(user.name || "");
    setFormEmail(user.email || "");
    setFormPhone(user.phone || "");
    setFormAge(user.age || "");
    setFormCountry(user.country || "");
    setFormRehab(!!user.hasRehabilitation);
    setFormAvatar(user.avatar || null);
    setIsEditing(false);
  }

  function toggleReminders() {
    onSettingsChange((prev) => ({
      ...prev,
      workoutReminders: !prev.workoutReminders,
    }));
  }

  function toggleArticles() {
    onSettingsChange((prev) => ({
      ...prev,
      articleNotifications: !prev.articleNotifications,
    }));
  }

  const filteredMainHistory = history
    .filter((entry) => !entry.isIndividual)
    .filter((entry) => !selectedFilterDate || entry.date === selectedFilterDate);

  const filteredIndividualHistory = history
    .filter((entry) => entry.isIndividual)
    .filter((entry) => !selectedFilterDate || entry.date === selectedFilterDate);

  return (
    <section className="screen" id="screen-profile">
      <header className="screen__header">
        <h1 className="screen__title">Профиль</h1>
        <p className="screen__subtitle">Личный кабинет пользователя</p>
      </header>

      {/* Горизонтальная лента категорий для профиля */}
      <div style={{
        display: "flex",
        gap: "10px",
        overflowX: "auto",
        width: "100%",
        padding: "4px 0",
        margin: "4px 0 0 0",
        msOverflowStyle: "none",
        scrollbarWidth: "none",
        flexShrink: 0
      }} className="no-scrollbar">
        {[
          { id: "main", label: "Основное", icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )},
          { id: "activity", label: "Активность", icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          )}
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
                flexShrink: 0,
                flex: 1
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Сообщение об успешном сохранении */}
      {saveMessage && (
        <div className="save-message" id="save-message" style={{ margin: "8px 0" }}>
          {saveMessage}
        </div>
      )}

      {/* Вкладка «Основное» */}
      {activeTab === "main" && (
        <>
          {/* Блок: Профиль пользователя */}
          <div className="card" id="card-profile-form">
            <h2 className="card__title">Профиль пользователя</h2>

            {!isEditing ? (
              /* Режим просмотра информации с фото-заглушкой */
              <div className="profile-view">
                <div className="profile-view__avatar-section">
                  <div className="profile-view__avatar-placeholder" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Аватар"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: "var(--color-accent)" }}
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-text)" }}>
                      {user.name || "Пользователь"}
                    </span>
                    <span className="profile-view__avatar-label">{user.avatar ? "Фото профиля" : "[ Фото-заглушка ]"}</span>
                  </div>
                </div>

                <div className="profile-view__fields">
                  <div className="profile-view__row">
                    <span className="profile-view__label">Телефон:</span>
                    <span className="profile-view__value">{user.phone || "—"}</span>
                  </div>
                  <div className="profile-view__row">
                    <span className="profile-view__label">Email:</span>
                    <span className="profile-view__value">{user.email || "—"}</span>
                  </div>
                  <div className="profile-view__row">
                    <span className="profile-view__label">Возраст:</span>
                    <span className="profile-view__value">{user.age ? `${user.age} лет` : "—"}</span>
                  </div>
                  <div className="profile-view__row">
                    <span className="profile-view__label">Страна:</span>
                    <span className="profile-view__value">{user.country || "—"}</span>
                  </div>
                  <div className="profile-view__row">
                    <span className="profile-view__label">Реабилитация:</span>
                    <span className="profile-view__value">
                      {user.hasRehabilitation ? "Да" : "Нет"}
                    </span>
                  </div>
                </div>

                <button
                  id="btn-edit-profile"
                  className="btn-save mt-4"
                  onClick={() => setIsEditing(true)}
                >
                  Редактировать
                </button>
              </div>
            ) : (
              /* Режим редактирования */
              <div className="profile-edit">
                {/* Интерактивный аватар */}
                <div className="profile-view__avatar-section" style={{ marginBottom: "16px" }}>
                  <div
                    onClick={() => document.getElementById("avatar-file-input").click()}
                    style={{
                      position: "relative",
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      cursor: "pointer",
                      overflow: "hidden",
                      border: "1px solid var(--color-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f3f4f6"
                    }}
                    title="Нажмите для выбора фото"
                  >
                    {formAvatar ? (
                      <img
                        src={formAvatar}
                        alt="Превью"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: "var(--color-accent)" }}
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                    
                    {/* Тонкий оверлей при наведении с подсказкой */}
                    <div className="hover:opacity-100 opacity-0 transition-opacity duration-200" style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(0,0,0,0.45)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "0.65rem",
                      fontWeight: "500",
                      textAlign: "center"
                    }}>
                      Изм.
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-text)" }}>
                      {formName || "Пользователь"}
                    </span>
                    <span
                      style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => document.getElementById("avatar-file-input").click()}
                    >
                      Изменить фото
                    </span>
                  </div>
                  
                  {/* Скрытый инпут */}
                  <input
                    id="avatar-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: "none" }}
                  />
                </div>

                <div className="form-field">
                  <label className="form-field__label" htmlFor="input-name">
                    Имя
                  </label>
                  <input
                    id="input-name"
                    className="form-field__input"
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label className="form-field__label" htmlFor="input-email">
                    Email
                  </label>
                  <input
                    id="input-email"
                    className="form-field__input"
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label className="form-field__label" htmlFor="input-phone">
                    Телефон
                  </label>
                  <input
                    id="input-phone"
                    className="form-field__input"
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label className="form-field__label" htmlFor="input-age">
                    Возраст
                  </label>
                  <input
                    id="input-age"
                    className="form-field__input"
                    type="number"
                    min="1"
                    max="120"
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label className="form-field__label" htmlFor="input-country">
                    Страна
                  </label>
                  <input
                    id="input-country"
                    className="form-field__input"
                    type="text"
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                  />
                </div>

                <div className="form-field form-field--row">
                  <span className="form-field__label">
                    Проходил реабилитацию в центре
                  </span>
                  <button
                    id="toggle-rehab"
                    className={`toggle ${formRehab ? "toggle--on" : ""}`}
                    onClick={() => setFormRehab(!formRehab)}
                    role="switch"
                    aria-checked={formRehab}
                  >
                    <span className="toggle__track">
                      <span className="toggle__thumb" />
                    </span>
                    <span className="toggle__label">{formRehab ? "Да" : "Нет"}</span>
                  </button>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button
                    id="btn-save-profile"
                    className="btn-save"
                    style={{ flex: 1, margin: 0 }}
                    onClick={handleSaveProfile}
                  >
                    Сохранить
                  </button>
                  <button
                    id="btn-cancel-profile"
                    style={{
                      flex: 1,
                      margin: 0,
                      display: "flex",
                      border: "1px solid var(--color-border)",
                      cursor: "pointer",
                      background: "transparent",
                      color: "var(--color-text-secondary)",
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 700,
                      fontSize: "15px",
                      padding: "14px",
                      borderRadius: "16px",
                      alignItems: "center",
                      gap: "8px",
                      justifyContent: "center",
                      transition: "background-color 0.15s ease"
                    }}
                    onClick={handleCancelProfile}
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Настройки */}
          <div className="card" id="card-settings">
            <h2 className="card__title">Настройки</h2>

            <div className="settings-row">
              <span className="settings-row__label">
                Напоминания о тренировках
              </span>
              <button
                id="toggle-reminders"
                className={`toggle ${settings.workoutReminders ? "toggle--on" : ""}`}
                onClick={toggleReminders}
                role="switch"
                aria-checked={settings.workoutReminders}
              >
                <span className="toggle__track">
                  <span className="toggle__thumb" />
                </span>
                <span className="toggle__label">
                  {settings.workoutReminders ? "Вкл" : "Выкл"}
                </span>
              </button>
            </div>

            <div className="settings-row">
              <span className="settings-row__label">
                Уведомления о статьях
              </span>
              <button
                id="toggle-articles"
                className={`toggle ${settings.articleNotifications ? "toggle--on" : ""}`}
                onClick={toggleArticles}
                role="switch"
                aria-checked={settings.articleNotifications}
              >
                <span className="toggle__track">
                  <span className="toggle__thumb" />
                </span>
                <span className="toggle__label">
                  {settings.articleNotifications ? "Вкл" : "Выкл"}
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Вкладка «Активность» */}
      {activeTab === "activity" && (
        <>
          {/* Календарь активности */}
          <div className="card" id="card-activity-calendar" style={{ padding: "18px" }}>
            <h2 className="card__title" style={{ marginBottom: "12px", fontSize: "1.05rem", fontWeight: "800", fontFamily: "'Manrope', sans-serif" }}>Календарь активности</h2>
            
            {/* Панель переключения месяцев */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <button 
                type="button"
                onClick={handlePrevMonth}
                style={{
                  border: "1px solid var(--color-border)",
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  color: "var(--color-text-secondary)"
                }}
              >
                ‹
              </button>
              <span style={{ fontSize: "0.95rem", fontWeight: "800", fontFamily: "'Manrope', sans-serif", color: "var(--color-text)" }}>
                {monthsRu[month]} {year}
              </span>
              <button 
                type="button"
                onClick={handleNextMonth}
                style={{
                  border: "1px solid var(--color-border)",
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  color: "var(--color-text-secondary)"
                }}
              >
                ›
              </button>
            </div>

            {/* Сетка дней недели */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", textAlign: "center", marginBottom: "8px" }}>
              {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((wDay) => (
                <span key={wDay} style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--color-text-secondary)", textTransform: "uppercase" }}>
                  {wDay}
                </span>
              ))}
            </div>

            {/* Сетка дней месяца */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
              {/* Пустые ячейки в начале месяца */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} />
              ))}
              
              {/* Дни месяца */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const formattedDay = String(day).padStart(2, "0");
                const formattedMonth = String(month + 1).padStart(2, "0");
                const dateStr = `${formattedDay}.${formattedMonth}.${year}`;

                // Проверяем, есть ли тренировки в истории за этот день
                const dayHasWorkout = history.some((entry) => entry.date === dateStr);
                const isSelected = selectedFilterDate === dateStr;

                // Цветовые стили в зависимости от состояния
                let bgColor = "#fff";
                let color = "var(--color-text)";
                let borderColor = "var(--color-border)";
                let fontWeight = "600";
                let shadow = "none";

                if (dayHasWorkout) {
                  bgColor = "var(--color-active, #1BAB7C)";
                  color = "#fff";
                  borderColor = "var(--color-active, #1BAB7C)";
                  fontWeight = "700";
                  shadow = "0 3px 8px rgba(27, 171, 124, 0.15)";
                }

                return (
                  <button
                    key={`day-${day}`}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    style={{
                      height: "34px",
                      borderRadius: "10px",
                      border: isSelected ? "2px solid #000" : "1px solid " + borderColor,
                      backgroundColor: bgColor,
                      color: color,
                      fontSize: "0.8rem",
                      fontWeight: fontWeight,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: shadow,
                      transition: "all 0.15s ease",
                      fontFamily: "'Manrope', sans-serif"
                    }}
                    title={dayHasWorkout ? "Есть тренировки. Нажмите для фильтрации." : "Нет тренировок."}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Фильтр по дате */}
          {selectedFilterDate && (
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "rgba(27, 171, 124, 0.08)",
              border: "1px solid var(--color-accent)",
              borderRadius: "14px",
              padding: "10px 14px",
              marginBottom: "16px",
              fontSize: "0.82rem",
              color: "var(--color-active)",
              fontFamily: "'Manrope', sans-serif",
              fontWeight: "700"
            }}>
              <span>Показаны тренировки за {selectedFilterDate}</span>
              <button 
                type="button"
                onClick={() => setSelectedFilterDate(null)}
                style={{
                  border: "none",
                  background: "none",
                  color: "#ef4444",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  textDecoration: "underline"
                }}
              >
                Сбросить
              </button>
            </div>
          )}

          {/* Достижения */}
          <div className="card" id="card-achievements" style={{ marginBottom: "16px" }}>
            <h2 className="card__title">Достижения</h2>
            <div className="achievement-row">
              <div className="achievement-row__icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2h12v6a6 6 0 01-12 0V2z" />
                  <path d="M6 4H3v2a3 3 0 003 3" />
                  <path d="M18 4h3v2a3 3 0 01-3 3" />
                  <path d="M12 14v4" />
                  <path d="M8 22h8" />
                  <path d="M10 18h4" />
                </svg>
              </div>
              <div className="achievement-row__info">
                <span className="achievement-row__value">
                  {achievements.daysInRow}
                </span>
                <span className="achievement-row__label">
                  дней тренировок подряд
                </span>
              </div>
            </div>
          </div>

          {/* История основных тренировок */}
          <div className="card" id="card-main-history" style={{ marginBottom: "16px" }}>
            <h2 className="card__title">История основных тренировок</h2>
            {filteredMainHistory.length === 0 ? (
              <p className="card__text card__text--empty">
                {selectedFilterDate ? "В этот день не было основных тренировок" : "Пока нет завершённых основных тренировок"}
              </p>
            ) : (
              <ul className="history-list">
                {filteredMainHistory.map((entry) => (
                  <li key={entry.id} className="history-list__item">
                    <span className="history-list__date">{entry.date}</span>
                    <span className="history-list__name">{entry.name}</span>
                    <span className="history-list__status">{entry.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* История индивидуальных тренировок */}
          <div className="card" id="card-individual-history">
            <h2 className="card__title">История индивидуальных тренировок</h2>
            {filteredIndividualHistory.length === 0 ? (
              <p className="card__text card__text--empty">
                {selectedFilterDate ? "В этот день не было индивидуальных тренировок" : "Пока нет завершённых индивидуальных тренировок"}
              </p>
            ) : (
              <ul className="history-list">
                {filteredIndividualHistory.map((entry) => {
                  const isFullyCompleted = entry.status === "Завершено" || entry.status === "Выполнено полностью" || entry.completedCount === entry.totalCount;
                  const progressText = isFullyCompleted ? "Завершено" : entry.status;
                  
                  return (
                     <li key={entry.id} className="history-list__item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "8px", padding: "12px 14px", height: "auto" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                        <span className="history-list__date" style={{ margin: 0 }}>{entry.date}</span>
                        <span 
                          className="history-list__status" 
                          style={{ 
                            margin: 0,
                            backgroundColor: isFullyCompleted ? "#eefbf4" : "#fffbeb",
                            color: isFullyCompleted ? "#117a42" : "#b45309",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: "600"
                          }}
                        >
                          {progressText}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-text)", margin: "2px 0" }}>
                        {entry.name || "Индивидуальная программа"}
                      </div>
                      {entry.exercises && entry.exercises.length > 0 && (
                        <div style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "4px",
                          width: "100%",
                          borderTop: "1px dashed var(--color-border)",
                          paddingTop: "8px",
                          marginTop: "6px"
                        }}>
                          {entry.exercises.map((exName, exIdx) => {
                            const isExCompleted = isFullyCompleted || exIdx < (entry.completedCount || 0);
                            return (
                              <div
                                key={exIdx}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "3px",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  backgroundColor: isExCompleted ? "#f0fdf4" : "var(--color-bg)",
                                  border: "1px solid var(--color-border)",
                                  fontSize: "0.65rem",
                                  fontWeight: "500",
                                  color: isExCompleted ? "#166534" : "var(--color-text-secondary)"
                                }}
                              >
                                <span>{isExCompleted ? "✓" : "○"}</span>
                                <span>{exName}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}

      {/* Кнопка Выхода */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "4px", marginBottom: "4px" }}>
        <button
          onClick={onLogout}
          style={{
            background: "none",
            border: "none",
            color: "#d93025",
            fontSize: "0.9rem",
            fontWeight: "500",
            cursor: "pointer",
            textDecoration: "underline"
          }}
        >
          Выйти из аккаунта
        </button>
      </div>
    </section>
  );
}
