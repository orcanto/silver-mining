import { GameState } from "../types";
import { INITIAL_STATE } from "../constants";
import { supabase } from "../lib/supabase";

export const DataService = {
    // 1. Telegram Verilerini Çek
    getTelegramUser: () => {
        const tg = (window as any).Telegram?.WebApp;
        if (tg?.initDataUnsafe?.user) {
            const user = tg.initDataUnsafe.user;
            return {
                id: user.id,
                username: user.username || `user_${user.id}`,
                firstName: user.first_name || 'Madenci',
                isPremium: user.is_premium || false,
                photoUrl: user.photo_url || ''
            };
        }
        return { id: 12345678, username: 'TestUser', firstName: 'Test', isPremium: false, photoUrl: '' };
    },

    // 2. Giriş ve Profil Yükleme
    loginUser: async (): Promise<GameState> => {
        const tgUser = DataService.getTelegramUser();
        
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', tgUser.id)
                .maybeSingle();

            if (data && data.game_state) {
                const savedState = data.game_state || {};
                
                // Veritabanından gelen veriyi güvenli hale getir
                return {
                    ...INITIAL_STATE,
                    ...savedState,
                    telegramUser: tgUser,
                    id: tgUser.id, // ID'yi garantiye al
                    // Kritik Diziler: Eğer boşsa boş dizi ata
                    depositRequests: savedState.depositRequests || [],
                    withdrawalRequests: savedState.withdrawalRequests || [],
                    minerSlots: savedState.minerSlots || INITIAL_STATE.minerSlots,
                    generatorSlots: savedState.generatorSlots || INITIAL_STATE.generatorSlots,
                    lastUpdate: savedState.lastUpdate ? Number(savedState.lastUpdate) : Date.now()
                };
            } else {
                // Yeni Kullanıcı Oluştur
                const newState: GameState = {
                    ...INITIAL_STATE,
                    farmName: `${tgUser.firstName} Üssü`,
                    telegramUser: tgUser,
                    id: tgUser.id,
                    lastUpdate: Date.now(),
                    depositRequests: [],
                    withdrawalRequests: []
                };

                await supabase.from('profiles').upsert({
                    id: tgUser.id,
                    username: tgUser.username,
                    game_state: newState,
                    updated_at: new Date().toISOString()
                });

                return newState;
            }
        } catch (err) {
            console.error("Kritik Giriş Hatası:", err);
            return { ...INITIAL_STATE, telegramUser: tgUser };
        }
    },

    // 3. Oyun Kaydetme (Kullanıcı Tarafı)
    saveGame: async (state: GameState): Promise<boolean> => {
        if (!state || !state.id) return false;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    username: state.telegramUser?.username,
                    game_state: state, // Tüm state'i JSON olarak kaydet
                    updated_at: new Date().toISOString()
                })
                .eq('id', state.id);

            if (error) throw error;
            return true;
        } catch (err) {
            console.error("Kaydetme Hatası:", err);
            return false;
        }
    },

    // 4. Referans İşlemleri
    handleReferral: async (newUserId: number | undefined, referrerId: string) => {
        if (!newUserId || !referrerId) return;
        const refIdNum = parseInt(referrerId);
        if (isNaN(refIdNum) || newUserId === refIdNum) return; 

        try {
            const { data: existing } = await supabase
                .from('referrals')
                .select('*')
                .eq('referred_id', newUserId)
                .maybeSingle();

            if (!existing) {
                await supabase.from('referrals').insert([
                    {
                        referrer_id: refIdNum,
                        referred_id: newUserId,
                        status: 'PENDING',
                        created_at: new Date().toISOString()
                    }
                ]);
            }
        } catch (err) {
            console.error("Referans hatası:", err);
        }
    },

    // --- 5. ADMIN: TÜM VERİLERİ ÇEK ---
    getAllGlobalData: async (): Promise<any[]> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, game_state');

            if (error) throw error;

            return (data || []).map(item => {
                const state = item.game_state || {};
                return {
                    ...state,
                    id: item.id, // Ana tablo ID'si esastır
                    username: item.username,
                    // Admin panelinin ihtiyaç duyduğu dizileri garanti et
                    depositRequests: state.depositRequests || [],
                    withdrawalRequests: state.withdrawalRequests || [],
                    silverBalance: state.silverBalance || 0
                };
            });
        } catch (err) {
            console.error("Global Veri Hatası:", err);
            return [];
        }
    },

    // 🚀 6. ADMIN: GÜNCELLEME (SORUNU ÇÖZEN NOKTA) 🚀
    // Burası Admin panelinden gelen güncellenmiş kullanıcı verisini (updatedState)
    // doğrudan 'game_state' JSON sütununun içine yazar.
    adminUpdateUser: async (userId: string | number, updatedState: any): Promise<boolean> => {
        try {
            // updatedState içinde depositRequests dizisi güncellenmiş olarak geliyor (status: COMPLETED).
            // Biz bunu doğrudan game_state içine basıyoruz.
            
            const { error } = await supabase
                .from('profiles')
                .update({ 
                    game_state: updatedState, // <-- İŞTE BURASI DÜZELTİLDİ
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) throw error;
            return true;
        } catch (err) {
            console.error("Admin Güncelleme Hatası:", err);
            return false;
        }
    }
};