// src/components/Onboarding/GenreSelect.jsx
import { useState } from "react";

const GENRES = [
  { name: "Indie Rock", emoji: "🎸", color: "#e74c3c" },
  { name: "Electronic", emoji: "⚡", color: "#00e5cc" },
  { name: "Hip-Hop", emoji: "🎤", color: "#f0a500" },
  { name: "Jazz", emoji: "🎷", color: "#9b59b6" },
  { name: "Metal", emoji: "🤘", color: "#e74c3c" },
  { name: "Folk", emoji: "🪕", color: "#27ae60" },
  { name: "Pop", emoji: "✨", color: "#e91e63" },
  { name: "R&B / Soul", emoji: "🎶", color: "#ff9800" },
  { name: "Country", emoji: "🤠", color: "#795548" },
  { name: "Punk", emoji: "⚡", color: "#f44336" },
  { name: "Classical", emoji: "🎻", color: "#607d8b" },
  { name: "Reggae", emoji: "🌿", color: "#4caf50" },
  { name: "Blues", emoji: "🎵", color: "#1565c0" },
  { name: "Alternative", emoji: "🔊", color: "#00bcd4" },
  { name: "Latin", emoji: "🎺", color: "#ff5722" },
  { name: "Experimental", emoji: "🔭", color: "#7c3aed" },
];

export default function GenreSelect({ onComplete }) {
  const [selected, setSelected] = useState([]);
  const [animating, setAnimating] = useState(false);

  const toggle = (genre) => {
    setSelected((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : prev.length < 6
        ? [...prev, genre]
        : prev
    );
  };

  const handleContinue = () => {
    if (selected.length < 1) return;
    setAnimating(true);
    setTimeout(() => onComplete(selected), 400);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        maxWidth: "640px",
        margin: "0 auto",
        padding: "4rem 2rem 6rem",
        opacity: animating ? 0 : 1,
        transform: animating ? "translateY(-20px)" : "translateY(0)",
        transition: "all 0.4s ease",
      }}
    >
      {/* Header */}
      <div className="animate-fadeUp" style={{ marginBottom: "3rem" }}>
        <div
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.3em",
            color: "var(--gold)",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}
        >
          ◆ Step 1 of 1
        </div>
        <h1
          className="font-display"
          style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)", lineHeight: 0.9, marginBottom: "1rem" }}
        >
          WHAT DO YOU
          <br />
          <span style={{ color: "var(--gold)" }}>LISTEN TO?</span>
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.75rem", letterSpacing: "0.08em", lineHeight: 1.7 }}>
          Pick up to 6 genres. Claude will use these to find
          <br />
          shows you'll actually want to go to.
        </p>
      </div>

      {/* Genre Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "10px",
          marginBottom: "3rem",
        }}
      >
        {GENRES.map((genre, i) => {
          const isSelected = selected.includes(genre.name);
          return (
            <button
              key={genre.name}
              onClick={() => toggle(genre.name)}
              className="animate-fadeUp"
              style={{
                animationDelay: `${i * 30}ms`,
                background: isSelected ? genre.color : "var(--card)",
                border: `1px solid ${isSelected ? genre.color : "var(--border)"}`,
                color: isSelected ? "#000" : "var(--text)",
                padding: "14px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "6px",
                cursor: !isSelected && selected.length >= 6 ? "not-allowed" : "pointer",
                opacity: !isSelected && selected.length >= 6 ? 0.4 : 1,
                transition: "all 0.2s",
                textAlign: "left",
                transform: isSelected ? "scale(1.02)" : "scale(1)",
              }}
              onMouseEnter={(e) => {
                if (!isSelected && selected.length < 6)
                  e.currentTarget.style.borderColor = genre.color;
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{genre.emoji}</span>
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "0.7rem",
                  letterSpacing: "0.05em",
                  fontWeight: isSelected ? "500" : "300",
                }}
              >
                {genre.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "1.5rem 2rem",
          background: "linear-gradient(to top, var(--bg) 70%, transparent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
        }}
      >
        <div style={{ color: "var(--muted)", fontSize: "0.7rem", letterSpacing: "0.1em" }}>
          {selected.length > 0 ? (
            <span style={{ color: "var(--gold)" }}>
              {selected.length} selected {selected.length >= 6 && "(max)"}
            </span>
          ) : (
            "Select at least 1 genre"
          )}
        </div>

        <button
          onClick={handleContinue}
          disabled={selected.length < 1}
          style={{
            background: selected.length >= 1 ? "var(--gold)" : "var(--border)",
            color: selected.length >= 1 ? "#000" : "var(--muted)",
            border: "none",
            padding: "14px 32px",
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "1rem",
            letterSpacing: "0.2em",
            cursor: selected.length >= 1 ? "pointer" : "not-allowed",
            transition: "all 0.3s",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          FIND MY SHOWS →
        </button>
      </div>
    </div>
  );
}