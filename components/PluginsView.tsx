
import React from 'react';
import { GameState } from '../types';
import { AVAILABLE_PLUGINS } from '../constants';
import { Boxes, Download, CheckCircle, Power, User, Code, Terminal, AlertCircle } from 'lucide-react';

interface Props {
  gameState: GameState;
  onInstall: (id: string) => void;
  onToggle: (id: string) => void;
}

export const PluginsView: React.FC<Props> = ({ gameState, onInstall, onToggle }) => {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="text-center mb-4">
         <h2 className="text-2xl font-black text-emerald-400 italic tracking-tighter uppercase">Eklenti Marketi</h2>
         <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Topluluk Geliştiricileri Modülleri</p>
      </div>

      <div className="bg-slate-900/40 rounded-2xl p-4 border border-white/5 flex gap-3">
         <AlertCircle className="text-amber-500 shrink-0 w-5 h-5" />
         <p className="text-[9px] text-slate-400 leading-relaxed italic">
            Bu eklentiler topluluk tarafından geliştirilmiştir. Rig otomasyonu ve analiz araçları için gümüş bakiyenle kurulum yapabilirsin.
         </p>
      </div>

      <div className="space-y-4">
        {AVAILABLE_PLUGINS.map(plugin => {
          const isInstalled = gameState.installedPlugins.includes(plugin.id);
          const isActive = gameState.activePlugins.includes(plugin.id);
          const canAfford = gameState.silverBalance >= plugin.cost;

          return (
            <div 
              key={plugin.id}
              className={`bg-[#1a1b2e] rounded-3xl p-5 border transition-all relative overflow-hidden group
                ${isInstalled ? 'border-emerald-500/20' : 'border-white/5 hover:border-white/10'}
              `}
            >
              {/* Dev Badge */}
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Terminal size={48} className="text-emerald-500" />
              </div>

              <div className="flex items-start gap-4 mb-4 relative z-10">
                 <div className="w-14 h-14 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-center text-3xl shadow-inner">
                    {plugin.icon}
                 </div>
                 <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white uppercase tracking-tight">{plugin.name}</h3>
                      <span className="text-[7px] text-slate-500 font-bold bg-white/5 px-1.5 py-0.5 rounded">v{plugin.version}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 opacity-60">
                       <Code size={10} className="text-emerald-400" />
                       <span className="text-[8px] font-black text-slate-400 uppercase">{plugin.developer}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 font-medium leading-snug">{plugin.description}</p>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
                 {!isInstalled ? (
                    <>
                       <div className="flex flex-col">
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Kurulum Ücreti</p>
                          <p className="text-sm font-black text-white">{plugin.cost.toLocaleString()} <span className="text-[9px] text-slate-500 italic">GÜMÜŞ</span></p>
                       </div>
                       <button 
                         onClick={() => canAfford && onInstall(plugin.id)}
                         disabled={!canAfford}
                         className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95
                           ${canAfford ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/10' : 'bg-slate-800 text-slate-600'}
                         `}
                       >
                          <Download size={14} /> KURULUM YAP
                       </button>
                    </>
                 ) : (
                    <>
                       <div className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-emerald-500" />
                          <span className="text-[10px] font-black text-emerald-500 uppercase">KURULDU</span>
                       </div>
                       <button 
                         onClick={() => onToggle(plugin.id)}
                         className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border
                           ${isActive 
                             ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                             : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}
                         `}
                       >
                          <Power size={14} /> {isActive ? 'DEAKTİF ET' : 'AKTİF ET'}
                       </button>
                    </>
                 )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#1a1b2e] rounded-3xl p-6 border border-white/5 text-center space-y-3">
         <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2 border border-white/5">
            <User size={24} className="text-slate-500" />
         </div>
         <h3 className="text-xs font-black text-white uppercase tracking-widest">Kendi Eklentini Yap!</h3>
         <p className="text-[9px] text-slate-500 uppercase font-bold leading-relaxed px-4">
           SDK dokümantasyonuna göz atarak topluluk için yeni araçlar geliştirebilir ve SRG ödülleri kazanabilirsin.
         </p>
         <button className="text-[8px] font-black text-emerald-400 uppercase tracking-widest hover:underline">Geliştirici Portalına Git ↗</button>
      </div>
    </div>
  );
};
