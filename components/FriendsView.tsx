import React, { useState, useEffect } from 'react';
import { GameState } from '../types';
import { Users, Copy, Share2, Check, Loader2, TrendingUp, UserCheck, Info, Sparkles, Coins, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TRANSLATIONS } from '../constants';

interface Props {
  gameState: GameState;
  onClaimReward: (id: number) => void;
}

// Önbellek
let lastFetchTime = 0;
let cachedDetails: any[] = [];
let cachedSponsorName: string | null = null;

export const FriendsView: React.FC<Props> = ({ gameState, onClaimReward }) => {
  const [copied, setCopied] = useState(false);
  const [refDetails, setRefDetails] = useState<any[]>(cachedDetails);
  const [loading, setLoading] = useState(false);
  const [sponsorName, setSponsorName] = useState<string | null>(cachedSponsorName);
  const [isCollecting, setIsCollecting] = useState(false);

  const lang = gameState.language || 'TR';
  const t = TRANSLATIONS[lang] as any;

  const labels = {
    teamBonus: lang === 'TR' ? 'KAZANÇ' : lang === 'RU' ? 'ДОХОД' : 'BONUS', // Kısaltıldı
    claim200: lang === 'TR' ? '200 GÜMÜŞ AL' : lang === 'RU' ? 'ПОЛУЧИТЬ 200' : 'CLAIM 200',
    notReached: lang === 'TR' ? 'HEDEF BEKLENİYOR' : lang === 'RU' ? 'ОЖИДАНИЕ' : 'WAITING TARGET', // Kısaltıldı
    claimed: lang === 'TR' ? 'ALINDI' : lang === 'RU' ? 'ПОЛУЧЕНО' : 'CLAIMED', // Kısaltıldı
    mySponsor: lang === 'TR' ? 'SENİ DAVET EDEN' : lang === 'RU' ? 'ВАС ПРИГЛАСИЛ' : 'YOUR SPONSOR',
    linkCopied: lang === 'TR' ? 'LİNK KOPYALANDI!' : lang === 'RU' ? 'СКОПИРОВАНА!' : 'COPIED!',
    inviteBtn: lang === 'TR' ? 'DAVET ET' : lang === 'RU' ? 'ПРИГЛАСИТЬ' : 'INVITE',
    direct: lang === 'TR' ? 'YOK' : 'NONE',
    claimAll: lang === 'TR' ? 'HEPSİNİ AL' : lang === 'RU' ? 'СОБРАТЬ ВСЕ' : 'CLAIM ALL',
    noReward: lang === 'TR' ? 'ÖDÜL YOK' : 'NO REWARD',
    infoTitle: lang === 'TR' ? 'NASIL KAZANIRIM?' : 'HOW TO EARN?',
    activeFriend: lang === 'TR' ? 'AKTİF ARKADAŞ' : 'ACTIVE FRIEND',
    activeDesc: lang === 'TR' ? '1000 SRG toplayan her arkadaşın için:' : 'For every friend mining 1000 SRG:',
    passiveIncome: lang === 'TR' ? 'PASİF GELİR' : 'PASSIVE INCOME',
    passiveDesc: lang === 'TR' ? 'Arkadaşının harcamalarından payın:' : 'Share from friend\'s spendings:'
  };

  const userId = gameState.id || 0;
  const inviteLink = `https://t.me/SilverRigBot?start=${userId}`;

  // 1️⃣ SPONSOR İSMİ
  useEffect(() => {
    const fetchSponsor = async () => {
      if (!gameState.referredBy || cachedSponsorName) {
        if (cachedSponsorName) setSponsorName(cachedSponsorName);
        return;
      }
      const isId = /^\d+$/.test(gameState.referredBy);
      if (isId) {
        const { data } = await supabase.from('profiles').select('username').eq('id', gameState.referredBy).single();
        const name = data?.username || `ID: ${gameState.referredBy}`;
        setSponsorName(name);
        cachedSponsorName = name;
      } else {
        setSponsorName(gameState.referredBy);
        cachedSponsorName = gameState.referredBy;
      }
    };
    fetchSponsor();
  }, [gameState.referredBy]);

    // 2️⃣ LİSTE ÇEKME VE HESAPLAMA
  useEffect(() => {
    const fetchStats = async () => {
      const currentTime = Date.now();
      
      // Önbellek kontrolü (Sürekli sorgu atmasın)
      if (currentTime - lastFetchTime < 600000 && cachedDetails.length > 0) {
        setRefDetails(cachedDetails);
        return;
      }
      
      if (!gameState.referrals || gameState.referrals.length === 0) {
        setRefDetails([]);
        return;
      }
      
      setLoading(true);
      try {
        const cleanIds = gameState.referrals.map(id => Number(id)).filter(id => !isNaN(id));
        
        // KRİTİK NOKTA: Adamın sadece adını değil, 'depositRequests' (Yatırım Geçmişi) verisini de çekiyoruz!
        const { data } = await supabase
          .from('profiles')
          .select('id, username, game_state') // game_state içinde depositRequests var
          .in('id', cleanIds);

        const formattedData = data?.map(profile => {
          // 💰 HESAPLAMA BURADA YAPILIYOR
          // 1. Adamın tüm taleplerini al
          const deposits = profile.game_state?.depositRequests || [];
          
          // 2. Sadece "COMPLETED" (Onaylanmış) olanları bul ve topla
          const totalSilverBought = deposits.reduce((total: number, req: any) => {
            if (req.status === 'COMPLETED') {
              return total + (Number(req.amountSilver) || 0);
            }
            return total;
          }, 0);

          return {
            id: profile.id,
            username: profile.username,
            totalSrgEarned: profile.game_state?.totalSrgEarned || 0,
            
            // İşte burası artık otomatik!
            // Veritabanında ayrı bir sayı tutmaya gerek yok, geçmişten hesapladık.
            silverBought: totalSilverBought 
          };
        }) || [];

        cachedDetails = formattedData;
        lastFetchTime = currentTime;
        setRefDetails(formattedData);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchStats();
  }, [gameState.referrals?.length]);

  // 3️⃣ ÖDÜL HESABI
  const claimableFriends = refDetails.filter(friend => {
    const srg = friend.totalSrgEarned || 0;
    const isCompleted = srg >= 1000;
    const isClaimed = gameState.completedTaskIds?.includes(`ref_reward_${friend.id}`);
    return isCompleted && !isClaimed;
  });

  const totalClaimableAmount = claimableFriends.length * 200;
  const hasRewards = claimableFriends.length > 0;

  // 🚀 HEPSİNİ AL
  const handleCollectAll = async () => {
    if (isCollecting || !hasRewards) return;
    setIsCollecting(true);
    for (const friend of claimableFriends) {
      onClaimReward(friend.id);
      await new Promise(r => setTimeout(r, 50)); 
    }
    setIsCollecting(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const shareText = encodeURIComponent(lang === 'TR' ? "Maden ekipmanlarını kur, beraber kazanalım! ⛏️" : "Давай майнить вместе! ⛏️");
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${shareText}`;
    if ((window as any).Telegram?.WebApp) (window as any).Telegram.WebApp.openTelegramLink(shareUrl);
    else window.open(shareUrl, '_blank');
  };

  return (
    <div className="p-4 space-y-4 pb-32 animate-in fade-in duration-500">
      
      {/* BAŞLIK */}
      <div className="text-center">
        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          {lang === 'TR' ? 'EKİP VE KAZANÇ' : 'TEAM & EARNINGS'}
        </h2>
      </div>

      {/* BUTONLAR */}
      <div className="flex gap-2 h-12">
        <div onClick={handleCopy} className="flex-1 bg-white/5 border border-white/10 rounded-xl p-1 flex items-center cursor-pointer active:scale-95 transition-transform overflow-hidden">
          <div className="flex-1 px-3 truncate text-[10px] font-mono text-slate-500">
            {copied ? <span className="text-emerald-500 font-black tracking-widest animate-pulse">{labels.linkCopied}</span> : inviteLink}
          </div>
          <div className={`p-2 rounded-lg transition-colors ${copied ? 'bg-emerald-500/10 text-emerald-500' : 'text-slate-400'}`}>
            {copied ? <Check size={18}/> : <Copy size={18}/>}
          </div>
        </div>
        <button onClick={handleShare} className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-xl flex items-center justify-center gap-2 active:scale-90 transition-all border border-blue-400/30 shadow-lg shadow-blue-600/20">
          <Share2 size={18} />
          <span className="font-black text-[10px] uppercase tracking-tighter hidden sm:inline">{labels.inviteBtn}</span>
        </button>
      </div>

      {/* INFO PANELİ (Kompakt) */}
      <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/20 p-3 rounded-2xl space-y-2 shadow-lg shadow-blue-900/10">
        <div className="flex items-center gap-2 text-blue-400 border-b border-blue-500/20 pb-1">
          <Sparkles size={14} className="text-yellow-400" />
          <span className="text-[9px] font-black uppercase tracking-widest">{labels.infoTitle}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                <div className="flex items-center gap-1 text-emerald-400 mb-0.5">
                    <UserCheck size={10} /><span className="text-[8px] font-black uppercase">{labels.activeFriend}</span>
                </div>
                <p className="text-[8px] text-slate-400 leading-tight">{labels.activeDesc} <span className="text-white font-bold">+200 🥈</span></p>
            </div>
            <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                <div className="flex items-center gap-1 text-yellow-400 mb-0.5">
                    <TrendingUp size={10} /><span className="text-[8px] font-black uppercase">{labels.passiveIncome}</span>
                </div>
                <p className="text-[8px] text-slate-400 leading-tight">{labels.passiveDesc} <span className="text-white font-bold">%10 PAY</span></p>
            </div>
        </div>
      </div>

      {/* LİSTE BAŞLIĞI & BUTON & SPONSOR */}
      <div className="space-y-2 pt-0">
        <div className="flex justify-between items-center px-1 border-b border-white/5 pb-2">
          <div className="flex flex-col">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Users size={14}/> {lang === 'TR' ? 'EKİP' : 'TEAM'} ({gameState.referrals?.length || 0})
            </h3>
          </div>
          
          <button 
            onClick={handleCollectAll}
            disabled={isCollecting || !hasRewards}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all active:scale-95 ${hasRewards ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 animate-pulse cursor-pointer" : "bg-white/5 text-slate-600 cursor-not-allowed"}`}
          >
            {isCollecting ? <Loader2 size={12} className="animate-spin"/> : <Coins size={12}/>}
            <div className="flex flex-col leading-none items-start">
              <span className="text-[8px] font-black uppercase tracking-widest">{hasRewards ? labels.claimAll : labels.noReward}</span>
              {hasRewards && <span className="text-[8px] font-bold">+{totalClaimableAmount} 🥈</span>}
            </div>
          </button>

          <div className="flex flex-col items-end">
             <span className="text-[7px] font-black text-slate-600 uppercase mb-0.5">{labels.mySponsor}</span>
             <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg">
                <UserCheck size={10} className="text-blue-400" />
                <span className="text-[9px] font-black text-blue-300 uppercase italic max-w-[70px] truncate">
                  {sponsorName || labels.direct}
                </span>
             </div>
          </div>
        </div>

        {loading && <div className="text-center py-4"><Loader2 size={20} className="animate-spin text-blue-500 mx-auto"/></div>}

        <div className="space-y-2">
          {refDetails.map((friend) => {
            const srgProgress = Math.min(1000, friend.totalSrgEarned || 0);
            const isCompleted = srgProgress >= 1000;
            const isClaimed = gameState.completedTaskIds?.includes(`ref_reward_${friend.id}`);
            const friendBonus = Math.floor((friend.silverBought || 0) * 0.1);

            // Buton Durumuna Göre İçerik Belirleme (Kompakt)
            let actionButtonContent;
            if (isClaimed) {
                actionButtonContent = (
                    <div className="w-24 py-1.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase rounded-lg text-center border border-emerald-500/20 tracking-widest flex items-center justify-center gap-1">
                        <Check size={10} /> {labels.claimed}
                    </div>
                );
            } else if (isCompleted) {
                actionButtonContent = (
                    <button onClick={() => onClaimReward(friend.id)} className="w-24 py-1.5 bg-emerald-500 text-black text-[8px] font-black uppercase rounded-lg active:scale-95 transition-all shadow-lg shadow-emerald-500/20 tracking-widest flex items-center justify-center gap-1 animate-pulse">
                        <Coins size={10} /> {labels.claim200}
                    </button>
                );
            } else {
                actionButtonContent = (
                    <div className="w-24 py-1.5 bg-white/5 text-slate-500 text-[7px] font-black uppercase rounded-lg text-center border border-white/5 opacity-60 truncate px-1">
                        {labels.notReached}
                    </div>
                );
            }

            return (
              // KOMPAKT KART TASARIMI (padding azaltıldı, items-center yapıldı)
              <div key={friend.id} className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 p-3 rounded-[1.5rem] flex justify-between items-center">
                
                {/* SOL: İsim ve Bonus */}
                <div className="space-y-0.5 flex-1 truncate pr-2">
                    <p className="text-sm font-black text-white uppercase flex items-center gap-1 truncate">
                        {friend.username || `USER_${friend.id}`}
                        {isCompleted && !isClaimed && <Zap size={12} className="text-yellow-400 animate-pulse shrink-0" />} 
                    </p>
                    <div className="flex items-center gap-1">
  <TrendingUp size={10} className="text-emerald-500 shrink-0" />
  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter truncate flex items-center gap-1">
    {labels.teamBonus}: +{friendBonus.toLocaleString()} 🥈
  </p>
</div>
                </div>

                {/* SAĞ: Buton ve Progress Bar (Yan Yana) */}
                <div className="flex items-center gap-3 w-[55%] justify-end">
                    
                    {/* 1. BUTON (Ortada) */}
                    <div className="shrink-0">
                        {actionButtonContent}
                    </div>
                  
                    {/* 2. PROGRESS BAR (Sağda, Kısaltılmış) */}
                    <div className="text-right flex-1 min-w-[60px]">
                        <p className="text-[8px] font-black text-slate-500 mb-0.5">{Math.floor(srgProgress)}/1000</p>
                        <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5 w-full">
                        <div className={`h-full ${isCompleted ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-blue-500'}`} style={{ width: `${(srgProgress/1000)*100}%` }}></div>
                        </div>
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