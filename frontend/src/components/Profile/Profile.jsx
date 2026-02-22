import {useState} from "react"
import { GENRES } from "../../constants/genres";

const Profile = ({ genres, onUpdateGenres }) => {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(genres);

  const toggle = g => setSelected(prev =>
    prev.includes(g) ? prev.filter(x => x !== g) : prev.length < 5 ? [...prev, g] : prev
  );

  return (
    <div className="min-h-screen pt-24 px-4 pb-12" style={{background:"#0A0A0A"}}>
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white" style={{fontFamily:"Georgia, serif", letterSpacing:"-0.04em"}}>Your Profile</h2>
          <p className="text-xs mt-1" style={{color:"#444", fontFamily:"'Courier New', monospace"}}>CUSTOMIZE YOUR TASTE PROFILE</p>
        </div>

        {/* Avatar area */}
        <div className="flex items-center gap-4 mb-8 p-4 rounded-lg" style={{background:"#111", border:"1px solid #1e1e1e"}}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{background:"#F5A623"}}>
            <span className="text-xl font-black" style={{color:"#0A0A0A", fontFamily:"Georgia, serif"}}>J</span>
          </div>
          <div>
            <p className="font-bold text-white" style={{fontFamily:"Georgia, serif"}}>Jamie Lee</p>
            <p className="text-xs" style={{color:"#555", fontFamily:"'Courier New', monospace"}}>jamie@email.com</p>
          </div>
        </div>

        {/* Genre preferences */}
        <div className="p-4 rounded-lg mb-4" style={{background:"#111", border:"1px solid #1e1e1e"}}>
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs tracking-widest" style={{color:"#555", fontFamily:"'Courier New', monospace"}}>GENRE PREFERENCES</p>
            <button
              onClick={() => { setEditing(e => !e); if (editing) onUpdateGenres(selected); }}
              className="text-xs underline" style={{color:"#F5A623", fontFamily:"'Courier New', monospace"}}
            >
              {editing ? "SAVE" : "EDIT"}
            </button>
          </div>
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => {
                const on = selected.includes(g);
                return (
                  <button key={g} onClick={() => toggle(g)}
                    className="px-3 py-1.5 rounded-full text-xs transition-all"
                    style={{background: on ? "#F5A623" : "#1a1a1a", color: on ? "#0A0A0A" : "#666", border:`1px solid ${on ? "#F5A623" : "#2a2a2a"}`, fontFamily:"'Courier New', monospace"}}
                  >{g}</button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selected.map(g => (
                <span key={g} className="px-3 py-1.5 rounded-full text-xs" style={{background:"#1a1a1a", color:"#F5A623", border:"1px solid #2a2a2a", fontFamily:"'Courier New', monospace"}}>{g}</span>
              ))}
            </div>
          )}
        </div>

        {/* Saved shows count */}
        <div className="p-4 rounded-lg" style={{background:"#111", border:"1px solid #1e1e1e"}}>
          <p className="text-xs tracking-widest mb-3" style={{color:"#555", fontFamily:"'Courier New', monospace"}}>SAVED SHOWS</p>
          <p className="text-4xl font-black" style={{color:"#F5A623", fontFamily:"Georgia, serif"}}>3</p>
          <p className="text-xs mt-1" style={{color:"#444", fontFamily:"'Courier New', monospace"}}>UPCOMING EVENTS SAVED</p>
        </div>
      </div>
    </div>
  );
};

export default Profile