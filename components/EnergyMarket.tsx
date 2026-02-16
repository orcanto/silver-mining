
import React, { useState, useMemo } from 'react';
import { GameState, EnergyListing } from '../types';
import { MARKET_LIMITS, TRANSLATIONS } from '../constants';
import { 
  TrendingUp, 
  Battery, 
  Zap, 
  DollarSign, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  AlertCircle,
  Clock,
  ChevronRight,
  Target,
  Coins,
  X,
  CheckCircle2,
  List,
  Trash2,
  ShoppingCart
} from 'lucide-react';

interface Props {
  gameState: GameState;
  onBuy: (listingId: string, amount: number) => void;
  onSell: (amount: number, pricePerUnit: number) => void;
  onCancel: (listingId: string) => void;
}

export const EnergyMarket: React.FC<Props> = ({ gameState, onBuy, onSell, onCancel }) => {
  const t = TRANSLATIONS[gameState.language] as any;
  const [sellAmount, setSellAmount] = useState<string>('');
  const [sellPrice, setSellPrice] = useState<string>('10.00'); 
  const [activeMarketTab, setActiveMarketTab] = useState<'buy' | 'sell'>('buy');
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedBuyListing, setSelectedBuyListing] = useState<EnergyListing | null>(null);
  const [buyAmountInput, setBuyAmountInput] = useState<string>('');

  // SATIŞ MANTIĞI - Miktar TAM SAYI, Fiyat ONDALIKLI
  const amountVal = Math.floor(parseFloat(sellAmount || '0'));
  const priceVal = parseFloat(sellPrice || '0');
  
  const grossGain = amountVal * priceVal;
  const fee = grossGain * 0.05; // %5 Komisyon
  const netGain = grossGain - fee;

  const isAmountValid = !isNaN(amountVal) && 
                       amountVal >= MARKET_LIMITS.MIN_AMOUNT && 
                       amountVal <= MARKET_LIMITS.MAX_AMOUNT &&
                       amountVal <= gameState.energyPool;

  const isPriceValid = !isNaN(priceVal) && 
                      priceVal >= MARKET_LIMITS.MIN_PRICE && 
                      priceVal <= MARKET_LIMITS.MAX_PRICE;

  const handleOpenConfirm = () => {
    if (isAmountValid && isPriceValid) {
      setShowConfirmModal(true);
    }
  };

  const handleFinalSell = () => {
    onSell(amountVal, priceVal);
    setSellAmount('');
    setShowConfirmModal(false);
  };

  const handlePercentage = (pct: number) => {
    const calculated = Math.floor(gameState.energyPool * pct);
    const clamped = Math.min(MARKET_LIMITS.MAX_AMOUNT, Math.max(0, calculated));
    setSellAmount(clamped.toString());
  };

  // ALIM MANTIĞI - Miktar TAM SAYI
  const handleOpenBuyModal = (listing: EnergyListing) => {
      setSelectedBuyListing(listing);
      setBuyAmountInput(Math.floor(listing.amount).toString());
  };

  const buyAmountVal = Math.floor(parseFloat(buyAmountInput || '0'));
  const buyCost = selectedBuyListing ? buyAmountVal * selectedBuyListing.pricePerUnit : 0;
  
  const isBuyValid = selectedBuyListing 
      ? (!isNaN(buyAmountVal) && buyAmountVal > 0 && buyAmountVal <= selectedBuyListing.amount && gameState.srgBalance >= buyCost)
      : false;

  const handleFinalBuy = () => {
      if (selectedBuyListing && isBuyValid) {
          onBuy(selectedBuyListing.id, buyAmountVal);
          setSelectedBuyListing(null);
          setBuyAmountInput('');
      }
  };

  const sortedListings = useMemo(() => {
    return [...gameState.energyMarketListings]
        .filter(l => !l.isPlayerListing)
        .sort((a, b) => a.pricePerUnit - b.pricePerUnit);
  }, [gameState.energyMarketListings]);

  const playerListings = useMemo(() => {
      return [...gameState.energyMarketListings].filter(l => l.isPlayerListing);
  }, [gameState.energyMarketListings]);

  return (
    <div className="p-6 space-y-6 bg-[#0b0e1a] pb-32">
      {/* Header & Stats */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">{t.emTitle || 'ENERJİ MARKETİ'}</h2>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">LIVE</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-500 uppercase">{t.headerEnergy}</p>
          <p className="text-xs font-black text-white">{gameState.energyPool.toFixed(2)} <span className="text-amber-500">{t.unitKw}</span></p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-[#1a1b2e] rounded-2xl border border-white/10 shadow-inner">
        <button 
          onClick={() => setActiveMarketTab('buy')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-[10px] font-black transition-all ${activeMarketTab === 'buy' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <ArrowDownCircle size={12} /> {t.emTabBuy || 'ENERJİ AL'}
        </button>
        <button 
          onClick={() => setActiveMarketTab('sell')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-[10px] font-black transition-all ${activeMarketTab === 'sell' ? 'bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <ArrowUpCircle size={12} /> {t.emTabSell || 'ENERJİ SAT'}
        </button>
      </div>

      {/* SELL TAB */}
      {activeMarketTab === 'sell' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#1a1b2e] rounded-3xl p-6 border border-slate-500/20 shadow-2xl space-y-5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-500/10 rounded-lg">
                <Target size={16} className="text-slate-400" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">{t.emSellTitle || 'İLAN OLUŞTUR'}</h3>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end px-1">
                <label className="text-[9px] font-black text-slate-500 uppercase">{t.emAmount || 'MİKTAR'}</label>
                <span className="text-[10px] font-bold text-slate-400 italic">Tam Sayı (Min: {MARKET_LIMITS.MIN_AMOUNT})</span>
              </div>
              <div className="relative group">
                <input 
                  type="number"
                  inputMode="numeric"
                  step="1"
                  value={sellAmount} 
                  onChange={(e) => setSellAmount(e.target.value)}
                  placeholder="0"
                  className={`w-full bg-[#0b0e1a] border rounded-2xl p-4 text-lg font-black text-white outline-none transition-all ${!isAmountValid && sellAmount !== '' ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 focus:border-slate-500/50 group-hover:border-white/20'}`} 
                />
                <Zap className={`absolute right-4 top-1/2 -translate-y-1/2 opacity-50 ${!isAmountValid && sellAmount !== '' ? 'text-red-500' : 'text-amber-500'}`} size={20} />
              </div>
              <div className="flex gap-2">
                {[0.25, 0.5, 1].map((pct) => (
                  <button key={pct} onClick={() => handlePercentage(pct)} className="flex-1 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-slate-400 hover:bg-white/10 hover:text-white transition-all uppercase">
                    %{pct * 100}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end px-1">
                <label className="text-[9px] font-black text-slate-500 uppercase">{t.emPrice || 'BİRİM FİYAT'}</label>
                <span className="text-[10px] font-bold text-slate-400 italic">Limit: {MARKET_LIMITS.MIN_PRICE} - {MARKET_LIMITS.MAX_PRICE} SRG</span>
              </div>
              <div className="relative group">
                <input 
                  type="number"
                  inputMode="decimal"
                  value={sellPrice} 
                  onChange={(e) => setSellPrice(e.target.value)}
                  className={`w-full bg-[#0b0e1a] border rounded-2xl p-4 text-lg font-black text-white outline-none transition-all ${!isPriceValid ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 focus:border-emerald-500/50 group-hover:border-white/20'}`} 
                />
                <Coins className={`absolute right-4 top-1/2 -translate-y-1/2 opacity-50 ${!isPriceValid ? 'text-red-500' : 'text-emerald-500'}`} size={20} />
              </div>
            </div>

            <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[9px] font-black text-slate-500 uppercase">{t.emGross || 'BRÜT KAZANÇ'}</p>
                <p className="text-sm font-black text-white">{grossGain.toFixed(2)} <span className="text-[8px]">SRG</span></p>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <p className="text-[9px] font-black text-slate-500 uppercase">{t.emFee || 'BORSA KOMİSYONU'}</p>
                <p className="text-xs font-bold text-red-400">-{fee.toFixed(2)} SRG</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-[10px] font-black text-emerald-500 uppercase">{t.emNet || 'NET KAZANÇ'}</p>
                <p className="text-xl font-black text-emerald-400">{netGain.toFixed(2)} <span className="text-xs">SRG</span></p>
              </div>
            </div>

            <button onClick={handleOpenConfirm} disabled={!isAmountValid || !isPriceValid} className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${isAmountValid && isPriceValid ? 'bg-gradient-to-r from-amber-500 to-amber-700 text-amber-950 hover:brightness-110' : 'bg-slate-800 text-slate-600 cursor-not-allowed shadow-none'}`}>
              {t.emButtonSell || 'İLAN VER'} <ChevronRight size={14} />
            </button>
          </div>

          {/* Player Listings */}
          <div className="space-y-4 pt-4 border-t border-white/5">
             <div className="flex items-center justify-between px-2">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <List size={12} className="text-indigo-400" /> {t.emMyList || 'AKTİF İLANLARIM'}
               </h3>
             </div>
             <div className="space-y-3">
               {playerListings.map(listing => (
                   <div key={listing.id} className="relative bg-[#1a1b2e] rounded-2xl p-4 border border-amber-500/30 overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                      <div className="flex justify-between items-center">
                         <div>
                            <p className="text-[11px] font-black text-white uppercase">{Math.floor(listing.amount)} {t.unitKw}</p>
                            <p className="text-[9px] font-bold text-slate-500">{t.emPrice || 'Fiyat'}: {listing.pricePerUnit.toFixed(2)} SRG</p>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-black text-emerald-400 mb-2">+{listing.totalPrice.toFixed(2)} SRG</p>
                            <button onClick={() => onCancel(listing.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[8px] font-black uppercase"><Trash2 size={10} /> {t.emCancel || 'İptal'}</button>
                         </div>
                      </div>
                   </div>
               ))}
             </div>
          </div>
        </div>
      )}

      {/* BUY TAB */}
      {activeMarketTab === 'buy' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {sortedListings.map((listing) => (
            <div key={listing.id} className="relative group bg-[#1a1b2e] rounded-2xl p-4 border border-white/5 transition-all hover:bg-[#252841] overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/30"></div>
              <div className="flex items-center gap-4 justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-white/5 border-white/5">
                    <Battery className="text-slate-400" size={24} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-white uppercase">{listing.sellerName}</h4>
                    <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <Zap size={10} className="text-amber-500" /> {Math.floor(listing.amount)} {t.unitKw} 
                      <span className="mx-1">•</span>
                      <span className="text-emerald-400">{listing.pricePerUnit.toFixed(2)} SRG</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white mb-2">{listing.totalPrice.toFixed(2)} <span className="text-[10px] text-slate-500">SRG</span></p>
                  <button onClick={() => handleOpenBuyModal(listing)} disabled={gameState.srgBalance <= 0} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${gameState.srgBalance > 0 ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-600 opacity-50'}`}>{t.emButtonBuy || 'AL'}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALS */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#1a1b2e] rounded-[2.5rem] border border-white/10 p-8 shadow-2xl text-center">
            <h3 className="text-xl font-black text-white uppercase mb-6">{t.emConfirmSell || 'SATIŞ ONAYI'}</h3>
            <div className="space-y-4 bg-black/40 rounded-3xl p-6 mb-8">
               <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-500 uppercase">{t.emAmount || 'Miktar'}</span><span className="text-sm font-black text-white">{amountVal} {t.unitKw}</span></div>
               <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-500 uppercase">{t.emPrice || 'Birim Fiyat'}</span><span className="text-sm font-black text-white">{priceVal.toFixed(2)} SRG</span></div>
               <div className="flex justify-between items-center border-t border-white/5 pt-3"><span className="text-[10px] font-black text-emerald-500 uppercase">{t.emNet || 'Net'}</span><span className="text-xl font-black text-emerald-400">{netGain.toFixed(2)} SRG</span></div>
            </div>
            <div className="flex gap-3">
               <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-4 rounded-2xl bg-white/5 text-slate-400 font-black text-[10px] uppercase">{t.cancel}</button>
               <button onClick={handleFinalSell} className="flex-[2] py-4 rounded-2xl bg-emerald-500 text-slate-950 font-black text-[10px] uppercase"><CheckCircle2 size={16} className="inline mr-1" /> {t.emPublish || 'YAYINLA'}</button>
            </div>
          </div>
        </div>
      )}

      {selectedBuyListing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#1a1b2e] rounded-[2.5rem] border border-white/10 p-8 shadow-2xl">
            <h3 className="text-xl font-black text-white uppercase text-center mb-6">{t.emModalTitle || 'ENERJİ SATIN AL'}</h3>
            <div className="space-y-6">
                <div className="space-y-2">
                   <div className="flex justify-between px-1"><label className="text-[9px] font-black text-slate-500 uppercase">{t.emBuyAmount || 'Alınacak Miktar'}</label><span className="text-[9px] font-bold text-slate-400">Maks: {Math.floor(selectedBuyListing.amount)}</span></div>
                   <input type="number" inputMode="numeric" step="1" value={buyAmountInput} onChange={(e) => setBuyAmountInput(e.target.value)} className="w-full bg-[#0b0e1a] border border-white/10 rounded-2xl p-4 text-xl font-black text-white outline-none focus:border-emerald-500/50" />
                </div>
                <div className="bg-black/40 rounded-3xl p-5 border border-white/5">
                   <div className="flex justify-between items-center"><span className="text-[10px] font-black text-emerald-500 uppercase">{t.emTotal || 'Toplam Maliyet'}</span><span className="text-xl font-black text-emerald-400">{buyCost.toFixed(2)} SRG</span></div>
                   {buyCost > gameState.srgBalance && <p className="text-[9px] font-black text-red-500 mt-2 text-center uppercase">{t.insufficient}</p>}
                </div>
                <div className="flex gap-3">
                   <button onClick={() => setSelectedBuyListing(null)} className="flex-1 py-4 rounded-2xl bg-white/5 text-slate-400 font-black text-[10px] uppercase">{t.cancel}</button>
                   <button onClick={handleFinalBuy} disabled={!isBuyValid} className={`flex-[2] py-4 rounded-2xl font-black text-[10px] uppercase ${isBuyValid ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-600'}`}>SATIN AL</button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
