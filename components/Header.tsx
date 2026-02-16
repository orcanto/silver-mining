import React from 'react';
import { GameState } from '../types';
import { Zap, Activity } from 'lucide-react';
import { MACHINES, GENERATORS_DATA } from '../constants';

interface HeaderProps {
  state: GameState;
  onOpenDeposit: () => void;
  hourlyProd: number;
  hourlyEnergy?: number;
  hourlyConsumption?: number; // 🚀 YENİ: Tüketim verisi buraya gelmeli
}

export const Header: React.FC<HeaderProps> = ({ 
  state, 
  onOpenDeposit, 
  hourlyProd, 
  hourlyEnergy = 0, 
  hourlyConsumption = 0 
}) => {
  const currentLang = state.language || 'TR';

  const LABELS: any = {
    TR: { silver: 'GMŞ', energyUnit: 'kw/sa', invest: 'YATIRIM', buy: 'SATIN AL', timeUnit: 'sa' },
    EN: { silver: 'SLV', energyUnit: 'kw/h', invest: 'INVEST', buy: 'BUY', timeUnit: 'h' },
    RU: { silver: 'SER', energyUnit: 'кВт/ч', invest: 'ВКЛАД', buy: 'КУПИТЬ', timeUnit: 'ч' }
  };
  const t = LABELS[currentLang] || LABELS['TR'];

  // --- KRİTİK DÜZELTME ---
  // Artık iç hesaplama yapmak yerine App.tsx'ten gelen net farkı kullanıyoruz
  const netEnergy = hourlyEnergy - hourlyConsumption;
  
  const formatDecimal = (val: number) => parseFloat(val.toFixed(2)).toLocaleString('tr-TR');
  const formatInteger = (val: number) => Math.floor(val).toLocaleString('tr-TR');

  return (
    <header className="px-2 pb-1.5 pt-[max(4px,env(safe-area-inset-top))] bg-[#020617] border-b border-white/10 z-[100] sticky top-0 shadow-2xl backdrop-blur-md bg-opacity-95">
      <div className="grid grid-cols-3 gap-1.5">
        
        {/* SRG KUTUSU */}
        <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-lg px-2 flex flex-col justify-center h-[54px] relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-white font-tech tracking-tighter leading-none">
                {Math.floor(state.srgBalance).toLocaleString()}
              </span>
              <span className="text-[9px] font-black text-indigo-400 uppercase">SRG</span>
            </div>
            <p className="text-[10px] font-bold text-emerald-400 leading-none mt-1">
              +{formatInteger(hourlyProd)} <span className="text-[7px] opacity-70">SRG/{t.timeUnit}</span>
            </p>
          </div>
          <div className="absolute right-1 top-1 opacity-10"><Zap size={14} className="text-indigo-400" /></div>
        </div>

        {/* GÜMÜŞ KUTUSU */}
        <div onClick={onOpenDeposit} className="bg-slate-900/50 border border-slate-500/20 rounded-lg px-2 flex items-center justify-between h-[54px] relative overflow-hidden group active:scale-95 transition-transform cursor-pointer">
          <div className="relative z-10 flex flex-col justify-center">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-white font-tech tracking-tighter leading-none">
                {Math.floor(Number(state.silverBalance || 0)).toLocaleString()}
              </span>
              <span className="text-[9px] font-black text-slate-400 uppercase">{t.silver}</span>
            </div>
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-0.5 italic truncate max-w-[60px]">{t.invest}</span>
          </div>
          <div className="bg-emerald-500 text-[9px] font-black text-black px-1.5 py-1 rounded-md shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse relative z-10">{t.buy}</div>
        </div>

        {/* ENERJİ KUTUSU (TAM SENKRONİZE) */}
        <div className={`rounded-lg px-2 flex flex-col justify-center h-[54px] border transition-all duration-500 relative overflow-hidden ${netEnergy >= 0 ? 'bg-cyan-950/40 border-cyan-500/20' : 'bg-red-950/40 border-red-500/20 shadow-[inset_0_0_15px_rgba(239,68,68,0.2)]'}`}>
          <div className="relative z-10">
            <div className="flex items-baseline gap-1 leading-none">
              <span className={`text-lg font-black font-tech tracking-tighter ${netEnergy < 0 ? 'text-red-400' : 'text-white'}`}>
                {state.energyPool.toFixed(2)}
              </span>
              <span className="text-[9px] font-black text-slate-400 uppercase">KW</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
                {/* 🚀 BURASI ÖNEMLİ: Net enerjiyi (Üretim-Tüketim) gösteriyoruz */}
                <span className={`text-[10px] font-black font-tech ${netEnergy >= 0 ? 'text-cyan-400' : 'text-red-500 animate-pulse'}`}>
                  {netEnergy >= 0 ? '+' : ''}{formatDecimal(netEnergy)}
                </span>
                <span className="text-[7px] font-bold text-slate-500 uppercase">{t.energyUnit}</span>
            </div>
          </div>
          <div className="absolute right-1 top-1 opacity-20">
            <Activity size={12} className={netEnergy >= 0 ? 'text-cyan-400' : 'text-red-500 animate-bounce'} />
          </div>
        </div>

      </div>
    </header>
  );
};