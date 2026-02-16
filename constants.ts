
import { GameState, MachineType, Task, LevelConfig, Upgrade } from './types';

export const MINERS_DATA: MachineType[] = [
  // T1: Giriş Seviyesi (Neon Serisi)
  { id: 'm1', name: '🔵 NEON PULSE v1', category: 'cpu', tier: 'T1', silverCost: 2000, srgProdPerDay: 4000.0, energyCostPerDay: 13.0, icon: '⛏️' }, 
  { id: 'm2', name: '🔵 NEON PULSE v2', category: 'cpu', tier: 'T1', silverCost: 6000, srgProdPerDay: 12371.1, energyCostPerDay: 38.0, icon: '⛏️' }, 
  
  // T2: Orta Seviye (Giga & X-Force)
  { id: 'm3', name: '🟢 GIGA FORCE - X', category: 'cpu', tier: 'T2', silverCost: 10000, srgProdPerDay: 21276.6, energyCostPerDay: 62.0, icon: '🖥️' }, 
  { id: 'm4', name: '🟢 GIGA FORCE - PRO', category: 'cpu', tier: 'T2', silverCost: 20000, srgProdPerDay: 43956.0, energyCostPerDay: 125.0, icon: '🖥️' }, 
  
  // T3: Üst Seviye (Titan & Heavy Duty)
  { id: 'm5', name: '🟡 TITAN CORE NODE', category: 'cpu', tier: 'T3', silverCost: 40000, srgProdPerDay: 90909.1, energyCostPerDay: 250.0, icon: '🏢' }, 
  { id: 'm6', name: '🟡 TITAN ULTRA-NET', category: 'cpu', tier: 'T3', silverCost: 100000, srgProdPerDay: 235294.1, energyCostPerDay: 610.0, icon: '🏢' }, 
  
  // T4: Profesyonel (Silver & Industrial)
  { id: 'm7', name: '🥈 SILVER-CORE i7', category: 'cpu', tier: 'T4', silverCost: 150000, srgProdPerDay: 375000.0, energyCostPerDay: 920.0, icon: '🥈' }, 
  { id: 'm8', name: '🥈 SILVER-CORE MAX', category: 'cpu', tier: 'T4', silverCost: 200000, srgProdPerDay: 512820.5, energyCostPerDay: 1240.0, icon: '🥈' }, 
  
  // ELITE: Efsanevi (Cyber & Overlord)
  { id: 'm9', name: '🔥 CYBER OVERLORD', category: 'cpu', tier: 'ELITE', silverCost: 400000, srgProdPerDay: 1095890.4, energyCostPerDay: 2500.0, icon: '🔥' }, 
  { id: 'm10', name: '🔥 OMEGA PROTOCOL', category: 'cpu', tier: 'ELITE', silverCost: 500000, srgProdPerDay: 1428571.4, energyCostPerDay: 3100.0, icon: '🔥' }, 
];

export const GENERATORS_DATA: MachineType[] = [
  { id: 'g1', name: '🔅 SOLAR PAD v1', category: 'generator', tier: 'P1', silverCost: 1000, srgProdPerDay: 0, energyCostPerDay: -40.0, icon: '☀️' }, 
  { id: 'g2', name: '🔅 SOLAR PAD v2', category: 'generator', tier: 'P1', silverCost: 3000, srgProdPerDay: 0, energyCostPerDay: -128.0, icon: '☀️' }, 
  { id: 'g3', name: '🌪️ WIND VORTEX', category: 'generator', tier: 'P2', silverCost: 10000, srgProdPerDay: 0, energyCostPerDay: -480.0, icon: '🌤️' }, 
  { id: 'g4', name: '🔋 IONIC BATTERY X', category: 'generator', tier: 'P3', silverCost: 20000, srgProdPerDay: 0, energyCostPerDay: -1024.0, icon: '🔋' }, 
  { id: 'g5', name: '⚛️ FUSION REACTOR', category: 'generator', tier: 'P4', silverCost: 50000, srgProdPerDay: 0, energyCostPerDay: -2720.0, icon: '⚛️' }, 
  { id: 'g6', name: '⚡ DARK MATTER CELL', category: 'generator', tier: 'ELITE', silverCost: 75000, srgProdPerDay: 0, energyCostPerDay: -4320.0, icon: '⚡' }, 
];

