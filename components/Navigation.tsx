import React from 'react';
import { View } from '../types';
import { LayoutDashboard, ShoppingCart, Home, Users, Pointer, ShieldCheck } from 'lucide-react';

interface Props {
  activeView: View;
  setView: (v: View) => void;
  userId?: number; // App.tsx'den gelen kullanıcı ID'si
}

export const Navigation: React.FC<Props> = ({ activeView, setView, userId }) => {
  // BURAYA KENDİ TELEGRAM ID'Nİ YAZ
  const MY_ADMIN_ID = 1531240410; 

  const items: { id: View, icon: any, label: string }[] = [
    { id: 'mining', icon: LayoutDashboard, label: 'SLOT' },
    { id: 'shop', icon: ShoppingCart, label: 'MARKET' },
    { id: 'home', icon: Home, label: 'HOME' }, 
    { id: 'tap', icon: Pointer, label: 'KAZ' },
    { id: 'friends', icon: Users, label: 'REF' },
  ];

  // SADECE SENİN İÇİN: Admin panelini listeye gizlice ekle
  // Localhost'ta test yapabilmen için hostname kontrolü de ekledim
  if (userId === MY_ADMIN_ID || window.location.hostname === 'localhost') {
    items.push({ id: 'admin' as View, icon: ShieldCheck, label: 'ADM' });
  }

  return (
    <div className="absolute bottom-4 left-0 right-0 z-[100] px-3 animate-in slide-in-from-bottom-5 duration-500">
      <nav className="bg-[#0b0e1a]/95 backdrop-blur-3xl border border-white/10 h-16 py-2 px-2 flex items-center justify-around shadow-[0_-5px_30px_rgba(0,0,0,0.6)] rounded-[2rem]">
        {items.map((item) => {
          const isActive = activeView === item.id;
          const isHome = item.id === 'home';
          const isAdmin = item.id === 'admin';

          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all relative flex-1 h-full
                ${isActive ? (isAdmin ? 'text-red-500' : 'text-emerald-400') : 'text-slate-500'}
              `}
            >
              {isHome && (
                 <div className={`absolute -top-3 w-10 h-10 rounded-full border border-white/5 transition-all shadow-2xl ${isActive ? 'bg-emerald-500 border-emerald-400' : 'bg-[#1a1b2e]'}`}></div>
              )}
              
              <item.icon 
                size={isHome ? 22 : 18} 
                className={`relative z-10 ${isHome && isActive ? 'text-black' : ''} ${isActive && !isHome ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''}`} 
              />
              
              <span className={`text-[7px] font-black uppercase tracking-widest relative z-10 ${isHome && isActive ? 'text-black' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};