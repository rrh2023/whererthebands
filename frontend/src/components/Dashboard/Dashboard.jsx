import { useState } from 'react';
import LocationSearch from '../Dashboard/LocationSearch'
import LoadingSpinner from '../shared/LoadingSpinner';
import ConcertCard from '../Dashboard/ConcertCard';
import { MOCK_CONCERTS } from "../../constants/mockData";


const Dashboard = ({ genres }) => {
  const [loading, setLoading] = useState(false);
  const [concerts, setConcerts] = useState(MOCK_CONCERTS);
  const [searched, setSearched] = useState(false);

  const handleSearch = (location) => {
    setLoading(true);
    setConcerts([]);
    setTimeout(() => {
      setConcerts(MOCK_CONCERTS);
      setLoading(false);
      setSearched(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-12" style={{background:"#0A0A0A"}}>
      {/* Ambient light */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 w-80 h-40 opacity-10 pointer-events-none" style={{background:"radial-gradient(ellipse, #F5A623 0%, transparent 70%)", filter:"blur(30px)"}}/>

      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8 pt-4">
          <h2 className="text-3xl font-black text-white leading-none" style={{fontFamily:"Georgia, serif", letterSpacing:"-0.04em"}}>
            Your shows,<br/>
            <span style={{color:"#F5A623"}}>tonight.</span>
          </h2>
          <div className="flex flex-wrap gap-2 mt-3">
            {genres.map(g => (
              <span key={g} className="text-xs px-2 py-1 rounded-full" style={{background:"#1a1a1a", color:"#666", fontFamily:"'Courier New', monospace", border:"1px solid #242424"}}>
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <LocationSearch onSearch={handleSearch} loading={loading} />
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <LoadingSpinner />
          </div>
        ) : concerts.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs tracking-widest" style={{color:"#444", fontFamily:"'Courier New', monospace"}}>
                {concerts.length} AI-MATCHED SHOWS — TAP TO EXPAND
              </p>
            </div>
            {concerts.map((c, i) => <ConcertCard key={c.id} concert={c} index={i} />)}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🎸</p>
            <p className="text-sm" style={{color:"#444", fontFamily:"'Courier New', monospace"}}>SEARCH A CITY TO FIND YOUR SHOWS</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard