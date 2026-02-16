import React, { useState } from 'react';
import { GameState } from '../types';
import { Clock, CheckCircle2, XCircle, ArrowDownCircle, ArrowUpCircle, ChevronLeft } from 'lucide-react';

interface Props {
  gameState: GameState;
  onClose: () => void;
}

export const TransactionHistory: React.FC<Props> = ({ gameState, onClose }) => {
  const [filter, setFilter] = useState<'PENDING' | 'SUCCESS' | 'REJECTED'>('PENDING');

  const dict = {
    TR: { title: 'İŞLEM GEÇMİŞİ', pending: 'BEKLEYEN', success: 'ONAYLANAN', rejected: 'REDDEDİLEN', noData: 'İşlem bulunamadı', deposit: 'YATIRIM', withdraw: 'ÇEKİM' },
    EN: { title: 'TRANSACTION HISTORY', pending: 'PENDING', success: 'SUCCESS', rejected: 'REJECTED', noData: 'No transactions found', deposit: 'DEPOSIT', withdraw: 'WITHDRAW' },
    RU: { title: 'ИСТОРИЯ ОПЕРАЦИЙ', pending: 'В ОЖИДАНИИ', success: 'ОДОБРЕНО', rejected: 'ОТКЛОНЕНО', noData: 'История пуста', deposit: 'ДЕПОЗИТ', withdraw: 'ВЫВОД' }
  }[gameState.language || 'TR'] || { title: 'İŞLEM GEÇMİŞİ', pending: 'BEKLEYEN', success: 'ONAYLANAN', rejected: 'REDDEDİLEN', noData: 'İşlem bulunamadı', deposit: 'YATIRIM', withdraw: 'ÇEKİM' };

  // --- 🚀 VERİ BİRLEŞTİRME VE HATA KORUMASI ---
  const allTransactions = [
    ...(gameState.depositRequests || []).map(d => ({ ...d, type: 'DEPOSIT' })),
    ...(gameState.withdrawalRequests || []).map(w => ({ ...w, type: 'WITHDRAWAL' }))
  ].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  // --- 🚀 FİLTRELEME MANTIĞI (ADMIN ONAYI İLE TAM UYUMLU) ---
  const filteredData = allTransactions.filter(tx => {
    if (filter === 'PENDING') return tx.status === 'PENDING';
    if (filter === 'SUCCESS') return tx.status === 'COMPLETED' || tx.status === 'PAID' || tx.status === 'SUCCESS';
    if (filter === 'REJECTED') return tx.status === 'REJECTED' || tx.status === 'FAILED';
    return true;
  });

  return (
    <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#0a1229] w-full max-w-md h-[80vh] rounded-[3rem] border border-white/10 flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* HEADER */}
        <div className="p-6 flex items-center gap-4 border-b border-white/5 bg-[#0d1733]">
          <button onClick={onClose} className="p-2.5 bg-white/5 rounded-xl text-slate-400 active:scale-90 transition-all">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-lg font-black text-white italic uppercase tracking-tight font-mono">{dict.title}</h2>
        </div>

        {/* 3'LÜ KATEGORİ SEKMELERİ */}
        <div className="flex p-2.5 bg-black/40 gap-1.5 border-b border-white/5">
          {[
            { id: 'PENDING', label: dict.pending, color: 'text-amber-500' },
            { id: 'SUCCESS', label: dict.success, color: 'text-emerald-500' },
            { id: 'REJECTED', label: dict.rejected, color: 'text-red-500' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`flex-1 py-3 rounded-2xl text-[11px] font-black transition-all border ${
                filter === tab.id 
                ? 'bg-white/10 border-white/10 ' + tab.color 
                : 'bg-transparent border-transparent text-slate-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* İŞLEM LİSTESİ */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar pb-12">
          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-30">
              <Clock size={50} className="mb-3 text-slate-500" />
              <p className="font-black uppercase text-sm tracking-widest text-white">{dict.noData}</p>
            </div>
          ) : (
            filteredData.map((tx) => (
              <div key={tx.id} className="bg-white/5 border border-white/5 rounded-[1.8rem] p-5 flex justify-between items-center animate-in slide-in-from-bottom-3">
                <div className="flex items-center gap-4 text-left">
                  <div className={`p-3 rounded-2xl ${tx.type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {tx.type === 'DEPOSIT' ? <ArrowDownCircle size={22} /> : <ArrowUpCircle size={22} />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tight">
                      {tx.type === 'DEPOSIT' ? dict.deposit : dict.withdraw}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      {tx.timestamp ? new Date(tx.timestamp).toLocaleString(gameState.language === 'RU' ? 'ru-RU' : 'tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '---'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-white font-mono tracking-tighter">
                    {/* 🚀 BURASI GÜNCELLENDİ: ALTIN / 1000 VE $ İŞARETİ */}
                    {tx.type === 'DEPOSIT' 
                      ? `$${tx.costUsdt || 0}` 
                      : `$${((tx.amount || 0) / 1000).toFixed(2)}`}
                  </p>
                  <p className="text-[9px] font-black text-slate-600 uppercase mt-1 tracking-tighter italic">ID: {String(tx.id || '').slice(0, 8)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};