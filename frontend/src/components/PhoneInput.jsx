import React, { useState, useRef, useEffect } from "react";
import { countries } from "../data/countries";
import { useLanguage } from "../context/LanguageContext";
import CountryFlag from "./CountryFlag";

/**
 * PhoneInput — Переиспользуемый компонент ввода международного телефона
 * с плавающим селектором стран (крупные флаги + названия + телефонные коды).
 */
export default function PhoneInput({
  dialCode,
  onDialCodeChange,
  phoneNumber,
  onPhoneNumberChange,
  id = "input-phone",
  disabled = false,
  style = {},
}) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentCountry =
    countries.find((c) => c.dialCode === dialCode) || countries[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", ...style }} ref={dropdownRef}>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {/* Кнопка выбора страны: Флаг + Код + Иконка выпадающего списка */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="form-field__input"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "0 14px",
            height: "48px",
            borderRadius: "16px",
            cursor: disabled ? "not-allowed" : "pointer",
            backgroundColor: "#fff",
            border: "1px solid var(--color-border)",
            fontSize: "14px",
            fontFamily: "'Manrope', sans-serif",
            fontWeight: "700",
            color: "var(--color-text)",
            whiteSpace: "nowrap",
            flexShrink: 0,
            width: "auto",
            marginBottom: 0,
          }}
        >
          <CountryFlag code={currentCountry.code} />
          <span>{currentCountry.dialCode}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Поле ввода телефонного номера */}
        <input
          id={id}
          type="tel"
          placeholder={currentCountry.placeholder || "(29) 000-00-00"}
          value={phoneNumber}
          disabled={disabled}
          onChange={(e) => onPhoneNumberChange(e.target.value)}
          className="form-field__input"
          style={{
            flex: 1,
            minWidth: 0,
            height: "48px",
            borderRadius: "16px",
            fontSize: "14px",
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 500,
            marginBottom: 0,
          }}
        />
      </div>

      {/* Выпадающее меню с флагами стран */}
      {isOpen && !disabled && (
        <div
          className="no-scrollbar"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            maxHeight: "230px",
            overflowY: "auto",
            backgroundColor: "#fff",
            borderRadius: "16px",
            boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
            border: "1px solid var(--color-border)",
            zIndex: 1000,
            padding: "6px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {countries.map((c, i) => {
            const isSelected = c.code === currentCountry.code && c.dialCode === dialCode;
            return (
              <button
                key={`${c.code}-${c.dialCode}-${i}`}
                type="button"
                onClick={() => {
                  onDialCodeChange(c.dialCode);
                  setIsOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: isSelected ? "rgba(27, 171, 124, 0.08)" : "transparent",
                  color: isSelected ? "var(--color-active)" : "var(--color-text)",
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: isSelected ? "700" : "500",
                  fontSize: "13.5px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = "#F7F9F8";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <CountryFlag code={c.code} size={24} />
                  <span>{t(c.name)}</span>
                </div>
                <span style={{ color: "var(--color-text-secondary)", fontWeight: "600", fontSize: "13px" }}>
                  {c.dialCode}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
