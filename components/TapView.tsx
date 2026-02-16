
import React, { useState, useCallback, useRef } from 'react';
import { GameState, FloatingText } from '../types';
import { TRANSLATIONS, LEVEL_TITLES } from '../constants';
import { Cpu, Zap, AlertTriangle } from 'lucide-react';

interface Props {
  gameState: GameState;
  onTapping: () => void;
}

export const TapView: React.FC<Props> = ({ gameState, onTapping }) => {
  const t = TRANSLATIONS[gameState.language] as any;
  const [floats, setFloats] = useState<FloatingText[]>([]);
  const [botWarning, setBotWarning] = useState(false);
  
  const lastClickPos = useRef<{x: number, y: number}>({x: 0, y: 0});
  const sameSpotCount = useRef<number>(0);
  const lockUntil = useRef<number>(0);

  const currentLevel = LEVEL_TITLES.slice().reverse().find(l => gameState.totalSrgEarned >= l.threshold) || LEVEL_TITLES[0];
  const tapReward = 1 * (1 + currentLevel.bonus);

  const handleTap = useCallback((e: React.PointerEvent) => {
    if (gameState.energyPool < 0.1) return;
    
    const now = Date.now();
    if (now < lockUntil.current) return;

    const x = e.clientX;
    const y = e.clientY;

    const dist = Math.sqrt(Math.pow(x - lastClickPos.current.x, 2) + Math.pow(y - lastClickPos.current.y, 2));
    if (dist < 10) {
      sameSpotCount.current += 1;
    } else {
      sameSpotCount.current = 0;
    }

    lastClickPos.current = {x, y};

    if (sameSpotCount.current >= 20) {
      setBotWarning(true);
      lockUntil.current = now + 2000; 
      sameSpotCount.current = 0;
      setTimeout(() => setBotWarning(false), 2000);
      return;
    }

    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }

    const id = Date.now();
    setFloats(prev => [
      ...prev, 
      { id: id + 1, x: x - 30, y: y, text: `-0.1 ${t.unitKw}`, color: "text-red-500" },
      { id: id + 2, x: x + 30, y: y, text: `+${tapReward.toFixed(1)} SRG`, color: "text-emerald-400" }
    ]);
    
    onTapping();
    
    setTimeout(() => {
      setFloats(prev => prev.filter(f => f.id !== id + 1 && f.id !== id + 2));
    }, 800);
  }, [gameState.energyPool, onTapping, t.unitKw, tapReward]);

  const isEnergyLow = gameState.energyPool < 1;

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 space-y-12 select-none relative overflow-hidden bg-[#0b0e1a]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[100px] rounded-full"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[100px] rounded-full"></div>
      </div>

      {botWarning && (
        <div className="fixed top-1/4 left-0 right-0 z-[300] flex justify-center px-8">
           <div className="bg-red-600 text-white p-4 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-3 animate-bounce">
              <AlertTriangle size={24} />
              <div>
                 <p className="text-[10px] font-black uppercase">{t.tapBotWarning}</p>
              </div>
           </div>
        </div>
      )}

      {floats.map(f => (
        <div 
          key={f.id} 
          className={`fixed pointer-events-none font-black text-xs z-[200] ${f.color} animate-out fade-out slide-out-to-top-12 duration-700 fill-mode-forwards`}
          style={{ left: f.x, top: f.y - 40 }}
        >
           {f.text}
        </div>
      ))}

      <div className="w-full max-w-xs space-y-3 z-10">
         <div className="flex justify-between items-end px-2">
            <div className="flex items-center gap-2">
               <Zap size={14} className={isEnergyLow ? 'text-red-500' : 'text-cyan-400'} />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.tapEnergyLabel}</span>
            </div>
            <span className={`text-sm font-black ${isEnergyLow ? 'text-red-500 animate-pulse' : 'text-white'}`}>{gameState.energyPool.toFixed(1)} kW</span>
         </div>
         <div className="w-full h-3 bg-black/40 rounded-full border border-white/5 p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isEnergyLow ? 'bg-red-600' : 'bg-gradient-to-r from-blue-600 to-cyan-400'}`}
              style={{ width: `${(gameState.energyPool / gameState.maxEnergyPool) * 100}%` }}
            ></div>
         </div>
         <p className="text-[8px] text-slate-500 text-right font-bold uppercase">{t.tapCapacity}: {gameState.maxEnergyPool.toFixed(0)} kW</p>
      </div>

      <div className="relative z-10">
         <div 
           onPointerDown={handleTap}
           className={`w-64 h-64 rounded-[3.5rem] relative flex items-center justify-center transition-all active:scale-[0.92] touch-manipulation cursor-pointer group will-change-transform
             ${isEnergyLow ? 'opacity-40 grayscale bg-slate-900 border-slate-800' : 'bg-slate-900/40 border border-white/10 shadow-[0_0_40px_rgba(37,99,235,0.15)]'}
           `}
         >
            <div className="bg-slate-950 p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center">
               <Cpu className={`w-20 h-20 transition-colors ${isEnergyLow ? 'text-slate-700' : 'text-blue-500 group-active:text-emerald-500'}`} />
               <p className={`text-[10px] font-black mt-4 ${isEnergyLow ? 'text-slate-700' : 'text-slate-500'}`}>{t.tapActionLabel}</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-8 w-full max-w-xs z-10 pt-8 text-center">
         <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.tapEarningLabel}</p>
            <span className="text-lg font-black text-white">+{tapReward.toFixed(1)} SRG</span>
         </div>
         <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.tapCostLabel}</p>
            <span className="text-lg font-black text-white">-0.1 kW</span>
         </div>
      </div>
    </div>
  );
};
