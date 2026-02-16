
import React, { useState, useEffect } from 'react';
import { GameState } from '../types';
import { TRANSLATIONS } from '../constants'; 
import { X, Wallet, ArrowRight, ArrowLeft, AlertCircle, Coins, DollarSign, Gem, Trash2, Clock, CheckCircle2, History, PlusCircle, AlertTriangle, ShieldCheck, Lock } from 'lucide-react';

interface Props {
  gameState: GameState;
  onClose: () => void;
  onConfirm: (address: string, amount: number, method: string) => void;
  onCancelRequest: (id: string) => void;
}

export const WithdrawalModal: React.FC<Props> = ({ gameState, onClose, onConfirm, onCancelRequest }) => {
  const t = TRANSLATIONS[gameState.language] as any; 
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [step, setStep] = useState<'form' | 'review' | 'success'>('form');

  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<'USDT' | 'TON'>('USDT');
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null); 
  
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const numAmount = parseInt(amount) || 0;
  const minWithdraw = 100; // MİNİMUM 100 ALTIN ($0.10) OLARAK GÜNCELLENDİ
  
  const isValid = address.length > 5 && numAmount >= minWithdraw && numAmount <= gameState.goldBalance;

  useEffect(() => {
    setStep('form');
    setConfirmCancelId(null);
  }, [activeTab]);

  const handleMax = () => {
    setAmount(Math.floor(gameState.goldBalance).toString());
  }

  const handleReview = () => {
    if (isValid) setStep('review');
  }

  const handleFinalSubmit = () => {
    onConfirm(address, numAmount, method);
    setStep('success');
  }

  const pendingRequests = gameState.withdrawalRequests || [];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
       <div className="w-full max-w-sm bg-[#1a1b2e] rounded-[2.5rem] border border-amber-500/20 p-6 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
          
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center mb-4 relative">
             <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <Wallet size={32} className="text-amber-500" />
             </div>
             <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{t.finTitle}</h3>
             <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">1000 ALTIN = 1.00 USD</p>
             
             <button onClick={onClose} className="absolute -top-2 -right-2 p-2 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-full">
                <X size={20}/>
             </button>
          </div>

          <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5 mb-6">
             <button 
               onClick={() => setActiveTab('create')}
               className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'create' ? 'bg-amber-500 text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
             >
                <PlusCircle size={12} /> YENİ TALEP
             </button>
             <button 
               onClick={() => setActiveTab('list')}
               className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'list' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
             >
                <History size={12} /> BEKLEYEN ({pendingRequests.length})
             </button>
          </div>

          {activeTab === 'create' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
                {step === 'form' && (
                  <div className="space-y-4">
                    <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Coins size={16} className="text-amber-500" />
                          <span className="text-[10px] font-black text-slate-500 uppercase">CÜZDAN</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-black text-white">{Math.floor(gameState.goldBalance).toLocaleString()} <span className="text-amber-500 text-sm">🟡</span></span>
                          <p className="text-[9px] font-black text-emerald-500 mt-0.5">ESTIMATED: ${(gameState.goldBalance / 1000).toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button 
                        onClick={() => setMethod('USDT')}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${method === 'USDT' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-black/20 border-white/5 text-slate-500 hover:bg-white/5'}`}
                        >
                        <DollarSign size={20} />
                        <span className="text-[10px] font-black uppercase">USDT (TRC20)</span>
                        </button>
                        <button 
                        onClick={() => setMethod('TON')}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${method === 'TON' ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-black/20 border-white/5 text-slate-500 hover:bg-white/5'}`}
                        >
                        <Gem size={20} />
                        <span className="text-[10px] font-black uppercase">TON COIN</span>
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase ml-1">ADRES</label>
                        <input 
                            type="text" 
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder={method === 'USDT' ? 'T...' : 'UQ...'}
                            className="w-full bg-[#0b0e1a] border border-white/10 rounded-2xl p-4 text-xs font-mono text-white outline-none focus:border-amber-500/50 transition-all placeholder:text-slate-700"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between px-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase">MİKTAR (ALTIN)</label>
                        <span className="text-[9px] font-bold text-slate-600">Min: {minWithdraw} 🟡</span>
                        </div>
                        <div className="relative">
                          <input 
                              type="number" 
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="w-full bg-[#0b0e1a] border border-white/10 rounded-2xl p-4 text-lg font-black text-white outline-none focus:border-amber-500/50 transition-all placeholder:text-slate-700"
                              placeholder="0"
                          />
                          <button 
                              onClick={handleMax}
                              className="absolute right-3 top-1/2 -translate-y-1/2 bg-amber-500/20 text-amber-500 px-3 py-1.5 rounded-lg text-[9px] font-black hover:bg-amber-500 hover:text-black transition-colors"
                          >
                              MAX
                          </button>
                        </div>
                        {numAmount >= minWithdraw && (
                          <p className="text-[9px] font-black text-emerald-400 text-center uppercase tracking-widest mt-2">ALINACAK NAKİT: ${(numAmount/1000).toFixed(2)}</p>
                        )}
                    </div>

                    <button 
                        onClick={handleReview}
                        disabled={!isValid}
                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2
                        ${isValid ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
                        `}
                    >
                        {isValid ? 'TALEP OLUŞTUR' : numAmount < minWithdraw ? 'MİNİMUM LİMİT GEÇERSİZ' : 'BAKİYE YETERSİZ'}
                    </button>
                  </div>
                )}

                {step === 'review' && (
                  <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                    <div className="text-center space-y-2">
                       <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                          <ShieldCheck size={24} className="text-emerald-500" />
                       </div>
                       <h4 className="text-sm font-black text-white uppercase">ONAY VE KONTROL</h4>
                    </div>

                    <div className="bg-black/40 rounded-3xl p-6 border border-white/5 space-y-4">
                       <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <span className="text-[10px] font-black text-slate-500 uppercase">YÖNTEM</span>
                          <span className={`text-xs font-black px-2 py-0.5 rounded uppercase ${method === 'USDT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>{method}</span>
                       </div>
                       <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <span className="text-[10px] font-black text-slate-500 uppercase">NAKİT KARŞILIĞI</span>
                          <span className="text-sm font-black text-emerald-400">${(numAmount/1000).toFixed(2)}</span>
                       </div>
                       <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-500 uppercase">ALICI ADRES</span>
                          <p className="text-[10px] font-mono text-slate-300 break-all bg-white/5 p-2 rounded-lg">{address}</p>
                       </div>
                    </div>

                    <div className="flex gap-3">
                       <button onClick={() => setStep('form')} className="flex-1 py-4 rounded-2xl bg-white/5 text-slate-400 font-black text-xs uppercase">GERİ</button>
                       <button onClick={handleFinalSubmit} className="flex-[2] py-4 rounded-2xl bg-emerald-600 text-black font-black text-xs uppercase shadow-lg active:scale-95">ONAYLA</button>
                    </div>
                  </div>
                )}

                {step === 'success' && (
                   <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in duration-500">
                      <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center border-4 border-emerald-500/30 mb-6">
                         <CheckCircle2 size={40} className="text-emerald-500" />
                      </div>
                      <h3 className="text-xl font-black text-white uppercase mb-2">İŞLEM TAMAM!</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase text-center max-w-[200px] mb-8">
                         Talebiniz kuyruğa alındı. İnceleme sonrası gönderilecektir.
                      </p>
                      <button onClick={onClose} className="w-full py-4 rounded-2xl bg-slate-800 text-white font-black text-xs uppercase">KAPAT</button>
                   </div>
                )}
            </div>
          )}

          {activeTab === 'list' && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300 h-[320px] overflow-y-auto no-scrollbar">
                 {pendingRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 gap-2 border-2 border-dashed border-white/10 rounded-2xl">
                        <History size={32} />
                        <p className="text-[10px] font-black uppercase text-slate-500">HİÇ TALEP YOK</p>
                    </div>
                 ) : (
                    pendingRequests.map(req => (
                      <div key={req.id} className="bg-black/40 border border-white/5 rounded-2xl p-4 relative group">
                          <div className="flex justify-between items-start mb-2">
                              <div>
                                  <div className="flex items-center gap-2">
                                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${req.method === 'USDT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>{req.method}</span>
                                      <span className="text-[9px] text-zinc-500 font-mono">ID: {req.id.substring(0,6)}</span>
                                  </div>
                                  <h4 className="text-lg font-black text-white mt-1">{req.amount.toLocaleString()} 🟡</h4>
                                  <p className="text-[10px] font-black text-emerald-500">${(req.amount/1000).toFixed(2)}</p>
                              </div>
                              <div className="text-right">
                                  <span className="text-[8px] bg-amber-500/20 text-amber-500 px-2 py-1 rounded font-black uppercase">BEKLEMEDE</span>
                              </div>
                          </div>
                      </div>
                    ))
                 )}
              </div>
          )}
       </div>
    </div>
  );
};
