import { useState } from 'react';
import Logo from '../shared/Logo'


const Login = ({ onLogin, onSwitch }) => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{background:"#0A0A0A"}}>
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20" style={{background:"radial-gradient(circle, #F5A623 0%, transparent 70%)", filter:"blur(60px)"}}/>
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10" style={{background:"radial-gradient(circle, #F5A623 0%, transparent 70%)", filter:"blur(40px)"}}/>
        {/* Vinyl record decoration */}
        <div className="absolute -right-24 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white opacity-5" style={{animation:"slowSpin 20s linear infinite"}}>
          <div className="absolute inset-8 rounded-full border border-white opacity-50"/>
          <div className="absolute inset-16 rounded-full border border-white opacity-50"/>
          <div className="absolute inset-24 rounded-full border border-white opacity-50"/>
          <div className="absolute inset-0 flex items-center justify-center"><div className="w-6 h-6 rounded-full bg-white opacity-20"/></div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-sm px-6">
        <div className="mb-10 text-center">
          <Logo />
          <p className="mt-3 text-sm" style={{color:"#666", fontFamily:"'Courier New', monospace", letterSpacing:"0.08em"}}>
            YOUR CITY. YOUR SOUND.
          </p>
        </div>

        <div className="space-y-4">
          {["Email", "Password"].map((label, i) => (
            <div key={label}>
              <label className="block text-xs mb-2 tracking-widest" style={{color:"#555", fontFamily:"'Courier New', monospace"}}>{label.toUpperCase()}</label>
              <input
                type={i === 1 ? "password" : "email"}
                value={i === 0 ? email : pass}
                onChange={e => i === 0 ? setEmail(e.target.value) : setPass(e.target.value)}
                className="w-full px-4 py-3 rounded text-white text-sm outline-none transition-all"
                style={{background:"#141414", border:"1px solid #2a2a2a", fontFamily:"'Courier New', monospace"}}
                onFocus={e => e.target.style.borderColor = "#F5A623"}
                onBlur={e => e.target.style.borderColor = "#2a2a2a"}
                placeholder={i === 0 ? "you@email.com" : "••••••••"}
              />
            </div>
          ))}

          <button
            onClick={onLogin}
            className="w-full py-3.5 rounded font-bold text-sm tracking-widest transition-all hover:opacity-90 active:scale-98 mt-2"
            style={{background:"#F5A623", color:"#0A0A0A", fontFamily:"'Courier New', monospace", letterSpacing:"0.12em"}}
          >
            LET'S GO →
          </button>
        </div>

        <p className="mt-6 text-center text-xs" style={{color:"#444", fontFamily:"'Courier New', monospace"}}>
          NO ACCOUNT?{" "}
          <button onClick={onSwitch} className="underline transition-colors" style={{color:"#F5A623"}}>SIGN UP</button>
        </p>
      </div>
      <style>{`@keyframes slowSpin{to{transform:translateY(-50%) rotate(360deg)}}`}</style>
    </div>
  );
};

export default Login