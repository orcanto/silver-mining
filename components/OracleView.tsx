
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GameState } from '../types';
import { Sparkles, Terminal, Loader2, Zap, TrendingUp, Info } from 'lucide-react';

export const OracleView: React.FC<{ state: GameState }> = ({ state }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getInsight = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Mevcut Maden Çiftliği Durumu:
        - SRG Bakiyesi: ${state.srgBalance}
        - Enerji: ${state.energyPool}/${state.maxEnergyPool}
        - Saatlik Tüketim: ${state.hourlyConsumption} Wh/sa
        - Saatlik Üretim: ${state.hourlyGeneration} Wh/sa
        - Rütbe: ${state.rank}

        Sen siberpunk dünyada yaşayan çok zeki bir Cyber Oracle'sın. Kullanıcıya maden stratejisi hakkında 2-3 cümlelik, teknik ve gizemli bir tavsiye ver. 
        Kullanıcıyı motive et. Terimler: HODL, Moon, Hashrate, Grid, Overclock. Sadece metin döner misin?
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      setInsight(response.text);
    } catch (e) {
      setInsight("Blockchain ağında bir parazit var, verilere ulaşılamıyor...");
    }
    setLoading(false);
  };

  return (
    <div className="p-8 h-full flex flex-col items-center justify-center text-center space-y-12 animate-in fade-in duration-700">
      <div className="relative group">
        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-[100px] opacity-20 animate-pulse group-hover:opacity-40 transition-opacity"></div>
        <div className="w-44 h-44 bg-slate-950 rounded-[4rem] flex items-center justify-center border-2 border-indigo-500/30 shadow-2xl relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
          <Sparkles size={96} className="text-indigo-400 drop-shadow-[0_0_25px_rgba(99,102,241,0.8)] animate-float" />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent"></div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">SİBER KAHİN</h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black">AI ANALİZ MOTORU v2.1</p>
      </div>

      <div className="bg-[#0f172a]/60 p-10 rounded-[3rem] border border-white/5 min-h-[180px] w-full flex items-center justify-center relative overflow-hidden shadow-2xl backdrop-blur-3xl">
        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,1)]"></div>
        {loading ? (
          <div className="flex flex-col items-center gap-5">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <p className="text-[11px] font-black text-slate-500 uppercase animate-pulse tracking-[0.3em]">AĞ SENKRONİZASYONU...</p>
          </div>
        ) : insight ? (
          <p className="text-base font-medium text-indigo-100 italic leading-relaxed animate-in slide-in-from-bottom-4">"{insight}"</p>
        ) : (
          <div className="flex flex-col items-center gap-5 opacity-40">
            <Info className="text-slate-600 w-12 h-12" />
            <p className="text-xs text-slate-600 font-bold uppercase tracking-widest leading-relaxed px-4">Kahin ağdaki siber dalgaları gözlemliyor. Farmını analiz etmek için verileri yükle.</p>
          </div>
        )}
      </div>

      <button
        onClick={getInsight}
        disabled={loading}
        className="w-full py-6 rounded-[2.5rem] bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-black text-[12px] uppercase tracking-[0.3em] shadow-[0_15px_30px_rgba(99,102,241,0.3)] active:scale-95 transition-all flex items-center justify-center gap-4"
      >
        <Terminal size={22} /> ANALİZİ BAŞLAT
      </button>

      <div className="grid grid-cols-2 gap-5 w-full">
        <div className="bg-slate-900/60 p-6 rounded-[2.2rem] border border-white/5 flex flex-col items-center group hover:bg-white/5 transition-colors duration-300">
          <Zap size={22} className="text-cyan-400 mb-3 group-hover:scale-125 transition-transform" />
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">VERİ AKIŞI</span>
          <span className="text-sm font-black text-white mt-1 font-tech">{(state.hourlyGeneration - state.hourlyConsumption).toFixed(1)} Wh</span>
        </div>
        <div className="bg-slate-900/60 p-6 rounded-[2.2rem] border border-white/5 flex flex-col items-center group hover:bg-white/5 transition-colors duration-300">
          <TrendingUp size={22} className="text-amber-400 mb-3 group-hover:scale-125 transition-transform" />
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">HASH_RATE</span>
          <span className="text-sm font-black text-white mt-1 font-tech">+{ (state.energyPool > 0 ? 14.8 : 0).toFixed(1) }%</span>
        </div>
      </div>
    </div>
  );
};
