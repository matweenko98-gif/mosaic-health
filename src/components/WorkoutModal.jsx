import React from "react";

/**
 * WorkoutModal — модальное окно «плеера» тренировки.
 *
 * Показывает заглушку видеоплеера, название тренировки,
 * сетку параметров, описание методики
 * и кнопку «Отметить выполнение».
 */
export default function WorkoutModal({ workout, onClose, onComplete, onBackToList }) {
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

  // Описание сути упражнения
  const isBreathing = workout.id === 1 || workout.id === 2;
  const aboutText = isBreathing
    ? "Дыхательная гимнастика, направленная на раскрытие грудной клетки, улучшение экскурсии легких и мобилизацию ребер по ключевым точкам под весом снаряда."
    : "Разбор биомеханики шага, тренировка правильного переката стопы, своевременного включения ягодичных мышц и согласованной работы плечевого пояса.";

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Кнопка возврата к списку */}
        <button
          onClick={onBackToList || onClose}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-xs self-start py-1 mb-1 transition-colors duration-150 shrink-0"
        >
          <svg
            className="w-3 h-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          К списку
        </button>

        {/* Заглушка видеоплеера */}
        <div className="modal__player shrink-0" id="modal-player" style={{ height: "160px" }}>
          <svg
            className="modal__play-icon"
            width="40"
            height="40"
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
        <h2 className="text-base font-bold text-gray-800 mt-2 mb-1 shrink-0">
          {workout.title}
        </h2>

        {/* Сетка характеристик (Parameters Grid) */}
        <div className="grid grid-cols-3 gap-2 border-y border-gray-100 py-2.5 my-2 shrink-0">
          {/* Время */}
          <div className="flex flex-col items-center gap-1 border-r border-gray-100">
            <svg
              className="w-3.5 h-3.5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-xs font-medium text-gray-600">
              {workout.duration || "15 мин"}
            </span>
          </div>

          {/* Сложность */}
          <div className="flex flex-col items-center gap-1 border-r border-gray-100">
            <svg
              className="w-3.5 h-3.5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-xs font-medium text-gray-600">
              {workout.level || "Базовый"}
            </span>
          </div>

          {/* Снаряд */}
          <div className="flex flex-col items-center gap-1">
            <svg
              className="w-3.5 h-3.5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            <span className="text-xs font-medium text-gray-600">
              {workout.equipment || "С гирей"}
            </span>
          </div>
        </div>

        {/* Блок: О методике */}
        <div className="flex flex-col gap-1.5 my-2">
          <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-0.5">
            О методике
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {aboutText}
          </p>
        </div>

        {/* Действия */}
        <div className="modal__actions">
          <button
            id="btn-complete-workout"
            className="w-full bg-[#222222] hover:bg-black text-white text-sm font-semibold py-3.5 px-4 min-h-[48px] rounded-xl transition-colors duration-150 flex items-center justify-center gap-1.5 shrink-0"
            onClick={handleComplete}
          >
            ✓ Отметить выполнение
          </button>
          
          <button
            id="btn-close-modal"
            onClick={onClose}
            className="w-full bg-transparent hover:bg-gray-50 text-gray-500 hover:text-gray-700 text-sm font-semibold py-3.5 px-4 min-h-[48px] rounded-xl border border-gray-200 transition-colors duration-150 flex items-center justify-center shrink-0"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