export const MACHINES = [...MINERS_DATA, ...GENERATORS_DATA];

// --- TELEGRAM BİLDİRİM METİNLERİ (3 DİL) ---
export const NOTIFICATION_TEXTS: any = {
  TR: {
    buyerTitle: "🥈 *Ödeme Onaylandı!*",
    buyerBody: (amount: number) => `Satın aldığınız *${amount.toLocaleString()} Gümüş* hesabınıza tanımlandı. İyi madencilikler! ⛏️`,
    sponsorTitle: "🥈 *Referans Kazancı!*",
    sponsorBody: (name: string, bonus: number) => `Arkadaşınız @${name} yatırım yaptı. Hesabınıza *+${bonus.toLocaleString()} Gümüş* bonus eklendi!`
  },
  EN: {
    buyerTitle: "🥈 *Payment Approved!*",
    buyerBody: (amount: number) => `*${amount.toLocaleString()} Silver* has been credited to your account. Happy mining! ⛏️`,
    sponsorTitle: "🥈 *Referral Bonus!*",
    sponsorBody: (name: string, bonus: number) => `Your friend @${name} made an investment. *+${bonus.toLocaleString()} Silver* bonus has been added to your account!`
  },
  RU: {
    buyerTitle: "🥈 *Платеж подтвержден!*",
    buyerBody: (amount: number) => `*${amount.toLocaleString()} серебра* зачислено на ваш счет. Удачного майнинга! ⛏️`,
    sponsorTitle: "🥈 *Реферальный бонус!*",
    sponsorBody: (name: string, bonus: number) => `Ваш друг @${name} сделал инвестицию. Бонус *+${bonus.toLocaleString()} серебра* зачислен на ваш счет!`
  }
};

export const DAILY_REWARDS = [
  { day: 1, silver: 50, gold: 0 },
  { day: 2, silver: 100, gold: 0 },
  { day: 3, silver: 150, gold: 10 },
  { day: 4, silver: 200, gold: 0 },
  { day: 5, silver: 300, gold: 30 },
  { day: 6, silver: 400, gold: 0 },
  { day: 7, silver: 500, gold: 50 },
];

export const TASKS: Task[] = [
  { id: 't1', title: 'Join Channel', description: 'Join our telegram.', rewardSilver: 500, icon: 'send', link: 'https://t.me' },
];

export const LEVEL_TITLES: LevelConfig[] = [
  { title: 'rank1', threshold: 0, bonus: 0 },
  { title: 'rank2', threshold: 50000, bonus: 0.01 },
  { title: 'rank3', threshold: 100000, bonus: 0.03 },
  { title: 'rank4', threshold: 200000, bonus: 0.05 },
  { title: 'rank5', threshold: 400000, bonus: 0.07 },
  { title: 'rank6', threshold: 800000, bonus: 0.10 },
  { title: 'rank7', threshold: 1600000, bonus: 0.15 },
  { title: 'rank8', threshold: 3200000, bonus: 0.20 },
  { title: 'rank9', threshold: 6400000, bonus: 0.25 },
  { title: 'rank10', threshold: 12800000, bonus: 0.40 },
];

// Added missing constants required by components
export const UPGRADES: Upgrade[] = [
  { id: 'up1', name: 'Pro Cooling System', category: 'hardware', baseCost: 5000, multiplier: 1.2, powerValue: 0, energyCost: 10, icon: '❄️', description: 'Advanced cooling for higher mining performance.', effectValue: 20, powerConsumption: 5 },
  { id: 'up2', name: 'Industrial Power Grid', category: 'power', baseCost: 10000, multiplier: 1.15, powerValue: 0, energyCost: 0, icon: '⚡', description: 'Stabilizes voltage across all connected hardware.', effectValue: 100, powerConsumption: 0 },
];

export const MARKET_LIMITS = {
  MIN_AMOUNT: 10,
  MAX_AMOUNT: 100000,
  MIN_PRICE: 0.1,
  MAX_PRICE: 1000
};

export const AVAILABLE_PLUGINS = [
  { id: 'pl1', name: 'Auto-Collector Pro', version: '1.2.0', developer: 'CyberDev', description: 'Automatically claims SRG rewards every 30 minutes.', icon: '🤖', cost: 15000 },
];

