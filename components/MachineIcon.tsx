
import React from 'react';
import { MachineType } from '../types';

interface Props {
  machine: MachineType;
  size?: number;
  className?: string;
}

export const MachineIcon: React.FC<Props> = ({ machine, size = 40, className = "" }) => {
  if (machine.category === 'generator') {
    return (
      <div 
        style={{ fontSize: size * 0.8 }} 
        className={`flex items-center justify-center leading-none select-none drop-shadow-[0_0_10px_rgba(34,211,238,0.4)] ${className}`}
      >
        {machine.icon}
      </div>
    );
  }

  const colors: Record<string, { primary: string, secondary: string, detail: string, glow: string }> = {
    'm1': { primary: '#10b981', secondary: '#064e3b', detail: '#34d399', glow: 'rgba(16,185,129,0.3)' }, // Green
    'm2': { primary: '#3b82f6', secondary: '#1e3a8a', detail: '#60a5fa', glow: 'rgba(59,130,246,0.3)' }, // Blue
    'm3': { primary: '#f59e0b', secondary: '#78350f', detail: '#fbbf24', glow: 'rgba(245,158,11,0.3)' }, // Amber
    'm4': { primary: '#94a3b8', secondary: '#334155', detail: '#cbd5e1', glow: 'rgba(148,163,184,0.3)' }, // Slate
    'm7': { primary: '#ef4444', secondary: '#7f1d1d', detail: '#f87171', glow: 'rgba(239,68,68,0.3)' }, // Red
  };

  const c = colors[machine.id] || colors['m1'];
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-2xl ${className}`}
    >
      {/* Outer Case */}
      <rect x="8" y="12" width="48" height="40" rx="6" fill="#0f172a" />
      <rect x="8" y="12" width="48" height="40" rx="6" stroke={c.primary} strokeWidth="2" strokeOpacity="0.2" />
      
      {/* Front Panel */}
      <rect x="12" y="16" width="40" height="32" rx="4" fill="#020617" />
      
      {/* Glow Effect */}
      <rect x="16" y="20" width="32" height="12" rx="2" fill={c.glow} />
      
      {/* Screen / Display */}
      <rect x="16" y="20" width="32" height="12" rx="2" fill={c.secondary} />
      <rect x="18" y="22" width="12" height="2" rx="1" fill={c.primary} fillOpacity="0.8" />
      <rect x="18" y="26" width="24" height="2" rx="1" fill={c.primary} fillOpacity="0.4" />
      
      {/* LED Indicators */}
      <circle cx="20" cy="40" r="2" fill={c.primary} className="animate-pulse" />
      <circle cx="28" cy="40" r="2" fill={c.primary} fillOpacity="0.5" />
      <circle cx="36" cy="40" r="2" fill="#ef4444" fillOpacity="0.3" />
      
      {/* Fans / Grills */}
      <rect x="44" y="36" width="4" height="8" rx="1" fill="#1e293b" />
      <rect x="44" y="20" width="4" height="12" rx="1" fill="#1e293b" />
      
      {/* Circuit Trace Decor */}
      <path d="M52 24H56V40H52" stroke={c.detail} strokeWidth="1" strokeOpacity="0.2" />
      <path d="M8 32H4" stroke={c.detail} strokeWidth="1" strokeOpacity="0.2" />
    </svg>
  );
};
