
import React, { useState, useEffect } from 'react';
import { Upgrade, GameState } from '../types';
import { MINERS_DATA, GENERATORS_DATA, TRANSLATIONS } from '../constants';
import { Cpu, Zap, Battery, Sparkles, Lock, ArrowUpCircle } from 'lucide-react';
import { MachineIcon } from './MachineIcon';

interface Props {
  gameState: GameState;
  onBuy: (item: Upgrade) => void;
  currentSilver: number;
  startTab?: 'mining' | 'energy';
  onTabChange?: (tab: 'mining' | 'energy') => void;
  language: 'EN' | 'TR' | 'RU';
  onNavigateToSlots: () => void; // Slotlara yönlendirme için callback
}

export const ShopView: React.FC<Props> = ({ gameState, onBuy, currentSilver, startTab = 'mining', onTabChange, language, onNavigateToSlots }) => {
  const t = TRANSLATIONS[language] as any;
  const [tab, setTab] = useState<'mining' | 'energy'>(startTab);
  
  useEffect(() => {
    setTab(startTab);
  }, [startTab]);

  const handleTabClick = (t: 'mining' | 'energy') => {
    setTab(t);
    if (onTabChange) onTabChange(t);
  };

  const items = tab === 'mining' ? MINERS_DATA : GENERATORS_DATA;

  const isMinerTab = tab === 'mining';
  const unlockedCount = isMinerTab ? gameState.unlockedMinerSlots : gameState.unlockedGeneratorSlots;
  const slots = isMinerTab ? gameState.minerSlots : gameState.generatorSlots;
  const hasEmptySlot = slots.findIndex((s, i) => s === null && i < unlockedCount) !== -1;

  const smartFormat = (val: number) => parseFloat(val.toFixed(2)).toLocaleString(language === 'RU' ? 'ru-RU' : 'tr-TR');

  const handleBuy = (item: any) => {
    if (!hasEmptySlot) {
        onNavigateToSlots();
        return;
    }
    const upgrade: Upgrade = {
        id: item.id,
        name: item.name,
        category: isMinerTab ? 'mining' : 'energy',
        baseCost: item.silverCost,
        multiplier: 1.2,
        powerValue: isMinerTab ? item.srgProdPerDay / 24 : Math.abs(item.energyCostPerDay) / 24,
        energyCost: isMinerTab ? item.energyCostPerDay / 24 : 0,
        icon: item.icon
    };
    onBuy(upgrade);
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500 pb-32 no-scrollbar overflow-y-auto">
      <div className="text-center space-y-1">
          <h2 className="text-xl font-black italic tracking-tighter uppercase text-white leading-none">{t.shopTitle}</h2>
          <p className="text-[8px] text-slate-500 uppercase tracking-[0.4em] font-black">{t.cyberBase}</p>
      </div>

      <div className="flex bg-[#0f172a] p-1 rounded-2xl border border-white/5">
        <button 
          onClick={() => handleTabClick('mining')}
          className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all duration-300 ${tab === 'mining' ? 'bg-slate-800 text-emerald-400 border border-emerald-500/20' : 'text-slate-500'}`}
        >
          {t.miners}
        </button>
        <button 
          onClick={() => handleTabClick('energy')}
          className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all duration-300 ${tab === 'energy' ? 'bg-slate-800 text-cyan-400 border border-cyan-500/20' : 'text-slate-500'}`}
        >
          {t.energy}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map(item => {
          const canAfford = currentSilver >= item.silverCost;
          const isMiner = tab === 'mining';
          
          const hourlyProd = isMiner ? smartFormat(item.srgProdPerDay / 24) : '0';
          const dailyProd = isMiner ? item.srgProdPerDay.toLocaleString(language === 'RU' ? 'ru-RU' : 'tr-TR') : '0';
          
          const consHourly = isMiner ? smartFormat(item.energyCostPerDay / 24) : smartFormat(Math.abs(item.energyCostPerDay) / 24);
          const consDaily = smartFormat(Math.abs(item.energyCostPerDay));

          return (
            <div key={item.id} className={`p-4 flex flex-col transition-all duration-500 rounded-[2rem] border bg-slate-950/90 relative overflow-hidden group ${canAfford ? (isMiner ? 'border-emerald-500/20 shadow-lg' : 'border-cyan-500/20 shadow-lg') : 'border-white/5 opacity-60'}`}>
              
              <div className="grid grid-cols-[56px_1fr] gap-3 items-center mb-4">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/5 shrink-0 shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30"></div>
                    {isMiner ? <MachineIcon machine={item} size={42} /> : <span className="text-2xl">{item.icon}</span>}
                </div>
                <div className="text-left">
                    <h4 className="text-[11px] font-black text-white uppercase leading-tight line-clamp-2 tracking-tight">
                        {item.name}
                    </h4>
                    <div className="flex items-center gap-1 mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${canAfford ? (isMiner ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.5)]') : 'bg-slate-700'}`}></div>
                        <span className="text-[6px] font-black text-slate-500 uppercase tracking-widest">{isMiner ? t.asicUnit : t.powerGen}</span>
                    </div>
                </div>
              </div>
              
              <div className="w-full space-y-2">
                <div className="bg-black/50 py-3 px-3 rounded-2xl border border-white/5 space-y-3">
                   {isMiner ? (
                     <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 border-b border-white/5 pb-2.5">
                           <div className="flex flex-col border-r border-white/5 pr-1">
                              <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{t.shopHourlySrg}</p>
                              <p className="text-[13px] font-black font-tech text-emerald-400">+{hourlyProd}</p>
                           </div>
                           <div className="flex flex-col pl-2 text-right">
                              <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{t.shopDaily}</p>
                              <p className="text-[13px] font-black font-tech text-emerald-400">{dailyProd}</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                           <div className="flex flex-col border-r border-red-500/10 pr-1">
                              <p className="text-[6px] font-black text-red-500/60 uppercase tracking-widest leading-none mb-1">{t.shopHourlyLoad}</p>
                              <p className="text-[12px] font-black font-tech text-red-500">-{consHourly}</p>
                           </div>
                           <div className="flex flex-col pl-2 text-right">
                              <p className="text-[6px] font-black text-red-500/60 uppercase tracking-widest leading-none mb-1">{t.daily}</p>
                              <p className="text-[12px] font-black font-tech text-red-500">-{consDaily}</p>
                           </div>
                        </div>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center py-1">
                        <p className="text-[7px] font-black text-cyan-500 uppercase tracking-[0.2em] leading-none mb-2">{t.powerGen} ({t.unitKwH})</p>
                        <p className="text-[20px] font-black font-tech text-cyan-400 leading-none">+{consHourly}</p>
                        <p className="text-[7px] text-slate-500 font-bold uppercase mt-2 border-t border-white/5 pt-1.5 w-full text-center">{t.daily}: {consDaily} KW</p>
                     </div>
                   )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                   <div className="flex-1 bg-white/5 py-2.5 rounded-xl border border-white/5 flex items-center justify-center gap-1.5">
                      <span className="text-[13px] font-tech font-black text-amber-400">{item.silverCost.toLocaleString(language === 'RU' ? 'ru-RU' : 'tr-TR')}</span>
                      <span className="text-[11px]">🥈</span>
                   </div>
                   
                   {!hasEmptySlot ? (
                       <button
                         onClick={onNavigateToSlots}
                         className="flex-[1.5] py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-amber-500 text-black shadow-lg animate-pulse flex items-center justify-center gap-1"
                       >
                         <Lock size={12} /> KİLİT AÇ
                       </button>
                   ) : (
                       <button
                        onClick={() => handleBuy(item)}
                        disabled={!canAfford}
                        className={`flex-[1.5] py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${canAfford ? (isMiner ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20') : 'bg-slate-900 text-slate-700 cursor-not-allowed'}`}
                       >
                        {canAfford ? t.shopBuy : t.insufficient}
                      </button>
                   )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
