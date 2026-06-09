import React, { useState, useEffect } from "react";

/**
 * ProfileScreen — Экран «Профиль / Личный кабинет».
 */
export default function ProfileScreen({
  profile,
  onProfileSave,
  history,
  settings,
  onSettingsChange,
  achievements,
}) {
  const [activeTab, setActiveTab] = useState("main"); // "main" | "activity"
  const [isEditing, setIsEditing] = useState(false);

  // Локальные состояния для полей формы редактирования
  const [formAge, setFormAge] = useState(profile.age);
  const [formCountry, setFormCountry] = useState(profile.country);
  const [formRehab, setFormRehab] = useState(profile.passedRehabilitation);
  const [saveMessage, setSaveMessage] = useState("");

  // Синхронизация формы при изменении внешнего профиля
  useEffect(() => {
    setFormAge(profile.age);
    setFormCountry(profile.country);
    setFormRehab(profile.passedRehabilitation);
  }, [profile]);

  function handleSaveProfile() {
    onProfileSave({
      age: formAge,
      country: formCountry,
      passedRehabilitation: formRehab,
    });
    setSaveMessage("Данные успешно сохранены");
    setTimeout(() => setSaveMessage(""), 3000);
    setIsEditing(false);
  }

  function handleCancelProfile() {
    // Сбросить к сохраненным значениям
    setFormAge(profile.age);
    setFormCountry(profile.country);
    setFormRehab(profile.passedRehabilitation);
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

  return (
    <section className="screen" id="screen-profile">
      <header className="screen__header">
        <h1 className="screen__title">Профиль</h1>
        <p className="screen__subtitle">Личный кабинет пользователя</p>
      </header>

      {/* Полноценные мобильные табы */}
      <div className="profile-tabs">
        <button
          type="button"
          onClick={() => setActiveTab("main")}
          className={`profile-tabs__btn ${
            activeTab === "main" ? "profile-tabs__btn--active" : ""
          }`}
        >
          Основное
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("activity")}
          className={`profile-tabs__btn ${
            activeTab === "activity" ? "profile-tabs__btn--active" : ""
          }`}
        >
          Активность
        </button>
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
                  <div className="profile-view__avatar-placeholder">
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
                  </div>
                  <span className="profile-view__avatar-label">[ Фото-заглушка ]</span>
                </div>

                <div className="profile-view__fields">
                  <div className="profile-view__row">
                    <span className="profile-view__label">Возраст:</span>
                    <span className="profile-view__value">{profile.age} лет</span>
                  </div>
                  <div className="profile-view__row">
                    <span className="profile-view__label">Страна:</span>
                    <span className="profile-view__value">{profile.country}</span>
                  </div>
                  <div className="profile-view__row">
                    <span className="profile-view__label">Реабилитация:</span>
                    <span className="profile-view__value">
                      {profile.passedRehabilitation ? "Да" : "Нет"}
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
                    className="modal__btn modal__btn--secondary"
                    style={{ flex: 1, margin: 0 }}
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
          {/* Достижения */}
          <div className="card" id="card-achievements">
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

          {/* История тренировок */}
          <div className="card" id="card-history">
            <h2 className="card__title">История тренировок</h2>
            {history.length === 0 ? (
              <p className="card__text card__text--empty">
                Пока нет завершённых тренировок
              </p>
            ) : (
              <ul className="history-list">
                {history.map((entry) => (
                  <li key={entry.id} className="history-list__item">
                    <span className="history-list__date">{entry.date}</span>
                    <span className="history-list__name">{entry.name}</span>
                    <span className="history-list__status">{entry.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}
