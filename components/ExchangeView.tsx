import React, { useState } from 'react';
import { GameState } from '../types';
import { RefreshCw, Zap, TrendingUp, AlertCircle } from 'lucide-react';

interface ExchangeProps {
  gameState: GameState;
  onExchange: (amount: number) => void;
}

export const ExchangeView: React.FC<ExchangeProps> = ({ gameState, onExchange }) => {
  const [amount, setAmount] = useState('200');
  
  const LABELS: any = {
    TR: { 
      title: 'KRAL DÖNÜŞÜM', 
      withdrawInfo: '🟡 ALTINLAR NAKİT OLARAK ÇEKİLEBİLİR',
      submit: 'PAKETİ ONAYLA',
      low: 'YETERSİZ BAKİYE',
      invalid: 'SADECE 200 VE KATLARI',
      max: 'MAX'
    },
    EN: { 
      title: 'ROYAL EXCHANGE', 
      withdrawInfo: '🟡 GOLD IS WITHDRAWABLE AS CASH',
      submit: 'CONFIRM BUNDLE',
      low: 'LOW BALANCE',
      invalid: 'ONLY MULTIPLES OF 200',
      max: 'MAX'
    },
    RU: { 
      title: 'КОРОЛЕВСКИЙ ОБМЕН', 
      withdrawInfo: '🟡 ЗОЛОТО МОЖНО ВЫВЕСТИ В КЭШ',
      submit: 'ОБМЕНЯТЬ',
      low: 'МАЛО SRG',
      invalid: 'ТОЛЬКО КРАТНО 200',
      max: 'МАКС'
    }
  };
  const l = LABELS[gameState.language || 'TR'];

  const numAmount = parseFloat(amount) || 0;
  
  // 200'ün tam katı mı? (Zorunlu kural)
  const isMultipleOf200 = numAmount > 0 && numAmount % 200 === 0;
  const multiplier = Math.floor(numAmount / 200);
  const canAfford = isMultipleOf200 && numAmount <= (gameState.srgBalance || 0);

  const handleMax = () => {
    const maxPossible = Math.floor((gameState.srgBalance || 0) / 200) * 200;
    setAmount(maxPossible.toString());
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in zoom-in duration-300">
      <div className="text-center space-y-2">
        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase drop-shadow-2xl">{l.title}</h3>
        <div className="bg-amber-500/20 border border-amber-500/30 px-4 py-1.5 rounded-2xl inline-block">
            <p className="text-[11px] text-amber-400 font-black uppercase tracking-widest leading-none">
              200 SRG = 1 🟡 + 1 🥈
            </p>
        </div>
      </div>

      <div className="bg-[#1a1b2e] p-6 rounded-[3rem] border-2 border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full bg-emerald-500/10 py-2 border-b border-emerald-500/20 text-center">
            <p className="text-[8px] font-black text-emerald-400 tracking-[0.2em]">{l.withdrawInfo}</p>
        </div>

        <div className="space-y-6 pt-8 relative z-10">
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SRG MİKTARI</span>
               <button onClick={handleMax} className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-black rounded-lg active:scale-90">{l.max}</button>
            </div>
            
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full bg-black/60 border-2 rounded-[2rem] p-6 text-3xl font-black outline-none transition-all text-center font-tech ${!isMultipleOf200 && numAmount > 0 ? 'border-red-500 text-red-500' : 'border-white/10 text-white focus:border-indigo-500'}`}
              placeholder="0"
            />
            
            {!isMultipleOf200 && numAmount > 0 && (
              <p className="text-center text-[10px] font-black text-red-500 uppercase animate-bounce mt-2">
                ⚠️ {l.invalid}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-b from-amber-400/20 to-transparent p-5 rounded-[2.5rem] border border-amber-500/30 text-center relative overflow-hidden">
                  <p className="text-[8px] font-black text-amber-500 uppercase mb-2 leading-none">CASH GOLD</p>
                  <div className="flex items-center justify-center gap-1">
                      <span className="text-4xl font-black text-white font-tech">+{isMultipleOf200 ? multiplier : 0}</span>
                      <span className="text-2xl">🟡</span>
                  </div>
              </div>

              <div className="bg-gradient-to-b from-slate-400/20 to-transparent p-5 rounded-[2.5rem] border border-slate-500/30 text-center relative overflow-hidden">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-2 leading-none">SILVER</p>
                  <div className="flex items-center justify-center gap-1">
                      <span className="text-4xl font-black text-white font-tech">+{isMultipleOf200 ? multiplier : 0}</span>
                      <span className="text-2xl">🥈</span>
                  </div>
              </div>
          </div>

          <button 
            onClick={() => onExchange(numAmount)}
            disabled={!canAfford}
            className={`w-full py-6 rounded-[2rem] font-black text-lg uppercase flex items-center justify-center gap-3 transition-all active:scale-95 ${canAfford ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' : 'bg-slate-800 text-slate-600 grayscale'}`}
          >
            {numAmount > (gameState.srgBalance || 0) ? l.low : (!isMultipleOf200 && numAmount > 0 ? l.invalid : l.submit)}
          </button>
        </div>
      </div>
    </div>
  );
};