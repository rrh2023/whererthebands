// src/components/Dashboard/LocationSearch.jsx
import { useState } from "react";

export default function LocationSearch({ onSearch, loading }) {
  const [city, setCity] = useState("");
  const [radius, setRadius] = useState(25);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    onSearch({ city: city.trim(), radius });
  };

  const radii = [10, 25, 50, 100];

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        padding: "20px 24px",
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        alignItems: "flex-end",
      }}
    >
      {/* City input */}
      <div style={{ flex: "1 1 200px", minWidth: "160px" }}>
        <label
          style={{
            display: "block",
            fontSize: "0.55rem",
            letterSpacing: "0.25em",
            color: "var(--muted)",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          City / ZIP
        </label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="New York, NY"
          required
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            borderBottom: "1px solid var(--border)",
            padding: "10px 0",
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.9rem",
            color: "var(--text)",
            outline: "none",
            letterSpacing: "0.05em",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderBottomColor = "var(--gold)")}
          onBlur={(e) => (e.target.style.borderBottomColor = "var(--border)")}
        />
      </div>

      {/* Radius selector */}
      <div style={{ flex: "0 0 auto" }}>
        <label
          style={{
            display: "block",
            fontSize: "0.55rem",
            letterSpacing: "0.25em",
            color: "var(--muted)",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          Radius
        </label>
        <div style={{ display: "flex", gap: "6px" }}>
          {radii.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRadius(r)}
              style={{
                background: radius === r ? "var(--gold)" : "transparent",
                color: radius === r ? "#000" : "var(--muted)",
                border: `1px solid ${radius === r ? "var(--gold)" : "var(--border)"}`,
                padding: "8px 12px",
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.7rem",
                cursor: "pointer",
                letterSpacing: "0.05em",
                transition: "all 0.15s",
              }}
            >
              {r}mi
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        style={{
          background: loading ? "var(--border)" : "var(--gold)",
          color: loading ? "var(--muted)" : "#000",
          border: "none",
          padding: "10px 28px",
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "1rem",
          letterSpacing: "0.2em",
          cursor: loading ? "not-allowed" : "pointer",
          flex: "0 0 auto",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          whiteSpace: "nowrap",
        }}
      >
        {loading ? (
          <>
            <span
              style={{
                width: "12px",
                height: "12px",
                border: "2px solid var(--muted)",
                borderTopColor: "transparent",
                borderRadius: "50%",
                display: "inline-block",
                animation: "spin 0.8s linear infinite",
              }}
            />
            SEARCHING...
          </>
        ) : (
          "FIND SHOWS →"
        )}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}