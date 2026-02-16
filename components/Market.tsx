import React, { useState } from 'react';
import { GameState, MachineInstance } from '../types';
import { MINERS_DATA, GENERATORS_DATA, TRANSLATIONS } from '../constants';
import { Plus, Lock, Cpu, Zap as ZapIcon, AlertCircle } from 'lucide-react';
import { MachineIcon } from './MachineIcon';
import { MachineModal } from './MachineModal';

interface Props {
  state: GameState;
  onRemoveSlot: (idx: number, category: 'mining' | 'energy') => void;
  onEmptySlotClick: (tab: 'mining' | 'energy') => void;
  onUnlockRow: (category: 'mining' | 'energy', cost: number) => void;
}

export const MiningGrid: React.FC<Props> = ({ state, onRemoveSlot, onEmptySlotClick, onUnlockRow }) => {
  const t = TRANSLATIONS[state.language || 'en'] as any;
  const [activeTab, setActiveTab] = useState<'mining' | 'energy'>('mining');
  const [selectedSlot, setSelectedSlot] = useState<{instance: MachineInstance, idx: number, category: 'mining' | 'energy'} | null>(null);
  
  const isOnline = state.energyPool > 0;
  const isMiningTab = activeTab === 'mining';
  const unlockedCount = isMiningTab ? state.unlockedMinerSlots : state.unlockedGeneratorSlots;

  const smartFormat = (val: number) => {
    return parseFloat(val.toFixed(2)).toLocaleString(state.language === 'RU' ? 'ru-RU' : 'tr-TR');
  };

  const getUnlockPrice = (idx: number, isMining: boolean) => {
    if (!isMining) return 500 * (idx - 2); 
    if (idx < 4) return 0;
    const price = 1000 + (Math.floor((idx - 4) / 4) * 1000);
    return Math.min(10000, price);
  };

  return (
    <div className="flex flex-col h-full w-full p-4 pb-24 overflow-y-auto no-scrollbar">
      
      {/* ÜST TABLAR (SEÇENEKLER) */}
      <div className="flex bg-[#0f172a] p-1 rounded-2xl border border-white/5 mb-6 shrink-0">
        <button 
          onClick={() => setActiveTab('mining')}
          className={`flex-1 py-4 rounded-xl flex flex-col items-center justify-center transition-all ${isMiningTab ? 'bg-slate-800 text-emerald-400 border border-emerald-500/20 shadow-lg' : 'text-slate-500'}`}
        >
          <div className="flex items-center gap-1.5">
            <Cpu size={16} />
            <span className="text-[11px] font-black uppercase">ASIC MINER</span>
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('energy')}
          className={`flex-1 py-4 rounded-xl flex flex-col items-center justify-center transition-all ${!isMiningTab ? 'bg-slate-800 text-cyan-400 border border-cyan-500/20 shadow-lg' : 'text-slate-500'}`}
        >
          <div className="flex items-center gap-1.5">
            <ZapIcon size={16} />
            <span className="text-[11px] font-black uppercase">ENERJİ PANELİ</span>
          </div>
        </button>
      </div>

      {/* HEM MINER HEM ENERJİ İÇİN 2'Lİ GRID YAPISI */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {(isMiningTab ? state.minerSlots : state.generatorSlots).map((slot, idx) => {
            const isLocked = idx >= unlockedCount;
            const isNextToUnlock = idx === unlockedCount;
            
            if (isLocked) {
              if (isNextToUnlock) {
                const currentSlotPrice = getUnlockPrice(idx, isMiningTab);
                const canAfford = state.silverBalance >= currentSlotPrice;
                return (
                  <div key={`locked-${idx}`} className="aspect-square bg-[#1a1b2e] border border-amber-500/30 rounded-2xl p-3 flex flex-col items-center justify-center gap-2">
                    <Lock size={20} className="text-amber-500" />
                    <div className="text-center">
                       <p className="text-[10px] font-black text-amber-400">{currentSlotPrice.toLocaleString()} 🥈</p>
                    </div>
                    <button 
                      onClick={() => onUnlockRow(activeTab, currentSlotPrice)}
                      disabled={!canAfford}
                      className={`w-full py-2 rounded-xl text-[9px] font-black uppercase ${canAfford ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-500'}`}
                    >
                      KİLİT AÇ
                    </button>
                  </div>
                );
              }
              return (
                <div key={`future-${idx}`} className="aspect-square bg-black/20 border border-white/5 rounded-2xl flex items-center justify-center opacity-30">
                   <Lock size={18} className="text-slate-600" />
                </div>
              );
            }

            const dataList = isMiningTab ? MINERS_DATA : GENERATORS_DATA;
            const machine = slot ? dataList.find(m => m.id === slot.typeId) : null;
            
            if (!slot || !machine) return (
                <div key={`empty-${idx}`} onClick={() => onEmptySlotClick(activeTab)} className="aspect-square flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:border-emerald-500/50 cursor-pointer active:scale-95 transition-transform">
                    <Plus size={28} className="text-slate-500 mb-1" />
                    <span className="text-[10px] font-black uppercase text-slate-500">EKLE</span>
                </div>
            );

            const val = smartFormat(isMiningTab ? machine.srgProdPerDay / 24 : Math.abs(machine.energyCostPerDay) / 24);

            return (
              <div 
                key={slot.id || `slot-${idx}`} 
                onClick={() => setSelectedSlot({instance: slot, idx, category: activeTab})}
                className={`aspect-square p-3 flex flex-col items-center justify-between text-center relative rounded-2xl border bg-[#0f172a] shadow-xl cursor-pointer active:scale-95 transition-all ${isOnline ? (isMiningTab ? 'border-emerald-500/30 shadow-emerald-500/5' : 'border-cyan-500/30 shadow-cyan-500/5') : 'border-red-900/50 opacity-60'}`}
              >
                <div className="w-full truncate px-1">
                    <h4 className="text-[9px] font-black text-slate-300 uppercase">{machine.name}</h4>
                </div>
                
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                    <MachineIcon machine={machine} size={36} />
                </div>

                <div className="w-full bg-black/40 py-1.5 rounded-xl border border-white/5">
                    <p className={`text-[11px] font-black font-tech leading-none ${isMiningTab ? 'text-emerald-400' : 'text-cyan-400'}`}>
                      {isMiningTab ? '+' : '-'}{val}
                    </p>
                </div>
                
                <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${isOnline ? (isMiningTab ? 'bg-emerald-500 animate-pulse' : 'bg-cyan-500') : 'bg-red-500'}`} />
              </div>
            );
        })}
      </div>

      {selectedSlot && (
          <MachineModal 
            slot={selectedSlot.instance}
            silverBalance={state.silverBalance}
            onClose={() => setSelectedSlot(null)}
            onSell={() => {
                onRemoveSlot(selectedSlot.idx, selectedSlot.category);
                setSelectedSlot(null);
            }}
            language={state.language}
          />
      )}
    </div>
  );
};