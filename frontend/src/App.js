// src/App.jsx
import { useState, useEffect } from "react";
import { getCurrentUser, signOut } from "./services/cognito";
import { getProfile } from "./services/api";
import Navbar from "./components/shared/Navbar";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import ForgotPassword from "./components/Auth/ForgotPassword";
import GenreSelect from "./components/Onboarding/GenreSelect";
import Dashboard from "./components/Dashboard/Dashboard";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@400;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080808;
    --surface: #111111;
    --card: #181818;
    --border: #2a2a2a;
    --gold: #f0a500;
    --gold-dim: #a06f00;
    --cyan: #00e5cc;
    --red: #ff3d3d;
    --text: #e0e0e0;
    --muted: #555;
    --grain-opacity: 0.035;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Mono', monospace;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Grain overlay */
  body::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
    opacity: var(--grain-opacity);
    pointer-events: none;
    z-index: 9999;
  }

  ::selection { background: var(--gold); color: #000; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); }

  .font-display { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.05em; }
  .font-ui { font-family: 'Syne', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-gold {
    0%, 100% { box-shadow: 0 0 0 0 rgba(240,165,0,0.4); }
    50%       { box-shadow: 0 0 0 8px rgba(240,165,0,0); }
  }
  .animate-fadeUp { animation: fadeUp 0.5s ease both; }
`;

// Screens: "loading" | "login" | "signup" | "forgotPassword" | "onboarding" | "dashboard"
export default function App() {
  const [screen, setScreen] = useState("loading");
  const [user, setUser]     = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const profile = await getProfile();
          setUser({
            email:  currentUser.signInDetails?.loginId,
            isNew:  false,
            genres: profile.genres ?? [],
          });
          setScreen(profile.genres?.length > 0 ? "dashboard" : "onboarding");
        } else {
          setScreen("login");
        }
      } catch {
        setScreen("login");
      }
    };
    checkSession();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setScreen(userData.isNew ? "onboarding" : "dashboard");
  };

  const handleOnboardingComplete = (genres) => {
    setUser((u) => ({ ...u, genres }));
    setScreen("dashboard");
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {
      // If signOut fails, clear local state anyway
    }
    setUser(null);
    setScreen("login");
  };

  const isAuthed = screen === "dashboard" || screen === "onboarding";

  // Loading splash — shown while checking existing session
  if (screen === "loading") {
    return (
      <>
        <style>{globalStyles}</style>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="font-display"
            style={{
              fontSize: "1.5rem",
              letterSpacing: "0.3em",
              color: "var(--muted)",
              animation: "pulse-gold 1.5s infinite",
            }}
          >
            LOADING...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{globalStyles}</style>
      {isAuthed && <Navbar user={user} onLogout={handleLogout} />}
      <main>
        {screen === "login" && (
          <Login
            onLogin={handleLogin}
            onGoSignup={() => setScreen("signup")}
            onGoForgotPassword={() => setScreen("forgotPassword")}
          />
        )}
        {screen === "signup" && (
          <Signup onSignup={handleLogin} onGoLogin={() => setScreen("login")} />
        )}
        {screen === "forgotPassword" && (
          <ForgotPassword onGoLogin={() => setScreen("login")} />
        )}
        {screen === "onboarding" && (
          <GenreSelect onComplete={handleOnboardingComplete} />
        )}
        {screen === "dashboard" && <Dashboard user={user} onSessionExpired={handleLogout} />}
      </main>
    </>
  );
}