export const ADMIN_WALLET_ADDRESS = 'TMhZNvx7AUjr8MNBxTxcximf2sPyetgmPY';
export const ADMIN_WALLET_TON = 'UQDtEZD3JzyKFId-dKx3qVWSc_xUxAYMjL6svrJlDEFUlDp0';

export const TRANSLATIONS = {
  EN: {
    // ... diğer sabit çevirilerin aynı kalıyor ...
    unitKw: 'kw', unitKwH: 'kw/h', headerGold: 'Gold', headerEnergy: 'Energy', shopTitle: 'HARDWARE SHOP', shopBuy: 'BUY', shopPrice: 'Price', insufficient: 'LACK', cancel: 'CANCEL', confirm: 'CONFIRM', mmSell: 'Sell', tasks: 'TASKS', dailyReward: 'DAILY', cashGold: 'GOLD CASH', investSilver: 'SILVER', reinvestTitle: 'CONVERT', reinvestBtn: 'CONVERT',
    finTitle: 'FINANCE', finSub: 'Withdraw', finMin: 'Min:', depTitle: 'BUY SILVER', depSub: 'Invest', shopHourlySrg: 'HOURLY SRG', shopDaily: 'DAILY SRG', shopHourlyLoad: 'HOURLY KW', shopHourlyProd: 'DAILY KW',
    navSlot: 'SLOTS', navMarket: 'SHOP', navHome: 'HOME', navTap: 'TAP', navFriends: 'REF', cashOut: 'WITHDRAW', 
    add: 'ADD', energy: 'ENERGY', miners: 'MINERS', hourly: 'HOURLY', daily: 'DAILY', cyberBase: 'CYBER BASE', asicUnit: 'ASIC', powerGen: 'POWER', efficiency: 'EFFICIENCY', refundPolicy: 'REFUND', unlockSlot: 'UNLOCK', 
    
    // 10 KADEMELİ EN RÜTBELER
    rank1: '🛠️ SCRIPT KIDDIE',
    rank2: '💾 BYTE WALKER',
    rank3: '📡 NET SURFER',
    rank4: '🛡️ CYBER GUARD',
    rank5: '⚔️ DATA WARRIOR',
    rank6: '🌀 CODE BOSS',
    rank7: '🛰️ SYSTEM LORD',
    rank8: '⚡ OMEGA ADMIN',
    rank9: '🏛️ CYBER ARCHITECT',
    rank10: '👑 CYBER DEITY',

    guideTitle: 'MINER GUIDE', guideStart: 'START SYSTEM', 
    g1t: 'BUY RIGS', g1s: 'Use Silver to buy ASICs and produce SRG.',
    g2t: 'ENERGY', g2s: 'Buy panels. No energy means no mining.',
    g3t: 'CASH', g3s: 'Convert SRG to Gold and withdraw.',
    minWithdrawLabel: 'Min Withdraw',
    tapEnergyLabel: 'GRID ENERGY', tapPowerLabel: 'POWER', tapEarningLabel: 'EARNING', tapCostLabel: 'COST', tapActionLabel: 'TAP TO EARN', tapCapacity: 'Capacity', tapBotWarning: 'TOO FAST!',
    progress: 'Progress', nextRank: 'Next Rank', shopTipTitle: 'TIP', shopTip: 'Higher tier ASICs have better ROI and efficiency.',
    shopConfirmTitle: 'CONFIRM PURCHASE', shopRemaining: 'REMAINING SILVER', waitConfirm: 'WAITING CONFIRMATION', waitConfirmSub: 'Your request is being processed by the network.', close: 'CLOSE', mmConfirmTitle: 'CONFIRM SALE', mmRefundAmount: 'REFUND AMOUNT',
    shopTabMiners: 'ASIC RIGS', shopTabGen: 'POWER GEN', shopLocked: 'LOCKED TIER'
  },
  TR: {
    // ... diğer sabit çevirilerin aynı kalıyor ...
    unitKw: 'kw', unitKwH: 'kw/sa', headerGold: 'Altın', headerEnergy: 'Enerji', shopTitle: 'SİBER MARKET', shopBuy: 'SATIN AL', shopPrice: 'Fiyat', insufficient: 'YETERSİZ', cancel: 'VAZGEÇ', confirm: 'ONAYLA', mmSell: 'Sat', tasks: 'GÖREVLER', dailyReward: 'GÜNLÜK', cashGold: 'GÜNLÜK ALTIN', investSilver: 'GÜMÜŞ', reinvestTitle: 'DÖNÜŞTÜR', reinvestBtn: 'DÖNÜŞTÜR',
    finTitle: 'FİNANS', finSub: 'Altın Çekimi', finMin: 'Min:', depTitle: 'GÜMÜŞ AL', depSub: 'Yatırım', shopHourlySrg: 'SAATLİK SRG', shopDaily: 'GÜNLÜK SRG', shopHourlyLoad: 'SAATLİK KW', shopHourlyProd: 'GÜNLÜK KW',
    navSlot: 'SLOT', navMarket: 'MARKET', navHome: 'EVİM', navTap: 'KAZ', navFriends: 'REF', cashOut: 'NAKİT ÇEK',
    add: 'EKLE', energy: 'ENERJİ', miners: 'MADENCİLER', hourly: 'SAATLİK', daily: 'GÜNLÜK', cyberBase: 'SİBER ÜS', asicUnit: 'ASIC', powerGen: 'GÜÇ', efficiency: 'VERİM', refundPolicy: 'İADE', unlockSlot: 'KİLİT AÇ',

    // 10 KADEMELİ TR RÜTBELER
    rank1: '🛠️ SCRIPT KIDDIE',
    rank2: '💾 BYTE WALKER',
    rank3: '📡 AĞ SÖRFÇÜSÜ',
    rank4: '🛡️ SİBER MUHAFIZ',
    rank5: '⚔️ VERİ SAVAŞÇISI',
    rank6: '🌀 KOD REİSİ',
    rank7: '🛰️ SİSTEM HAKİMİ',
    rank8: '⚡ OMEGA ADMİN',
    rank9: '🏛️ SİBER MİMAR',
    rank10: '👑 SİBER TANRI',

    guideTitle: 'MADENCİ REHBERİ', guideStart: 'BAŞLAT',
    g1t: 'CİHAZ AL', g1s: 'Gümüş ile ASIC al ve SRG üret.',
    g2t: 'ENERJİ', g2s: 'Panel almayı unutma, enerjin biterse üretim durur.',
    g3t: 'NAKİT', g3s: 'SRG\'leri Altın\'a çevir ve çek.',
    minWithdrawLabel: 'Min Çekim',
    tapEnergyLabel: 'ENERJİ', tapPowerLabel: 'GÜÇ', tapEarningLabel: 'KAZANÇ', tapCostLabel: 'MALİYET', tapActionLabel: 'DOKUN VE KAZAN', tapCapacity: 'Kapasite', tapBotWarning: 'ÇOK HIZLI!',
    progress: 'İlerleme', nextRank: 'Sonraki Rütbe', shopTipTitle: 'İPUCU', shopTip: 'Üst seviye ASIC cihazlar daha hızlı amorti süresine sahiptir.',
    shopConfirmTitle: 'SATIN ALMA ONAYI', shopRemaining: 'KALAN GÜMÜŞ', waitConfirm: 'ONAY BEKLENİYOR', waitConfirmSub: 'Talebiniz ağ üzerinde işleniyor, lütfen bekleyin.', close: 'KAPAT', mmConfirmTitle: 'SATIŞ ONAYI', mmRefundAmount: 'İADE TUTARI',
    shopTabMiners: 'ASIC CİHAZLAR', shopTabGen: 'GÜÇ ÜRETİMİ', shopLocked: 'KİLİTLİ SEVİYE'
  },
  RU: {
    // ... diğer sabit çevirilerin aynı kalıyor ...
    unitKw: 'кВт', unitKwH: 'кВт/ч', headerGold: 'Золото', headerEnergy: 'Энергия', shopTitle: 'МАРКЕТ', shopBuy: 'КУПИТЬ', shopPrice: 'Цена', insufficient: 'МАЛО', cancel: 'ОТМЕНА', confirm: 'ОК', mmSell: 'Продать', tasks: 'ЗАДАНИЯ', dailyReward: 'БОНУS', cashGold: 'ЗОЛОТО', investSilver: 'СЕРЕБРО', reinvestTitle: 'ОБМЕН', reinvestBtn: 'ОБМЕН',
    finTitle: 'ФИНАНСЫ', finSub: 'Вывод', finMin: 'Мин:', depTitle: 'КУПИТЬ', depSub: 'Инвест', shopHourlySrg: 'SRG В ЧАС', shopDaily: 'SRG В ДЕНЬ', shopHourlyLoad: 'КВТ В ЧАС', shopHourlyProd: 'КВТ В ДЕНЬ',
    navSlot: 'СЛОТЫ', navMarket: 'МАГАЗИН', navHome: 'ГЛАВНАЯ', navTap: 'ТАП', navFriends: 'РЕФ', cashOut: 'ВЫВОД',
    add: 'ДОБАВИТЬ', energy: 'ЭНЕРГИЯ', miners: 'МАЙНЕРЫ', hourly: 'В ЧАС', daily: 'В ДЕНЬ', cyberBase: 'БАЗА', asicUnit: 'ASIC', powerGen: 'ГЕНЕРАЦИЯ', efficiency: 'КПД', refundPolicy: 'ВОЗВРАТ', unlockSlot: 'ОТКРЫТЬ',

    // 10 KADEMELİ RU RÜTBELER
    rank1: '🛠️ НОВИЧОК',
    rank2: '💾 БИТ-ХОДОК',
    rank3: '📡 СЕТЕВОЙ СЕРФЕР',
    rank4: '🛡️ КИБЕР-СТРАЖ',
    rank5: '⚔️ ВОИН ДАННЫХ',
    rank6: '🌀 БОСС КОДА',
    rank7: '🛰️ ВЛАДЫКА СИСТЕМЫ',
    rank8: '⚡ ОMEGA АДМИН',
    rank9: '🏛️ КИБЕР-АРХИТЕКТОР',
    rank10: '👑 КИБЕР-БОГ',

    guideTitle: 'ИНСТРУКЦИЯ', guideStart: 'СТАРТ',
    g1t: 'ОБОРУДОВАНИЕ', g1s: 'Покупайте ASIC за серебро.',
    g2t: 'ЭНЕРГИЯ', g2s: 'Без энергии майнинг остановится.',
    g3t: 'ВЫВОД', g3s: 'Меняйте SRG на золото и выводите.',
    minWithdrawLabel: 'Мин. вывод',
    tapEnergyLabel: 'ЭНЕРГИЯ', tapPowerLabel: 'СİЛА', tapEarningLabel: 'ДОХОD', tapCostLabel: 'ЦЕНА', tapActionLabel: 'ЖМИ VE KAZAN', tapCapacity: 'Емкость', tapBotWarning: 'ТОРМОЗИ!',
    progress: 'прогресс', nextRank: 'Следующий ранг', shopTipTitle: 'СОВЕТ', shopTip: 'ASIC более высокого уровня имеют лучший ROI.',
    shopConfirmTitle: 'ПОДТВЕРДИТЬ ПОКУПКУ', shopRemaining: 'ОСТАТОК СЕРЕБРА', waitConfirm: 'ОЖИДАНИЕ', waitConfirmSub: 'Ваш запрос обрабатывается сетью.', close: 'ЗАКРЫТЬ', mmConfirmTitle: 'ПОДТВЕРДИТЬ ПРОДАЖУ', mmRefundAmount: 'СУММА ВОЗВРАТА',
    shopTabMiners: 'ASIC МАЙНЕРЫ', shopTabGen: 'ГЕНЕРАЦИЯ', shopLocked: 'БЛОКИРОВАННЫЙ'
  }
};

export const INITIAL_STATE: GameState = {
  silverBalance: 3000, 
  goldBalance: 0, 
  srgBalance: 0, 
  totalSrgEarned: 0,
  // Added missing initialized properties
  sats: 0,
  balance: 0,
  totalEarned: 0,
  clickPower: 1,
  upgrades: {},
  
  referredBy: "",

  energyPool: 20, maxEnergyPool: 1000, hourlyGeneration: 0, hourlyConsumption: 0,
  // --- KRİTİK DEĞİŞİKLİK ---
  minerSlots: Array(30).fill(null),      // 30 slotluk dizi
  generatorSlots: Array(30).fill(null),  // 30 slotluk dizi
  unlockedMinerSlots: 4,                 // Başlangıçta 4 açık
  unlockedGeneratorSlots: 2,             // Başlangıçta 2 açık

  lastUpdate: Date.now(), 
  language: 'EN', 
  completedTaskIds: [], 
  referrals: [], 
  referredBy: "",
  withdrawalRequests: [], 
  depositRequests: [],
  dailyStreak: 0, 
  lastDailyClaim: 0
};