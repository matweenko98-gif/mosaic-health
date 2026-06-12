import React, { useState } from "react";

/**
 * WorkoutModal — модальное окно «плеера» тренировки.
 *
 * Показывает заглушку видеоплеера, название тренировки,
 * сетку параметров, описание методики
 * и кнопку «Отметить выполнение».
 * 
 * Расширен возможностью воспроизведения плейлиста,
 * навигации назад/вперед и переключения паузы.
 */
export default function WorkoutModal({
  workout,
  onClose,
  onComplete,
  onBackToList,
  playlist = [],
  currentIndex = -1,
  onIndexChange,
}) {
  if (!workout) return null;

  const [isPlaying, setIsPlaying] = useState(true);

  const isLastExercise = playlist.length === 0 || currentIndex === playlist.length - 1;

  function handleClosePlayer() {
    // Если это плейлист индивидуальных тренировок и пройдено хотя бы одно упражнение, логгируем частичный прогресс
    const isIndividualPlaylist = playlist.length > 0 && playlist[0].id >= 101;
    if (isIndividualPlaylist && currentIndex > 0) {
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
        name: "Индивидуальная программа",
        status: `Выполнено ${currentIndex}/${playlist.length}`,
        isIndividual: true,
        completedCount: currentIndex,
        totalCount: playlist.length,
        exercises: playlist.map(item => item.title || item.label)
      });
    } else {
      onClose();
    }
  }

  function handleComplete() {
    const today = new Date();
    const dateStr =
      String(today.getDate()).padStart(2, "0") +
      "." +
      String(today.getMonth() + 1).padStart(2, "0") +
      "." +
      today.getFullYear();

    const isIndividualPlaylist = playlist.length > 0 && playlist[0].id >= 101;
    if (isIndividualPlaylist) {
      // Логгируем всю программу как одно выполненное ДЗ
      onComplete({
        id: Date.now(),
        date: dateStr,
        name: "Индивидуальная программа",
        status: "Завершено",
        isIndividual: true,
        completedCount: playlist.length,
        totalCount: playlist.length,
        exercises: playlist.map(item => item.title || item.label)
      });
    } else {
      // Одиночная тренировка
      onComplete({
        id: Date.now(),
        date: dateStr,
        name: workout.title,
        status: "Выполнено",
        isIndividual: false
      });
    }
    
    onClose();
  }

  // Описание сути упражнения
  const isBreathing = workout.id === 1 || workout.id === 2;
  const aboutText = workout.description || (isBreathing
    ? "Дыхательная гимнастика, направленная на раскрытие грудной клетки, улучшение экскурсии легких и мобилизацию ребер по ключевым точкам под весом снаряда."
    : "Разбор биомеханики шага, тренировка правильного переката стопы, своевременного включения ягодичных мышц и согласованной работы плечевого пояса.");

  const nextWorkout = playlist.length > 0 && currentIndex >= 0 && currentIndex < playlist.length - 1
    ? playlist[currentIndex + 1]
    : null;

  const totalDurationMin = playlist.length > 0
    ? playlist.reduce((sum, item) => {
        const parsed = parseInt(item.duration, 10);
        return sum + (isNaN(parsed) ? 0 : parsed);
      }, 0)
    : parseInt(workout.duration, 10) || 0;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClosePlayer();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "95vh", overflowY: "auto" }}>
        
        {/* Горизонтальный прогрессбар плейлиста */}
        {playlist.length > 0 && currentIndex >= 0 && (
          <div style={{
            display: "flex",
            gap: "4px",
            paddingBottom: "12px",
            marginBottom: "12px",
            borderBottom: "1px solid var(--color-border)",
            width: "100%"
          }}>
            {playlist.map((item, idx) => {
              const isCurrent = idx === currentIndex;
              const isPassed = idx < currentIndex;
              
              let bgColor = "#e5e7eb"; // Предстоящие этапы
              if (isPassed) {
                bgColor = "#222222"; // Пройденный этап
              } else if (isCurrent) {
                bgColor = "#007aff"; // Активный этап
              }

              return (
                <div
                  key={item.id}
                  onClick={() => onIndexChange && onIndexChange(idx)}
                  style={{
                    flex: 1,
                    height: "6px",
                    borderRadius: "3px",
                    backgroundColor: bgColor,
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                  title={item.title || item.label}
                />
              );
            })}
          </div>
        )}

        {/* Кнопка возврата к списку */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onBackToList) onBackToList();
            else onClose();
          }}
          className="back-btn"
          style={{
            alignSelf: "flex-start",
            marginBottom: "8px"
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>К списку</span>
        </button>

        {/* Заглушка видеоплеера */}
        <div className="modal__player shrink-0" id="modal-player" style={{ height: "160px", position: "relative" }}>
          {!isPlaying ? (
            <div style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(255, 255, 255, 0.93)",
              borderRadius: "inherit",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: "var(--color-text-secondary)"
            }}>
              <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-text)" }}>
                Тренировка приостановлена
              </span>
              <button
                onClick={() => setIsPlaying(true)}
                className="back-btn"
                style={{
                  padding: "0 16px",
                  height: "34px",
                  backgroundColor: "var(--color-active)",
                  color: "#fff",
                  borderRadius: "17px",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ▶ Продолжить
              </button>
            </div>
          ) : (
            <>
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
              <span className="modal__player-label">[Видеоплеер — воспроизведение]</span>
            </>
          )}
        </div>

        {/* Элементы управления воспроизведением плейлиста */}
        {playlist.length > 0 && currentIndex >= 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", width: "100%", marginTop: "2px" }}>
            <button
              onClick={() => onIndexChange && onIndexChange(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="back-btn"
              style={{
                flex: 1,
                height: "36px",
                opacity: currentIndex === 0 ? 0.4 : 1,
                cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                justifyContent: "center"
              }}
            >
              ← Назад
            </button>
            
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="back-btn"
              style={{
                flex: 1.2,
                height: "36px",
                backgroundColor: isPlaying ? "var(--color-bg)" : "var(--color-active)",
                color: isPlaying ? "var(--color-text)" : "#fff",
                fontWeight: "600",
                justifyContent: "center",
                border: isPlaying ? "1px solid var(--color-border)" : "none"
              }}
            >
              {isPlaying ? "⏸ Пауза" : "▶ Старт"}
            </button>
            
            <button
              onClick={() => onIndexChange && onIndexChange(currentIndex + 1)}
              disabled={currentIndex === playlist.length - 1}
              className="back-btn"
              style={{
                flex: 1,
                height: "36px",
                opacity: currentIndex === playlist.length - 1 ? 0.4 : 1,
                cursor: currentIndex === playlist.length - 1 ? "not-allowed" : "pointer",
                justifyContent: "center"
              }}
            >
              Вперед →
            </button>
          </div>
        )}

        {/* Название тренировки */}
        <div style={{ marginTop: "6px", marginBottom: "2px" }} className="shrink-0">
          <h2 className="text-base font-bold text-gray-800" style={{ margin: 0 }}>
            {workout.title}
          </h2>
          {nextWorkout && (
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", fontStyle: "italic", marginTop: "2px" }}>
              Далее: {nextWorkout.title}
            </div>
          )}
        </div>

        {/* Панель времени (Время упражнения и Общее время всей тренировки) */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
          padding: "12px 0",
          margin: "12px 0",
          textAlign: "center"
        }} className="shrink-0">
          <div style={{ borderRight: "1px solid var(--color-border)" }}>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-secondary)", fontWeight: "600", marginBottom: "4px" }}>
              Время упражнения
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-text)" }}>
              {workout.duration || "15 мин"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-text-secondary)", fontWeight: "600", marginBottom: "4px" }}>
              Общее время
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-text)" }}>
              {totalDurationMin ? `${totalDurationMin} мин` : (workout.duration || "15 мин")}
            </div>
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
          {isLastExercise && (
            <button
              id="btn-complete-workout"
              className="w-full bg-[#222222] hover:bg-black text-white text-sm font-semibold py-3.5 px-4 min-h-[48px] rounded-xl transition-colors duration-150 flex items-center justify-center gap-1.5 shrink-0"
              onClick={handleComplete}
            >
              ✓ Завершить тренировку
            </button>
          )}
          
          <button
            id="btn-close-modal"
            onClick={handleClosePlayer}
            className="w-full bg-transparent hover:bg-gray-50 text-gray-500 hover:text-gray-700 text-sm font-semibold py-3.5 px-4 min-h-[48px] rounded-xl border border-gray-200 transition-colors duration-150 flex items-center justify-center shrink-0"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
