import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, CheckCircle2, Lock, X } from 'lucide-react';
import { DAILY_REWARDS } from '../constants';

interface Props {
  streak: number;
  lastClaim: number;
  language: string;
  onClaim: () => void;
  onClose: () => void;
}

export const DailyBonus: React.FC<Props> = ({ streak = 0, lastClaim = 0, language = 'EN', onClaim, onClose }) => {
  
  // 🌍 DİL DESTEĞİ (TR, EN, RU)
  const LABELS: any = {
    TR: {
      title: "GÜNLÜK ÖDÜL",
      subtitle: "Her gün gel, seriyi bozma, kazan!",
      day: "GÜN",
      claim: "ÖDÜLÜ AL",
      comeBack: "YARIN GEL",
      close: "PENCEREYİ KAPAT",
      wait: "Kalan Süre:"
    },
    EN: {
      title: "DAILY REWARD",
      subtitle: "Come back daily, keep the streak!",
      day: "DAY",
      claim: "CLAIM REWARD",
      comeBack: "COME BACK TOMORROW",
      close: "CLOSE WINDOW",
      wait: "Time Left:"
    },
    RU: {
      title: "ЕЖЕДНЕВНЫЙ БОНУС",
      subtitle: "Заходите каждый день, держите серию!",
      day: "ДЕНЬ",
      claim: "ЗАБРАТЬ",
      comeBack: "ПРИХОДИТЕ ЗАВТРА",
      close: "ЗАКРЫТЬ",
      wait: "Осталось:"
    }
  };

  const t = LABELS[language] || LABELS['EN']; // Varsayılan EN

  // 🕒 UTC 00:00 KONTROLÜ
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [canClaim, setCanClaim] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      
      // UTC Tarihlerini Karşılaştır (YYYY-MM-DD formatında)
      const currentUtcDate = now.toISOString().split('T')[0];
      const lastClaimDate = new Date(lastClaim || 0);
      const lastClaimUtcDate = lastClaim === 0 ? '1970-01-01' : lastClaimDate.toISOString().split('T')[0];

      // Eğer bugünün tarihi son alınan tarihten farklıysa ALABİLİR
      const isAvailable = currentUtcDate !== lastClaimUtcDate;
      setCanClaim(isAvailable);

      // UTC 00:00'a Kalan Süreyi Hesapla
      const nextMidnightUTC = new Date();
      nextMidnightUTC.setUTCHours(24, 0, 0, 0); // Bir sonraki UTC gece yarısı
      
      const diff = nextMidnightUTC.getTime() - now.getTime();
      
      if (diff > 0) {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeftStr(`${h}s ${m}d ${s}sn`);
      } else {
        setTimeLeftStr('00:00:00');
      }
    };

    checkStatus(); // İlk açılışta kontrol et
    const timer = setInterval(checkStatus, 1000); // Her saniye güncelle

    return () => clearInterval(timer);
  }, [lastClaim]);

  // 7 Günlük Döngü İndeksi
  const currentIndex = streak % 7;

  // Güvenli Veri Listesi (Sayı/Obje Desteği)
  const safeRewards = Array.isArray(DAILY_REWARDS) && DAILY_REWARDS.length > 0 
    ? DAILY_REWARDS 
    : Array.from({ length: 7 }, (_, i) => ({ day: i + 1, silver: (i + 1) * 100, gold: 0 }));

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-[#1a1b2e] rounded-[2rem] border border-amber-500/20 shadow-2xl relative overflow-hidden">
        
        {/* Arka Plan Efekti */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none" />

        {/* Kapat Butonu (Sağ Üst) */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-20">
          <X size={24} />
        </button>

        <div className="p-6 relative z-10">
           {/* Başlık */}
           <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                 <Calendar size={32} className="text-amber-500" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{t.title}</h2>
              <p className="text-xs text-slate-400 font-bold mt-1">{t.subtitle}</p>
           </div>

           {/* Ödül Grid */}
           <div className="grid grid-cols-4 gap-2 mb-6">
              {safeRewards.map((item, idx) => {
                 // Veri Güvenliği
                 const isObject = typeof item === 'object' && item !== null;
                 const silverAmount = isObject ? (item as any).silver || (item as any).amount : Number(item);
                 const goldAmount = isObject ? (item as any).gold || 0 : 0;
                 const dayNum = isObject ? (item as any).day : idx + 1;

                 const isCompleted = idx < currentIndex;
                 const isCurrent = idx === currentIndex;
                 const isLocked = idx > currentIndex;

                 return (
                    <div key={idx} className={`relative flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all min-h-[70px] ${isCompleted ? 'bg-emerald-500/10 border-emerald-500/30' : ''} ${isCurrent ? 'bg-amber-500/20 border-amber-500 scale-105 shadow-lg shadow-amber-500/20 z-10' : ''} ${isLocked ? 'bg-slate-900 border-slate-800 opacity-50' : ''}`}>
                       
                       <p className="text-[7px] font-black text-slate-500 mb-1">{t.day} {dayNum}</p>
                       
                       {/* Gümüş */}
                       <p className="text-[10px] font-black text-white">{silverAmount} 🥈</p>
                       
                       {/* Altın */}
                       {goldAmount > 0 && <p className="text-[8px] font-black text-amber-400">+{goldAmount} 🟡</p>}
                       
                       {/* Tamamlandı İkonu */}
                       {isCompleted && (
                           <div className="absolute inset-0 bg-emerald-950/60 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
                               <CheckCircle2 size={20} className="text-emerald-500 drop-shadow-md" />
                           </div>
                       )}
                       
                       {/* Kilit İkonu */}
                       {isLocked && <Lock size={12} className="text-slate-600 mt-1" />}
                    </div>
                 )
              })}
           </div>

           {/* Aksiyon Butonu */}
           <button 
             onClick={canClaim ? onClaim : onClose} 
             disabled={!canClaim && false} // Buton her zaman aktif olsun, claim değilse kapatma görevi görsün veya pasif kalsın (tercih senin)
             className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${canClaim ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 active:scale-95 hover:bg-amber-400' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
           >
             {canClaim ? t.claim : `${t.wait} ${timeLeftStr}`}
           </button>
           
           {!canClaim && (
               <div className="text-center mt-3">
                   <p className="text-[9px] text-slate-500 font-mono">{t.comeBack}</p>
               </div>
           )}
        </div>
      </div>
    </div>
  );
};
