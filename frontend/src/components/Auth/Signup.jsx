// src/components/Auth/Signup.jsx
import { useState } from "react";
import { signUp, confirmSignUp } from "../../services/cognito";

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

const labelStyle = {
  display: "block",
  fontSize: "0.6rem",
  letterSpacing: "0.25em",
  color: "var(--muted)",
  textTransform: "uppercase",
  marginBottom: "0.25rem",
};

export default function Signup({ onSignup, onGoLogin }) {
  const [step, setStep] = useState("register"); // "register" | "confirm"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signUp({ username: email, password });
      setStep("confirm");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      onSignup({ email, isNew: true });
    } catch (err) {
      setError(err.message || "Confirmation failed.");
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
      {/* Background decoration */}
      <div
        className="font-display"
        style={{
          position: "absolute",
          top: "-2rem",
          right: "-2rem",
          fontSize: "clamp(5rem, 18vw, 16rem)",
          color: "transparent",
          WebkitTextStroke: "1px #1a1a1a",
          lineHeight: 0.85,
          userSelect: "none",
          pointerEvents: "none",
          textAlign: "right",
        }}
      >
        JOIN
        <br />
        THE
        <br />
        CROWD
      </div>

      <div
        className="animate-fadeUp"
        style={{ width: "100%", maxWidth: "380px", position: "relative", zIndex: 1 }}
      >
        {/* Step indicator */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "2.5rem",
            alignItems: "center",
          }}
        >
          {["register", "confirm"].map((s, i) => (
            <div
              key={s}
              style={{
                height: "2px",
                flex: 1,
                background: step === s || (s === "register" && step === "confirm")
                  ? "var(--gold)"
                  : "var(--border)",
                transition: "background 0.4s",
              }}
            />
          ))}
          <span style={{ fontSize: "0.6rem", color: "var(--muted)", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
            {step === "register" ? "1 / 2" : "2 / 2"}
          </span>
        </div>

        <h2
          className="font-display"
          style={{ fontSize: "2.5rem", marginBottom: "0.5rem", lineHeight: 1 }}
        >
          {step === "register" ? "CREATE ACCOUNT" : "CHECK YOUR EMAIL"}
        </h2>
        <p style={{ color: "var(--muted)", fontSize: "0.7rem", letterSpacing: "0.08em", marginBottom: "2.5rem" }}>
          {step === "register"
            ? "Free forever. No spam. Just shows."
            : `We sent a 6-digit code to ${email}`}
        </p>

        {step === "register" ? (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: "1.75rem" }}>
              <label style={labelStyle}>Email</label>
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
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                placeholder="min 8 characters"
                required
                minLength={8}
                onFocus={(e) => (e.target.style.borderBottomColor = "var(--gold)")}
                onBlur={(e) => (e.target.style.borderBottomColor = "var(--border)")}
              />
            </div>

            {/* Password strength bar */}
            <div style={{ height: "2px", background: "var(--border)", marginBottom: "2rem" }}>
              <div
                style={{
                  height: "100%",
                  width: password.length === 0 ? "0%" : password.length < 8 ? "33%" : password.length < 12 ? "66%" : "100%",
                  background: password.length < 8 ? "var(--red)" : password.length < 12 ? "var(--gold)" : "var(--cyan)",
                  transition: "all 0.3s",
                }}
              />
            </div>

            {error && <p style={{ color: "var(--red)", fontSize: "0.7rem", marginBottom: "1rem" }}>⚠ {error}</p>}

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
              }}
            >
              {loading ? "CREATING..." : "CREATE ACCOUNT →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirm}>
            <div style={{ marginBottom: "2rem" }}>
              <label style={labelStyle}>Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                style={{ ...inputStyle, fontSize: "2rem", letterSpacing: "0.5em" }}
                placeholder="000000"
                maxLength={6}
                required
                onFocus={(e) => (e.target.style.borderBottomColor = "var(--cyan)")}
                onBlur={(e) => (e.target.style.borderBottomColor = "var(--border)")}
              />
            </div>

            {error && <p style={{ color: "var(--red)", fontSize: "0.7rem", marginBottom: "1rem" }}>⚠ {error}</p>}

            <button
              type="submit"
              disabled={loading || code.length < 6}
              style={{
                width: "100%",
                background: "var(--cyan)",
                color: "#000",
                border: "none",
                padding: "14px",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "1.1rem",
                letterSpacing: "0.2em",
                cursor: loading || code.length < 6 ? "not-allowed" : "pointer",
                opacity: loading || code.length < 6 ? 0.5 : 1,
                transition: "all 0.2s",
              }}
            >
              {loading ? "VERIFYING..." : "VERIFY & ENTER →"}
            </button>
          </form>
        )}

        <p style={{ marginTop: "2rem", color: "var(--muted)", fontSize: "0.7rem", textAlign: "center" }}>
          Already have an account?{" "}
          <button
            onClick={onGoLogin}
            style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", textDecoration: "underline" }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}