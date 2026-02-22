import { useState } from 'react';

const ConcertCard = ({ concert, index }) => {
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-lg transition-all cursor-pointer group"
      style={{
        background:"#111",
        border:"1px solid #1e1e1e",
        animation:`fadeUp 0.5s ease forwards`,
        animationDelay:`${index * 0.1}s`,
        opacity:0,
      }}
      onClick={() => setExpanded(e => !e)}
    >
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Top: image + core info */}
      <div className="flex gap-0">
        <div className="relative w-28 h-28 flex-shrink-0">
          <img src={concert.image} alt={concert.name} className="w-full h-full object-cover" style={{filter:"brightness(0.7)"}}/>
          <div className="absolute inset-0 transition-opacity group-hover:opacity-0" style={{background:"linear-gradient(to right, transparent 60%, #111)"}}/>
        </div>

        <div className="flex-1 p-4 pr-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-black text-white leading-tight" style={{fontFamily:"Georgia, serif", fontSize:"1.1rem", letterSpacing:"-0.02em"}}>
                {concert.name}
              </h3>
              <p className="text-xs mt-0.5" style={{color:"#666", fontFamily:"'Courier New', monospace"}}>
                {concert.venue} · {concert.date}
              </p>
            </div>
            {/* Match score */}
            <div className="flex-shrink-0 flex flex-col items-center" style={{minWidth:"44px"}}>
              <div className="text-xl font-black leading-none" style={{color:"#F5A623", fontFamily:"Georgia, serif"}}>{concert.match}</div>
              <div className="text-xs" style={{color:"#555", fontFamily:"'Courier New', monospace"}}>FIT</div>
            </div>
          </div>

          {/* Vibe tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {concert.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-xs" style={{background:"#1a1a1a", color:"#666", fontFamily:"'Courier New', monospace", border:"1px solid #242424"}}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded: AI explanation */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t" style={{borderColor:"#1e1e1e"}}>
          <div className="mt-3 flex gap-3 items-start">
            <div className="flex-shrink-0 w-5 h-5 rounded-sm flex items-center justify-center mt-0.5" style={{background:"#F5A623"}}>
              <span style={{fontSize:"10px", color:"#0A0A0A", fontWeight:"bold"}}>AI</span>
            </div>
            <p className="text-sm leading-relaxed" style={{color:"#aaa", fontFamily:"Georgia, serif", fontStyle:"italic"}}>
              "{concert.explanation}"
            </p>
          </div>
          <div className="flex justify-between items-center mt-4">
            <a href="#" className="text-xs underline transition-colors hover:opacity-80" style={{color:"#F5A623", fontFamily:"'Courier New', monospace"}}>
              GET TICKETS →
            </a>
            <button
              onClick={e => { e.stopPropagation(); setSaved(s => !s); }}
              className="flex items-center gap-1.5 text-xs transition-all"
              style={{color: saved ? "#F5A623" : "#555", fontFamily:"'Courier New', monospace"}}
            >
              <svg className="w-3.5 h-3.5" fill={saved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {saved ? "SAVED" : "SAVE"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConcertCard
