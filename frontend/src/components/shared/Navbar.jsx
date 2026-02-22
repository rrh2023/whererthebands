import Logo from './Logo'


const Navbar = ({ onNav, active }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white border-opacity-10" style={{background:"rgba(10,10,10,0.92)", backdropFilter:"blur(12px)"}}>
    <Logo />
    <div className="flex items-center gap-1">
      {["Dashboard","Profile"].map(item => (
        <button
          key={item}
          onClick={() => onNav(item)}
          className="px-4 py-1.5 text-sm font-medium rounded transition-all"
          style={{
            color: active === item ? "#0A0A0A" : "#888",
            background: active === item ? "#F5A623" : "transparent",
            fontFamily:"'Courier New', monospace",
            letterSpacing:"0.05em",
          }}
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
    <button
      className="text-xs font-medium px-3 py-1.5 rounded border transition-all hover:bg-white hover:text-black"
      style={{color:"#888", borderColor:"#333", fontFamily:"'Courier New', monospace"}}
    >
      SIGN OUT
    </button>
  </nav>
);

export default Navbar