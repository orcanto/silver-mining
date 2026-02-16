export const TapGame: React.FC<TapGameProps> = ({ gameState, onTap }) => {
  const t = TRANSLATIONS[gameState.language] as any;
  const currentLevel = [...LEVEL_TITLES].reverse().find(l => gameState.totalSrgEarned >= l.threshold) || LEVEL_TITLES[0];
  const tapReward = (gameState.clickPower || 1) * (1 + (currentLevel?.bonus || 0));

  return (
    <div className="flex flex-col items-center h-full w-full bg-slate-950 pt-2 pb-24 overflow-hidden">
      
      {/* 🚀 ÜST PANEL: EARNING & COST (DEV BOYUT) */}
      <div className="w-full px-4 grid grid-cols-2 gap-2 mb-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-[2.5rem] flex flex-col items-center">
          <span className="text-[10px] font-black text-emerald-500/60 uppercase mb-1">EARNING</span>
          <span className="text-3xl font-tech font-black text-white">+{tapReward.toFixed(1)}</span>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-[2.5rem] flex flex-col items-center">
          <span className="text-[10px] font-black text-red-500/60 uppercase mb-1">COST</span>
          <span className="text-3xl font-tech font-black text-white">-0.1</span>
        </div>
      </div>

      {/* ⚡️ ENERJİ & KAPASİTE (YUKARI TAŞINDI) */}
      <div className="w-full px-4 mb-6">
        <div className="bg-[#0f172a] p-5 rounded-[2.5rem] border border-white/10">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase">GRID ENERGY</p>
              <h2 className={`text-4xl font-tech font-black ${gameState.energyPool <= 5 ? 'text-red-500' : 'text-white'}`}>
                {gameState.energyPool.toFixed(1)} <span className="text-sm">Wh</span>
              </h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase">CAPACITY</p>
              <h2 className="text-2xl font-tech font-black text-indigo-400">{gameState.maxEnergyPool} Wh</h2>
            </div>
          </div>
          
          <div className="w-full h-4 bg-black/50 rounded-full border border-white/5 p-1">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${gameState.energyPool <= 5 ? 'bg-red-600 animate-pulse' : 'bg-gradient-to-r from-indigo-500 to-cyan-400'}`}
              style={{ width: `${(gameState.energyPool / gameState.maxEnergyPool) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 💰 BALANCE */}
      <div className="mb-6 text-center">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">TOTAL BALANCE</p>
        <h1 className="text-5xl font-tech font-black text-white">{Math.floor(gameState.srgBalance).toLocaleString()}</h1>
      </div>

      {/* ⛏️ CLICKER (ALTA ALINDI) */}
      <div className="flex-1 flex items-center justify-center relative">
        <div 
          className={`w-64 h-64 bg-slate-900 rounded-[4.5rem] border-8 border-white/5 flex items-center justify-center active:scale-90 transition-transform ${gameState.energyPool <= 5 ? 'opacity-20 grayscale pointer-events-none' : ''}`}
          onPointerDown={(e) => onTap(e.clientX, e.clientY)}
        >
          <span className="text-8xl">⛏️</span>
        </div>
      </div>

    </div>
  );
};