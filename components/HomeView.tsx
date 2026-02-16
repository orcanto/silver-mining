import React, { useState } from 'react';
import { GameState, View } from '../types';
import { TRANSLATIONS, LEVEL_TITLES } from '../constants';
import { TonConnectButton } from '@tonconnect/ui-react';
import { 
  Repeat, 
  Calendar,
  TrendingUp,
  Plus,
  Award,
  Zap,
  Lock,
  AlertTriangle,
  Database,
  Users,
  Gift,
  Cpu,
  Globe,
  ArrowUpRight,
  HelpCircle,
  CheckCircle2,
  History 
} from 'lucide-react';

interface Props {
  gameState: GameState;
  onNavigate: (view: View) => void;
  onOpenDailyBonus: () => void; // 🛠️ cvoid hatası düzeltildi
  onOpenWithdrawal: () => void;
  onOpenDeposit: () => void;
  onLanguageChange: (lang: 'TR' | 'EN' | 'RU') => void;
  onReinvest: (amount: number) => void;
  onClaimTask: (taskId: string, reward: number) => void;
  onClaimReferral?: () => void;
  onResetTutorial?: () => void;
  onOpenHistory?: () => void; 
  hourlyProd: number; 
}

export const HomeView: React.FC<Props> = ({ 
  gameState, onNavigate, onOpenDailyBonus, 
  onOpenWithdrawal, onOpenDeposit, onLanguageChange, onReinvest, onClaimTask, onClaimReferral, onResetTutorial,
  onOpenHistory, 
  hourlyProd 
}) => {
  const t = TRANSLATIONS[gameState.language] as any;
  const [adminClicks, setAdminClicks] = useState(0);
  
  const lastActiveHours = (Date.now() - gameState.lastUpdate) / 3600000;
  const isStoppedByInactivity = lastActiveHours > 72;

  // 🚀 Mevcut rütbeyi ve sonrakini hesapla
  const currentLevel = [...LEVEL_TITLES].reverse().find(l => gameState.totalSrgEarned >= l.threshold) || LEVEL_TITLES[0];
  const nextLevel = LEVEL_TITLES.find(l => l.threshold > gameState.totalSrgEarned);
  
  const progress = nextLevel 
    ? ((gameState.totalSrgEarned - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100 
    : 100;

  // Enerji biterse veya inaktiflik varsa üretim durur
  const totalHourlySrg = gameState.energyPool > 0 && !isStoppedByInactivity ? hourlyProd : 0;
  
  const bonusMultiplier = currentLevel.bonus;
  const baseValue = hourlyProd / (1 + bonusMultiplier);
  const bonusAmount = hourlyProd - baseValue;

  const handleAdminClick = () => {
    // 🛡️ SADECE SENİN TG ID'NE ÖZEL KİLİT
    const MY_ADMIN_ID = "1531240410"; 

    // ID kontrolü (String karşılaştırması en güvenlisidir)
    if (String(gameState.id) !== MY_ADMIN_ID) {
      // ID eşleşmiyorsa fonksiyonu burada bitir, tık sayma
      return; 
    }

    const nextCount = adminClicks + 1;
    setAdminClicks(nextCount);
    if (nextCount >= 5) {
      onNavigate('admin');
      setAdminClicks(0);
    }
  };

  return (
    <div className="p-4 space-y-4 select-none pb-32 animate-in fade-in duration-700">
      
      {/* ÜST BAR: Cüzdan ve Dil Seçimi */}
      <div className="flex justify-between items-center mb-2 px-1 gap-2">
          <div className="flex items-center gap-2">
            <div className="scale-[0.75] origin-left">
              <TonConnectButton />
            </div>
            {gameState.walletAddress && (
              <div className="hidden min-[380px]:flex items-center gap-1 text-[7px] font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">
                <CheckCircle2 size={8} />
                {gameState.walletAddress.slice(-4)}
              </div>
            )}
          </div>

          <div className="flex gap-1.5">
            {[{ code: 'EN', flag: '🇺🇸' }, { code: 'TR', flag: '🇹🇷' }, { code: 'RU', flag: '🇷🇺' }].map(lang => (
              <button 
                key={lang.code} 
                onClick={() => onLanguageChange(lang.code as any)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all border ${gameState.language === lang.code ? 'bg-emerald-500/20 border-emerald-500 shadow-lg' : 'bg-slate-900 border-white/5 opacity-50'}`}
              >
                {lang.flag}
              </button>
            ))}
          </div>
      </div>

      {isStoppedByInactivity && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-[2rem] flex items-center gap-4 animate-pulse mx-2">
            <AlertTriangle className="text-red-500 shrink-0" size={24} />
            <div>
              <p className="text-[10px] font-black text-red-500 uppercase leading-none">MINING STOPPED!</p>
              <p className="text-[8px] text-red-400 font-bold uppercase mt-1">Inactive for too long.</p>
            </div>
        </div>
      )}

      {/* RÜTBE PANELİ */}
      <div className="bg-gradient-to-br from-[#1a1b2e] to-black p-5 rounded-[2.5rem] border border-emerald-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Award size={80} className="text-emerald-500" />
          </div>
          
          <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex flex-col" onClick={handleAdminClick}>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">
                  {gameState.language === 'EN' ? 'CURRENT RANK' : (gameState.language === 'TR' ? 'MEVCUT RÜTBE' : 'РАНГ')}
                </span>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.7)]"></div>
                    <span className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">{t[currentLevel.title]}</span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 bg-emerald-500/10 w-fit px-2 py-1 rounded-lg border border-emerald-500/20">
                   <TrendingUp size={12} className="text-emerald-400" />
                   <span className="text-[10px] font-black text-emerald-400 uppercase">BONUS: %{Math.round(currentLevel.bonus * 100)}</span>
                </div>
              </div>

              {nextLevel && (
                <div className="text-right flex flex-col items-end">
                   <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">{t.nextRank}</span>
                   <div className="flex items-center gap-1.5">
                      <Lock size={10} className="text-amber-500" />
                      <span className="text-xs font-black text-slate-300 uppercase italic tracking-tighter">{t[nextLevel.title]}</span>
                   </div>
                </div>
              )}
          </div>
          
          <div className="space-y-3 relative z-10">
              <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest">
                <span>{t.progress}</span>
                <span className="text-slate-400">{nextLevel ? `${Math.floor(gameState.totalSrgEarned).toLocaleString()} / ${nextLevel.threshold.toLocaleString()}` : 'MAX'}</span>
              </div>
              <div className="w-full h-3 bg-black/50 rounded-full border border-white/5 overflow-hidden p-0.5">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
              </div>
          </div>
      </div>

      {/* ÜRETİM PANELİ */}
      <div className="bg-[#0f172a] p-5 rounded-[2.5rem] border border-indigo-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Cpu size={64} className="text-indigo-500" />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">{t.shopHourlySrg}</p>
                <h3 className="text-2xl font-black text-white font-tech tracking-tighter">
                   {totalHourlySrg.toFixed(2)} <span className="text-xs text-indigo-500">SRG/H</span>
                </h3>
              </div>
              <button onClick={() => onNavigate('exchange')} className="py-2.5 px-4 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 text-[8px] font-black uppercase flex items-center gap-1 active:scale-95">
                <Repeat size={10} /> {t.reinvestBtn}
              </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5 relative z-10">
              <div>
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">BASE GEN</p>
                <p className="text-xs font-black text-white">+{baseValue.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[7px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">{t.bonus}</p>
                <p className="text-xs font-black text-emerald-400">+{bonusAmount.toFixed(2)}</p>
              </div>
          </div>
      </div>

      {/* ALT PANEL: Silver (Sol) ve Gold (Sağ) */}
<div className="grid grid-cols-2 gap-3">
    {/* SILVER PANEL - Buraya dokunulmadı */}
    <div className="bg-[#1a1b2e] p-4 rounded-[2rem] border border-white/5 flex flex-col justify-between min-h-[140px]">
        <div>
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.investSilver}</p>
          <h3 className="text-xl font-black text-white font-tech tracking-tighter">{Math.floor(gameState.silverBalance).toLocaleString()}</h3>
          
          <button 
            onClick={onOpenHistory}
            className="mt-1 flex items-center gap-1 text-[7px] font-black text-slate-500 uppercase hover:text-emerald-400 transition-colors"
          >
            <History size={10} /> {gameState.language === 'TR' ? 'İŞLEM GEÇMİŞİ' : 'TRANS_HISTORY'}
          </button>
        </div>
        
        <button onClick={onOpenDeposit} className="mt-3 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30 text-[8px] font-black uppercase flex items-center justify-center gap-1 active:scale-95">
          <Plus size={10} /> {t.depTitle}
        </button>
    </div>

    {/* GOLD PANEL - Sadece buraya bilgi eklendi */}
    <div className="bg-gradient-to-br from-amber-500/20 to-black p-4 rounded-[2rem] border border-amber-500/20 flex flex-col justify-between min-h-[140px]">
        <div>
          <p className="text-[8px] font-black text-amber-500/70 uppercase tracking-widest mb-1">{t.cashGold}</p>
          <h3 className="text-xl font-black text-white font-tech tracking-tighter">{Math.floor(gameState.goldBalance).toLocaleString()}</h3>
          
          {/* 🚀 ALTIN KUTUSU İÇİ MİNİK BİLGİ */}
          <div className="mt-1.5 pt-1.5 border-t border-amber-500/10 space-y-0.5">
            <p className="text-[6.5px] font-bold text-amber-500/60 uppercase leading-none">
              {gameState.language === 'TR' ? 'MİN. ÇEKİM: 100' : 
               gameState.language === 'RU' ? 'МИН. ВЫВОД: 100' : 
               'MIN. WITHDRAW: 100'}
            </p>
            <p className="text-[6.5px] font-bold text-slate-500 uppercase leading-none">
              {gameState.language === 'TR' ? '1000 = 1.00 USD' : 
               gameState.language === 'RU' ? '1000 = 1.00 USD' : 
               '1000 = 1.00 USD'}
            </p>
          </div>
        </div>
        
        <button onClick={onOpenWithdrawal} className="mt-3 py-2.5 bg-amber-500 text-black rounded-xl text-[8px] font-black uppercase shadow-lg shadow-amber-500/20 active:scale-95">
          {t.cashOut}
        </button>
    </div>
</div>

      <div className="grid grid-cols-2 gap-3">
          <button onClick={onOpenDailyBonus} className="bg-slate-900 border border-white/5 p-4 rounded-[2rem] flex flex-col items-center justify-center gap-2 min-h-[100px] active:scale-95 transition-transform">
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500"><Calendar size={18} /></div>
            <h3 className="text-[9px] font-black text-white uppercase tracking-widest">{t.dailyReward}</h3>
          </button>
          <button onClick={() => onNavigate('tasks')} className="bg-slate-900 border border-white/5 p-4 rounded-[2rem] flex flex-col items-center justify-center gap-2 min-h-[100px] active:scale-95 transition-transform">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400"><Globe size={18} /></div>
            <h3 className="text-[9px] font-black text-white uppercase tracking-widest">{t.tasks}</h3>
          </button>
      </div>

    </div>
  );
};