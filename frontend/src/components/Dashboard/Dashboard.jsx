// src/components/Dashboard/Dashboard.jsx
import { useState, useEffect, useCallback } from "react";
import LocationSearch from "./LocationSearch";
import ConcertCard from "./ConcertCard";
import { getEvents, getRecommendations, getProfile, saveShow, unsaveShow } from "../../services/api";

const TABS = ["AI PICKS", "ALL SHOWS", "SAVED"];

function SkeletonCard() {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        height: "280px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={{ height: "130px", background: "#1a1a1a" }} />
      <div style={{ padding: "14px 16px", display: "flex", gap: "14px" }}>
        <div style={{ width: "44px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ height: "10px", background: "#2a2a2a", borderRadius: "2px" }} />
          <div style={{ height: "28px", background: "#2a2a2a", borderRadius: "2px" }} />
          <div style={{ height: "8px",  background: "#2a2a2a", borderRadius: "2px" }} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ height: "14px", background: "#2a2a2a", borderRadius: "2px", width: "80%" }} />
          <div style={{ height: "14px", background: "#2a2a2a", borderRadius: "2px", width: "55%" }} />
          <div style={{ height: "10px", background: "#2a2a2a", borderRadius: "2px", width: "40%" }} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.02) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
        }}
      />
      <style>{`@keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }`}</style>
    </div>
  );
}

export default function Dashboard({ user, onSessionExpired }) {
  const [tab, setTab]                     = useState("ALL SHOWS");
  const [loading, setLoading]             = useState(false);
  const [events, setEvents]               = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [aiPhase, setAiPhase]             = useState(null);
  const [error, setError]                 = useState("");
  const [lastCity, setLastCity]           = useState("");

  // FIX: savedShows is now real state loaded from the user's profile
  const [savedShows, setSavedShows]       = useState([]);
  const [savedIds, setSavedIds]           = useState(new Set());

  // Load saved shows on mount
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const profile = await getProfile();
        const shows = profile.savedShows ?? [];
        setSavedShows(shows);
        setSavedIds(new Set(shows.map((s) => s.id)));
      } catch (err) {
      if (err.message === "SESSION_EXPIRED") { onSessionExpired?.(); return; }
      // Non-fatal: saved tab will just be empty
    }
    };
    loadSaved();
  }, [onSessionExpired]);

  const handleSearch = async ({ city, radius }) => {
    setLoading(true);
    setError("");
    setAiPhase("fetching");
    setEvents([]);
    setRecommendations([]);
    setLastCity(city);

    try {
      const eventsData = await getEvents(city, radius);
      setEvents(eventsData);

      const genres = user.genres ?? [];
      if (eventsData.length > 0 && genres.length > 0) {
        setAiPhase("analyzing");
        const recsData = await getRecommendations(genres, eventsData);
        setRecommendations(recsData);
      }
      setAiPhase("done");
    } catch (err) {
      if (err.message === "SESSION_EXPIRED") { onSessionExpired?.(); return; }
      console.error("Full error:", err);
      setError(err.message || "Something went wrong. Check your connection and try again.");
      setAiPhase(null);
    } finally {
      setLoading(false);
    }
  };

  // FIX: actually call the API when saving/unsaving
  const handleSaveToggle = useCallback(async (event) => {
    const isSaved = savedIds.has(event.id);
    try {
      if (isSaved) {
        await unsaveShow(event.id);
        setSavedShows((prev) => prev.filter((s) => s.id !== event.id));
        setSavedIds((prev) => { const next = new Set(prev); next.delete(event.id); return next; });
      } else {
        await saveShow(event);
        setSavedShows((prev) => [...prev, event]);
        setSavedIds((prev) => new Set([...prev, event.id]));
      }
    } catch (err) {
      console.error("Save toggle failed:", err);
    }
  }, [savedIds]);

  const recMap = {};
  recommendations.forEach((r) => { recMap[r.event_id] = r; });

  const aiPickEvents = recommendations
    .map((r) => events.find((e) => e.id === r.event_id))
    .filter(Boolean);

  const tabContent = {
    "AI PICKS":  aiPickEvents,
    "ALL SHOWS": events,
    "SAVED":     savedShows,
  };

  const displayed = tabContent[tab] ?? [];

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Page header */}
      <div className="animate-fadeUp" style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.6rem", letterSpacing: "0.3em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          ◆ LIVE NEAR YOU
        </div>
        <h1 className="font-display" style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", lineHeight: 0.9, marginBottom: "0.5rem" }}>
          TONIGHT'S
          <br />
          <span style={{ color: "var(--gold)" }}>LINEUP</span>
        </h1>
        {user?.genres?.length > 0 && (
          <p style={{ color: "var(--muted)", fontSize: "0.65rem", letterSpacing: "0.1em" }}>
            Tuned to:{" "}
            <span style={{ color: "var(--cyan)" }}>{user.genres.join(" · ")}</span>
          </p>
        )}
      </div>

      {/* Search bar */}
      <div className="animate-fadeUp" style={{ animationDelay: "80ms", marginBottom: "2rem" }}>
        <LocationSearch onSearch={handleSearch} loading={loading} />
      </div>

      {/* AI status bar */}
      {aiPhase && aiPhase !== "done" && (
        <div
          style={{
            background: "rgba(240,165,0,0.06)",
            border: "1px solid rgba(240,165,0,0.2)",
            padding: "12px 18px",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "0.7rem",
            letterSpacing: "0.1em",
            color: "var(--gold)",
          }}
        >
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "var(--gold)",
              animation: "pulse-gold 1s infinite",
              flexShrink: 0,
            }}
          />
          {aiPhase === "fetching"
            ? `Pulling shows near ${lastCity}...`
            : "Claude is analyzing your taste..."}
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            background: "rgba(255,61,61,0.06)",
            border: "1px solid rgba(255,61,61,0.25)",
            color: "var(--red)",
            padding: "12px 18px",
            marginBottom: "1.5rem",
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* Tabs — show SAVED tab always; others only after search */}
      {(events.length > 0 || loading || savedShows.length > 0) && (
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "1.5rem" }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${tab === t ? "var(--gold)" : "transparent"}`,
                color: tab === t ? "var(--gold)" : "var(--muted)",
                padding: "10px 20px",
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.2s",
                marginBottom: "-1px",
              }}
            >
              {t}
              {t === "AI PICKS" && recommendations.length > 0 && (
                <span style={{ marginLeft: "6px", background: "var(--gold)", color: "#000", padding: "1px 5px", fontSize: "0.55rem" }}>
                  {recommendations.length}
                </span>
              )}
              {t === "ALL SHOWS" && events.length > 0 && (
                <span style={{ marginLeft: "6px", color: "var(--border)", fontSize: "0.55rem" }}>
                  {events.length}
                </span>
              )}
              {t === "SAVED" && savedShows.length > 0 && (
                <span style={{ marginLeft: "6px", color: "var(--cyan)", fontSize: "0.55rem" }}>
                  {savedShows.length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : displayed.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
          {displayed.filter(Boolean).map((event, i) => (
            <ConcertCard
              key={event.id}
              event={event}
              recommendation={recMap[event.id] ?? null}
              index={i}
              isSaved={savedIds.has(event.id)}
              onSaveToggle={handleSaveToggle}
            />
          ))}
        </div>
      ) : tab === "SAVED" ? (
        <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
          <div
            className="font-display"
            style={{ fontSize: "clamp(3rem, 12vw, 8rem)", color: "transparent", WebkitTextStroke: "1px #1e1e1e", lineHeight: 0.9, marginBottom: "2rem" }}
          >
            NO SAVED
            <br />
            SHOWS
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.75rem", letterSpacing: "0.15em" }}>
            SAVE SHOWS FROM THE ALL SHOWS TAB
          </p>
        </div>
      ) : events.length === 0 && aiPhase === null ? (
        <div style={{ textAlign: "center", padding: "6rem 2rem", position: "relative" }}>
          <div
            className="font-display"
            style={{ fontSize: "clamp(4rem, 15vw, 10rem)", color: "transparent", WebkitTextStroke: "1px #1e1e1e", lineHeight: 0.9, marginBottom: "2rem" }}
          >
            NO SHOWS
            <br />
            YET
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.75rem", letterSpacing: "0.15em" }}>
            ENTER A CITY ABOVE TO DISCOVER LIVE MUSIC NEAR YOU
          </p>
        </div>
      ) : null}
    </div>
  );
}