import React from "react";

const flagDesigns = {
  BY: ["#C8313E", "#1E8E45"], RU: ["#FFFFFF", "#2455A6", "#D52B1E"],
  AE: ["#00732F", "#FFFFFF", "#000000"], ME: ["#C8102E"], KZ: ["#45BCE5"],
  UA: ["#1E78C8", "#FFD700"], DE: ["#171717", "#D52B1E", "#FFCE00"],
  CY: ["#FFFFFF"], TR: ["#E30A17"], RS: ["#C6363C", "#244AA5", "#FFFFFF"],
  TH: ["#C8102E", "#FFFFFF", "#2D2A8A", "#FFFFFF", "#C8102E"],
  AZ: ["#00B5E2", "#E11B22", "#00A651"], AM: ["#D90012", "#0033A0", "#F2A800"],
  GE: ["#FFFFFF"], IL: ["#FFFFFF"], KG: ["#E8112D"], LV: ["#9E3039", "#FFFFFF", "#9E3039"],
  LT: ["#FDB913", "#006A44", "#C1272D"], MD: ["#003DA5", "#FFD100", "#C8102E"],
  PL: ["#FFFFFF", "#DC143C"], US: ["#B22234", "#FFFFFF", "#B22234", "#FFFFFF", "#B22234"],
  TJ: ["#CC0000", "#FFFFFF", "#009739"], TM: ["#007A33"], UZ: ["#1EB5E9", "#FFFFFF", "#1EB53A"],
  EE: ["#4891D9", "#171717", "#FFFFFF"],
};

export default function CountryFlag({ code, size = 22 }) {
  const colors = flagDesigns[code] || ["#E5E7EB"];
  const stripeHeight = 24 / colors.length;
  const isUae = code === "AE";
  const isMoldova = code === "MD";
  const isUs = code === "US";

  return (
    <svg
      width={size}
      height={Math.round(size * 0.72)}
      viewBox="0 0 36 24"
      role="img"
      aria-label={`Flag of ${code}`}
      style={{ display: "block", borderRadius: "4px", boxShadow: "0 1px 2px rgba(0,0,0,.18)", overflow: "hidden", flexShrink: 0 }}
    >
      {isUae ? (
        <>
          <rect width="9" height="24" fill="#EF3340" />
          {colors.map((color, index) => <rect key={color} x="9" y={index * 8} width="27" height="8" fill={color} />)}
        </>
      ) : isMoldova ? (
        <>
          {colors.map((color, index) => <rect key={color} x={index * 12} width="12" height="24" fill={color} />)}
          <circle cx="18" cy="12" r="3.2" fill="#8B5E00" />
        </>
      ) : isUs ? (
        <>
          {colors.map((color, index) => <rect key={`${color}-${index}`} y={index * stripeHeight} width="36" height={stripeHeight} fill={color} />)}
          <rect width="15" height="12" fill="#3C3B6E" />
        </>
      ) : (
        colors.map((color, index) => <rect key={`${color}-${index}`} y={index * stripeHeight} width="36" height={stripeHeight} fill={color} />)
      )}
      {code === "ME" && <circle cx="18" cy="12" r="4" fill="#F6C344" />}
      {code === "KZ" && <circle cx="18" cy="12" r="4" fill="#F6C344" />}
      {code === "CY" && <ellipse cx="18" cy="12" rx="6" ry="2.5" fill="#C69214" />}
      {code === "TR" && <text x="12" y="16" fontSize="13" fill="#fff">☾</text>}
      {code === "AZ" && <text x="14" y="16" fontSize="12" fill="#fff">☾</text>}
      {code === "IL" && <path d="M18 6l4 7h-8zm0 12l-4-7h8z" fill="#1E5AA8" />}
      {code === "GE" && <path d="M16 3h4v7h7v4h-7v7h-4v-7H9v-4h7z" fill="#E2231A" />}
    </svg>
  );
}
