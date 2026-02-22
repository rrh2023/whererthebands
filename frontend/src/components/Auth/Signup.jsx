import { useState } from 'react';
import Logo from '../shared/Logo'

const Signup = ({ onSignup, onSwitch }) => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"#0A0A0A"}}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 opacity-15" style={{background:"radial-gradient(circle, #F5A623 0%, transparent 70%)", filter:"blur(60px)"}}/>
      </div>
      <div className="relative z-10 w-full max-w-sm px-6">
        <div className="mb-10 text-center"><Logo /></div>
        <div className="space-y-4">
          {["Name", "Email", "Password", "Confirm Password"].map((label, i) => (
            <div key={label}>
              <label className="block text-xs mb-2 tracking-widest" style={{color:"#555", fontFamily:"'Courier New', monospace"}}>{label.toUpperCase()}</label>
              <input
                type={i >= 2 ? "password" : i === 1 ? "email" : "text"}
                className="w-full px-4 py-3 rounded text-white text-sm outline-none"
                style={{background:"#141414", border:"1px solid #2a2a2a", fontFamily:"'Courier New', monospace"}}
                onFocus={e => e.target.style.borderColor = "#F5A623"}
                onBlur={e => e.target.style.borderColor = "#2a2a2a"}
                placeholder="..."
              />
            </div>
          ))}
          <button onClick={onSignup} className="w-full py-3.5 rounded font-bold text-sm tracking-widest mt-2 hover:opacity-90" style={{background:"#F5A623", color:"#0A0A0A", fontFamily:"'Courier New', monospace", letterSpacing:"0.12em"}}>
            CREATE ACCOUNT →
          </button>
        </div>
        <p className="mt-6 text-center text-xs" style={{color:"#444", fontFamily:"'Courier New', monospace"}}>
          HAVE AN ACCOUNT? <button onClick={onSwitch} className="underline" style={{color:"#F5A623"}}>LOG IN</button>
        </p>
      </div>
    </div>
  );
};

export default Signup