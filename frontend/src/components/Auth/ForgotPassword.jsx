// src/components/Auth/ForgotPassword.jsx
import { useState } from "react";
import { resetPassword, confirmResetPassword } from "../../services/cognito";

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

export default function ForgotPassword({ onGoLogin }) {
  const [step, setStep]           = useState("request"); // "request" | "reset"
  const [email, setEmail]         = useState("");
  const [code, setCode]           = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await resetPassword({ username: email });
      setStep("reset");
    } catch (err) {
      setError(err.message || "Could not send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await confirmResetPassword({
        username:         email,
        confirmationCode: code,
        newPassword:      newPassword,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Reset failed. Check your code and try again.");
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
      {/* Decorative background */}
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
        NEW
        <br />
        PASS
        <br />
        WORD
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
        style={{ width: "100%", maxWidth: "380px", position: "relative", zIndex: 1 }}
      >
        {/* Step indicator */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "2.5rem", alignItems: "center" }}>
          {["request", "reset"].map((s) => (
            <div
              key={s}
              style={{
                height: "2px",
                flex: 1,
                background:
                  s === "request" || step === "reset"
                    ? "var(--gold)"
                    : "var(--border)",
                transition: "background 0.4s",
              }}
            />
          ))}
          <span style={{ fontSize: "0.6rem", color: "var(--muted)", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
            {step === "request" ? "1 / 2" : "2 / 2"}
          </span>
        </div>

        {success ? (
          /* ── Success state ── */
          <div className="animate-fadeUp">
            <h2
              className="font-display"
              style={{ fontSize: "2.5rem", marginBottom: "0.75rem", lineHeight: 1, color: "var(--cyan)" }}
            >
              PASSWORD RESET
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "0.75rem", letterSpacing: "0.08em", marginBottom: "2.5rem" }}>
              You're all set. Sign in with your new password.
            </p>
            <button
              onClick={onGoLogin}
              style={{
                width: "100%",
                background: "var(--gold)",
                color: "#000",
                border: "none",
                padding: "14px",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "1.1rem",
                letterSpacing: "0.2em",
                cursor: "pointer",
              }}
            >
              BACK TO LOGIN →
            </button>
          </div>
        ) : step === "request" ? (
          /* ── Step 1: Enter email ── */
          <>
            <h2
              className="font-display"
              style={{ fontSize: "2.5rem", marginBottom: "0.5rem", lineHeight: 1 }}
            >
              FORGOT
              <br />
              <span style={{ color: "var(--gold)" }}>PASSWORD?</span>
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "0.7rem", letterSpacing: "0.08em", marginBottom: "2.5rem" }}>
              Enter your email and we'll send a reset code.
            </p>

            <form onSubmit={handleRequest}>
              <div style={{ marginBottom: "2rem" }}>
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

              {error && (
                <p style={{ color: "var(--red)", fontSize: "0.7rem", letterSpacing: "0.05em", marginBottom: "1rem" }}>
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
                }}
              >
                {loading ? "SENDING..." : "SEND RESET CODE →"}
              </button>
            </form>
          </>
        ) : (
          /* ── Step 2: Code + new password ── */
          <>
            <h2
              className="font-display"
              style={{ fontSize: "2.5rem", marginBottom: "0.5rem", lineHeight: 1 }}
            >
              CHECK YOUR
              <br />
              <span style={{ color: "var(--cyan)" }}>EMAIL</span>
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "0.7rem", letterSpacing: "0.08em", marginBottom: "2.5rem" }}>
              We sent a reset code to {email}
            </p>

            <form onSubmit={handleReset}>
              <div style={{ marginBottom: "1.75rem" }}>
                <label style={labelStyle}>Reset Code</label>
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

              <div style={{ marginBottom: "0.75rem" }}>
                <label style={labelStyle}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                    width:
                      newPassword.length === 0 ? "0%" :
                      newPassword.length < 8   ? "33%" :
                      newPassword.length < 12  ? "66%" : "100%",
                    background:
                      newPassword.length < 8   ? "var(--red)" :
                      newPassword.length < 12  ? "var(--gold)" : "var(--cyan)",
                    transition: "all 0.3s",
                  }}
                />
              </div>

              {error && (
                <p style={{ color: "var(--red)", fontSize: "0.7rem", letterSpacing: "0.05em", marginBottom: "1rem" }}>
                  ⚠ {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || code.length < 6 || newPassword.length < 8}
                style={{
                  width: "100%",
                  background: "var(--cyan)",
                  color: "#000",
                  border: "none",
                  padding: "14px",
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "1.1rem",
                  letterSpacing: "0.2em",
                  cursor: loading || code.length < 6 || newPassword.length < 8 ? "not-allowed" : "pointer",
                  opacity: loading || code.length < 6 || newPassword.length < 8 ? 0.5 : 1,
                  transition: "all 0.2s",
                }}
              >
                {loading ? "RESETTING..." : "RESET PASSWORD →"}
              </button>
            </form>
          </>
        )}

        {/* Back to login link */}
        {!success && (
          <p style={{ marginTop: "2rem", color: "var(--muted)", fontSize: "0.7rem", textAlign: "center" }}>
            Remember it?{" "}
            <button
              onClick={onGoLogin}
              style={{
                background: "none",
                border: "none",
                color: "var(--gold)",
                cursor: "pointer",
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.7rem",
                textDecoration: "underline",
                letterSpacing: "0.05em",
              }}
            >
              Back to login
            </button>
          </p>
        )}
      </div>
    </div>
  );
}