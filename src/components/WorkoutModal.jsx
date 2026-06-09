import React from "react";

/**
 * WorkoutModal — модальное окно «плеера» тренировки.
 *
 * Показывает заглушку видеоплеера, название тренировки
 * и кнопку «Отметить выполнение».
 * При выполнении — добавляет запись в историю и закрывает модалку.
 */
export default function WorkoutModal({ workout, onClose, onComplete }) {
  if (!workout) return null;

  function handleComplete() {
    const today = new Date();
    const dateStr =
      String(today.getDate()).padStart(2, "0") +
      "." +
      String(today.getMonth() + 1).padStart(2, "0") +
      "." +
      today.getFullYear();

    onComplete({
      id: Date.now(),
      date: dateStr,
      name: workout.title,
      status: "Выполнено",
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Заглушка видеоплеера */}
        <div className="modal__player" id="modal-player">
          <svg
            className="modal__play-icon"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="10,8 16,12 10,16" />
          </svg>
          <span className="modal__player-label">[Видеоплеер — заглушка]</span>
        </div>

        {/* Название тренировки */}
        <h2 className="modal__title">{workout.title}</h2>
        <p className="modal__desc">{workout.description}</p>

        {/* Действия */}
        <div className="modal__actions">
          <button
            id="btn-complete-workout"
            className="modal__btn modal__btn--primary"
            onClick={handleComplete}
          >
            ✓ Отметить выполнение
          </button>
          <button
            id="btn-close-modal"
            className="modal__btn modal__btn--secondary"
            onClick={onClose}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
