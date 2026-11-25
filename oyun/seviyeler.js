// Seviyeler. Murat 25 Kasım 2026'da ilk 10 seviyeyi onayladı; aynı gün 7, 9 ve 10 kolaylaştırıldı
// (ilke: uzun soluklu oyun, ilk seviyelerde oyuncu zorlanmaz; bot ilk 10 seviyeyi en az ~%88 geçmeli).
// meyve numaraları: 0 çilek, 1 limon, 2 üzüm, 3 portakal, 4 elma, 5 erik
// hedef: { topla: { tur: adet } } ya da { puan: n }; yildiz: [2 yıldız, 3 yıldız] puan eşikleri
// ozel: hangi özel parçalar oluşabilir; yeni: bu seviyede tanıtılan özel parça
export const SEVIYELER = [
  { no: 1, hamle: 20, tur: 5, hedef: { topla: { 0: 10 } }, yildiz: [1500, 2500], ozel: {} },
  { no: 2, hamle: 20, tur: 5, hedef: { topla: { 1: 12, 4: 12 } }, yildiz: [2000, 3000], ozel: {} },
  { no: 3, hamle: 18, tur: 5, hedef: { puan: 1500 }, yildiz: [2200, 3200], ozel: {} },
  { no: 4, hamle: 20, tur: 6, hedef: { topla: { 2: 15 } }, yildiz: [2500, 3800], ozel: { cizgili: true }, yeni: 'cizgili' },
  { no: 5, hamle: 22, tur: 6, hedef: { topla: { 3: 20, 5: 20 } }, yildiz: [3000, 4500], ozel: { cizgili: true } },
  { no: 6, hamle: 20, tur: 6, hedef: { puan: 3000 }, yildiz: [4000, 5500], ozel: { cizgili: true, bomba: true }, yeni: 'bomba' },
  { no: 7, hamle: 20, tur: 6, hedef: { topla: { 0: 25 } }, yildiz: [3000, 4500], ozel: { cizgili: true, bomba: true } },
  { no: 8, hamle: 22, tur: 6, hedef: { topla: { 1: 15, 2: 15, 4: 15 } }, yildiz: [3500, 5000], ozel: { cizgili: true, bomba: true } },
  { no: 9, hamle: 22, tur: 6, hedef: { puan: 3500 }, yildiz: [4500, 6000], ozel: { cizgili: true, bomba: true, gokkusagi: true }, yeni: 'gokkusagi' },
  { no: 10, hamle: 28, tur: 6, hedef: { topla: { 5: 30, 3: 30 } }, yildiz: [5000, 7000], ozel: { cizgili: true, bomba: true, gokkusagi: true } },
];

export const TANITIM = {
  cizgili: { baslik: 'Yeni: Çizgili meyve', metin: '4 meyveyi yan yana getir. Çizgili meyve patlayınca bütün satırı ya da sütunu temizler.' },
  bomba: { baslik: 'Yeni: Bomba meyve', metin: '5 meyveyi L ya da T şeklinde birleştir. Bomba patlayınca çevresini temizler.' },
  gokkusagi: { baslik: 'Yeni: Gökkuşağı meyvesi', metin: '5 meyveyi düz bir sırada birleştir. Gökkuşağını bir meyveyle değiştir, o renkteki bütün meyveler patlar.' },
};

// Yıldız sayısı: hedefe ulaşıldıysa 1, eşikleri geçtikçe 2 ve 3
export function yildizHesapla(seviye, puan, basarili) {
  if (!basarili) return 0;
  if (puan >= seviye.yildiz[1]) return 3;
  if (puan >= seviye.yildiz[0]) return 2;
  return 1;
}

// Hedefin tamamlanıp tamamlanmadığı. toplanan: { tur: adet }
export function hedefTamam(seviye, toplanan, puan) {
  const h = seviye.hedef;
  if (h.puan) return puan >= h.puan;
  return Object.entries(h.topla).every(([tur, n]) => (toplanan[tur] || 0) >= n);
}
