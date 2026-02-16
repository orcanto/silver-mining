
import React, { useState, useMemo } from 'react';
import { GameState, MachineType } from '../types';
// Fixed: GENERATOR_TYPES replaced with GENERATORS_DATA
import { GENERATORS_DATA, TRANSLATIONS } from '../constants';
import { getEnergyStrategy } from '../services/geminiService';
import { 
  Battery, 
  Zap, 
  Activity, 
  ZapOff, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle,
  Loader2,
  Terminal,
  Settings2,
  HelpCircle
} from 'lucide-react';

export const PowerCenter: React.FC<{ gameState: GameState, onUpdateState: (updates: Partial<GameState>) => void }> = ({ gameState, onUpdateState }) => {
  const t = TRANSLATIONS[gameState.language];
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const smartFormat = (val: number) => parseFloat(val.toFixed(2)).toLocaleString('tr-TR');
  const netEnergy = gameState.hourlyGeneration - gameState.hourlyConsumption;
  const isDeficit = netEnergy < 0;
  
  // Fix: Replaced 'netPower' with 'netEnergy' as 'netPower' was not defined
  const timeRemaining = isDeficit 
    ? (gameState.energyPool / Math.abs(netEnergy)) 
    : (netEnergy > 0 ? (gameState.maxEnergyPool - gameState.energyPool) / netEnergy : 0);

  const formatTime = (hours: number) => {
    if (hours <= 0 || hours > 8760) return "Süresiz";
    const h = Math.floor(hours);
    const m = Math.floor((hours % 1) * 60);
    return h > 0 ? `${h} sa ${m} dk` : `${m} dk`;
  };

  const handleAISync = async () => {
    setIsLoadingInsight(true);
    const emptySlots = gameState.unlockedGeneratorSlots - gameState.generatorSlots.filter(s => s !== null).length;
    const insight = await getEnergyStrategy({
      hourlyConsumption: gameState.hourlyConsumption,
      hourlyGeneration: gameState.hourlyGeneration,
      silverBalance: gameState.silverBalance,
      emptySlots: emptySlots,
      // Fixed: GENERATOR_TYPES replaced with GENERATORS_DATA
      generatorTypes: GENERATORS_DATA
    });
    setAiInsight(insight);
    setIsLoadingInsight(false);
  };

  return (
    <div className="p-6 flex flex-col space-y-8 animate-in fade-in duration-500 pb-32">
      <div className="text-center space-y-2">
         <h2 className="text-3xl font-black text-cyan-400 italic tracking-tighter uppercase">ENERJİ MERKEZİ</h2>
      </div>

      <div className="bg-[#1a1b2e] rounded-[2.5rem] border border-white/5 p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4 mb-6 relative z-10">
           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${isDeficit ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
              <Battery className={`w-8 h-8 ${isDeficit ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`} />
           </div>
           <h3 className={`text-xl font-black ${isDeficit ? 'text-red-500' : 'text-emerald-400'}`}>
                 {isDeficit ? 'NEGATİF AKIŞ' : 'STABİL ŞEBEKE'}
           </h3>
        </div>

        <div className="space-y-4 relative z-10">
           <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[11px] text-slate-400 font-bold uppercase flex items-center gap-2"><Zap className="w-3 h-3 text-emerald-400" /> Giriş</span>
              <span className="text-emerald-400 font-mono font-bold">+{smartFormat(gameState.hourlyGeneration)} KW/sa</span>
           </div>
           <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[11px] text-slate-400 font-bold uppercase flex items-center gap-2"><ZapOff className="w-3 h-3 text-red-400" /> Yük</span>
              <span className="text-red-400 font-mono font-bold">-{smartFormat(gameState.hourlyConsumption)} KW/sa</span>
           </div>
           <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-white font-black uppercase">Net Tahmin</span>
              <span className={`text-sm font-mono font-black ${isDeficit ? 'text-red-500' : 'text-emerald-400'}`}>
                   {isDeficit ? `Kesinti: ${formatTime(timeRemaining)}` : `Dolum: ${formatTime(timeRemaining)}`}
              </span>
           </div>
        </div>
      </div>

      <button onClick={handleAISync} className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 font-black text-[10px] uppercase">
        {isLoadingInsight ? 'ANALİZ YAPILIYOR...' : 'STRATEJİK ANALİZ MOTORUNU ÇALIŞTIR'}
      </button>
      {aiInsight && <div className="bg-black/60 rounded-[2rem] p-6 border border-cyan-500/30"><p className="text-xs text-cyan-100 italic">"{aiInsight}"</p></div>}
    </div>
  );
};
