
import { GoogleGenAI } from "@google/genai";

export const tellOracleInsight = async (userName: string = "Madenci") => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Sen siber dünyada yaşayan, biraz karanlık ama çok zeki bir Kripto Kahinisin (Cyber Oracle). 
      Kullanıcı ${userName} kripto madenciliği yapıyor ve piyasa hakkında senden bir 'insight' (içgörü) istiyor.
      
      Ona 3-4 cümlelik, içinde "HODL", "Moon", "Gas fee", "Hashrate", "Balinalar" gibi terimler geçen, 
      bazı yerlerde teknik terimler kullanan ama genel olarak gizemli ve motivasyon verici bir yorum yap.
      Tonaliten: Siberpunk, fütüristik ve hafif alaycı olsun.
      
      Sadece yorum metnini döndür.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.8 }
    });

    return response.text || "Piyasa verileri şu an bulanık, blockchain üzerinde bir parazit var...";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Siber saldırı altındayız, verilere ulaşılamıyor. Riglerini kontrol et.";
  }
};

export const getEnergyStrategy = async (data: {
  hourlyConsumption: number,
  hourlyGeneration: number,
  silverBalance: number,
  emptySlots: number,
  generatorTypes: any[]
}) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const deficit = Math.max(0, data.hourlyConsumption - data.hourlyGeneration);
    const prompt = `
      Madencilik çiftliği enerji analizi:
      - Mevcut Saatlik Tüketim: ${data.hourlyConsumption.toFixed(1)} Wh/sa
      - Mevcut Saatlik Üretim: ${data.hourlyGeneration.toFixed(1)} Wh/sa
      - Enerji Açığı: ${deficit.toFixed(1)} Wh/sa
      - Mevcut Gümüş Bakiyesi: ${data.silverBalance}
      - Boş Enerji Slotu: ${data.emptySlots}
      
      ÖNEMLİ EKONOMİ BİLGİSİ:
      - 200 SRG = 1 Altın + 1 Gümüş oranında takas edilir.
      - 100 Altın = 1 USD değerindedir.
      - ROI (amorti) süresi Rig sınıfına göre 70-120 gün arasındadır.
      
      Mevcut Jeneratör Tipleri:
      ${data.generatorTypes.map(g => `- ${g.name}: ${g.cost} Gümüş, ${(g.productionPerDay/24).toFixed(1)} Wh/sa üretim`).join('\n')}

      Görev: Bu açığı kapatmak veya sistemi karlı hale getirmek için en mantıklı satın alma planını öner. 
      Yanıtın kısa, teknik, profesyonel ve stratejik olsun. Maksimum 4 cümle.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { temperature: 0.7 }
    });

    return response.text || "Analiz motoru başlatılamadı.";
  } catch (error) {
    return "Enerji şebekesinde parazit var, analiz yapılamıyor.";
  }
};
