import React, { useState, useEffect } from 'react';
import { MachineInstance } from '../types';
import { MACHINES, TRANSLATIONS } from '../constants';
import { Trash2, AlertTriangle, Timer, X } from 'lucide-react';

interface Props {
  slot: MachineInstance;
  silverBalance: number;
  onClose: () => void;
  onSell: () => void;
  language?: 'TR' | 'EN' | 'RU';
}

export const MachineModal: React.FC<Props> = ({ slot, onClose, onSell, language = 'TR' }) => {
  const t = TRANSLATIONS[language] as any;
  const [showConfirm, setShowConfirm] = useState(false);
  const [now, setNow] = useState(Date.now());

  // ⏱️ Anlık zaman takibi için timer
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const type = MACHINES.find(t => t.id === slot.typeId);
  if (!type) return null;

  // --- KRİTİK ZAMAN HESABI ---
  const timeDiff = now - (slot.purchaseTime || 0);
  const GRACE_PERIOD = 900000; // 15 Dakika
  const isTrial = timeDiff < GRACE_PERIOD;
  const remaining = Math.max(0, GRACE_PERIOD - timeDiff);
  
  const mm = Math.floor(remaining / 60000);
  const ss = Math.floor((remaining % 60000) / 1000);

  // İade oranı: Deneme süresindeyse %100, değilse %70
  const refundAmt = Math.floor(type.silverCost * (isTrial ? 1.0 : 0.70));

  const labels = {
    trial: { TR: "DENEME SÜRESİ", EN: "TRIAL PERIOD", RU: "ПРОБНЫЙ ПЕРИОД" },
    expired: { TR: "SÜRE DOLDU", EN: "TIME EXPIRED", RU: "СРОК ИСТЕК" },
    refundBtn: { TR: "İADE ET", EN: "REFUND", RU: "ВЕРНУТЬ" }
  };

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" 
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[300px] bg-[#1a1b2e] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in duration-200 relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Deneme Süresi İlerleme Çubuğu */}
        {isTrial && (
          <div 
            className="absolute top-0 left-0 h-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000" 
            style={{ width: `${(remaining / GRACE_PERIOD) * 100}%` }} 
          />
        )}

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X size={18} />
        </button>

        {!showConfirm ? (
          <>
            <div className="text-center mb-6">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border mb-4 ${isTrial ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-white/5 text-slate-500'}`}>
                <Timer size={12} className={isTrial ? 'animate-pulse' : ''} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {isTrial ? `${mm}:${ss.toString().padStart(2, '0')}` : labels.expired[language]}
                </span>
              </div>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">{type.tier}</p>
              <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-tight">{type.name}</h3>
            </div>

            <div className="bg-slate-900/50 rounded-[2rem] p-5 border border-white/5 text-center mb-8 relative group">
              <div className="absolute inset-0 bg-emerald-500/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-[9px] text-slate-500 font-black uppercase mb-1 tracking-widest">{t.mmRefundAmount}</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-black text-white font-tech tracking-tighter">
                  {refundAmt.toLocaleString('tr-TR')}
                </span>
                <span className="text-lg">🥈</span>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => setShowConfirm(true)} 
                className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg ${
                  isTrial 
                    ? 'bg-emerald-500 text-black shadow-emerald-500/20' 
                    : 'bg-red-600 text-white shadow-red-600/20'
                }`}
              >
                <Trash2 size={16} />
                {isTrial ? labels.refundBtn[language] : t.mmSell}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-amber-500" />
            </div>
            <h4 className="text-sm font-black text-white mb-2 uppercase tracking-tight">{t.mmConfirmTitle}</h4>
            <p className="text-[10px] text-slate-400 mb-6 leading-relaxed">
              {language === 'TR' ? 'Bu işlem geri alınamaz. Onaylıyor musunuz?' : 'This action cannot be undone.'}
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)} 
                className="flex-1 py-3.5 rounded-2xl bg-slate-800 text-[10px] font-black uppercase text-slate-400 active:scale-95 transition-transform"
              >
                {t.cancel}
              </button>
              <button 
                onClick={onSell} 
                className="flex-1 py-3.5 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase shadow-lg shadow-red-600/20 active:scale-95 transition-transform"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};