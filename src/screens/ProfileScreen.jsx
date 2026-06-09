import React, { useState, useEffect } from "react";

/**
 * ProfileScreen — Экран «Профиль / Личный кабинет».
 *
 * Интегрирован переключатель табов («Основное» и «Активность») на чистом Tailwind.
 * Карточки распределены по табам с полным сохранением их стилей и структуры.
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
  const [formAge, setFormAge] = useState(profile.age);
  const [formCountry, setFormCountry] = useState(profile.country);
  const [formRehab, setFormRehab] = useState(profile.passedRehabilitation);
  const [saveMessage, setSaveMessage] = useState("");

  // Sync local form state if global state changes (e.g. initial loads)
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

  function setLanguage(lang) {
    onSettingsChange((prev) => ({ ...prev, language: lang }));
  }

  return (
    <section className="screen" id="screen-profile">
      <header className="screen__header">
        <h1 className="screen__title">Профиль</h1>
        <p className="screen__subtitle">Личный кабинет пользователя</p>
      </header>

      {/* Переключатель табов на чистом Tailwind */}
      <div className="flex bg-gray-200/60 p-1 rounded-xl w-full">
        <button
          type="button"
          onClick={() => setActiveTab("main")}
          className={`w-1/2 py-2 text-xs font-medium rounded-lg text-center transition-all ${
            activeTab === "main"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Основное
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("activity")}
          className={`w-1/2 py-2 text-xs font-medium rounded-lg text-center transition-all ${
            activeTab === "activity"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Активность
        </button>
      </div>

      {/* Вкладка «Основное» */}
      {activeTab === "main" && (
        <>
          {/* 1. Profile Editing Form */}
          <div className="card" id="card-profile-form">
            <h2 className="card__title">Профиль пользователя</h2>

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

            <button
              id="btn-save-profile"
              className="btn-save"
              onClick={handleSaveProfile}
            >
              Сохранить
            </button>

            {saveMessage && (
              <div className="save-message" id="save-message">
                {saveMessage}
              </div>
            )}
          </div>

          {/* 4. Settings Card */}
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

            <div className="settings-row">
              <span className="settings-row__label">Язык интерфейса</span>
              <div className="lang-tabs" id="lang-tabs">
                <button
                  className={`lang-tabs__btn ${settings.language === "RU" ? "lang-tabs__btn--active" : ""}`}
                  onClick={() => setLanguage("RU")}
                >
                  RU
                </button>
                <button
                  className={`lang-tabs__btn ${settings.language === "EN" ? "lang-tabs__btn--active" : ""}`}
                  onClick={() => setLanguage("EN")}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Вкладка «Активность» */}
      {activeTab === "activity" && (
        <>
          {/* 2. Achievements Card */}
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

          {/* 3. Workouts History Card */}
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
