
import React, { useState, useMemo, useEffect } from 'react';
import { GameState, MachineType } from '../types';
// Fixed: CPU_TYPES replaced with MINERS_DATA, GENERATOR_TYPES replaced with GENERATORS_DATA
import { MINERS_DATA, GENERATORS_DATA, TRANSLATIONS } from '../constants';
import { Cpu, Zap, ShoppingCart, TrendingUp, Battery, AlertTriangle, Lock, X, CheckCircle2 } from 'lucide-react';
import { MachineIcon } from './MachineIcon';

interface Props {
  gameState: GameState;
  onBuy: (item: MachineType) => void;
  startTab?: 'cpu' | 'gen'; // YENİ: Başlangıç sekmesi
}

export const Shop: React.FC<Props> = ({ gameState, onBuy, startTab = 'cpu' }) => {
  const t = TRANSLATIONS[gameState.language]; // Aktif dil
  const [tab, setTab] = useState<'cpu' | 'gen'>(startTab);
  const [purchasingItem, setPurchasingItem] = useState<MachineType | null>(null);
  
  // startTab değişirse iç state'i güncelle (örn: Maden sayfasından gelince)
  useEffect(() => {
    setTab(startTab);
  }, [startTab]);
  
  // Fixed: CPU_TYPES replaced with MINERS_DATA, GENERATOR_TYPES replaced with GENERATORS_DATA
  const items = useMemo(() => tab === 'cpu' ? MINERS_DATA : GENERATORS_DATA, [tab]);

  const formatNumber = (num: number) => {
    return Math.floor(num).toLocaleString('tr-TR');
  };

  const handleBuyClick = (item: MachineType) => {
    setPurchasingItem(item);
  };

  const confirmPurchase = () => {
    if (purchasingItem) {
      onBuy(purchasingItem);
      setPurchasingItem(null);
    }
  };

  return (
    <div className="p-4 bg-[#0b0e1a] h-full overflow-y-auto no-scrollbar pb-32">
      <div className="flex flex-col gap-4 mb-6 text-center">
         <div className="flex items-center justify-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
              <ShoppingCart className="text-emerald-400 w-5 h-5" />
            </div>
            <h2 className="text-xl font-black tracking-tighter uppercase text-white italic">{t.shopTitle}</h2>
         </div>

         {/* Advice Banner for New Players */}
         <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 p-3 rounded-2xl flex items-start gap-3 text-left">
            <div className="bg-amber-500/20 p-1.5 rounded-lg shrink-0">
               <AlertTriangle size={14} className="text-amber-500" />
            </div>
            <div>
               <h4 className="text-[9px] font-black text-white uppercase">{t.shopTipTitle}</h4>
               <p className="text-[8px] text-slate-400 leading-relaxed font-bold">
                  {t.shopTip}
               </p>
            </div>
         </div>

         <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-white/5 w-full shadow-inner">
            <button 
              onClick={() => setTab('cpu')} 
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black transition-all ${tab === 'cpu' ? 'bg-emerald-600 text-black shadow-xl shadow-emerald-600/20 scale-[1.02]' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Cpu size={12}/> {t.shopTabMiners}
            </button>
            <button 
              onClick={() => setTab('gen')} 
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black transition-all ${tab === 'gen' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-[1.02]' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Zap size={12}/> {t.shopTabGen}
            </button>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
         {items.map(item => {
            const isMining = item.category === 'cpu';
            const hourlyProd = item.srgProdPerDay / 24;
            const hourlyCons = Math.abs(item.energyCostPerDay) / 24;

            // KİLİTLİ ÜRÜN KARTI (GİZLİ)
            if (item.tier === 'LOCKED') {
              return (
                <div 
                  key={item.id} 
                  className="glass opacity-60 grayscale flex flex-col items-center justify-center p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group min-h-[220px]"
                >
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
                   <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
                   
                   <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-600 border-dashed animate-pulse">
                         <Lock size={24} className="text-slate-500" />
                      </div>
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest text-center">{t.shopLocked}</h3>
                   </div>
                </div>
              );
            }

            // NORMAL ÜRÜN KARTI
            return (
              <div 
                key={item.id} 
                className={`glass relative p-3 rounded-[2rem] border transition-all active:scale-[0.98] flex flex-col overflow-hidden transform-gpu group ${isMining ? 'glow-emerald' : 'glow-blue'}`}
              >
                <div className="flex flex-col items-center text-center mb-3">
                   <div className="flex items-center gap-2 mb-1">
                      <p className={`text-[7px] font-black uppercase tracking-[0.1em] ${isMining ? 'text-emerald-400' : 'text-blue-400'}`}>{item.tier}</p>
                   </div>
                   
                   {/* Icon Container */}
                   <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner mb-2 transform-gpu group-hover:scale-110 transition-transform overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>
                      <MachineIcon machine={item} size={48} />
                   </div>
                   
                   <h3 className="font-black text-[10px] uppercase text-white leading-tight truncate w-full px-1">{item.name}</h3>
                </div>
                
                <div className="flex-1 space-y-2 mb-4">
                  {isMining ? (
                    <div className="bg-black/40 rounded-2xl p-3 border border-white/5 space-y-2.5">
                      {/* Saatlik SRG */}
                      <div className="flex flex-col items-center text-center">
                        <div className="flex items-center gap-1 mb-0.5">
                           <TrendingUp size={8} className="text-emerald-400" />
                           <span className="text-[7px] text-emerald-400 font-black uppercase tracking-widest">{t.shopHourlySrg}</span>
                        </div>
                        <div className="text-xl font-black text-white font-tech leading-none">
                          +{formatNumber(hourlyProd)}
                        </div>
                        <span className="text-[7px] text-slate-500 font-bold mt-1">{t.shopDaily}: {formatNumber(item.srgProdPerDay)}</span>
                      </div>

                      <div className="h-px bg-white/10 w-full"></div>

                      {/* Saatlik Tüketim */}
                      <div className="flex flex-col items-center text-center">
                        <div className="flex items-center gap-1 mb-0.5">
                           <Battery size={8} className="text-red-400" />
                           <span className="text-[7px] text-red-400 font-black uppercase tracking-widest">{t.shopHourlyLoad}</span>
                        </div>
                        <div className="text-sm font-black text-white font-tech leading-none">
                          -{hourlyCons.toFixed(2)} Wh
                        </div>
                        <span className="text-[7px] text-slate-500 font-bold mt-1">{t.shopDaily}: {item.energyCostPerDay} Wh</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-500/5 rounded-2xl p-2.5 border border-blue-500/10 flex flex-col items-center">
                       <span className="text-[7px] font-black text-blue-500 uppercase tracking-widest mb-1">{t.shopHourlyProd}</span>
                       <div className="text-lg font-black text-white font-tech leading-none">
                          +{hourlyCons.toFixed(2)} Wh
                       </div>
                       <span className="text-[7px] text-slate-500 font-bold mt-1 uppercase">{t.shopDaily}: {Math.abs(item.energyCostPerDay)} Wh</span>
                    </div>
                  )}
                </div>

                <div className="mt-auto space-y-2">
                   <div className="bg-white/5 py-1.5 rounded-xl border border-white/5 text-center flex flex-col">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-[11px] font-black text-white font-tech">{formatNumber(item.silverCost)}</span>
                        <span className="text-[10px]">🥈</span>
                      </div>
                   </div>
                   <button 
                    onClick={() => handleBuyClick(item)} 
                    disabled={gameState.silverBalance < item.silverCost}
                    className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl ${gameState.silverBalance >= item.silverCost ? isMining ? 'bg-emerald-600 text-black hover:bg-emerald-500' : 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-slate-900 text-slate-700 cursor-not-allowed'}`}
                   >
                    {gameState.silverBalance >= item.silverCost ? t.shopBuy : t.insufficient}
                   </button>
                </div>
              </div>
            );
         })}
      </div>

      {/* CONFIRM PURCHASE MODAL */}
      {purchasingItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in" onClick={() => setPurchasingItem(null)}>
          <div 
            className="w-full max-w-xs bg-[#1a1b2e] rounded-3xl p-6 border border-emerald-500/20 shadow-2xl relative overflow-hidden transform transition-all scale-100" 
            onClick={(e) => e.stopPropagation()}
          >
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShoppingCart size={80} className="text-emerald-500" />
             </div>
             
             <button onClick={() => setPurchasingItem(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                <X size={20} />
             </button>

             <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-inner">
                   <MachineIcon machine={purchasingItem} size={40} />
                </div>
                
                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">{t.shopConfirmTitle}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-6">{purchasingItem.name}</p>
                
                <div className="bg-black/40 rounded-xl p-4 border border-white/5 mb-6 space-y-3">
                   <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.shopPrice}</span>
                      <span className="text-lg font-black text-white">{formatNumber(purchasingItem.silverCost)} <span className="text-[10px] text-slate-500">🥈</span></span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.shopRemaining}</span>
                      <span className={`text-sm font-black ${gameState.silverBalance - purchasingItem.silverCost < 0 ? 'text-red-500' : 'text-emerald-400'}`}>
                         {formatNumber(gameState.silverBalance - purchasingItem.silverCost)} <span className="text-[9px]">🥈</span>
                      </span>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                   <button 
                     onClick={() => setPurchasingItem(null)}
                     className="py-3 rounded-xl bg-slate-800 text-slate-400 text-[10px] font-black uppercase hover:bg-slate-700 transition-colors"
                   >
                     {t.cancel}
                   </button>
                   <button 
                     onClick={confirmPurchase}
                     className="py-3 rounded-xl bg-emerald-600 text-black text-[10px] font-black uppercase shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                   >
                     <CheckCircle2 size={16} /> {t.confirm}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
