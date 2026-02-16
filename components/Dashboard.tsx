import React, { useMemo } from 'react';
import { GameState } from '../types';
import { MINERS_DATA, LEVEL_TITLES, UPGRADES, TRANSLATIONS } from '../constants';
import { Cpu, Zap, Battery, Trash2, Plus, AlertCircle, TrendingUp } from 'lucide-react';
import { MachineIcon } from './MachineIcon';

interface DashboardProps {
  gameState: GameState;
  onRemove: (slotId: number) => void;
  onGoMarket: () => void;
  onUpgrade: (slotId: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ gameState, onRemove, onGoMarket, onUpgrade }) => {
  // 🚀 Performans Fix: Rütbe hesaplamasını memoize ettik
  const currentLevel = useMemo(() => {
    return [...LEVEL_TITLES].reverse().find(l => (gameState.totalSrgEarned || 0) >= l.threshold) || LEVEL_TITLES[0];
  }, [gameState.totalSrgEarned]);

  const t = TRANSLATIONS[gameState.language] as any;

  // 🚀 Toplam Verim Hesaplama
  const totalProduction = useMemo(() => {
    return gameState.minerSlots.reduce((acc, slot) => {
      if (!slot) return acc;
      const m = MINERS_DATA.find(u => u.id === slot.typeId);
      // Enerji yoksa üretim 0 döner
      return acc + (gameState.hourlyGeneration > gameState.hourlyConsumption && m ? m.srgProdPerDay / 24 : 0);
    }, 0);
  }, [gameState.minerSlots, gameState.hourlyGeneration, gameState.hourlyConsumption]);

  return (
    <div className="flex flex-col h-full w-full p-6 pb-32 space-y-6 overflow-y-auto bg-slate-950 no-scrollbar">
      
      {/* Farm Profile */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-5 border border-white/5 shadow-2xl">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1 italic opacity-80">CYBER FARM</h2>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{gameState.farmName || 'ADSİZ ÜS'}</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-1">
              <Zap size={10} className="text-amber-500" />
              {t[currentLevel.title] || currentLevel.title}
            </p>
          </div>
          <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Grid Stats (Görsel İyileştirme) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/10">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mb-1">ŞEBEKE GİRİŞİ</p>
          <p className="text-base font-tech font-black text-emerald-400">+{gameState.hourlyGeneration.toFixed(1)} <span className="text-[8px] opacity-60">KW/S</span></p>
        </div>
        <div className="bg-amber-500/5 rounded-2xl p-4 border border-amber-500/10 text-right">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mb-1">MADEN VERİMİ</p>
          <p className="text-base font-tech font-black text-amber-400">{totalProduction.toFixed(1)} <span className="text-[8px] opacity-60">SRG/S</span></p>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Cpu className="w-3 h-3 text-indigo-400" /> AKTİF ÜNİTELER
          </h3>
          <span className="text-[10px] font-bold text-slate-600 bg-white/5 px-2 py-0.5 rounded-full">
            {gameState.minerSlots.filter(s => s !== null).length} / {gameState.unlockedMinerSlots}
          </span>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {gameState.minerSlots.map((slot, idx) => {
            if (idx >= gameState.unlockedMinerSlots) return null;
            
            if (!slot) {
              return (
                <button 
                  key={`empty-slot-${idx}`}
                  onClick={onGoMarket}
                  className="group h-20 rounded-2xl border-2 border-dashed border-slate-800 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-3"
                >
                  <Plus className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  <span className="text-[10px] font-black text-slate-600 group-hover:text-indigo-400 uppercase tracking-widest">YENİ DONANIM EKLE</span>
                </button>
              );
            }

            const machine = MINERS_DATA.find(u => u.id === slot.typeId);
            if (!machine) return null;

            const isRunning = gameState.hourlyGeneration >= gameState.hourlyConsumption;

            return (
              <div key={slot.id} className="bg-slate-900/40 rounded-2xl p-4 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center shadow-2xl border border-white/5 relative group-hover:scale-110 transition-transform">
                      <MachineIcon machine={machine} size={32} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase">{machine.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-500">T{machine.tier}</span>
                        <span className="text-[9px] text-emerald-400 font-black">
                          +{(machine.srgProdPerDay/24).toFixed(1)} SRG/S
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onUpgrade(idx)}
                      className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500 hover:text-white transition-all"
                    >
                      <TrendingUp size={14} />
                    </button>
                    <button 
                      onClick={() => onRemove(idx)}
                      className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="mt-4 space-y-1 relative z-10">
                  <div className="flex justify-between text-[7px] font-black uppercase tracking-tighter">
                    <span className={!isRunning ? 'text-red-500 animate-pulse' : 'text-slate-500'}>
                      {!isRunning ? 'SİSTEM ÇÖKTÜ - ENERJİ YETERSİZ' : 'STABİL ÇALIŞMA'}
                    </span>
                    <span className={!isRunning ? 'text-red-500' : 'text-emerald-400'}>
                      {!isRunning ? 'OFFLINE' : 'ONLINE'}
                    </span>
                  </div>
                  <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${!isRunning ? 'bg-red-500 w-0' : 'bg-emerald-400 w-full shadow-[0_0_8px_rgba(52,211,153,0.5)]'}`}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};