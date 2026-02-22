
const LoadingSpinner = () => (
  <div className="flex flex-col items-center gap-4">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-2 border-transparent" style={{borderTopColor:"#F5A623", animation:"spin 0.8s linear infinite"}}/>
      <div className="absolute inset-2 rounded-full border border-transparent" style={{borderTopColor:"#F5A623", opacity:0.4, animation:"spin 1.2s linear infinite reverse"}}/>
    </div>
    <p className="text-sm tracking-widest" style={{color:"#888", fontFamily:"'Courier New', monospace"}}>FINDING YOUR SHOWS...</p>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

export default LoadingSpinner