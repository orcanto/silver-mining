import React, { useState, useEffect } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { toNano } from '@ton/ton';
import { ADMIN_WALLET_ADDRESS, ADMIN_WALLET_TON } from '../constants';
import { 
  X, DollarSign, Copy, ShieldCheck, ArrowRightLeft, 
  Coins, HelpCircle, Zap, Wallet 
} from 'lucide-react';

interface Props {
  language: 'TR' | 'EN' | 'RU';
  telegramId: string | number;
  onClose: () => void;
  onSubmit: (amountSilver: number, costUsdt: number, memo: string) => void;
}

const MT = {
  TR: {
    title: "GÜMÜŞ YÜKLE",
    usd: "YATIRILACAK (USD)",
    silver: "ALACAĞIN (GÜMÜŞ)",
    btnContinue: "DEVAM ET",
    methodAuto: "OTOMATİK ÖDEME (TON)",
    methodManual: "MANUEL TRANSFER",
    btnPayAuto: "CÜZDAN İLE ÖDE",
    btnPaidManual: "MANUEL GÖNDERDİM",
    memo: "ZORUNLU MEMO KODU",
    address: "CÜZDAN ADRESİ",
    noMemo: "TRC20 İÇİN MEMO GEREKMEZ",
    confirmTitle: "GÖNDERİMİ ONAYLA",
    confirmDesc: "Doğru MEMO koduyla gönderim yaptınız mı?",
    yes: "EVET, ÖDEDİM",
    no: "GERİ DÖN",
    success: "İSTEK ALINDI",
    verification: "Onay süresi: ~5 Dakika",
    close: "KAPAT"
  },
  EN: {
    title: "DEPOSIT SILVER",
    usd: "DEPOSIT (USD)",
    silver: "YOU RECEIVE (SILVER)",
    btnContinue: "CONTINUE",
    methodAuto: "AUTOMATIC (TON)",
    methodManual: "MANUAL TRANSFER",
    btnPayAuto: "PAY WITH WALLET",
    btnPaidManual: "I SENT MANUALLY",
    memo: "REQUIRED MEMO CODE",
    address: "WALLET ADDRESS",
    noMemo: "NO MEMO REQUIRED FOR TRC20",
    confirmTitle: "CONFIRM SUBMISSION",
    confirmDesc: "Did you use the correct MEMO code?",
    yes: "YES, I PAID",
    no: "GO BACK",
    success: "REQUEST SENT",
    verification: "Verification: ~5 Minutes",
    close: "CLOSE"
  },
  RU: {
    title: "ДЕПОЗИТ",
    usd: "ДЕПОЗИТ (USD)",
    silver: "ВЫ ПОЛУЧИТЕ",
    btnContinue: "ПРОДОЛЖИТЬ",
    methodAuto: "АВТОМАТИЧЕСКИ (TON)",
    methodManual: "РУЧНОЙ ПЕРЕВОД",
    btnPayAuto: "ОПЛАТИТЬ КОШЕЛЬКОМ",
    btnPaidManual: "Я ОТПРАВИЛ ВРУЧНУЮ",
    memo: "КОД MEMO (ОБЯЗАТЕЛЬНО)",
    address: "АДРЕС КОШЕЛЬКА",
    noMemo: "ДЛЯ TRC20 МЕМО НЕ НУЖЕН",
    confirmTitle: "ПОДТВЕРЖДЕНИЕ",
    confirmDesc: "Вы использовали правильный MEMO?",
    yes: "ДА, ОПЛАТИЛ",
    no: "НАЗАД",
    success: "ЗАПРОС ОТПРАВЛЕН",
    verification: "Проверка: ~5 минут",
    close: "ЗАКРЫТЬ"
  }
};

export const DepositModal: React.FC<Props> = ({ language, telegramId, onClose, onSubmit }) => {
  const mt = MT[language] || MT.EN;
  const [tonConnectUI] = useTonConnectUI();
  const [step, setStep] = useState<'calculator' | 'instructions' | 'pre-confirm' | 'confirm'>('calculator');
  const [silverAmount, setSilverAmount] = useState<string>('2000');
  const [usdtAmount, setUsdtAmount] = useState<string>('1');
  const [selectedNetwork, setSelectedNetwork] = useState<'USDT' | 'TON'>('USDT');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // KİLİT MEKANİZMASI: Eğer bu true ise, modal asla dışarıdan kapatılamaz
  const [isSuccessLocked, setIsSuccessLocked] = useState(false);

  const RATE = 2000;
  const displayId = telegramId && telegramId !== 0 ? telegramId : "USER";
  const memoCode = `SRG-${displayId}`;
  
  const targetWallet = selectedNetwork === 'USDT' ? ADMIN_WALLET_ADDRESS : ADMIN_WALLET_TON;

  // Kapanma isteğini kontrol eden özel fonksiyon
  const handleSafeClose = () => {
    // Eğer onay ekranındaysak, X'e basılsa bile kapatma (Sadece DONE butonu kapasın)
    if (step === 'confirm') return; 
    onClose();
  };

  const handleManualSubmit = () => {
    setIsSuccessLocked(true); // Kilidi devreye sok
    onSubmit(Number(silverAmount), Number(usdtAmount), memoCode);
    setStep('confirm'); // Son adıma geç
  };

  const handleAutoTonPayment = async () => {
    if (!tonConnectUI.connected) { tonConnectUI.openModal(); return; }
    setIsProcessing(true);
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd');
      const data = await res.json();
      const tonPrice = data['the-open-network'].usd;
      const calculatedTon = ((parseFloat(usdtAmount) * 1.02) / tonPrice).toFixed(4);
      
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address: ADMIN_WALLET_TON, amount: toNano(calculatedTon).toString() }],
      };
      
      if (await tonConnectUI.sendTransaction(transaction)) {
        setIsSuccessLocked(true);
        onSubmit(parseFloat(silverAmount), parseFloat(usdtAmount), `AUTO-TON-${calculatedTon}`);
        setStep('confirm');
      }
    } catch (e) { console.error(e); } finally { setIsProcessing(false); }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl" 
      onClick={handleSafeClose} // Dışarı tıklandığında güvenli kapatma
    >
      <div className="w-full max-w-sm bg-[#1a1b2e] rounded-[3rem] border border-emerald-500/20 relative overflow-hidden flex flex-col shadow-2xl" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 relative z-10">
          
          {step !== 'confirm' && (
            <button onClick={handleSafeClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white bg-white/5 rounded-full"><X size={20}/></button>
          )}

          {step === 'calculator' && (
            <div className="space-y-6 text-center animate-in zoom-in-95">
               <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-500 border border-emerald-500/30"><ArrowRightLeft size={32} /></div>
               <h3 className="text-xl font-black text-white italic uppercase">{mt.title}</h3>
               <div className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase px-1">{mt.usd}</label>
                    <div className="relative">
                      <input type="number" value={usdtAmount} onChange={(e) => {setUsdtAmount(e.target.value); setSilverAmount((Number(e.target.value) * RATE).toString());}} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xl font-black text-white outline-none focus:border-emerald-500/50" />
                      <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase px-1">{mt.silver}</label>
                    <div className="relative">
                      <input readOnly value={silverAmount} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xl font-black text-emerald-400 outline-none" />
                      <Coins className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    </div>
                  </div>
               </div>
               <button onClick={() => setStep('instructions')} className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">{mt.btnContinue}</button>
            </div>
          )}

          {step === 'instructions' && (
            <div className="space-y-5 animate-in slide-in-from-right-4">
               <div className="flex justify-between border-b border-white/5 pb-4 items-center">
                  <button onClick={() => setStep('calculator')} className="text-emerald-500 font-black text-[10px] uppercase">← BACK</button>
                  <h3 className="text-sm font-black text-white italic tracking-tighter uppercase">TOTAL: ${usdtAmount}</h3>
               </div>

               <div className="space-y-2 text-left">
                 <label className="text-[9px] font-black text-blue-400 uppercase flex items-center gap-1 px-1"><Zap size={10} /> {mt.methodAuto}</label>
                 <div className="bg-blue-600/5 border border-blue-500/20 p-5 rounded-[2rem]">
                   <button onClick={handleAutoTonPayment} disabled={isProcessing} className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-[11px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-blue-600/10">
                     {isProcessing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Wallet size={16} /> {mt.btnPayAuto}</>}
                   </button>
                 </div>
               </div>

               <div className="text-center text-[9px] font-black text-slate-600 uppercase tracking-widest">——— OR MANUALLY ———</div>

               <div className="space-y-3">
                 <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                    <button onClick={() => setSelectedNetwork('USDT')} className={`flex-1 py-2 rounded-lg text-[9px] font-black transition-all ${selectedNetwork === 'USDT' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500'}`}>USDT (TRC20)</button>
                    <button onClick={() => setSelectedNetwork('TON')} className={`flex-1 py-2 rounded-lg text-[9px] font-black transition-all ${selectedNetwork === 'TON' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500'}`}>TON</button>
                 </div>

                 <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex justify-between cursor-pointer group active:scale-95 transition-all text-left" onClick={() => handleCopy(targetWallet)}>
                   <div className="flex flex-col">
                     <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{mt.address} ({selectedNetwork})</span>
                     <p className="text-[9px] font-mono text-slate-300 break-all pr-4 mt-1 leading-tight">{copiedText === targetWallet ? "✅ COPIED!" : targetWallet}</p>
                   </div>
                   <Copy size={16} className="text-slate-500 group-hover:text-white transition-colors" />
                 </div>
                 
                 {selectedNetwork === 'TON' ? (
                   <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20 flex justify-between cursor-pointer group active:scale-95 transition-all animate-in zoom-in-95 text-left" onClick={() => handleCopy(memoCode)}>
                     <div className="flex flex-col">
                       <span className="text-[8px] text-amber-500 font-black uppercase italic tracking-widest">{mt.memo}</span>
                       <p className="text-xl font-black text-amber-500 font-tech mt-1 tracking-widest">{copiedText === memoCode ? "✅ COPIED!" : memoCode}</p>
                     </div>
                     <Copy size={20} className="text-amber-500 group-hover:text-white transition-colors" />
                   </div>
                 ) : (
                   <div className="py-2 text-center border border-emerald-500/10 rounded-xl bg-emerald-500/5 animate-in fade-in">
                     <p className="text-[8px] text-emerald-500/50 font-black italic tracking-tighter uppercase">{mt.noMemo}</p>
                   </div>
                 )}

                 <button 
                   onClick={() => setStep('pre-confirm')} 
                   className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-black text-[11px] uppercase border border-amber-400/50 shadow-lg shadow-amber-500/20 active:scale-95 transition-all mt-2"
                 >
                   {mt.btnPaidManual}
                 </button>
               </div>
            </div>
          )}

          {step === 'pre-confirm' && (
            <div className="space-y-6 text-center py-4 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto border border-amber-500/30 text-amber-500"><HelpCircle size={32} /></div>
              <h3 className="text-xl font-black text-white italic uppercase leading-none">{mt.confirmTitle}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase px-4 leading-relaxed">{mt.confirmDesc}</p>
              <div className="space-y-3 pt-2">
                <button 
                  onClick={handleManualSubmit} 
                  className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-black text-[11px] uppercase shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  {mt.yes}
                </button>
                <button onClick={() => setStep('instructions')} className="w-full py-4 rounded-2xl bg-slate-800 text-slate-400 font-black text-[11px] uppercase active:scale-95 transition-all">
                  {mt.no}
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in">
               <div className="relative mb-6">
                 <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
                 <ShieldCheck size={60} className="text-emerald-500 relative z-10" />
               </div>
               <h3 className="text-xl font-black text-white italic uppercase mb-2 leading-none">{mt.success}</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 px-6 leading-relaxed">{mt.verification}</p>
               
               <div className="w-full px-4 mt-8">
                 {/* BU BUTON ARTIK TEK ÇIKIŞ YOLU */}
                 <button onClick={onClose} className="w-full py-5 rounded-2xl bg-white text-black font-black text-xs uppercase shadow-xl active:scale-95 transition-all border-b-4 border-slate-300">
                   {mt.close} (DONE)
                 </button>
               </div>
               
               <p className="mt-6 text-[8px] text-slate-600 font-black uppercase italic tracking-widest">USER TG: {displayId}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};