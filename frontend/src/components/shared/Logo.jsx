
const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="w-7 h-7 rounded-sm flex items-center justify-center" style={{background:"#F5A623"}}>
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
        <circle cx="9" cy="9" r="5" stroke="#0A0A0A" strokeWidth="2"/>
        <circle cx="9" cy="9" r="2" fill="#0A0A0A"/>
        <path d="M14 4h6M14 7h6M14 10h6" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round"/>
        <path d="M3 19c0-2.2 2.7-4 6-4s6 1.8 6 4" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
    <span className="font-black tracking-tight text-white" style={{fontFamily:"Georgia, serif", fontSize:"1.1rem", letterSpacing:"-0.03em"}}>
      WhereR<span style={{color:"#F5A623"}}>The</span>Bands
    </span>
  </div>
);

export default Logo