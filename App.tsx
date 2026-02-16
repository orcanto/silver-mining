import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { GameState, View } from './types';
import { 
  INITIAL_STATE, MACHINES, LEVEL_TITLES, 
  GENERATORS_DATA, MINERS_DATA 
} from './constants';

// Bileşenler
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomeView } from './components/HomeView';
import { MiningGrid } from './components/MiningGrid';
import { ShopView } from './components/ShopView';
import { ExchangeView } from './components/ExchangeView';
import { TapView } from './components/TapView';
import { TasksView } from './components/TasksView';
import { FriendsView } from './components/FriendsView';
import { AdminPanel } from './components/AdminPanel';
import { TransactionHistory } from './components/TransactionHistory';
import { WithdrawalModal } from './components/WithdrawalModal';
import { DepositModal } from './components/DepositModal';
import { DailyBonus } from './components/DailyBonus';
import { DataService } from './services/DataService';

const manifestUrl = 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json';

const safeSlots = (slots: any) => {
  if (!Array.isArray(slots)) return Array(30).fill(null);
  if (slots.length < 30) return [...slots, ...Array(30 - slots.length).fill(null)];
  return slots;
};

const App: React.FC = () => (
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <AppContent />
  </TonConnectUIProvider>
);

const AppContent: React.FC = () => {
  const [state, setState] = useState<GameState>({
    ...INITIAL_STATE,
    minerSlots: safeSlots(INITIAL_STATE.minerSlots),
    generatorSlots: safeSlots(INITIAL_STATE.generatorSlots)
  });
  
  const stateRef = useRef(state);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('home');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showDaily, setShowDaily] = useState(false);
  const [allUsersData, setAllUsersData] = useState<any[]>([]);

  useEffect(() => { stateRef.current = state; }, [state]);

  // 🛡️ MERKEZİ KAYIT FONKSİYONU (KÜSÜRAT TEMİZLEYİCİ)
  const saveGame = async (targetState: GameState) => {
    // 1. Aşağı Yuvarlama Fonksiyonu (10.569 -> 10.56)
    const formatFloor = (num: number) => Math.floor((num || 0) * 100) / 100;


    
    // 2. Temiz Kopya Oluştur
    const cleanState = {
      ...targetState,
      // Hassas sayıları traşla
      srgBalance: formatFloor(targetState.srgBalance),
      energyPool: formatFloor(targetState.energyPool),
      totalSrgEarned: formatFloor(targetState.totalSrgEarned),
      
      // Tam sayı olması gerekenler333333
      silverBalance: Math.floor(targetState.silverBalance || 0),
      goldBalance: Math.floor(targetState.goldBalance || 0),
      
      lastUpdate: Date.now()
    };

const notifyAndRewardSponsor = async (buyerName: string, sponsorId: string, purchaseAmount: number) => {
  const bonus = Math.floor(purchaseAmount * 0.1); // %10 Komisyon
  const botToken = "BOT_TOKEN_BURAYA";

  // 1. Veriyi Supa'dan ÇEKME! Elindeki 'allUsersData' içinden sponsoru bul.
  const sponsor = allUsersData.find(u => String(u.id) === String(sponsorId));

  if (sponsor) {
    // Sponsorun yeni bakiyesini hesapla
    const updatedSponsor = { 
      ...sponsor, 
      silverBalance: (sponsor.silverBalance || 0) + bonus 
    };

    // Veritabanına sadece bu sponsorun yeni halini gönder (Nokta atışı)
    await DataService.adminUpdateUser(String(sponsorId), updatedSponsor);

    // Ekranda (Admin Panelinde) rakamın anında değişmesi için state'i güncelle
    setAllUsersData(prev => prev.map(u => u.id === sponsorId ? updatedSponsor : u));
    
    console.log(`${buyerName} üzerinden ${sponsorId} ID'li sponsora bonus yattı.`);
  }

  // 2. Telegram Mesajı
  const message = `🥈 *Referans Kazancı!*\n\nArkadaşın @${buyerName} gümüş satın aldı.\n\n💰 Hesabına *+${bonus.toLocaleString()} gümüş* eklendi!`;
  
  fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: sponsorId, text: message, parse_mode: 'Markdown' })
  }).catch(e => console.error("Telegram mesajı gitmedi:", e));
};

    // 3. Servise Gönder
    await DataService.saveGame(cleanState);
  };

  // 🚀 ENERJİ HESAPLAMA (SAATLİK)
  const energyMetrics = useMemo(() => {
    let uretim = 0; let tuketim = 0;
    (state.generatorSlots || []).forEach(s => {
      if (s?.typeId) {
        const d = GENERATORS_DATA.find(x => x.id === s.typeId);
        uretim += d ? Math.abs(Number(d.energyCostPerDay)) / 24 : 50; 
      }
    });
    (state.minerSlots || []).forEach(s => {
      if (s?.typeId) {
        const m = [...MINERS_DATA, ...MACHINES].find(x => String(x.id).toLowerCase() === String(s.typeId).toLowerCase());
        tuketim += m ? Math.abs(Number(m.energyCostPerDay)) / 24 : 15;
      }
    });
    return { gen: uretim, cons: tuketim };
  }, [state.minerSlots, state.generatorSlots]);

  // 💰 ÜRETİM HESAPLAMA (SAATLİK)
  const finalHourlyProd = useMemo(() => {
    let prod = 0;
    const rank = [...LEVEL_TITLES].reverse().find(l => (state.totalSrgEarned || 0) >= l.threshold) || LEVEL_TITLES[0];
    const bonus = 1 + (Number(rank?.bonus) || 0);
    (state.minerSlots || []).forEach(s => {
      if (s?.typeId) {
        const m = [...MINERS_DATA, ...MACHINES].find(x => String(x.id).toLowerCase() === String(s.typeId).toLowerCase());
        if (m) prod += (Number(m.srgProdPerDay || 0) / 24) * bonus;
      }
    });
    return prod;
  }, [state.minerSlots, state.totalSrgEarned]);

  // 🔄 CANLI OYUN DÖNGÜSÜ (1 SANİYE)
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setState(prev => {
        if (!prev) return prev;
        const srgPerSec = (finalHourlyProd / 3600);
        const energyPerSec = (energyMetrics.gen - energyMetrics.cons) / 3600;
        const canMine = prev.energyPool > 0;
        return {
          ...prev,
          energyPool: Math.max(0, Math.min(prev.maxEnergyPool, prev.energyPool + energyPerSec)),
          srgBalance: (Number(prev.srgBalance) || 0) + (canMine ? srgPerSec : 0),
          totalSrgEarned: (Number(prev.totalSrgEarned) || 0) + (canMine ? srgPerSec : 0),
          lastUpdate: Date.now()
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, finalHourlyProd, energyMetrics]);

  // 🎁 REFERANS ÖDÜLÜ ALMA
  const handleClaimRefReward = async (friendId: number) => {
    const rewardId = `ref_reward_${friendId}`;
    if (state.completedTaskIds?.includes(rewardId)) return;
    const newState = {
      ...state,
      silverBalance: (state.silverBalance || 0) + 200, 
      completedTaskIds: [...(state.completedTaskIds || []), rewardId]
    };
    setState(newState);
    await saveGame(newState); // <-- YENİ KAYIT FONKSİYONU
    alert("Ödül Alındı! 🥈");
  };

  // 🔑 OYUN BAŞLATMA VE REF YAKALAMA
  useEffect(() => {
    const initGame = async () => {
      const userData = await DataService.loginUser();
      if (userData) {
        const startParam = (window as any).Telegram?.WebApp?.initDataUnsafe?.start_param;
        if (startParam && !userData.referredBy && String(startParam) !== String(userData.id)) {
          userData.referredBy = String(startParam);
          userData.silverBalance = (userData.silverBalance || 0) + 0;
          await saveGame(userData); // <-- YENİ KAYIT FONKSİYONU
        }
        if (!userData.language) userData.language = 'TR';
        setState(userData);
      }
      setLoading(false);
    };
    initGame();
  }, []);

  // ⛏️ TIKLAMA (TAP) SİSTEMİ
  const handleTapping = () => {
    setState(prev => {
      if (prev.energyPool <= 5) return prev;
      const rank = [...LEVEL_TITLES].reverse().find(l => prev.totalSrgEarned >= l.threshold) || LEVEL_TITLES[0];
      const reward = (prev.clickPower || 1) * (1 + (rank?.bonus || 0));
      return {
        ...prev,
        srgBalance: prev.srgBalance + reward,
        totalSrgEarned: prev.totalSrgEarned + reward,
        energyPool: Math.max(0, prev.energyPool - 0.1)
      };
    });
  };

  // 🔧 DİĞER FONKSİYONLAR (SATIN ALMA, SİLME, ADMIN)
  const handlePurchase = async (item: any) => {
    const isMin = item.category === 'mining' || item.category === 'cpu';
    const key = isMin ? 'minerSlots' : 'generatorSlots';
    const limit = isMin ? state.unlockedMinerSlots : state.unlockedGeneratorSlots;
    const slots = [...safeSlots(state[key])];
    const emptyIdx = slots.findIndex((s, i) => s === null && i < (limit || 1));
    const price = Number(item.silverCost || item.baseCost || 0);
    if (emptyIdx === -1 || state.silverBalance < price) return;
    slots[emptyIdx] = { id: Math.random().toString(36).substr(2,9), typeId: item.id, level: 1, purchaseTime: Date.now() };
    const newState = { ...state, silverBalance: state.silverBalance - price, [key]: slots };
    setState(newState); 
    await saveGame(newState); // <-- YENİ KAYIT FONKSİYONU
  };

  const handleAdminAction = async (userId: string, requestId: string, approved: boolean, isDep: boolean, val?: number) => {
    const user = allUsersData.find(u => u.id === userId); if (!user) return;
    const updated = JSON.parse(JSON.stringify(user));
    if (isDep) {
      const req = updated.depositRequests.find((r: any) => r.id === requestId);
      if (req) { req.status = approved ? 'COMPLETED' : 'REJECTED'; if (approved) updated.silverBalance += (val || req.amountSilver); }
    } else {
      const req = updated.withdrawalRequests.find((r: any) => r.id === requestId);
      if (req) req.status = approved ? 'PAID' : 'REJECTED';
    }
    if (await DataService.adminUpdateUser(userId, updated)) {
      setAllUsersData(prev => prev.map(u => u.id === userId ? updated : u));
      if (userId === state.id) setState(updated);
    }
  };

  const handleManageUser = async (userId: string, action: string, value?: number) => {
    const user = allUsersData.find(u => u.id === userId); if (!user) return;
    let updated = { ...user }; if (action === 'add_silver') updated.silverBalance += (value || 0);
    if (await DataService.adminUpdateUser(userId, updated)) {
      setAllUsersData(prev => prev.map(u => u.id === userId ? updated : u));
      if (userId === state.id) setState(prev => ({ ...prev, silverBalance: updated.silverBalance }));
    }
  };
  
  

  // 🛡️ VERİ ÇEKME
  useEffect(() => { if (view === 'admin') DataService.getAllGlobalData().then(d => d && setAllUsersData(d)); }, [view]);

  if (loading) return <div className="h-screen bg-[#050b1d] flex items-center justify-center text-emerald-500 font-black italic text-2xl animate-pulse">SYSTEM LOADING...</div>;

  return (
    <div className="h-full w-full bg-[#050b1d] text-slate-200 flex flex-col relative overflow-hidden font-sans">
      <Header state={state} onOpenDeposit={() => setShowDeposit(true)} hourlyProd={finalHourlyProd} hourlyEnergy={energyMetrics.gen} hourlyConsumption={energyMetrics.cons} />
      <main className="flex-1 overflow-y-auto pb-20 no-scrollbar">
        {view === 'home' && <HomeView gameState={state} onNavigate={setView} onOpenDailyBonus={() => setShowDaily(true)} onOpenWithdrawal={() => setShowWithdraw(true)} onOpenDeposit={() => setShowDeposit(true)} onOpenHistory={() => setShowHistory(true)} onLanguageChange={(l) => setState(p => ({...p, language: l}))} hourlyProd={finalHourlyProd} onReinvest={() => setView('exchange')} />}
        {view === 'mining' && <MiningGrid state={state} onEmptySlotClick={() => setView('shop')} onRemoveSlot={(idx, cat) => {
            const key = cat === 'mining' ? 'minerSlots' : 'generatorSlots';
            const updated = [...(state[key] || [])];
            updated[idx] = null;
            const newState = { ...state, [key]: updated, silverBalance: state.silverBalance + 100 };
            setState(newState); 
            saveGame(newState); // <-- YENİ KAYIT FONKSİYONU
        }} onUnlockRow={async (cat, price) => {
            const key = cat === 'mining' ? 'unlockedMinerSlots' : 'unlockedGeneratorSlots';
            if (state.silverBalance < price) return;
            const updated = { ...state, silverBalance: state.silverBalance - price, [key]: (state[key] || 1) + 1 };
            setState(updated); 
            await saveGame(updated); // <-- YENİ KAYIT FONKSİYONU
        }} />}
        {view === 'shop' && <ShopView gameState={state} onBuy={handlePurchase} currentSilver={state.silverBalance} language={state.language} onNavigateToSlots={() => setView('mining')} />}
        {view === 'exchange' && <ExchangeView gameState={state} onExchange={async (amt) => {
          const updated = { ...state, srgBalance: state.srgBalance - amt, goldBalance: (state.goldBalance || 0) + (amt/200), silverBalance: (state.silverBalance || 0) + (amt/200) };
          setState(updated); 
          await saveGame(updated); // <-- YENİ KAYIT FONKSİYONU
        }} />}
        {view === 'tap' && <TapView gameState={state} onTapping={handleTapping} />}  
        {view === 'friends' && <FriendsView gameState={state} onClaimReward={handleClaimRefReward} />}
        {view === 'tasks' && <TasksView gameState={state} onClaimTask={() => {}} />}
        {view === 'admin' && <AdminPanel gameState={state} allUsersData={allUsersData} onClose={() => setView('home')} onProcessDeposit={(id, app, val) => {
              const u = allUsersData.find(x => (x.depositRequests || []).some((r: any) => r.id === id));
              if (u) handleAdminAction(u.id, id, app, true, val);
            }} onProcessWithdrawal={(id, app) => {
              const u = allUsersData.find(x => (x.withdrawalRequests || []).some((r: any) => r.id === id));
              if (u) handleAdminAction(u.id, id, app, false);
            }} onManageUser={handleManageUser} />}
      </main>
      <Navigation activeView={view} setView={setView} userId={state.id} />
      {showHistory && <TransactionHistory gameState={state} onClose={() => setShowHistory(false)} />}
      {showWithdraw && <WithdrawalModal gameState={state} onClose={() => setShowWithdraw(false)} onConfirm={async (adr, amt, mth) => {
          const updated = { ...state, goldBalance: state.goldBalance - amt, withdrawalRequests: [...(state.withdrawalRequests || []), { id: Math.random().toString(36).substr(2, 9), address: adr, amount: amt, method: mth, status: 'PENDING', timestamp: Date.now() }] };
          setState(updated); 
          await saveGame(updated); // <-- YENİ KAYIT FONKSİYONU
          setShowWithdraw(false);
      }} />}
      {showDeposit && <DepositModal language={state.language} telegramId={state.id} onClose={() => setShowDeposit(false)} onSubmit={async (s, c, m) => {
          const updated = { ...state, depositRequests: [...(state.depositRequests || []), { id: Math.random().toString(36).substr(2, 9), amountSilver: s, costUsdt: c, memo: m, status: 'PENDING', timestamp: Date.now() }] };
          setState(updated); 
          await saveGame(updated); // <-- YENİ KAYIT FONKSİYONU
          setShowDeposit(false);
      }} />}
      {showDaily && <DailyBonus streak={state.dailyStreak} lastClaim={state.lastDailyClaim} language={state.language} onClose={() => setShowDaily(false)} onClaim={async () => {
          const updated = { ...state, silverBalance: (state.silverBalance || 0) + 100, dailyStreak: (state.dailyStreak || 0) + 1, lastDailyClaim: Date.now() };
          setState(updated); 
          await saveGame(updated); // <-- YENİ KAYIT FONKSİYONU
          setShowDaily(false);
      }} />}
    </div>
  );
};

export default App;