import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

/**
 * WorkoutModal — модальное окно «плеера» тренировки.
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

  const { t, currentLang } = useLanguage();
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
            gap: "6px",
            paddingBottom: "12px",
            marginBottom: "12px",
            borderBottom: "1px solid var(--color-border)",
            width: "100%"
          }}>
            {playlist.map((item, idx) => {
              const isCurrent = idx === currentIndex;
              const isPassed = idx < currentIndex;
              
              let bgColor = "#ECECE9"; // Предстоящие этапы
              if (isPassed) {
                bgColor = "#007F63"; // Пройденный этап
              } else if (isCurrent) {
                bgColor = "#1BAB7C"; // Активный этап
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
                    transition: "all 0.2s ease",
                    boxShadow: isCurrent ? "0 0 6px rgba(27, 171, 124, 0.4)" : "none"
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
            marginBottom: "8px",
            border: "1.5px solid #a6a6a1",
            backgroundColor: "#fff",
            color: "var(--color-text)",
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 600,
            borderRadius: "12px"
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
          <span>{t("К списку")}</span>
        </button>

        {/* Видеоплеер тренировки (реальное видео или заглушка) */}
        <div className="modal__player shrink-0" id="modal-player" style={{
          height: "180px",
          position: "relative",
          borderRadius: "20px",
          overflow: "hidden",
          background: workout.video
            ? "#000"
            : "repeating-linear-gradient(135deg, #E9EBEA, #E9EBEA 11px, #F1F3F2 11px, #F1F3F2 22px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(0,127,99,.08)",
          boxShadow: "inset 0 0 20px rgba(0,0,0,0.03)"
        }}>
          {workout.video ? (
            <video
              key={workout.id}
              src={workout.video}
              controls
              playsInline
              preload="metadata"
              style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
            />
          ) : !isPlaying ? (
            <div style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(255, 255, 255, 0.94)",
              borderRadius: "inherit",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              color: "var(--color-text-secondary)"
            }}>
              <span style={{ fontSize: "14px", fontFamily: "'Manrope', sans-serif", fontWeight: "700", color: "var(--color-text)" }}>
                {t("Тренировка приостановлена")}
              </span>
              <button
                onClick={() => setIsPlaying(true)}
                style={{
                  border: "none",
                  cursor: "pointer",
                  background: "#1BAB7C",
                  color: "#fff",
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: "12px",
                  padding: "8px 18px",
                  borderRadius: "999px",
                  boxShadow: "0 6px 14px -4px rgba(27,171,124,.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {t("▶ Продолжить")}
              </button>
            </div>
          ) : (
            <>
              <div style={{
                width: "54px",
                height: "54px",
                borderRadius: "16px",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 16px -6px rgba(27,171,124,.4)"
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1BAB7C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" fill="#1BAB7C" />
                </svg>
              </div>
              <span style={{ fontSize: "11px", fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", color: "var(--color-text-secondary)", marginTop: "12px", letterSpacing: ".3px" }}>
                [{currentLang === "EN" ? "Video Player — Playing" : "Видеоплеер — воспроизведение"}]
              </span>
            </>
          )}
        </div>

        {/* Элементы управления воспроизведением плейлиста */}
        {playlist.length > 0 && currentIndex >= 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", width: "100%", marginTop: "2px" }}>
            <button
              onClick={() => onIndexChange && onIndexChange(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="back-btn"
              style={{
                flex: 1,
                height: "38px",
                opacity: currentIndex === 0 ? 0.4 : 1,
                cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                justifyContent: "center",
                borderRadius: "12px",
                border: "1.5px solid #a6a6a1",
                backgroundColor: "#fff",
                color: "var(--color-text)"
              }}
            >
              ← {t("Назад")}
            </button>
            
            {!workout.video && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                flex: 1.2,
                height: "38px",
                backgroundColor: isPlaying ? "#ECECE9" : "#1BAB7C",
                color: isPlaying ? "var(--color-text)" : "#fff",
                fontWeight: "700",
                fontFamily: "'Manrope', sans-serif",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                boxShadow: isPlaying ? "none" : "0 4px 12px -3px rgba(27,171,124,.5)"
              }}
            >
              {isPlaying ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                  <span>{t("Пауза")}</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>{t("Старт")}</span>
                </>
              )}
            </button>
            )}

            <button
              onClick={() => onIndexChange && onIndexChange(currentIndex + 1)}
              disabled={currentIndex === playlist.length - 1}
              className="back-btn"
              style={{
                flex: 1,
                height: "38px",
                opacity: currentIndex === playlist.length - 1 ? 0.4 : 1,
                cursor: currentIndex === playlist.length - 1 ? "not-allowed" : "pointer",
                justifyContent: "center",
                borderRadius: "12px",
                border: "1.5px solid #a6a6a1",
                backgroundColor: "#fff",
                color: "var(--color-text)"
              }}
            >
              {t("Вперед")} →
            </button>
          </div>
        )}

        {/* Название тренировки */}
        <div style={{ marginTop: "6px", marginBottom: "2px" }} className="shrink-0">
          <h2 style={{ margin: 0, fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "18px", color: "var(--color-text)" }}>
            {currentLang === "EN" ? (workout.title_en || t(workout.title)) : (workout.title_ru || workout.title)}
          </h2>
          {nextWorkout && (
            <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", fontStyle: "italic", marginTop: "4px", fontWeight: 300 }}>
              {t("Далее")}: {currentLang === "EN" ? (nextWorkout.title_en || t(nextWorkout.title)) : (nextWorkout.title_ru || nextWorkout.title)}
            </div>
          )}
        </div>

        {/* Панель времени (Время упражнения и Общее время всей тренировки) */}
        {playlist.length > 0 && playlist[0].id >= 101 && (
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
              <div style={{ fontSize: "10px", fontFamily: "'Manrope', sans-serif", letterSpacing: ".5px", textTransform: "uppercase", color: "var(--color-text-secondary)", fontWeight: "700", marginBottom: "4px" }}>
                {t("Время упражнения")}
              </div>
              <div style={{ fontSize: "16px", fontFamily: "'Manrope', sans-serif", fontWeight: "800", color: "var(--color-text)" }}>
                {workout.duration || "15 мин"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "10px", fontFamily: "'Manrope', sans-serif", letterSpacing: ".5px", textTransform: "uppercase", color: "var(--color-text-secondary)", fontWeight: "700", marginBottom: "4px" }}>
                {t("Общее время")}
              </div>
              <div style={{ fontSize: "16px", fontFamily: "'Manrope', sans-serif", fontWeight: "800", color: "var(--color-text)" }}>
                {totalDurationMin ? `${totalDurationMin} мин` : (workout.duration || "15 мин")}
              </div>
            </div>
          </div>
        )}

        {/* Блок: О методике */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", margin: "8px 0" }}>
          <h4 style={{ margin: 0, fontSize: "10px", fontFamily: "'Manrope', sans-serif", fontWeight: "800", textTransform: "uppercase", color: "var(--color-text-secondary)", letterSpacing: ".8px" }}>
            {t("О методике")}
          </h4>
          <p style={{ margin: 0, fontSize: "13.5px", lineHeight: "1.6", color: "#4a4a4a", fontWeight: 300 }}>
            {t(aboutText)}
          </p>
        </div>

        {/* Действия */}
        <div className="modal__actions" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {isLastExercise && (
            <button
              id="btn-complete-workout"
              style={{
                display: "flex",
                width: "100%",
                border: "none",
                cursor: "pointer",
                background: "#1BAB7C",
                color: "#fff",
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700,
                fontSize: "15px",
                padding: "14px",
                borderRadius: "16px",
                boxShadow: "0 8px 20px -8px rgba(27,171,124,.6)",
                alignItems: "center",
                gap: "8px",
                justifyContent: "center",
                transition: "background-color 0.15s ease"
              }}
              onClick={handleComplete}
            >
              {t("✓ Завершить тренировку")}
            </button>
          )}
          
          <button
            id="btn-close-modal"
            onClick={handleClosePlayer}
            style={{
              display: "flex",
              width: "100%",
              border: "1.5px solid #a6a6a1",
              cursor: "pointer",
              background: "transparent",
              color: "var(--color-text)",
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
          >
            {t("Закрыть")}
          </button>
        </div>
      </div>
    </div>
  );
}
