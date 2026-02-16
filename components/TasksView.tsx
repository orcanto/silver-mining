
import React, { useState } from 'react';
import { GameState, Task } from '../types';
import { TASKS, TRANSLATIONS } from '../constants';
import { 
  CheckCircle2, 
  Send, 
  Twitter, 
  Users, 
  Star, 
  Loader2,
  ExternalLink,
  Youtube,
  Gift
} from 'lucide-react';

interface Props {
  gameState: GameState;
  onClaimTask: (taskId: string, reward: number) => void;
}

export const TasksView: React.FC<Props> = ({ gameState, onClaimTask }) => {
  const t = TRANSLATIONS[gameState.language];
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleTaskClick = (task: Task) => {
    if (gameState.completedTaskIds.includes(task.id)) return;

    if (task.link) {
      window.open(task.link, '_blank');
      setVerifyingId(task.id);
      setTimeout(() => {
        onClaimTask(task.id, task.rewardSilver);
        setVerifyingId(null);
      }, 2000);
    } else {
      onClaimTask(task.id, task.rewardSilver);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'send': return <Send size={24} className="text-blue-400" />;
      case 'twitter': return <Twitter size={24} className="text-sky-500" />;
      case 'youtube': return <Youtube size={24} className="text-red-500" />;
      case 'users': return <Users size={24} className="text-purple-400" />;
      default: return <Star size={24} className="text-amber-400" />;
    }
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-32">
      <div className="text-center mb-4">
         <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">GÖREV MERKEZİ</h2>
         <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black mt-2">EKSTRA GÜMÜŞ KAZAN</p>
      </div>

      <div className="glass-card bg-emerald-500/5 border-emerald-500/20 p-6 rounded-[2.5rem] flex items-center justify-between shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-5"><Gift size={64} className="text-emerald-400" /></div>
         <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
               <CheckCircle2 className="text-emerald-500" size={32} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TAMAMLANAN</p>
               <p className="text-2xl font-black text-white">{gameState.completedTaskIds.length} / {TASKS.length}</p>
            </div>
         </div>
      </div>

      <div className="space-y-4">
        {TASKS.map(task => {
          const isCompleted = gameState.completedTaskIds.includes(task.id);
          const isVerifying = verifyingId === task.id;
          
          return (
            <div 
              key={task.id}
              className={`
                glass-card relative overflow-hidden rounded-[2.2rem] border transition-all active:scale-[0.98]
                ${isCompleted 
                  ? 'bg-[#1a1b2e]/50 border-emerald-500/20 opacity-80' 
                  : 'bg-[#1a1b2e]/80 border-white/5 shadow-2xl'}
              `}
            >
               {isCompleted && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>}

               <div className="p-5 flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all
                    ${isCompleted ? 'bg-emerald-500/10 border-emerald-500/20 opacity-50' : 'bg-black/40 border-white/5'}
                  `}>
                     {isCompleted ? <CheckCircle2 className="text-emerald-500" size={28} /> : getIcon(task.icon)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                     <h4 className={`text-sm font-black uppercase truncate ${isCompleted ? 'text-slate-500 line-through' : 'text-white'}`}>
                        {task.title}
                     </h4>
                     <p className="text-[10px] text-slate-500 leading-tight mt-1 line-clamp-1 font-bold">
                        {task.description}
                     </p>
                     
                     <div className="flex items-center gap-2 mt-3">
                        <div className="bg-black/40 px-3 py-1 rounded-xl flex items-center gap-2 border border-white/5">
                           <span className="text-xs">🥈</span>
                           <span className={`text-[11px] font-black ${isCompleted ? 'text-slate-500' : 'text-amber-500'}`}>
                              +{task.rewardSilver.toLocaleString()}
                           </span>
                        </div>
                     </div>
                  </div>

                  <button
                    onClick={() => handleTaskClick(task)}
                    disabled={isCompleted || isVerifying}
                    className={`
                      h-12 px-5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all
                      ${isCompleted 
                        ? 'bg-transparent text-emerald-500 cursor-default' 
                        : 'bg-gradient-to-r from-slate-100 to-slate-300 text-black shadow-xl active:scale-90'}
                    `}
                  >
                     {isVerifying ? (
                       <Loader2 size={16} className="animate-spin" />
                     ) : isCompleted ? (
                       'ALINDI'
                     ) : (
                       <><span className="hidden sm:inline">KATIL</span> <ExternalLink size={14} /></>
                     )}
                  </button>
               </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900/60 border border-white/5 p-6 rounded-[2.5rem] text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
            Yeni görevler ağ durumu güncellendikçe buraya eklenecektir. Takipte kalın!
          </p>
      </div>
    </div>
  );
};
