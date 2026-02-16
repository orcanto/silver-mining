export interface Upgrade {
  id: string;
  name: string;
  category: 'mining' | 'energy' | 'cooling' | 'hardware' | 'power';
  baseCost: number;
  multiplier: number;
  powerValue: number;
  energyCost: number;
  icon: string;
  description?: string;
  effectValue?: number;
  powerConsumption?: number;
}

export interface MachineInstance {
  id: string;
  typeId: string;
  level: number;
  purchaseTime: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color?: string;
}

export interface MachineType {
  id: string;
  name: string;
  category: 'cpu' | 'generator';
  tier: string;
  silverCost: number;
  srgProdPerDay: number;
  energyCostPerDay: number;
  icon: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'SYSTEM' | 'ECONOMY' | 'SOCIAL';
  message: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: number;
  amount: number;
  method: string;
  address: string;
  status: 'PENDING' | 'PAID' | 'REJECTED';
  timestamp: number;
  telegramUsername?: string;
  telegramId?: number;
}

export interface DepositRequest {
  id: string;
  amountSilver: number;
  costUsdt: number;
  memo: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  timestamp: number;
  telegramUsername?: string;
}

export interface Referral {
  id: string;
  username: string;
  status: 'ACTIVE' | 'PASIF';
  earned: number;
  silverBalance?: number;
  goldBalance?: number;
  silverBought?: number;
  level: number;
  miners?: number;
  generators?: number;
}

export interface EnergyListing {
  id: string;
  sellerId: number;
  sellerName: string;
  amount: number;
  pricePerUnit: number;
  totalPrice: number;
  isPlayerListing?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  rewardSilver: number;
  icon: string;
  link?: string;
}

export interface LevelConfig {
  title: string;
  threshold: number;
  bonus: number;
}

export interface GameState {
  silverBalance: number;
  goldBalance: number;
  srgBalance: number;
  totalSrgEarned: number;
  sats: number;
  balance: number;
  totalEarned: number;
  upgrades: Record<string, number>;
  clickPower: number;
  energyPool: number;
  maxEnergyPool: number;
  hourlyGeneration: number;
  hourlyConsumption: number;
  minerSlots: (MachineInstance | null)[];
  generatorSlots: (MachineInstance | null)[];
  unlockedMinerSlots: number;
  unlockedGeneratorSlots: number;
  rank: string;
  lastUpdate: number;
  language: 'TR' | 'EN' | 'RU';
  farmName: string;
  completedTaskIds: string[];
  installedPlugins: string[];
  activePlugins: string[];
  logs: LogEntry[];
  withdrawalRequests: WithdrawalRequest[];
  depositRequests: DepositRequest[];
  referrals: Referral[];
  dailyStreak: number;
  lastDailyClaim: number;
  pendingReferralClaims: number;
  pendingCommissionSilver: number;

  // --- KRİTİK: CÜZDAN ADRESİ BURAYA EKLENDİ ---
  walletAddress?: string; 

  telegramUser?: {
    id: number;
    username?: string;
    firstName: string;
    isPremium?: boolean;
    photoUrl?: string;
  };
  energyMarketListings: EnergyListing[];
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        HapticFeedback?: {
          selectionChanged: () => void;
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        };
      };
    };
  }
}

export type View = 'home' | 'mining' | 'shop' | 'exchange' | 'friends' | 'tasks' | 'tap' | 'admin';