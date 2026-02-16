import React, { useState } from 'react';
import { GameState, MachineInstance } from '../types';
import { MINERS_DATA, GENERATORS_DATA } from '../constants';
import { Plus, Lock, Cpu, Zap as ZapIcon, AlertCircle } from 'lucide-react';
import { MachineIcon } from './MachineIcon';
import { MachineModal } from './MachineModal';

interface Props {
  state: GameState;
  onRemoveSlot: (idx: number, category: 'mining' | 'generator') => void; // Kategori isimlendirmesi constants ile eşitlendi
  onEmptySlotClick: (category: 'mining' | 'energy') => void;
  onUnlockRow: (category: 'mining' | 'energy', price: number) => void;
}

export const MiningGrid: React.FC<Props> = ({ state, onRemoveSlot, onEmptySlotClick, onUnlockRow }) => {
  const [activeTab, setActiveTab] = useState<'mining' | 'energy'>('mining');
  const [selectedSlot, setSelectedSlot] = useState<{instance: MachineInstance, idx: number, category: 'mining' | 'energy'} | null>(null);
  
  // Enerji dengesini App.tsx'teki motor verisinden kontrol ediyoruz
  const isOnline = state.energyPool > 0 || (state.hourlyGeneration > state.hourlyConsumption);
  const isMiningTab = activeTab === 'mining';
  
  const currentSlots = isMiningTab ? state.minerSlots : state.generatorSlots;
  const currentUnlocked = isMiningTab ? state.unlockedMinerSlots : state.unlockedGeneratorSlots;
  const currentDataList = isMiningTab ? MINERS_DATA : GENERATORS_DATA;

  const LABELS: any = {
    TR: { hour: 'sa', day: 'gün', install: 'CİHAZ KUR', next: 'SONRAKİ SLOT', unlock: 'KİLİDİ AÇ', mining: 'ASIC', energy: 'ENERJİ' },
    EN: { hour: 'h', day: 'd', install: 'INSTALL', next: 'NEXT SLOT', unlock: 'UNLOCK', mining: 'ASIC', energy: 'POWER' },
    RU: { hour: 'ч', day: 'д', install: 'УСТАНОВИТЬ', next: 'СЛЕД. СЛОТ', unlock: 'ОТКРЫТЬ', mining: 'ASIC', energy: 'ЭНЕРГИЯ' }
  };
  const lang = state.language || 'TR';
  const t = LABELS[lang] || LABELS['TR'];

  const smartFormat = (val: number) => {
    return parseFloat(val.toFixed(2)).toLocaleString(lang === 'RU' ? 'ru-RU' : 'tr-TR');
  };

  const getUnlockPrice = (idx: number, isMining: boolean) => {
    // Fiyatlandırma mantığın sabit kaldı
    if (isMining) {
      if (idx < 4) return 0;
      if (idx < 10) return 1000 + (idx * 100);
      return 5000 + (idx * 500);
    } else {
      if (idx < 2) return 0;
      return 1000 + (idx * 200);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#020617] animate-in fade-in duration-500">
      {/* SEKMELER */}
      <div className="shrink-0 p-4 pb-2 z-20 bg-[#020617]/95 backdrop-blur-md border-b border-white/5 shadow-xl">
        <div className="flex bg-[#0f172a] p-1.5 rounded-[2.5rem] border border-white/5 shadow-inner">
          <button 
            onClick={() => setActiveTab('mining')}
            className={`flex-1 py-4 rounded-[2.2rem] flex flex-col items-center justify-center gap-1 transition-all duration-500 ${isMiningTab ? 'bg-emerald-500 text-black shadow-lg scale-100' : 'text-slate-500 hover:text-slate-300 scale-95'}`}
          >
            <div className="flex items-center gap-2">
              <Cpu size={16} className={isMiningTab ? 'animate-pulse' : ''} />
              <span className="text-[11px] font-black uppercase tracking-widest">{t.mining}</span>
            </div>
            <span className={`text-[8px] font-bold ${isMiningTab ? 'text-black/60' : 'text-slate-600'}`}>
              {state.minerSlots.filter(s => s).length} / 30
            </span>
          </button>

          <button 
            onClick={() => setActiveTab('energy')}
            className={`flex-1 py-4 rounded-[2.2rem] flex flex-col items-center justify-center gap-1 transition-all duration-500 ${!isMiningTab ? 'bg-cyan-500 text-black shadow-lg scale-100' : 'text-slate-500 hover:text-slate-300 scale-95'}`}
          >
            <div className="flex items-center gap-2">
              <ZapIcon size={16} className={!isMiningTab ? 'animate-bounce' : ''} />
              <span className="text-[11px] font-black uppercase tracking-widest">{t.energy}</span>
            </div>
            <span className={`text-[8px] font-bold ${!isMiningTab ? 'text-black/60' : 'text-slate-600'}`}>
              {state.generatorSlots.filter(s => s).length} / 30
            </span>
          </button>
        </div>
      </div>

      {/* İÇERİK */}
      <div className="flex-1 overflow-y-auto p-4 pt-4 pb-32 no-scrollbar">
        {!isOnline && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-3xl flex items-center gap-3 mb-6 animate-pulse shadow-lg shadow-red-500/5">
              <AlertCircle size={20} className="text-red-500" />
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">SİSTEM DURDURULDU (ENERJİ YETERSİZ)</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 w-full">
          {currentSlots.map((slot, idx) => {
            const isLocked = idx >= currentUnlocked;
            const isNextToUnlock = idx === currentUnlocked;

            if (isLocked) {
              const price = getUnlockPrice(idx, isMiningTab);
              const canAfford = (state.silverBalance || 0) >= price;

              return (
                <div 
                  key={`locked-${idx}`} 
                  className={`aspect-square bg-[#1a1b2e] border rounded-[2.5rem] p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${isNextToUnlock ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-white/5 opacity-30 grayscale'}`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${isNextToUnlock ? 'bg-amber-500/20 border-amber-500/30 text-amber-500' : 'bg-slate-900 border-white/5 text-slate-700'}`}>
                    <Lock size={18} />
                  </div>
                  {isNextToUnlock ? (
                    <>
                      <p className="text-[11px] font-black text-amber-400 font-tech">{price.toLocaleString()} 🥈</p>
                      <button 
                        onClick={() => onUnlockRow(activeTab, price)}
                        disabled={!canAfford}
                        className={`w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all ${canAfford ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-500'}`}
                      >
                        {t.unlock}
                      </button>
                    </>
                  ) : (
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic mt-2 text-center">{t.next}</p>
                  )}
                </div>
              );
            }

            const machine = slot ? currentDataList.find(m => m.id === slot.typeId) : null;
            
            if (!slot || !machine) {
              return (
                <div 
                  key={`empty-${idx}`} 
                  onClick={() => onEmptySlotClick(activeTab)} 
                  className="aspect-square flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-white/10 bg-white/5 hover:bg-emerald-500/5 hover:border-emerald-500/40 cursor-pointer active:scale-95 transition-all group"
                >
                  <div className="p-3 bg-white/5 rounded-full mb-1 group-hover:scale-110 group-hover:rotate-90 transition-all">
                     <Plus size={24} className="text-slate-600 group-hover:text-emerald-400" />
                  </div>
                  <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest leading-none group-hover:text-emerald-400">{t.install}</span>
                </div>
              );
            }

            const hourlyVal = isMiningTab ? machine.srgProdPerDay / 24 : Math.abs(machine.energyCostPerDay) / 24;

            return (
              <div 
                key={slot.id || `slot-${idx}`} 
                onClick={() => setSelectedSlot({instance: slot, idx, category: activeTab})}
                className={`aspect-square p-3 flex flex-col items-center justify-between text-center relative rounded-[2.5rem] border bg-gradient-to-b from-[#1a1b2e] to-[#0f172a] shadow-2xl cursor-pointer active:scale-95 transition-all duration-300 hover:border-white/20 ${isOnline ? (isMiningTab ? 'border-emerald-500/20 shadow-emerald-500/5' : 'border-cyan-500/20 shadow-cyan-500/5') : 'border-red-900/40 grayscale brightness-75'}`}
              >
                <h4 className="text-[12px] font-black text-white/70 uppercase truncate w-full px-2 mt-1 tracking-tighter">{machine.name}</h4>
                
                <div className="w-20 h-20 flex items-center justify-center relative my-1">
                  <div className={`absolute inset-0 blur-2xl opacity-10 rounded-full ${isMiningTab ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
                  <MachineIcon machine={machine} size={80} className="relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                </div>

                <div className="w-full bg-black/40 py-2 px-1 rounded-2xl border border-white/5 backdrop-blur-sm flex flex-col gap-0.5">
                  <div className="flex items-center justify-center gap-1">
                    <span className={`text-[18px] font-black font-tech leading-none ${isMiningTab ? 'text-emerald-400' : 'text-cyan-400'}`}>
                      {isMiningTab ? '+' : '-'}{isMiningTab ? Math.floor(hourlyVal).toLocaleString() : smartFormat(hourlyVal)}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                      {isMiningTab ? 'SRG' : 'KW'}/{t.hour}
                    </span>
                  </div>
                </div>

                {/* Aktiflik Noktası */}
                <div className={`absolute top-5 right-5 w-2 h-2 rounded-full border border-black/50 ${isOnline ? (isMiningTab ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]') : 'bg-red-600'}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL */}
      {selectedSlot && (
        <MachineModal 
          slot={selectedSlot.instance}
          silverBalance={state.silverBalance}
          onClose={() => setSelectedSlot(null)}
          onSell={() => {
            // App.tsx'teki kategorilerle eşleşmesi için 'energy' yerine 'generator' gönderiyoruz
            const targetCategory = selectedSlot.category === 'energy' ? 'generator' : 'mining';
            onRemoveSlot(selectedSlot.idx, targetCategory);
            setSelectedSlot(null);
          }}
          language={state.language}
        />
      )}
    </div>
  );
};