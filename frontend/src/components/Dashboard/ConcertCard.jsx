// src/components/Dashboard/ConcertCard.jsx
import { useState } from "react";

export default function ConcertCard({ event, recommendation, index }) {
  const [flipped, setFlipped] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!event || !event.date) return null;

  const score = recommendation?.match_score ?? null;
  const scoreColor =
    score >= 9 ? "var(--cyan)" : score >= 7 ? "var(--gold)" : "var(--muted)";

  const vibeTags = recommendation?.vibe_tags ?? [];
  const explanation = recommendation?.explanation ?? null;

  const dateObj = event.date ? new Date(event.date + "T00:00:00") : null;
  const month = dateObj
    ? dateObj.toLocaleString("en-US", { month: "short" }).toUpperCase()
    : "—";
  const day = dateObj ? dateObj.getDate() : "—";
  const weekday = dateObj
    ? dateObj.toLocaleString("en-US", { weekday: "short" }).toUpperCase()
    : "";

  return (
    <div
      style={{
        animationDelay: `${index * 80}ms`,
        perspective: "1000px",
      }}
      className="animate-fadeUp"
    >
      <div
        style={{
          position: "relative",
          transformStyle: "preserve-3d",
          transition: "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          height: "280px",
          cursor: "pointer",
        }}
        onClick={() => setFlipped((f) => !f)}
      >
        {/* ── FRONT ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: "var(--card)",
            border: "1px solid var(--border)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Image */}
          <div style={{ position: "relative", height: "130px", flexShrink: 0, background: "#111" }}>
            {event.image && (
              <img
                src={event.image}
                alt={event.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.7,
                  filter: "saturate(0.6) contrast(1.1)",
                }}
              />
            )}
            {/* Score badge */}
            {score !== null && (
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "rgba(0,0,0,0.85)",
                  border: `1px solid ${scoreColor}`,
                  padding: "4px 10px",
                  display: "flex",
                  alignItems: "baseline",
                  gap: "2px",
                }}
              >
                <span
                  className="font-display"
                  style={{ fontSize: "1.4rem", color: scoreColor, lineHeight: 1 }}
                >
                  {score}
                </span>
                <span style={{ fontSize: "0.5rem", color: "var(--muted)", letterSpacing: "0.1em" }}>
                  /10
                </span>
              </div>
            )}
            {/* Genre tag */}
            {event.genre && (
              <div
                style={{
                  position: "absolute",
                  bottom: "10px",
                  left: "10px",
                  background: "rgba(0,0,0,0.8)",
                  border: "1px solid var(--border)",
                  padding: "3px 8px",
                  fontSize: "0.55rem",
                  letterSpacing: "0.2em",
                  color: "var(--muted)",
                  textTransform: "uppercase",
                }}
              >
                {event.genre}
              </div>
            )}
          </div>

          {/* Content */}
          <div
            style={{
              padding: "14px 16px",
              flex: 1,
              display: "flex",
              gap: "14px",
              overflow: "hidden",
            }}
          >
            {/* Date column */}
            <div
              style={{
                flexShrink: 0,
                borderRight: "1px solid var(--border)",
                paddingRight: "14px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "44px",
              }}
            >
              <span style={{ fontSize: "0.55rem", color: "var(--gold)", letterSpacing: "0.15em" }}>{month}</span>
              <span className="font-display" style={{ fontSize: "1.8rem", lineHeight: 1, color: "#fff" }}>
                {day}
              </span>
              <span style={{ fontSize: "0.5rem", color: "var(--muted)", letterSpacing: "0.1em" }}>{weekday}</span>
            </div>

            {/* Main info */}
            <div style={{ flex: 1, overflow: "hidden" }}>
              <h3
                className="font-ui"
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1.2,
                  marginBottom: "4px",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {event.name}
              </h3>
              <p style={{ fontSize: "0.65rem", color: "var(--muted)", letterSpacing: "0.05em", marginBottom: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                📍 {event.venue}
              </p>
              {/* Vibe tags */}
              {vibeTags.length > 0 && (
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  {vibeTags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        background: "rgba(0,229,204,0.08)",
                        border: "1px solid rgba(0,229,204,0.2)",
                        color: "var(--cyan)",
                        padding: "2px 7px",
                        fontSize: "0.55rem",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Flip hint */}
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              right: "12px",
              fontSize: "0.55rem",
              color: "var(--border)",
              letterSpacing: "0.1em",
            }}
          >
            TAP FOR WHY →
          </div>
        </div>

        {/* ── BACK (AI explanation) ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "#0f0f0f",
            border: "1px solid var(--gold)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.55rem",
                letterSpacing: "0.25em",
                color: "var(--gold)",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              ◆ Claude says
            </div>
            <p
              style={{
                color: "var(--text)",
                fontSize: "0.78rem",
                lineHeight: 1.75,
                fontStyle: "italic",
              }}
            >
              {explanation ?? "No AI explanation available for this show."}
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
            <a
              href={event.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                flex: 1,
                background: "var(--gold)",
                color: "#000",
                textDecoration: "none",
                textAlign: "center",
                padding: "10px",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "0.85rem",
                letterSpacing: "0.15em",
              }}
            >
              GET TICKETS →
            </a>
            <button
              onClick={(e) => { e.stopPropagation(); setSaved((s) => !s); }}
              style={{
                background: saved ? "rgba(0,229,204,0.15)" : "transparent",
                border: `1px solid ${saved ? "var(--cyan)" : "var(--border)"}`,
                color: saved ? "var(--cyan)" : "var(--muted)",
                padding: "10px 14px",
                cursor: "pointer",
                fontSize: "0.9rem",
                transition: "all 0.2s",
              }}
            >
              {saved ? "♥" : "♡"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}