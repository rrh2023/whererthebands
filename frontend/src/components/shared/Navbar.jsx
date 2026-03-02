// src/components/shared/Navbar.jsx
export default function Navbar({ user, onLogout }) {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "1px solid var(--border)",
        background: "rgba(8,8,8,0.92)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
        height: "60px",
      }}
    >
      {/* Wordmark */}
      <div
        className="font-display"
        style={{ fontSize: "1.5rem", letterSpacing: "0.12em", color: "#fff" }}
      >
        WHERE
        <span style={{ color: "var(--gold)" }}>R</span>
        THE
        <span style={{ color: "var(--cyan)" }}>BANDS</span>
        <span style={{ color: "var(--muted)", fontSize: "0.6rem", marginLeft: "6px", verticalAlign: "middle", fontFamily: "'DM Mono', monospace", letterSpacing: "0.2em" }}>
          ?
        </span>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        {user && (
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.7rem",
              color: "var(--muted)",
              letterSpacing: "0.1em",
            }}
          >
            {user.email?.split("@")[0] ?? "listener"}
          </span>
        )}
        <button
          onClick={onLogout}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--muted)",
            padding: "6px 14px",
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.65rem",
            letterSpacing: "0.15em",
            cursor: "pointer",
            transition: "all 0.2s",
            textTransform: "uppercase",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--red)";
            e.currentTarget.style.color = "var(--red)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--muted)";
          }}
        >
          LOGOUT
        </button>
      </div>
    </nav>
  );
}