// src/components/Auth/Login.jsx
import { useState } from "react";
  import { signIn, signOut } from '../../services/cognito';

const inputStyle = {
  width: "100%",
  background: "transparent",
  border: "none",
  borderBottom: "1px solid var(--border)",
  padding: "14px 0",
  fontFamily: "'DM Mono', monospace",
  fontSize: "0.85rem",
  color: "var(--text)",
  outline: "none",
  letterSpacing: "0.05em",
  transition: "border-color 0.2s",
};

export default function Login({ onLogin, onGoSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  try {
    await signOut(); // clear any existing session first
    await signIn({ username: email, password });
    onLogin({ email, isNew: false });
  } catch (err) {
    setError(err.message || "Login failed.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background text */}
      <div
        className="font-display"
        style={{
          position: "absolute",
          bottom: "-1rem",
          left: "-1rem",
          fontSize: "clamp(6rem, 20vw, 18rem)",
          color: "transparent",
          WebkitTextStroke: "1px #1e1e1e",
          lineHeight: 0.85,
          userSelect: "none",
          pointerEvents: "none",
          letterSpacing: "-0.02em",
        }}
      >
        LIVE
        <br />
        MUSIC
        <br />
        NOW
      </div>

      {/* Gold accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          width: "1px",
          height: "30vh",
          background: "linear-gradient(to bottom, var(--gold), transparent)",
          opacity: 0.4,
        }}
      />

      <div
        className="animate-fadeUp"
        style={{
          width: "100%",
          maxWidth: "380px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: "3rem" }}>
          <h1
            className="font-display"
            style={{
              fontSize: "3.5rem",
              lineHeight: 0.9,
              marginBottom: "0.5rem",
            }}
          >
            WHERE<span style={{ color: "var(--gold)" }}>R</span>
            <br />
            THE
            <span style={{ color: "var(--cyan)" }}>BANDS</span>
            <span style={{ color: "var(--muted)" }}>?</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.75rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.6rem",
                letterSpacing: "0.25em",
                color: "var(--muted)",
                textTransform: "uppercase",
                marginBottom: "0.25rem",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="you@example.com"
              required
              onFocus={(e) => (e.target.style.borderBottomColor = "var(--gold)")}
              onBlur={(e) => (e.target.style.borderBottomColor = "var(--border)")}
            />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.6rem",
                letterSpacing: "0.25em",
                color: "var(--muted)",
                textTransform: "uppercase",
                marginBottom: "0.25rem",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="••••••••"
              required
              onFocus={(e) => (e.target.style.borderBottomColor = "var(--gold)")}
              onBlur={(e) => (e.target.style.borderBottomColor = "var(--border)")}
            />
          </div>

          {error && (
            <p
              style={{
                color: "var(--red)",
                fontSize: "0.7rem",
                letterSpacing: "0.05em",
                marginBottom: "1rem",
              }}
            >
              ⚠ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "var(--gold)",
              color: "#000",
              border: "none",
              padding: "14px",
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.1rem",
              letterSpacing: "0.2em",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "all 0.2s",
              animation: !loading ? "pulse-gold 2.5s infinite" : "none",
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#ffc107")}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.background = "var(--gold)")}
          >
            {loading ? "SIGNING IN..." : "LET'S GO →"}
          </button>
        </form>

        <p
          style={{
            marginTop: "2rem",
            color: "var(--muted)",
            fontSize: "0.7rem",
            textAlign: "center",
            letterSpacing: "0.05em",
          }}
        >
          No account?{" "}
          <button
            onClick={onGoSignup}
            style={{
              background: "none",
              border: "none",
              color: "var(--cyan)",
              cursor: "pointer",
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.7rem",
              textDecoration: "underline",
              letterSpacing: "0.05em",
            }}
          >
            Sign up free
          </button>
        </p>
      </div>
    </div>
  );
}