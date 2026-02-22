import { useState } from 'react';

const LocationSearch = ({ onSearch, loading }) => {
  const [loc, setLoc] = useState("Brooklyn, NY");

  return (
    <div className="flex gap-3 items-center">
      <div className="relative flex-1 max-w-xs">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{color:"#555"}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <input
          value={loc}
          onChange={e => setLoc(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded text-white text-sm outline-none"
          style={{background:"#141414", border:"1px solid #2a2a2a", fontFamily:"'Courier New', monospace"}}
          onFocus={e => e.target.style.borderColor = "#F5A623"}
          onBlur={e => e.target.style.borderColor = "#2a2a2a"}
        />
      </div>
      <button
        onClick={() => onSearch(loc)}
        disabled={loading}
        className="px-5 py-2.5 rounded text-sm font-bold tracking-widest transition-all hover:opacity-90 disabled:opacity-40"
        style={{background:"#F5A623", color:"#0A0A0A", fontFamily:"'Courier New', monospace", letterSpacing:"0.08em"}}
      >
        {loading ? "..." : "SEARCH"}
      </button>
    </div>
  );
};

export default LocationSearch