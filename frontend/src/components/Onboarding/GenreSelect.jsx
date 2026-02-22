import {useState} from "react";
import { GENRES } from "../../constants/genres";

const GenreSelect = ({ onComplete }) => {
  const [selected, setSelected] = useState([]);

  const toggle = (g) => setSelected(prev =>
    prev.includes(g) ? prev.filter(x => x !== g) : prev.length < 5 ? [...prev, g] : prev
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{background:"#0A0A0A"}}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5" style={{background:"repeating-linear-gradient(0deg, transparent, transparent 39px, #F5A623 39px, #F5A623 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #F5A623 39px, #F5A623 40px)"}}/>
      </div>
      <div className="relative z-10 w-full max-w-lg text-center">
        <div className="mb-2">
          <span className="text-xs tracking-widest" style={{color:"#F5A623", fontFamily:"'Courier New', monospace"}}>STEP 1 OF 1</span>
        </div>
        <h1 className="text-4xl font-black mb-3 text-white leading-none" style={{fontFamily:"Georgia, serif", letterSpacing:"-0.04em"}}>
          What moves you?
        </h1>
        <p className="text-sm mb-10" style={{color:"#666", fontFamily:"'Courier New', monospace"}}>
          PICK UP TO 5 GENRES — WE'LL DO THE REST
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {GENRES.map(g => {
            const on = selected.includes(g);
            return (
              <button
                key={g}
                onClick={() => toggle(g)}
                className="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
                style={{
                  background: on ? "#F5A623" : "#141414",
                  color: on ? "#0A0A0A" : "#888",
                  border: `1px solid ${on ? "#F5A623" : "#2a2a2a"}`,
                  fontFamily:"'Courier New', monospace",
                  letterSpacing:"0.04em",
                  transform: on ? "scale(1.05)" : "scale(1)",
                }}
              >
                {g.toUpperCase()}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mb-6">
          <span className="text-xs" style={{color:"#444", fontFamily:"'Courier New', monospace"}}>
            {selected.length}/5 SELECTED
          </span>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-6 h-1 rounded-full transition-all" style={{background: i < selected.length ? "#F5A623" : "#222"}}/>
            ))}
          </div>
        </div>

        <button
          onClick={() => selected.length > 0 && onComplete(selected)}
          className="w-full py-4 rounded font-bold text-sm tracking-widest transition-all"
          style={{
            background: selected.length > 0 ? "#F5A623" : "#1a1a1a",
            color: selected.length > 0 ? "#0A0A0A" : "#333",
            fontFamily:"'Courier New', monospace",
            letterSpacing:"0.12em",
            cursor: selected.length > 0 ? "pointer" : "not-allowed",
          }}
        >
          {selected.length > 0 ? "FIND MY SHOWS →" : "SELECT AT LEAST ONE"}
        </button>
      </div>
    </div>
  );
};

export default GenreSelect