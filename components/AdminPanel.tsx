import React, { useState, useEffect, useMemo } from 'react';
import { GameState, DepositRequest } from '../types';
import { TRANSLATIONS, MACHINES, MINERS_DATA, GENERATORS_DATA } from '../constants';
import { 
  Activity, Users, Wallet, Cpu, CheckCircle2,
  Skull, Search, Zap, Edit2, Plus, Database,
  ArrowDownCircle, ArrowUpCircle, Clock, Server, Layers,
  UserPlus, Trophy, TrendingUp, DollarSign, FileText, Terminal, Trash2
} from 'lucide-react';

interface Props {
  gameState: GameState;
  allUsersData?: any[]; 
  onClose: () => void;
  onProcessWithdrawal: (id: string, approved: boolean) => void;
  onProcessDeposit: (id: string, approved: boolean, newSilver?: number) => void;
  onManageUser: (userId: string, action: 'add_silver' | 'toggle_status', value?: number) => void;
}

interface AdminLog {
    id: string;
    message: string;
    type: 'success' | 'danger' | 'info';
    timestamp: string;
}

export const AdminPanel: React.FC<Props> = ({ 
  gameState, 
  allUsersData = [], 
  onClose,
  onProcessWithdrawal, 
  onProcessDeposit,
  onManageUser
}) => {
  const t = TRANSLATIONS[gameState.language] as any;
  const [activeTab, setActiveTab] = useState<'dashboard' | 'units' | 'users' | 'finance' | 'logs'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'silver' | 'ref' | 'production'>('silver');
  
  const [editingDepositId, setEditingDepositId] = useState<string | null>(null);
  const [editSilverValue, setEditSilverValue] = useState<string>('');
  
  const [addingSilverToUser, setAddingSilverToUser] = useState<string | null>(null);
  const [silverValueToAdd, setSilverValueToAdd] = useState<string>('1000');

  // 🚀 LOG SİSTEMİ (LOCALSTORAGE İLE KALICI)
  const [localLogs, setLocalLogs] = useState<AdminLog[]>(() => {
      const saved = localStorage.getItem('admin_logs');
      return saved ? JSON.parse(saved) : [{ id: 'init', message: 'SYSTEM_READY: Admin paneli başlatıldı...', type: 'info', timestamp: new Date().toLocaleTimeString() }];
  });

  // Log ekleyince hafızaya da yaz
  const addLog = (msg: string, type: 'success' | 'danger' | 'info' = 'info') => {
      const newLog: AdminLog = {
          id: Math.random().toString(36).substr(2, 9),
          message: msg,
          type,
          timestamp: new Date().toLocaleTimeString()
      };
      const updatedLogs = [newLog, ...localLogs].slice(0, 100); // Son 100 logu tut
      setLocalLogs(updatedLogs);
      localStorage.setItem('admin_logs', JSON.stringify(updatedLogs));
  };

  // Logları Temizle
  const clearLogs = () => {
      setLocalLogs([]);
      localStorage.removeItem('admin_logs');
  };

  // 1. KULLANICILARI HAZIRLA
  const allUsers = useMemo(() => {
    const machineRef = MACHINES || [];
    if (allUsersData && allUsersData.length > 0) {
      return allUsersData.map(u => {
        let hourlyProd = 0;
        if (Array.isArray(u.minerSlots)) {
            u.minerSlots.forEach((s: any) => {
                if (s && s.typeId) {
                    const m = machineRef.find(x => String(x.id).toLowerCase() === String(s.typeId).toLowerCase());
                    if (m) hourlyProd += (m.srgProdPerDay || 0) / 24;
                }
            });
        }

        const totalDeposited = (u.depositRequests || [])
            .filter((r: any) => r.status === 'COMPLETED')
            .reduce((acc: number, r: any) => acc + (Number(r.costUsdt) || 0), 0);
            
        const totalWithdrawn = (u.withdrawalRequests || [])
            .filter((r: any) => r.status === 'PAID')
            .reduce((acc: number, r: any) => acc + (Number(r.amount) || 0), 0);

        return {
          ...u,
          miners: Array.isArray(u.minerSlots) ? u.minerSlots.filter((s: any) => s && s.typeId).length : 0,
          generators: Array.isArray(u.generatorSlots) ? u.generatorSlots.filter((s: any) => s && s.typeId).length : 0,
          silverBalance: Number(u.silverBalance) || 0,
          earned: Number(u.totalSrgEarned) || 0,
          refCount: Array.isArray(u.referrals) ? u.referrals.length : 0,
          hourlyProduction: hourlyProd,
          totalDeposited,
          totalWithdrawn
        };
      });
    }
    return [];
  }, [allUsersData, gameState]);

  // SIRALAMA
  const sortedUsers = useMemo(() => {
    let sorted = [...allUsers];
    if (searchTerm) {
        sorted = sorted.filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || u.id.toString().includes(searchTerm));
    }
    return sorted.sort((a, b) => {
        if (sortBy === 'ref') return b.refCount - a.refCount;
        if (sortBy === 'production') return b.hourlyProduction - a.hourlyProduction;
        return b.silverBalance - a.silverBalance;
    });
  }, [allUsers, searchTerm, sortBy]);

  // CİHAZ ANALİZİ
  const deviceBreakdown = useMemo(() => {
    const minerCounts: Record<string, number> = {};
    const generatorCounts: Record<string, number> = {};
    const allReferenceData = [...(MINERS_DATA || []), ...(GENERATORS_DATA || []), ...(MACHINES || [])];

    allUsersData?.forEach(u => {
      if (Array.isArray(u.minerSlots)) {
        u.minerSlots.forEach((s: any) => {
          if (s && s.typeId) {
            const ref = allReferenceData.find(d => String(d.id).toLowerCase() === String(s.typeId).toLowerCase());
            const name = ref ? (ref.name || ref.title || s.typeId) : s.typeId.toUpperCase();
            minerCounts[name] = (minerCounts[name] || 0) + 1;
          }
        });
      }
      if (Array.isArray(u.generatorSlots)) {
        u.generatorSlots.forEach((s: any) => {
          if (s && s.typeId) {
            const ref = allReferenceData.find(d => String(d.id).toLowerCase() === String(s.typeId).toLowerCase());
            const name = ref ? (ref.name || ref.title || s.typeId) : s.typeId.toUpperCase();
            generatorCounts[name] = (generatorCounts[name] || 0) + 1;
          }
        });
      }
    });

    const sortedMiners = Object.entries(minerCounts).sort((a, b) => a[0].localeCompare(b[0]));
    const sortedGenerators = Object.entries(generatorCounts).sort((a, b) => a[0].localeCompare(b[0]));

    return { sortedMiners, sortedGenerators };
  }, [allUsersData]);

  // İSTATİSTİKLER
  const stats = useMemo(() => {
    const totalSilver = allUsers.reduce((acc, r) => acc + (r.silverBalance || 0), 0);
    const totalDeposited = (gameState.depositRequests || []).filter(d => d.status === 'COMPLETED').reduce((acc, d) => acc + d.costUsdt, 0);
    const totalWithdrawn = (gameState.withdrawalRequests || []) .filter(w => w.status === 'PAID').reduce((acc, w) => acc + (w.amount / 1000), 0);
    const totalMinersInSystem = allUsers.reduce((acc, r) => acc + (r.miners || 0), 0);
    const totalGeneratorsInSystem = allUsers.reduce((acc, r) => acc + (r.generators || 0), 0);

    return { totalSilver, totalDeposited, totalWithdrawn, totalMinersInSystem, totalGeneratorsInSystem };
  }, [allUsers, gameState.depositRequests, gameState.withdrawalRequests]);

  const pendingWithdrawals = (gameState.withdrawalRequests || []).filter(r => r.status === 'PENDING');
  const pendingDeposits = (gameState.depositRequests || []).filter(r => r.status === 'PENDING');

  // 🚀 BAKİYE EKLEME FONKSİYONU (FIX)
  const handleGiveSilver = (userId: string) => {
    const amount = parseInt(silverValueToAdd);
    if (amount && !isNaN(amount)) {
        // App.tsx'e emir gönder
        onManageUser(userId, 'add_silver', amount);
        // Logu kaydet
        addLog(`BAKİYE EKLENDİ: ID:${userId} | Miktar:${amount.toLocaleString()} 🥈`, 'success');
        setAddingSilverToUser(null);
        setSilverValueToAdd('1000');
    } else {
        alert("Geçerli bir miktar girin!");
    }
  };

  const handleEditAndApprove = (dep: DepositRequest) => {
    const val = parseInt(editSilverValue);
    if (!isNaN(val)) {
       onProcessDeposit(dep.id, true, val);
       addLog(`YATIRIM ONAY (DÜZENLENDİ): ${val} 🥈`, 'success');
       setEditingDepositId(null);
       setEditSilverValue('');
    } else {
       onProcessDeposit(dep.id, true, dep.amountSilver);
       addLog(`YATIRIM ONAY: ${dep.amountSilver} 🥈`, 'success');
       setEditingDepositId(null);
    }
  };

  return (
    <div className="absolute inset-0 z-[9999] bg-[#050505] w-full h-full overflow-y-auto no-scrollbar font-mono p-4 pb-32">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b-2 border-red-600/30 pb-4 mb-6 sticky top-0 bg-[#050505] z-[60] pt-2">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/10 rounded-lg border border-red-600/40 animate-pulse">
               <Skull className="text-red-600" size={28} />
            </div>
            <div>
               <h2 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">ROOT_ACCESS</h2>
               <p className="text-[9px] text-red-600 uppercase tracking-[0.2em] font-black mt-1">SUPER ADMIN MODE</p>
            </div>
         </div>
         <button onClick={onClose} className="bg-zinc-900 border border-zinc-700 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-red-600 hover:border-red-600 transition-colors">ÇIKIŞ</button>
      </div>

      {/* NAVİGASYON */}
      <div className="flex p-1 bg-zinc-900 rounded-xl border border-zinc-800 sticky top-[70px] z-[50] mb-6 shadow-xl overflow-x-auto no-scrollbar">
         {[
           { id: 'dashboard', label: 'DASH', icon: Activity },
           { id: 'units', label: 'UNITS', icon: Server },
           { id: 'users', label: 'USERS', icon: Users },
           { id: 'finance', label: 'CASH', icon: Wallet },
           { id: 'logs', label: 'LOGS', icon: FileText }
         ].map(tabItem => (
           <button key={tabItem.id} onClick={() => setActiveTab(tabItem.id as any)} className={`flex-1 min-w-[60px] flex flex-col items-center justify-center gap-1 py-3 rounded-lg text-[8px] font-black transition-all ${activeTab === tabItem.id ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>
             <tabItem.icon size={14} /> {tabItem.label}
           </button>
         ))}
      </div>

      {/* --- DASHBOARD --- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-2">
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
                 <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">TOPLAM MINER</p>
                 <div className="flex items-center gap-2">
                    <Server size={14} className="text-orange-500" />
                    <span className="text-lg font-black text-white">{stats.totalMinersInSystem}</span>
                 </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
                 <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">TOPLAM PANEL</p>
                 <div className="flex items-center gap-2">
                    <Zap size={14} className="text-yellow-500" />
                    <span className="text-lg font-black text-white">{stats.totalGeneratorsInSystem}</span>
                 </div>
              </div>
              
              {/* Finansal Veriler */}
              <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-2xl">
                 <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">TOPLAM YATIRIM</p>
                 <div className="flex items-center gap-2">
                    <DollarSign size={14} className="text-emerald-500" />
                    <span className="text-lg font-black text-emerald-400">${stats.totalDeposited.toFixed(2)}</span>
                 </div>
              </div>
              <div className="bg-red-950/20 border border-red-500/20 p-4 rounded-2xl">
                 <p className="text-[8px] font-black text-red-500 uppercase tracking-widest mb-1">TOPLAM ÇEKİM</p>
                 <div className="flex items-center gap-2">
                    <ArrowUpCircle size={14} className="text-red-500" />
                    <span className="text-lg font-black text-red-400">${stats.totalWithdrawn.toFixed(2)}</span>
                 </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
                 <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">{t.admUsers}</p>
                 <div className="flex items-center gap-2">
                    <Users size={14} className="text-blue-500" />
                    <span className="text-lg font-black text-white">{allUsers.length}</span>
                 </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
                 <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">{t.admSilver}</p>
                 <div className="flex items-center gap-2">
                    <Database size={14} className="text-emerald-500" />
                    <span className="text-lg font-black text-white">{stats.totalSilver.toLocaleString()}</span>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* --- LOGS --- */}
      {activeTab === 'logs' && (
          <div className="space-y-4 animate-in slide-in-from-right-8">
              <div className="bg-black border border-zinc-800 rounded-2xl p-4 min-h-[400px] relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
                      <div className="flex items-center gap-2">
                          <Terminal size={14} className="text-green-500" />
                          <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">SYSTEM_LOGS.EXE</span>
                      </div>
                      <button onClick={clearLogs} className="text-zinc-600 hover:text-red-500"><Trash2 size={12}/></button>
                  </div>
                  
                  <div className="space-y-2 font-mono text-[10px] h-full overflow-y-auto max-h-[60vh] pr-2">
                      {localLogs.map((log) => (
                          <div key={log.id} className="flex gap-2 items-start border-b border-white/5 pb-1">
                              <span className="text-zinc-500 shrink-0">[{log.timestamp}]</span>
                              <span className={`break-all ${
                                  log.type === 'success' ? 'text-emerald-400' : 
                                  log.type === 'danger' ? 'text-red-400' : 'text-blue-300'
                              }`}>
                                  {log.type === 'success' && '✅ '}
                                  {log.type === 'danger' && '❌ '}
                                  {log.type === 'info' && 'ℹ️ '}
                                  <span className="uppercase">{log.message}</span>
                              </span>
                          </div>
                      ))}
                      {localLogs.length === 0 && <p className="text-zinc-600 italic">Kayıtlar temizlendi...</p>}
                  </div>
              </div>
          </div>
      )}

      {/* --- UNITS --- */}
      {activeTab === 'units' && (
        <div className="space-y-6 animate-in slide-in-from-right-8">
            <div className="bg-gradient-to-r from-zinc-900 to-black p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">SİSTEM ENVANTERİ</h3>
                    <p className="text-[9px] text-zinc-500 mt-1">Aktif cihazların model bazlı dökümü</p>
                </div>
                <div className="p-2 bg-zinc-800 rounded-lg">
                    <Layers size={18} className="text-zinc-400" />
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Cpu size={14} className="text-orange-500" />
                    <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest">MADENCİLER (ASIC)</h4>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {deviceBreakdown.sortedMiners.length > 0 ? (
                        deviceBreakdown.sortedMiners.map(([name, count]) => (
                            <div key={name} className="bg-zinc-900/80 border border-orange-500/20 p-3 rounded-xl flex items-center justify-between hover:bg-zinc-900 transition-colors">
                                <span className="text-xs font-black text-white">{name}</span>
                                <div className="flex items-center gap-3">
                                    <div className="h-1.5 w-16 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-500" style={{ width: '100%' }}></div>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-orange-400">{count} ADET</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-4 border border-dashed border-zinc-800 rounded-xl text-[10px] text-zinc-600">Veri Yok</div>
                    )}
                </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-dashed border-zinc-800">
                <div className="flex items-center gap-2 px-1">
                    <Zap size={14} className="text-yellow-500" />
                    <h4 className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">ENERJİ PANELLERİ</h4>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {deviceBreakdown.sortedGenerators.length > 0 ? (
                        deviceBreakdown.sortedGenerators.map(([name, count]) => (
                            <div key={name} className="bg-zinc-900/80 border border-yellow-500/20 p-3 rounded-xl flex items-center justify-between hover:bg-zinc-900 transition-colors">
                                <span className="text-xs font-black text-white">{name}</span>
                                <div className="flex items-center gap-3">
                                    <div className="h-1.5 w-16 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-500" style={{ width: '100%' }}></div>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-yellow-400">{count} ADET</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-4 border border-dashed border-zinc-800 rounded-xl text-[10px] text-zinc-600">Veri Yok</div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* --- USERS --- */}
      {activeTab === 'users' && (
        <div className="space-y-4">
           {/* Arama ve Sıralama */}
           <div className="space-y-3">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Üye ara..." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 pl-10 text-[10px] text-white outline-none" />
               </div>
               <div className="flex gap-2">
                   <button onClick={() => setSortBy('ref')} className={`flex-1 py-2 rounded-lg text-[9px] font-black flex items-center justify-center gap-1 border ${sortBy === 'ref' ? 'bg-purple-900/40 border-purple-500 text-purple-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                       <UserPlus size={12} /> EN ÇOK REF
                   </button>
                   <button onClick={() => setSortBy('production')} className={`flex-1 py-2 rounded-lg text-[9px] font-black flex items-center justify-center gap-1 border ${sortBy === 'production' ? 'bg-blue-900/40 border-blue-500 text-blue-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                       <TrendingUp size={12} /> EN HIZLI
                   </button>
                   <button onClick={() => setSortBy('silver')} className={`flex-1 py-2 rounded-lg text-[9px] font-black flex items-center justify-center gap-1 border ${sortBy === 'silver' ? 'bg-emerald-900/40 border-emerald-500 text-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                       <Trophy size={12} /> EN ZENGİN
                   </button>
               </div>
           </div>

           <div className="space-y-3">
             {sortedUsers.map(u => (
                <div key={u.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col gap-3 relative overflow-hidden">
                   
                   <div className="flex justify-between items-start gap-2 relative z-10">
                      
                      {/* SOL SÜTUN: Profil + İstatistik Grid */}
                      <div className="flex-1 flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 font-black text-lg">{u.username?.[0] || '?'}</div>
                             <div>
                                <p className="text-sm font-black text-white uppercase truncate max-w-[120px]">{u.username}</p>
                                <p className="text-[10px] text-zinc-600 font-black">ID: {u.id}</p>
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-1">
                              <div className="flex items-center gap-1.5 text-purple-400">
                                  <UserPlus size={14} />
                                  <div>
                                      <span className="text-[8px] text-zinc-500 block leading-none">REF</span>
                                      <span className="text-xs font-black">{u.refCount}</span>
                                  </div>
                              </div>
                              <div className="flex items-center gap-1.5 text-blue-400">
                                  <Activity size={14} />
                                  <div>
                                      <span className="text-[8px] text-zinc-500 block leading-none">SRG/h</span>
                                      <span className="text-xs font-black">{u.hourlyProduction.toFixed(1)}</span>
                                  </div>
                              </div>
                              <div className="flex items-center gap-1.5 text-orange-400">
                                  <Cpu size={14} />
                                  <div>
                                      <span className="text-[8px] text-zinc-500 block leading-none">ASIC</span>
                                      <span className="text-xs font-black">{u.miners}</span>
                                  </div>
                              </div>
                              <div className="flex items-center gap-1.5 text-yellow-400">
                                  <Zap size={14} />
                                  <div>
                                      <span className="text-[8px] text-zinc-500 block leading-none">PANEL</span>
                                      <span className="text-xs font-black">{u.generators}</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* SAĞ SÜTUN */}
                      <div className="flex flex-col items-end gap-3">
                          <div className="text-right">
                             <p className="text-[10px] text-zinc-500 font-bold mb-0.5">GÜMÜŞ BAKİYESİ</p>
                             <p className="text-base font-black text-emerald-500">{u.silverBalance?.toLocaleString()} 🥈</p>
                          </div>

                          <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-end gap-1.5 text-emerald-400">
                                  <div className="text-right">
                                      <span className="text-[8px] text-zinc-500 block leading-none">DEP</span>
                                      <span className="text-xs font-black">${u.totalDeposited}</span>
                                  </div>
                                  <ArrowDownCircle size={16} />
                              </div>
                              <div className="flex items-center justify-end gap-1.5 text-red-400">
                                  <div className="text-right">
                                      <span className="text-[8px] text-zinc-500 block leading-none">WITH</span>
                                      <span className="text-xs font-black">${u.totalWithdrawn}</span>
                                  </div>
                                  <ArrowUpCircle size={16} />
                              </div>
                          </div>
                      </div>
                   </div>

                   {/* EKLE BUTONU */}
                   <div className="mt-1">
                        {addingSilverToUser === u.id ? (
                            <div className="flex gap-2 animate-in slide-in-from-top-1">
                                <input type="number" value={silverValueToAdd} onChange={(e) => setSilverValueToAdd(e.target.value)} className="flex-1 bg-black border border-white/10 rounded-lg p-2 text-xs text-white outline-none" />
                                <button onClick={() => handleGiveSilver(u.id)} className="bg-emerald-600 text-black px-3 rounded-lg text-[10px] font-black">EKLE</button>
                            </div>
                        ) : (
                            <button onClick={() => setAddingSilverToUser(u.id)} className="w-full py-1.5 bg-zinc-800/50 hover:bg-emerald-600/20 text-zinc-500 hover:text-emerald-400 rounded-lg transition-colors flex items-center justify-center gap-2">
                                <Plus size={12} />
                                <span className="text-[9px] font-bold">BAKİYE EKLE</span>
                            </button>
                        )}
                   </div>
                </div>
             ))}
           </div>
        </div>
      )}

      {/* --- FINANCE --- */}
      {activeTab === 'finance' && (
        <div className="space-y-8 pb-32 animate-in slide-in-from-right-4">
           {/* Yatırımlar */}
           <div className="space-y-4">
              <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-1 flex items-center gap-2">
                <ArrowDownCircle size={14} /> {t.admPendingDep} ({pendingDeposits.length})
              </h3>
              {pendingDeposits.length === 0 ? (
                <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl text-center opacity-50">
                   <CheckCircle2 size={32} className="mx-auto mb-2 text-zinc-700" />
                   <p className="text-[9px] font-black uppercase">Bekleyen yatırım yok.</p>
                </div>
              ) : (
                pendingDeposits.map(dep => (
                  <div key={dep.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl space-y-4">
                      <div className="flex justify-between items-start">
                         <div>
                            <p className="text-[11px] font-black text-white uppercase">{dep.telegramUsername || 'Kullanıcı'}</p>
                            <p className="text-[9px] text-zinc-500 font-tech">MEMO: {dep.memo}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-black text-emerald-400">${dep.costUsdt.toFixed(2)}</p>
                            <p className="text-[10px] text-zinc-400">{dep.amountSilver.toLocaleString()} 🥈</p>
                         </div>
                      </div>
                      
                      {editingDepositId === dep.id ? (
                         <div className="flex gap-2">
                            <input 
                              type="number" 
                              placeholder="Yeni miktar" 
                              value={editSilverValue}
                              onChange={(e) => setEditSilverValue(e.target.value)}
                              className="flex-1 bg-black border border-white/10 rounded-xl p-2 text-xs text-white outline-none" 
                            />
                            <button onClick={() => handleEditAndApprove(dep)} className="bg-emerald-600 text-black px-4 rounded-xl text-[10px] font-black">ONAYLA</button>
                         </div>
                      ) : (
                         <div className="flex gap-2">
                            <button onClick={() => { onProcessDeposit(dep.id, false); addLog(`YATIRIM RED: ${dep.amountSilver} 🥈`, 'danger'); }} className="flex-1 py-3 bg-red-600/10 text-red-500 border border-red-600/20 rounded-xl text-[9px] font-black uppercase">{t.admReject || 'REDDET'}</button>
                            <button onClick={() => { setEditingDepositId(dep.id); setEditSilverValue(dep.amountSilver.toString()); }} className="p-3 bg-zinc-800 text-white rounded-xl"><Edit2 size={14}/></button>
                            <button onClick={() => onProcessDeposit(dep.id, true)} className="flex-[2] py-3 bg-emerald-600 text-black rounded-xl text-[9px] font-black uppercase">{t.admApprove || 'ONAYLA'}</button>
                         </div>
                      )}
                  </div>
                ))
              )}
           </div>

           {/* Çekimler */}
           <div className="space-y-4 pt-4 border-t border-zinc-800">
              <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest px-1 flex items-center gap-2">
                <ArrowUpCircle size={14} /> {t.admPendingWith} ({pendingWithdrawals.length})
              </h3>
              {pendingWithdrawals.length === 0 ? (
                <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl text-center opacity-50">
                   <Clock size={32} className="mx-auto mb-2 text-zinc-700" />
                   <p className="text-[9px] font-black uppercase">Bekleyen çekim yok.</p>
                </div>
              ) : (
                pendingWithdrawals.map(req => (
                  <div key={req.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl space-y-4 relative overflow-hidden">
                      <div className="flex justify-between items-start relative z-10">
                         <div>
                            <div className="flex items-center gap-2">
                               <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${req.method === 'USDT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>{req.method}</span>
                               <p className="text-[11px] font-black text-white uppercase">{req.telegramUsername || 'Kullanıcı'}</p>
                            </div>
                            <p className="text-[8px] text-zinc-500 font-tech mt-1 break-all pr-4">{req.address}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-black text-red-400">${(req.amount / 1000).toFixed(2)}</p>
                            <p className="text-[10px] text-zinc-400">{req.amount.toLocaleString()} 🟡</p>
                         </div>
                      </div>

                      <div className="flex gap-2 relative z-10">
                         <button onClick={() => { onProcessWithdrawal(req.id, false); addLog(`ÇEKİM RED: ${req.amount} 🟡`, 'danger'); }} className="flex-1 py-3 bg-red-600/10 text-red-500 border border-red-600/20 rounded-xl text-[9px] font-black uppercase">{t.admReject || 'REDDET'}</button>
                         <button onClick={() => { onProcessWithdrawal(req.id, true); addLog(`ÇEKİM ONAY: ${req.amount} 🟡`, 'success'); }} className="flex-[2] py-3 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase">{t.admApprove || 'ONAYLA'}</button>
                      </div>
                  </div>
                ))
              )}
           </div>
        </div>
      )}
    </div>
  );
};